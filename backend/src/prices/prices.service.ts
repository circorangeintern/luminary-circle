import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/app-config.service';
import { CreatePriceDto } from './dto/create-price.dto';
import { PriceDto } from './dto/price-response.dto';
import { AppException } from '../common/errors/app.exception';
import { PRICE_SELECT, PriceWithRelations, toPriceDto } from './price.mapper';
import { PriceQueryDto, PriceQueryResponseDto } from './dto/query-price.dto';
import { CompareResponseDto } from './dto/compare-response.dto';
import { TrendResponseDto } from './dto/trend-response.dto';

const DEDUPE_WINDOW_MINUTES = 10;
const DEFAULT_PAGE_SIZE = 20;
const TREND_WINDOW = 9; // last N submissions considered
const STABLE_THRESHOLD_PCT = 2; // +/- this % counts as STABLE

/** Raw row shape returned by the comparison query. */
interface CompareRow {
  id: string;
  price: number;
  note: string | null;
  status: string;
  source: string;
  created_at: Date;
  item_id: string;
  item_name: string;
  unit_id: string;
  unit_label: string;
  market_id: string;
  market_name: string;
  market_lga: string;
  market_state: string;
  display_name: string;
  flag_count: number;
}

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

  async compare(itemId: string, unitId: string): Promise<CompareResponseDto> {
    const pair = await this.prisma.itemUnit.findUnique({
      where: {
        itemId_unitId: { itemId, unitId },
      },
      select: {
        item: {
          select: { id: true, name: true, status: true },
        },
        unit: {
          select: { id: true, label: true },
        },
      },
    });

    if (!pair || pair.item.status !== 'ACTIVE') {
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

    const excludeThreshold = this.config.flagExcludeThreshold;

    // DISTINCT ON (market_id) with ORDER BY market_id, created_at DESC keeps
    // exactly the newest surviving row per market. The flag filter sits in
    // WHERE so an excluded price never wins its market (KAN-36) — an older
    // clean price is used instead of the market disappearing.
    // Template-literal params are parameterized by Prisma: no injection risk.
    const rows = await this.prisma.$queryRaw<CompareRow[]>`
      SELECT DISTINCT ON (ps.market_id)
        ps.id,
        ps.price,
        ps.note,
        ps.status::text        AS status,
        ps.source::text        AS source,
        ps.created_at,
        i.id                   AS item_id,
        i.name                 AS item_name,
        un.id                  AS unit_id,
        un.label               AS unit_label,
        m.id                   AS market_id,
        m.name                 AS market_name,
        m.lga                  AS market_lga,
        m.state                AS market_state,
        u.display_name,
        COALESCE(f.flag_count, 0)::int AS flag_count
      FROM price_submissions ps
        JOIN users   u  ON u.id  = ps.user_id
        JOIN markets m  ON m.id  = ps.market_id
        JOIN items   i  ON i.id  = ps.item_id
        JOIN units   un ON un.id = ps.unit_id
        LEFT JOIN (
          SELECT submission_id, COUNT(*)::int AS flag_count
          FROM flags
          GROUP BY submission_id
        ) f ON f.submission_id = ps.id
      WHERE ps.item_id  = ${itemId}
        AND ps.unit_id  = ${unitId}
        AND ps.status   = 'ACTIVE'
        AND m.status    = 'ACTIVE'
        AND COALESCE(f.flag_count, 0) < ${excludeThreshold}
      ORDER BY ps.market_id, ps.created_at DESC
    `;

    const mapperOptions = {
      freshnessWindowDays: this.config.freshnessWindowDays,
      flagMarkThreshold: this.config.flagMarkThreshold,
    };

    // Reshape raw rows into what the mapper expects, then reuse it - same
    // Price object shape as POST /prices and GET /prices.
    const priced = rows.map((r) => {
      const relation: PriceWithRelations = {
        id: r.id,
        price: r.price,
        note: r.note,
        status: r.status,
        source: r.source,
        createdAt: r.created_at,
        item: { id: r.item_id, name: r.item_name },
        unit: { id: r.unit_id, label: r.unit_label },
        market: {
          id: r.market_id,
          name: r.market_name,
          lga: r.market_lga,
          state: r.market_state,
        },
        user: { displayName: r.display_name },
        _count: { flags: r.flag_count },
      };

      return {
        market: relation.market,
        latestPrice: toPriceDto(relation, mapperOptions),
      };
    });

    const marketsWithData = priced.length;
    // KAN-34: with fewer than two markets there is nothing to compare, so no
    // price may be labelled cheapest. One price alone is not a bargain.
    const comparisonPossible = marketsWithData >= 2;

    let cheapestId: string | null = null;
    if (comparisonPossible) {
      const cheapest = priced.reduce((best, current) =>
        current.latestPrice.price < best.latestPrice.price ? current : best,
      );
      cheapestId = cheapest.latestPrice.id;
    }

    return {
      item: { id: pair.item.id, name: pair.item.name },
      unit: { id: pair.unit.id, label: pair.unit.label },
      comparison: priced.map((p) => ({
        market: p.market,
        latestPrice: p.latestPrice,
        isCheapest: p.latestPrice.id === cheapestId,
      })),
      marketsWithData,
      comparisonPossible,
    };
  }

  async trend(
    itemId: string,
    unitId: string,
    marketId: string,
  ): Promise<TrendResponseDto> {
    const pair = await this.prisma.itemUnit.findUnique({
      where: { itemId_unitId: { itemId, unitId } },
      select: {
        item: {
          select: { id: true, name: true, status: true },
        },
        unit: {
          select: { id: true, label: true },
        },
      },
    });

    if (!pair || pair.item.status !== 'ACTIVE') {
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

    const market = await this.prisma.market.findUnique({
      where: { id: marketId },
      select: {
        id: true,
        name: true,
        lga: true,
        state: true,
        status: true,
      },
    });

    if (!market || market.status !== 'ACTIVE') {
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

    const excludeThreshold = this.config.flagExcludeThreshold;

    // Fetch a bit more than the window, because some rows may be flagged out.
    // We over-fetch, filter, THEN slice to the window — otherwise a flagged
    // row inside the window would shrink our sample below what's available.
    const rows = await this.prisma.priceSubmission.findMany({
      where: { itemId, unitId, marketId, status: 'ACTIVE' },
      select: PRICE_SELECT,
      orderBy: { createdAt: 'desc' },
      take: TREND_WINDOW * 3, // headroom for flagged exclusions
    });

    // Exclude flagged-out prices (same rule as compare), then take the window.
    const valid = rows
      .filter((r) => r._count.flags < excludeThreshold)
      .slice(0, TREND_WINDOW);

    const mapperOptions = {
      freshnessWindowDays: this.config.freshnessWindowDays,
      flagMarkThreshold: this.config.flagMarkThreshold,
    };

    const header = {
      item: {
        id: pair.item.id,
        name: pair.item.name,
      },
      unit: {
        id: pair.unit.id,
        label: pair.unit.label,
      },
      market: {
        id: market.id,
        name: market.name,
        lga: market.lga,
        state: market.state,
      },
    };

    // points: lightweight, chronological (oldest -> newest) for a left-to-right chart.
    const points = valid
      .map((r) => ({ price: r.price, createdAt: r.createdAt.toISOString() }))
      .reverse();

    if (valid.length < 2) {
      return {
        ...header,
        direction: 'INSUFFICIENT_DATA',
        sampleSize: valid.length,
        latest: valid.length === 1 ? toPriceDto(valid[0], mapperOptions) : null,
        points,
      };
    }

    // valid[0] is newest (desc order), valid[last] is oldest.
    const newest = valid[0].price;
    const oldest = valid[valid.length - 1].price;
    const pctChange = ((newest - oldest) / oldest) * 100;

    let direction: string;
    if (Math.abs(pctChange) <= STABLE_THRESHOLD_PCT) {
      direction = 'STABLE';
    } else if (newest > oldest) {
      direction = 'UP';
    } else {
      direction = 'DOWN';
    }

    return {
      ...header,
      direction,
      sampleSize: valid.length,
      latest: toPriceDto(valid[0], mapperOptions),
      points,
    };
  }
}
