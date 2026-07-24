import { Injectable, Logger } from '@nestjs/common';
import { DeviceType, Prisma, ResponseStatus } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEventsDto,
  EventsResultDto,
  FRONTEND_EVENT_NAMES,
} from './dto/event.dto';

export interface EmitEventInput {
  name: string;
  sessionId: string;
  userId?: string | null;
  screenName?: string | null;
  responseStatus?: ResponseStatus | null;
  errorCode?: string | null;
  deviceType?: DeviceType | null;
  properties?: Record<string, unknown> | null;
  clientEventId?: string | null;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget event write. Deliberately NOT async from the caller's
   * perspective: it returns void, swallows its own errors, and can never
   * delay or fail the request that triggered it.
   */
  emit(input: EmitEventInput): void {
    void this.prisma.analyticsEvent
      .create({
        data: {
          name: input.name,
          sessionId: input.sessionId,
          userId: input.userId ?? null,
          screenName: input.screenName ?? null,
          responseStatus: input.responseStatus ?? null,
          errorCode: input.errorCode ?? null,
          deviceType: input.deviceType ?? null,
          properties: (input.properties ?? undefined) as never,
          clientEventId: input.clientEventId ?? null,
        },
      })
      .catch((e: unknown) => {
        this.logger.warn(
          `Failed to record analytics event "${input.name}": ${
            e instanceof Error ? e.message : String(e)
          }`,
        );
      });
  }

  /**
   * Batch-ingest frontend-owned events. Unlike emit(), this one awaits and
   * reports per-batch results, because the client asked for them. It still
   * never throws on individual failures: one bad event must not sink a batch.
   */
  async ingestBatch(
    dto: CreateEventsDto,
    userId: string | null,
  ): Promise<EventsResultDto> {
    const valid: Prisma.AnalyticsEventCreateManyInput[] = [];
    let rejected = 0;

    // 1. Filter and shape in memory
    for (const event of dto.events) {
      if (!FRONTEND_EVENT_NAMES.includes(event.name as never)) {
        rejected++;
        this.logger.warn(`Rejected non-frontend event name: ${event.name}`);
        continue;
      }
      valid.push({
        clientEventId: event.clientEventId,
        name: event.name,
        sessionId: event.sessionId,
        userId,
        screenName: event.screenName ?? null,
        responseStatus: (event.responseStatus as ResponseStatus) ?? null,
        errorCode: event.errorCode ?? null,
        deviceType: (event.deviceType as DeviceType) ?? null,
        properties: (event.properties ?? undefined) as never,
        // Client timestamp when supplied, else server time. Client clocks
        // can be wrong, but for UI events the client's own ordering is
        // more useful than network-arrival time.
        createdAt: event.occurredAt ? new Date(event.occurredAt) : new Date(),
      });
    }

    if (valid.length === 0) {
      return { accepted: 0, duplicates: 0, rejected };
    }

    // 2. ONE round trip for the whole batch. skipDuplicates makes the unique
    //    constraint on clientEventId a silent no-op instead of an error, so
    //    retried batches are still safe, i just infer the duplicate count
    //    from what actually landed.
    const result = await this.prisma.analyticsEvent.createMany({
      data: valid,
      skipDuplicates: true,
    });

    return {
      accepted: result.count,
      duplicates: valid.length - result.count,
      rejected,
    };
  }
}
