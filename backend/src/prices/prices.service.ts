import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/app-config.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceDto } from './dto/price-response.dto';
import { AppException } from '../common/errors/app.exception';
import { PRICE_SELECT, toPriceDto } from './price.mapper';
import { PriceQueryDto, PriceQueryResponseDto } from './dto/query-price.dto';

const DEDUPE_WINDOW_MINUTES = 10;
const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class PricesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async create(userId: string, dto: CreatePriceDto): Promise<PriceDto> {
    const [pair, market] = await Promise.all([
      this.prisma.itemUnit.findUnique({
        where: {
          itemId_unitId: {
            itemId: dto.itemId,
            unitId: dto.unitId,
          },
        },
        select: {
          item: { select: { status: true } },
        },
      }),
      this.prisma.market.findUnique({
        where: { id: dto.marketId },
        select: { status: true },
      }),
    ]);

    if (!pair) {
      throw new AppException(
        'VALIDATION_ERROR',
        'That measure is not valid for the selected item',
        [
          {
            field: 'unitId',
            message: 'Choose a measure from the list for this item',
          },
        ],
      );
    }
    if (pair.item.status !== 'ACTIVE') {
      throw new AppException('VALIDATION_ERROR', 'That item is not available', [
        { field: 'itemId', message: 'Item is not active' },
      ]);
    }
    if (!market || market.status != 'ACTIVE') {
      throw new AppException(
        'VALIDATION_ERROR',
        'That market is not available',
        [
          {
            field: 'marketId',
            message: 'Choose a market from the list',
          },
        ],
      );
    }

    // dedupe window
    const since = new Date(Date.now() - DEDUPE_WINDOW_MINUTES * 60 * 1000);
    const duplicate = await this.prisma.priceSubmission.findFirst({
      where: {
        userId,
        itemId: dto.itemId,
        unitId: dto.unitId,
        marketId: dto.marketId,
        price: dto.price,
        createdAt: { gte: since },
      },
      select: { id: true },
    });

    if (duplicate) {
      throw new AppException(
        'CONFLICT',
        'You just submitted this exact price a moment ago',
      );
    }

    const created = await this.prisma.priceSubmission.create({
      data: {
        userId,
        itemId: dto.itemId,
        unitId: dto.unitId,
        marketId: dto.marketId,
        price: dto.price,
        note: dto.note ?? null,
      },
      select: PRICE_SELECT,
    });

    return toPriceDto(created, {
      freshnessWindowDays: this.config.freshnessWindowDays,
      flagMarkThreshold: this.config.flagMarkThreshold,
    });
  }

  async getPrices(dto: PriceQueryDto): Promise<PriceQueryResponseDto> {
    const page = dto.page ?? 1;
    const pageSize = dto.pageSize ?? DEFAULT_PAGE_SIZE;

    const where = {
      status: 'ACTIVE' as const,
      ...(dto.itemId && { itemId: dto.itemId }),
      ...(dto.unitId && { unitId: dto.unitId }),
      ...(dto.marketId && { marketId: dto.marketId }),
    };

    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.priceSubmission.findMany({
        where,
        select: PRICE_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.priceSubmission.count({ where }),
    ]);

    const mapperOptions = {
      freshnessWindowDays: this.config.freshnessWindowDays,
      flagMarkThreshold: this.config.flagMarkThreshold,
    };

    return {
      items: rows.map((row) => toPriceDto(row, mapperOptions)),
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }
}
