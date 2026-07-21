import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PricesService } from './prices.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePriceDto } from './dto/create-price.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { SessionId } from '../common/decorators/session-id.decorator';
import { AppException } from '../common/errors/app.exception';
import { PriceResponseDto } from './dto/price-response.dto';
import { ErrorResponseDto } from '../common/errors/error-response.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { PriceQueryDto, PriceQueryResponseDto } from './dto/query-price.dto';

@ApiTags('prices')
@ApiHeader({
  name: 'X-Session-Id',
  required: false,
  description: 'Client session identifier, used for analytics grouping.',
})
@Controller('prices')
export class PricesController {
  constructor(
    private readonly prices: PricesService,
    private readonly analytics: AnalyticsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Submit a price observation' })
  @ApiResponse({
    status: 201,
    description: 'Price submitted',
    type: PriceResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not signed in',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Duplicate submission',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreatePriceDto,
    @CurrentUser() user: AuthenticatedUser,
    @SessionId() sessionId: string,
  ) {
    try {
      const price = await this.prices.create(user.id, dto);
      this.analytics.emit({
        name: 'price_submission_succeeded',
        sessionId,
        userId: user.id,
        responseStatus: 'SUCCESS',
        properties: {
          submissionId: price.id,
          itemId: dto.itemId,
          marketId: dto.marketId,
          unitId: dto.unitId,
          price: dto.price,
        },
      });

      return { price };
    } catch (e) {
      this.analytics.emit({
        name: 'price_submission_failed',
        sessionId,
        userId: user.id,
        // This endpoint throws VALIDATION_ERROR or CONFLICT; anything else is a crash.
        responseStatus:
          e instanceof AppException &&
          (e.code === 'VALIDATION_ERROR' || e.code === 'CONFLICT')
            ? 'VALIDATION_ERROR'
            : 'SERVER_ERROR',
        errorCode: e instanceof AppException ? e.code : 'UNKNOWN',
        properties: {
          itemId: dto.itemId,
          marketId: dto.marketId,
        },
      });

      throw e;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Browse price submissions, newest first' })
  @ApiResponse({
    status: 200,
    description: 'Paginated price submissions',
    type: PriceQueryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
    type: ErrorResponseDto,
  })
  async list(@Query() query: PriceQueryDto) {
    return this.prices.getPrices(query);
  }
}
