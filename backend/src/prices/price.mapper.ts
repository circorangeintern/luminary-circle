import { PriceDto } from './dto/price-response.dto';

/** The shape every price query must select. Keeps queries and mapper in sync. */
export interface PriceWithRelations {
  id: string;
  price: number;
  note: string | null;
  status: string;
  source: string;
  createdAt: Date;
  item: { id: string; name: string };
  unit: { id: string; label: string };
  market: { id: string; name: string; lga: string; state: string };
  user: { displayName: string };
  _count: { flags: number };
}

export interface MapperOptions {
  freshnessWindowDays: number;
  flagMarkThreshold: number;
}

/** The Prisma select that produces PriceWithRelations. Reused by every price query. */
export const PRICE_SELECT = {
  id: true,
  price: true,
  note: true,
  status: true,
  source: true,
  createdAt: true,
  item: { select: { id: true, name: true } },
  unit: { select: { id: true, label: true } },
  market: { select: { id: true, name: true, lga: true, state: true } },
  user: { select: { displayName: true } },
  _count: { select: { flags: true } },
} as const;

export function toPriceDto(
  row: PriceWithRelations,
  opts: MapperOptions,
): PriceDto {
  const ageMs = Date.now() - row.createdAt.getTime();
  const windowMs = opts.freshnessWindowDays * 24 * 60 * 60 * 1000;
  const flagCount = row._count.flags;

  return {
    id: row.id,
    item: row.item,
    unit: row.unit,
    market: row.market,
    price: row.price,
    note: row.note,
    status: row.status,
    source: row.source,
    isStale: ageMs > windowMs,
    isFlagged: flagCount >= opts.flagMarkThreshold,
    flagCount,
    submitterDisplayName: row.user.displayName,
    createdAt: row.createdAt.toISOString(),
  };
}
