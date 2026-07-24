import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  AdminRequestListDto,
  ModerationActionDto,
  ModerationQueueDto,
  RequestReviewDto,
} from './dto/admin.dto';
import { ErrorResponseDto } from '../common/errors/error-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SessionId } from '../common/decorators/session-id.decorator';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly analytics: AnalyticsService,
  ) {}

  @Get('moderation')
  @ApiOperation({ summary: 'Prices held for review' })
  @ApiResponse({
    status: 200,
    description: 'Moderation queue',
    type: ModerationQueueDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Not an admin',
    type: ErrorResponseDto,
  })
  async queue() {
    return this.admin.moderationQueue();
  }

  @Patch('moderation/:submissionId')
  @ApiOperation({ summary: 'Restore or remove a flagged price' })
  @ApiResponse({
    status: 200,
    description: 'Decision applied',
  })
  @ApiResponse({
    status: 404,
    description: 'Price not found',
    type: ErrorResponseDto,
  })
  async moderate(
    @Param('submissionId') submissionId: string,
    @Body() dto: ModerationActionDto,
    @CurrentUser() user: AuthenticatedUser,
    @SessionId() sessionId: string,
  ) {
    const result = await this.admin.moderate(submissionId, dto.action);

    this.analytics.emit({
      name: 'flag_resolved',
      sessionId,
      userId: user.id,
      responseStatus: 'SUCCESS',
      properties: {
        submissionId,
        action: dto.action,
        resolution: result.status,
      },
    });

    return result;
  }

  @Get('market-requests')
  @ApiOperation({ summary: 'List market requests' })
  @ApiResponse({
    status: 200,
    description: 'Requests',
    type: AdminRequestListDto,
  })
  async requests(@Query('status') status?: string) {
    return this.admin.listRequests(status);
  }

  @Patch('market-requests/:id')
  @ApiOperation({ summary: 'Approve or decline a market request' })
  @ApiResponse({
    status: 200,
    description: 'Decision applied',
  })
  @ApiResponse({
    status: 404,
    description: 'Request not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Already reviewed',
    type: ErrorResponseDto,
  })
  async review(
    @Param('id') id: string,
    @Body() dto: RequestReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.admin.reviewRequest(id, user.id, dto.action);
  }
}
