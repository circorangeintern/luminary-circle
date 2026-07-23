// =====================================================================
// MarketCompare — Database Seed Script
// Idempotent: safe to run any number of times.
//
// Strategy:
//   - Lookup data (units, items, item-units, markets, system users):
//     upsert keyed on unique fields -> re-running never duplicates.
//   - Seed prices (source = SEED_DEMO): delete-then-reinsert.
//     Re-seeding refreshes demo data while REAL_USER and TEAM_TEST
//     submissions are never touched. This doubles as the pre-demo
//     "refresh the dates" tool.
//
// Price values are anchored to NBS Selected Food Price Watch ranges and
// scaled to market-real units. They are demo data, clearly labelled
// SEED_DEMO, and attributed in the note field.
// =====================================================================

import 'dotenv/config';
import { PrismaClient, SubmissionSource } from '../src/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------

/** A Date `n` days ago, at a fixed hour so re-seeds are reproducible. */
function daysAgo(n: number, hour = 10): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

/** Deterministic string hash, used to vary trend shapes per item+unit. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Round to a sensible increment for the magnitude. */
function roundPrice(n: number): number {
  if (n >= 10000) return Math.round(n / 50) * 50;
  if (n >= 1000) return Math.round(n / 10) * 10;
  return Math.round(n / 5) * 5;
}

// ---------------------------------------------------------------------
// 1) UNITS — controlled list, market-real (approxKg only where documented)
// ---------------------------------------------------------------------

const UNITS: { label: string; approxKg?: number }[] = [
  { label: 'derica', approxKg: 0.9 },        // tomato-tin measure
  { label: 'mudu', approxKg: 1.5 },          // heaped; regional variation is real
  { label: 'congo', approxKg: 1.5 },         // south-west name for the mudu
  { label: 'paint bucket', approxKg: 4.0 },  // ~4kg of rice
  { label: '50kg bag', approxKg: 50.0 },
  { label: 'basket' },                       // size varies, no kg claimed
  { label: 'crate (30)' },                   // 30 eggs
  { label: 'piece' },
  { label: 'tuber' },
  { label: 'heap' },                         // market-table heap, highly variable
  { label: 'bottle (75cl)' },
  { label: 'litre' },
  { label: 'keg (5L)' },
];

// ---------------------------------------------------------------------
// 2) ITEMS — the five PRD staples plus common additions
// ---------------------------------------------------------------------

const ITEMS: { name: string; localNames: string[] }[] = [
  { name: 'Rice (local)', localNames: ['ofada-type', 'abakaliki rice'] },
  { name: 'Beans (brown)', localNames: ['honey beans', 'oloyin', 'ewa'] },
  { name: 'Tomatoes (fresh)', localNames: ['tomato jos', 'tamatir'] },
  { name: 'Cooking oil (vegetable)', localNames: ['groundnut oil', 'kings-type'] },
  { name: 'Eggs', localNames: ['egg', 'kwai'] },
  { name: 'Garri (white)', localNames: ['garri funfun', 'ijebu garri'] },
  { name: 'Yam', localNames: ['isu', 'puna yam'] },
  { name: 'Pepper (fresh)', localNames: ['rodo', 'ata rodo', 'shombo'] },
  { name: 'Onions', localNames: ['alubosa', 'albasa'] },
  { name: 'Palm oil', localNames: ['epo pupa', 'red oil'] },
];

// ---------------------------------------------------------------------
// 3) ITEM-UNIT legality map (drives the submit-form picker)
// ---------------------------------------------------------------------

const ITEM_UNITS: Record<string, string[]> = {
  'Rice (local)': ['derica', 'paint bucket', '50kg bag'],
  'Beans (brown)': ['derica', 'mudu', 'paint bucket'],
  'Tomatoes (fresh)': ['basket', 'paint bucket', 'heap'],
  'Cooking oil (vegetable)': ['bottle (75cl)', 'litre', 'keg (5L)'],
  Eggs: ['crate (30)', 'piece'],
  'Garri (white)': ['derica', 'congo', 'paint bucket', '50kg bag'],
  Yam: ['tuber', 'heap'],
  'Pepper (fresh)': ['basket', 'paint bucket', 'heap'],
  Onions: ['basket', 'paint bucket', 'heap'],
  'Palm oil': ['bottle (75cl)', 'litre', 'keg (5L)'],
};

// ---------------------------------------------------------------------
// 4) MARKETS — edit this array only
// ---------------------------------------------------------------------

const MARKETS: { name: string; lga: string; state: string }[] = [
  { name: 'Bodija Market', lga: 'Ibadan North', state: 'Oyo' },
  { name: 'Dugbe Market', lga: 'Ibadan North West', state: 'Oyo' },
  { name: 'Oje Market', lga: 'Ibadan North East', state: 'Oyo' },
  { name: 'Aleshinloye Market', lga: 'Ibadan North West', state: 'Oyo' },
  { name: 'Sasa Market', lga: 'Akinyele', state: 'Oyo' },
];

// ---------------------------------------------------------------------
// 5) PRICE BANDS per (item, unit): [low, high] whole naira
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
    basket: [14000, 26000], // volatile; a wide band is realistic
    'paint bucket': [4200, 6500],
    heap: [500, 1200],
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
  'Garri (white)': {
    derica: [700, 1100],
    congo: [1200, 1800],
    'paint bucket': [3000, 4200],
    '50kg bag': [32000, 42000],
  },
  Yam: {
    tuber: [2500, 6000],
    heap: [8000, 16000],
  },
  'Pepper (fresh)': {
    basket: [18000, 32000],
    'paint bucket': [5000, 8500],
    heap: [500, 1500],
  },
  Onions: {
    basket: [20000, 45000],
    'paint bucket': [4500, 9000],
    heap: [500, 1500],
  },
  'Palm oil': {
    'bottle (75cl)': [1800, 2400],
    litre: [2600, 3400],
    'keg (5L)': [13000, 16500],
  },
};

// ---------------------------------------------------------------------
// 6) SERIES SHAPE
//    8 points per (item, unit, market). Days-ago offsets tighten toward
//    now, so the latest price is 1 day old and the oldest is 14 days.
//    With FRESHNESS_WINDOW_DAYS=7 the older half reads as stale, which
//    gives the UI something real to badge.
// ---------------------------------------------------------------------

const SERIES_OFFSETS = [14, 12, 10, 8, 6, 4, 2, 1];

/** One market is deliberately left behind so its LATEST price is stale,
 *  giving the comparison view a visible stale badge to demo. */
const STALE_MARKET_INDEX = 4; // Sasa Market
const STALE_MARKET_EXTRA_DAYS = 9;

type Shape = 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE' | 'DIP';
const SHAPES: Shape[] = ['RISING', 'FALLING', 'STABLE', 'VOLATILE', 'DIP'];

/**
 * Deterministic price series. No Math.random, so every re-seed tells the
 * same story and a demo rehearsal matches demo day. Each market sits at a
 * different level (so comparison has a clear cheapest) and follows a
 * different shape (so trend arrows show variety across the catalogue).
 */
function buildSeries(
  band: [number, number],
  marketIdx: number,
  seedKey: string,
): number[] {
  const [low, high] = band;
  const span = high - low;
  const n = SERIES_OFFSETS.length;

  // Markets sit at staggered levels within the band.
  const base = low + span * (0.15 + 0.14 * marketIdx);
  const shape = SHAPES[(hashString(seedKey) + marketIdx) % SHAPES.length];
  const phase = ((hashString(seedKey) % 7) / 7) * Math.PI * 2;

  return SERIES_OFFSETS.map((_, i) => {
    const t = i / (n - 1); // 0 at oldest, 1 at newest

    let drift: number;
    switch (shape) {
      case 'RISING':
        drift = span * 0.3 * t;
        break;
      case 'FALLING':
        drift = -span * 0.28 * t;
        break;
      case 'STABLE':
        drift = span * 0.015 * Math.sin(t * Math.PI + phase);
        break;
      case 'VOLATILE':
        drift = span * 0.22 * Math.sin(t * Math.PI * 2.5 + phase);
        break;
      case 'DIP':
        drift = -span * 0.25 * Math.sin(t * Math.PI);
        break;
    }

    const wobble = span * 0.03 * Math.sin(t * Math.PI * 3 + phase);
    const price = base + drift + wobble;

    return roundPrice(Math.max(low, Math.min(high, price)));
  });
}

// ---------------------------------------------------------------------
// 7) SYSTEM ACCOUNTS
//    Reserved-looking numbers. Three contributors so display names vary
//    in the UI and so flag-threshold testing has enough distinct users.
// ---------------------------------------------------------------------

const SYSTEM_USERS: {
  phone: string;
  displayName: string;
  role: 'ADMIN' | 'USER';
  passwordEnv: string;
  fallback: string;
}[] = [
  {
    phone: '+2340000000001',
    displayName: 'MC Admin',
    role: 'ADMIN',
    passwordEnv: 'SEED_ADMIN_PASSWORD',
    fallback: 'ChangeMe-Admin-1!',
  },
  {
    phone: '+2340000000002',
    displayName: 'MC Seed Bot',
    role: 'USER',
    passwordEnv: 'SEED_CONTRIB_PASSWORD',
    fallback: 'ChangeMe-Contrib-1!',
  },
  {
    phone: '+2340000000003',
    displayName: 'Adunni O.',
    role: 'USER',
    passwordEnv: 'SEED_CONTRIB_PASSWORD',
    fallback: 'ChangeMe-Contrib-1!',
  },
  {
    phone: '+2340000000004',
    displayName: 'Chinedu A.',
    role: 'USER',
    passwordEnv: 'SEED_CONTRIB_PASSWORD',
    fallback: 'ChangeMe-Contrib-1!',
  },
];

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

  // ---- ItemUnit pairs -----------------------------------------------
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

  // ---- Markets ------------------------------------------------------
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

  // ---- System accounts ----------------------------------------------
  const contributorIds: string[] = [];
  for (const su of SYSTEM_USERS) {
    const hash = await bcrypt.hash(
      process.env[su.passwordEnv] ?? su.fallback,
      10,
    );
    const user = await prisma.user.upsert({
      where: { phone: su.phone },
      update: {},
      create: {
        phone: su.phone,
        displayName: su.displayName,
        passwordHash: hash,
        role: su.role,
      },
    });
    if (su.role === 'USER') contributorIds.push(user.id);
  }
  console.log(`  system accounts: ${SYSTEM_USERS.length}`);

  // ---- Seed prices: delete-then-reinsert (SEED_DEMO only) -----------
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
      const seedKey = `${itemName}|${unitLabel}`;

      marketIds.forEach((marketId, marketIdx) => {
        const series = buildSeries(band, marketIdx, seedKey);
        const extraDays =
          marketIdx === STALE_MARKET_INDEX ? STALE_MARKET_EXTRA_DAYS : 0;

        series.forEach((price, i) => {
          rows.push({
            userId: contributorIds[i % contributorIds.length],
            itemId,
            unitId,
            marketId,
            price,
            source: SubmissionSource.SEED_DEMO,
            createdAt: daysAgo(
              SERIES_OFFSETS[i] + extraDays,
              8 + (marketIdx % 6), // stagger the hour so ordering is stable
            ),
            note: 'Seed data, anchored to NBS Food Price Watch ranges',
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