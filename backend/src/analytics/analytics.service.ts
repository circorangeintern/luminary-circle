import { Injectable, Logger } from '@nestjs/common';
import { DeviceType, ResponseStatus } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

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
}
