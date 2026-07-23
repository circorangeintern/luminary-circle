import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MarketRequestsService } from './market-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CreateMarketRequestDto,
  MarketRequestDto,
  MarketRequestListDto,
} from './dto/market-request.dto';
import { ErrorResponseDto } from '../common/errors/error-response.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { type AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiTags('market-requests')
@Controller('market-requests')
export class MarketRequestsController {
  constructor(private readonly requests: MarketRequestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Request that a new market be added' })
  @ApiResponse({
    status: 201,
    description: 'Request submitted',
    type: MarketRequestDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not signed in',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Already exists or already requested',
    type: ErrorResponseDto,
  })
  async create(
    @Body() dto: CreateMarketRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.requests.create(user.id, dto);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'List your own market requests' })
  @ApiResponse({
    status: 200,
    description: 'Your requests',
    type: MarketRequestListDto,
  })
  async mine(@CurrentUser() user: AuthenticatedUser) {
    return this.requests.listMine(user.id);
  }
}
