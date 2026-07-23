import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CreateEventsDto, EventsResultDto } from './dto/event.dto';
import { ErrorResponseDto } from '../common/errors/error-response.dto';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../config/app-config.service';

@ApiTags('analytics')
@ApiHeader({
  name: 'Authorization',
  required: false,
  description: 'Optional Bearer token. Events from signed-in users are attributed; anonymous browsing is accepted without one.',
})
@Controller('events')
export class AnalyticsController {
  constructor(
    private readonly analytics: AnalyticsService,
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
  ) {}

  @Post()
  @HttpCode(202) // Accepted: we've taken the batch, not "created a resource"
  @ApiOperation({ summary: 'Submit a batch of frontend UI events' })
  @ApiResponse({ status: 202, description: 'Batch processed', type: EventsResultDto })
  @ApiResponse({ status: 400, description: 'Invalid batch', type: ErrorResponseDto })
  async ingest(@Body() dto: CreateEventsDto, @Req() req: { headers: Record<string, string | undefined> }) {
    // Public endpoint (anonymous browsing produces events), but attribute
    // to a user when a valid token happens to be present. A bad token is
    // ignored rather than rejected: analytics must never block the client.
    const userId = this.extractUserId(req.headers.authorization);
    return this.analytics.ingestBatch(dto, userId);
  }

  private extractUserId(authHeader?: string): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    try {
      const payload = this.jwt.verify<{ sub: string }>(
        authHeader.slice(7),
        { secret: this.config.jwtSecret },
      );
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }
}