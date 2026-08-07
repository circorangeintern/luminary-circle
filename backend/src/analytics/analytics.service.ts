import { Injectable, Logger } from '@nestjs/common'
import Mixpanel from 'mixpanel'
import { AppConfigService } from '../config/app-config.service'
import { DeviceType, Prisma, ResponseStatus } from '../generated/prisma'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateEventsDto,
  EventsResultDto,
  FRONTEND_EVENT_NAMES,
} from './dto/event.dto'

export interface EmitEventInput {
  name: string
  sessionId: string
  userId?: string | null
  screenName?: string | null
  responseStatus?: ResponseStatus | null
  errorCode?: string | null
  deviceType?: DeviceType | null
  properties?: Record<string, unknown> | null
  clientEventId?: string | null
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)
  private readonly mixpanel: Mixpanel.Mixpanel

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {
    this.mixpanel = Mixpanel.init(this.config.mixpanelToken)
  }

  /**
   * Fire-and-forget event write, now to two destinations. Both writes are
   * independent: a Mixpanel failure never blocks or affects the Postgres
   * write, and vice versa. Neither can ever fail or delay the caller.
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
          `Failed to record analytics event "${input.name}" in Postgres: ${
            e instanceof Error ? e.message : String(e)
          }`,
        )
      })

    this.trackMixpanel(input)
  }

  private trackMixpanel(input: EmitEventInput): void {
    try {
      this.mixpanel.track(input.name, {
        // distinct_id is how Mixpanel groups events into one user/funnel.
        // Fall back to sessionId for anonymous events so they still group
        // sensibly even without a signed-in user.
        distinct_id: input.userId ?? input.sessionId,
        session_id: input.sessionId,
        screen_name: input.screenName,
        response_status: input.responseStatus,
        error_code: input.errorCode,
        device_type: input.deviceType,
        ...input.properties,
      })
    } catch (e) {
      // mixpanel-node's track() is synchronous and can throw on a malformed
      // payload. Same posture as the Postgres write: log it, never throw.
      this.logger.warn(
        `Failed to record analytics event "${input.name}" in Mixpanel: ${
          e instanceof Error ? e.message : String(e)
        }`,
      )
    }
  }

  /**
   * Called once at login, after we know both the anonymous sessionId that
   * was active before sign-in and the real userId. Links the two in
   * Mixpanel so a user's pre-login and post-login events merge into one
   * timeline instead of appearing as two different people.
   */
  linkSessionToUser(sessionId: string, userId: string): void {
    try {
      this.mixpanel.alias(sessionId, userId)
    } catch (e) {
      this.logger.warn(
        `Failed to alias session to user in Mixpanel: ${
          e instanceof Error ? e.message : String(e)
        }`,
      )
    }
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
    const valid: Prisma.AnalyticsEventCreateManyInput[] = []
    let rejected = 0

    // 1. Filter and shape in memory
    for (const event of dto.events) {
      if (!FRONTEND_EVENT_NAMES.includes(event.name as never)) {
        rejected++
        this.logger.warn(`Rejected non-frontend event name: ${event.name}`)
        continue
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
        createdAt: event.occurredAt ? new Date(event.occurredAt) : new Date(),
      })
    }

    if (valid.length === 0) {
      return { accepted: 0, duplicates: 0, rejected }
    }

    // 2. ONE round trip for the whole batch. skipDuplicates makes the unique
    //    constraint on clientEventId a silent no-op instead of an error, so
    //    retried batches are still safe, i just infer the duplicate count
    //    from what actually landed.
    const result = await this.prisma.analyticsEvent.createMany({
      data: valid,
      skipDuplicates: true,
    })

    for (const event of valid) {
      this.trackMixpanel({
        name: event.name,
        sessionId: event.sessionId,
        userId: event.userId as string | null,
        screenName: event.screenName as string | null,
        responseStatus: event.responseStatus as ResponseStatus | null,
        errorCode: event.errorCode as string | null,
        deviceType: event.deviceType as DeviceType | null,
        properties: event.properties as Record<string, unknown> | null,
      })
    }

    return {
      accepted: result.count,
      duplicates: valid.length - result.count,
      rejected,
    }
  }
}
