// =====================================================================
// MarketCompare — Database Seed Script
// Phase 1 (KAN-16). Idempotent: safe to run any number of times.
//
// Strategy:
//   - Lookup data (units, items, item-units, markets, system users):
//     upsert keyed on unique fields -> re-running never duplicates.
//   - Seed prices (source = SEED_DEMO): delete-then-reinsert.
//     Re-seeding refreshes demo data while REAL_USER and TEAM_TEST
//     submissions are never touched. This doubles as the Week 5
//     "refresh demo data" tool.
//
// Price values are anchored to NBS Selected Food Price Watch ranges
// (March 2026) and scaled to market-real units. They are demo data,
// clearly labeled SEED_DEMO, and attributed per team decision.
// =====================================================================

import 'dotenv/config';
import { PrismaClient, SubmissionSource } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------

/** A Date `n` days ago (with optional hour offset for intra-day spread). */
function daysAgo(n: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

// ---------------------------------------------------------------------
// 1) UNITS — controlled list, market-real (approxKg only where documented)
// ---------------------------------------------------------------------

const UNITS: { label: string; approxKg?: number }[] = [
  { label: 'derica', approxKg: 0.9 },        // tomato-tin measure, ~0.75-1kg depending on fill
  { label: 'mudu', approxKg: 1.5 },          // heaped; regional variation is real
  { label: 'paint bucket', approxKg: 4.0 },  // ~4kg of rice
  { label: '50kg bag', approxKg: 50.0 },
  { label: 'crate (30)' },                   // 30 eggs — no meaningful kg
  { label: 'piece' },
  { label: 'bottle (75cl)' },
  { label: 'litre' },
  { label: 'keg (5L)' },
  { label: 'basket' },                        // tomatoes; size varies, no kg claimed
];

// ---------------------------------------------------------------------
// 2) ITEMS — the five PRD staples, with local names
// ---------------------------------------------------------------------

const ITEMS: { name: string; localNames: string[] }[] = [
  { name: 'Rice (local)', localNames: ['ofada-type', 'abakaliki rice'] },
  { name: 'Beans (brown)', localNames: ['honey beans', 'oloyin', 'ewa'] },
  { name: 'Tomatoes (fresh)', localNames: ['tomato jos', 'tamatur'] },
  { name: 'Cooking oil (vegetable)', localNames: ['groundnut oil', 'kings-type'] },
  { name: 'Eggs', localNames: ['egg', 'kwai'] },
];

// ---------------------------------------------------------------------
// 3) ITEM-UNIT legality map (drives the submit-form picker)
// ---------------------------------------------------------------------

const ITEM_UNITS: Record<string, string[]> = {
  'Rice (local)': ['derica', 'paint bucket', '50kg bag'],
  'Beans (brown)': ['derica', 'mudu', 'paint bucket'],
  'Tomatoes (fresh)': ['basket', 'paint bucket'],
  'Cooking oil (vegetable)': ['bottle (75cl)', 'litre', 'keg (5L)'],
  'Eggs': ['crate (30)', 'piece'],
};

// ---------------------------------------------------------------------
// 4) MARKETS — // PENDING PM CONFIRMATION (edit this array only)
// ---------------------------------------------------------------------

const MARKETS: { name: string; lga: string; state: string }[] = [
  { name: 'Mile 3 Market', lga: 'Port Harcourt', state: 'Rivers' }, // PENDING PM CONFIRMATION
  { name: 'Mile 1 Market', lga: 'Port Harcourt', state: 'Rivers' }, // PENDING PM CONFIRMATION
  { name: 'Oil Mill Market', lga: 'Obio/Akpor', state: 'Rivers' },  // PENDING PM CONFIRMATION
];

// ---------------------------------------------------------------------
// 5) SEED PRICES per (item, unit) — [low, high] whole-naira band.
//    Each market gets a slightly different level; each gets 4 points
//    over ~12 days with drift, so the trend view has real history.
//    Bands anchored to NBS Food Price Watch, March 2026 (e.g. local
//    rice 50kg ~N112,000; brown beans ~N1,326/kg; scaled to units).
// ---------------------------------------------------------------------

const PRICE_BANDS: Record<string, Record<string, [number, number]>> = {
  'Rice (local)': {
    derica: [1800, 2300],
    'paint bucket': [7600, 9200],
    '50kg bag': [108000, 116000],
  },
  'Beans (brown)': {
    derica: [1400, 1800],
    mudu: [2100, 2700],
    'paint bucket': [5800, 7200],
  },
  'Tomatoes (fresh)': {
    basket: [14000, 26000], // volatile, wide band is realistic
    'paint bucket': [4200, 6500],
  },
  'Cooking oil (vegetable)': {
    'bottle (75cl)': [2300, 2900],
    litre: [3100, 3700],
    'keg (5L)': [15500, 18000],
  },
  Eggs: {
    'crate (30)': [5600, 6800],
    piece: [220, 280],
  },
};

/** Days-ago offsets for the 4 points per series (oldest -> newest). */
const SERIES_OFFSETS = [12, 8, 4, 1];

/**
 * Deterministic-ish price series: base level per market index, gentle
 * drift across the 4 points so trends show up/down/stable variety.
 */
function buildSeries(band: [number, number], marketIdx: number): number[] {
  const [low, high] = band;
  const span = high - low;
  const base = low + Math.round(span * (0.25 + 0.25 * marketIdx)); // markets sit at different levels
  const driftDirection = (marketIdx % 3) - 1; // -1, 0, +1 across markets
  return SERIES_OFFSETS.map((_, i) => {
    const drift = driftDirection * Math.round(span * 0.06) * i;
    const wobble = Math.round(span * 0.02 * ((i % 2 === 0 ? 1 : -1)));
    const price = base + drift + wobble;
    return Math.max(low, Math.min(high, Math.round(price / 10) * 10)); // clamp + round to N10
  });
}

// ---------------------------------------------------------------------
// main
// ---------------------------------------------------------------------

async function main() {
  console.log('Seeding MarketCompare (idempotent)...');

  // ---- Units --------------------------------------------------------
  const unitByLabel = new Map<string, string>();
  for (const u of UNITS) {
    const unit = await prisma.unit.upsert({
      where: { label: u.label },
      update: { approxKg: u.approxKg ?? null },
      create: { label: u.label, approxKg: u.approxKg ?? null },
    });
    unitByLabel.set(u.label, unit.id);
  }
  console.log(`  units: ${unitByLabel.size}`);

  // ---- Items --------------------------------------------------------
  const itemByName = new Map<string, string>();
  for (const it of ITEMS) {
    const item = await prisma.item.upsert({
      where: { name: it.name },
      update: { localNames: it.localNames },
      create: { name: it.name, localNames: it.localNames },
    });
    itemByName.set(it.name, item.id);
  }
  console.log(`  items: ${itemByName.size}`);

  // ---- ItemUnit pairs -------------------------------------------------
  let pairCount = 0;
  for (const [itemName, unitLabels] of Object.entries(ITEM_UNITS)) {
    const itemId = itemByName.get(itemName)!;
    for (const label of unitLabels) {
      const unitId = unitByLabel.get(label)!;
      await prisma.itemUnit.upsert({
        where: { itemId_unitId: { itemId, unitId } }, // composite-PK upsert key
        update: {},
        create: { itemId, unitId },
      });
      pairCount++;
    }
  }
  console.log(`  item-unit pairs: ${pairCount}`);

  // ---- Markets --------------------------------------------------------
  const marketIds: string[] = [];
  for (const m of MARKETS) {
    const market = await prisma.market.upsert({
      where: { uq_market_identity: { name: m.name, lga: m.lga, state: m.state } },
      update: {},
      create: m,
    });
    marketIds.push(market.id);
  }
  console.log(`  markets: ${marketIds.length}`);

  // ---- System accounts ------------------------------------------------
  // Reserved-looking numbers; passwords hashed like real ones.
  const adminHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe-Admin-1!', 10);
  const contribHash = await bcrypt.hash(process.env.SEED_CONTRIB_PASSWORD ?? 'ChangeMe-Contrib-1!', 10);

  await prisma.user.upsert({
    where: { phone: '+2340000000001' },
    update: {},
    create: {
      phone: '+2340000000001',
      displayName: 'MC Admin',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const seedContributor = await prisma.user.upsert({
    where: { phone: '+2340000000002' },
    update: {},
    create: {
      phone: '+2340000000002',
      displayName: 'MC Seed Bot',
      passwordHash: contribHash,
      role: 'USER',
    },
  });
  console.log('  system accounts: 2');

  // ---- Seed prices: delete-then-reinsert (SEED_DEMO only) -------------
  const deleted = await prisma.priceSubmission.deleteMany({
    where: { source: SubmissionSource.SEED_DEMO },
  });
  console.log(`  cleared previous seed prices: ${deleted.count}`);

  const rows: {
    userId: string;
    itemId: string;
    unitId: string;
    marketId: string;
    price: number;
    source: SubmissionSource;
    createdAt: Date;
    note: string;
  }[] = [];

  for (const [itemName, unitBands] of Object.entries(PRICE_BANDS)) {
    const itemId = itemByName.get(itemName)!;
    for (const [unitLabel, band] of Object.entries(unitBands)) {
      const unitId = unitByLabel.get(unitLabel)!;
      marketIds.forEach((marketId, marketIdx) => {
        const series = buildSeries(band, marketIdx);
        series.forEach((price, i) => {
          rows.push({
            userId: seedContributor.id,
            itemId,
            unitId,
            marketId,
            price,
            source: SubmissionSource.SEED_DEMO,
            createdAt: daysAgo(SERIES_OFFSETS[i], 9 + marketIdx), // staggered per market
            note: 'Seed data — anchored to NBS Food Price Watch (Mar 2026)',
          });
        });
      });
    }
  }

  await prisma.priceSubmission.createMany({ data: rows });
  console.log(`  seed price submissions: ${rows.length}`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
