import { Injectable } from '@nestjs/common';
import {
  CreateMarketRequestDto,
  MarketRequestDto,
  MarketRequestListDto,
} from './dto/market-request.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/errors/app.exception';

const REQUEST_SELECT = {
  id: true,
  proposedName: true,
  lga: true,
  state: true,
  status: true,
  createdAt: true,
  reviewedAt: true,
} as const;

interface RequestRow {
  id: string;
  proposedName: string;
  lga: string;
  state: string;
  status: string;
  createdAt: Date;
  reviewedAt: Date | null;
}

function toRequestDto(row: RequestRow): MarketRequestDto {
  return {
    id: row.id,
    proposedName: row.proposedName,
    lga: row.lga,
    state: row.state,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
  };
}

@Injectable()
export class MarketRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateMarketRequestDto,
  ): Promise<MarketRequestDto> {
    const name = dto.proposedName.trim();
    const lga = dto.lga.trim();
    const state = dto.state.trim();

    // Already on the platform? Point them at it instead of queueing noise.
    const existing = await this.prisma.market.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        lga: { equals: lga, mode: 'insensitive' },
        state: { equals: state, mode: 'insensitive' },
      },
      select: { id: true },
    });

    if (existing) {
      throw new AppException(
        'CONFLICT',
        'That market is already on the platform',
      );
    }

    // Same user, same pending request? Don't duplicate
    const pending = await this.prisma.marketRequest.findFirst({
      where: {
        requestedById: userId,
        proposedName: { equals: name, mode: 'insensitive' },
        status: 'PENDING',
      },
      select: { id: true },
    });

    if (pending) {
      throw new AppException(
        'CONFLICT',
        'You have already requested this market',
      );
    }

    const created = await this.prisma.marketRequest.create({
      data: {
        proposedName: name,
        lga,
        state,
        requestedById: userId,
      },
      select: REQUEST_SELECT,
    });

    return toRequestDto(created);
  }

  async listMine(userId: string): Promise<MarketRequestListDto> {
    const rows = await this.prisma.marketRequest.findMany({
      where: { requestedById: userId },
      select: REQUEST_SELECT,
      orderBy: { createdAt: 'desc' },
    });

    return { requests: rows.map(toRequestDto) };
  }
}
