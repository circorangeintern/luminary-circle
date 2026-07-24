import { Test } from '@nestjs/testing';
import { PricesService } from './prices.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/app-config.service';

describe('PricesService', () => {
  let service: PricesService;
  let prisma: {
    itemUnit: { findUnique: jest.Mock };
    market: { findUnique: jest.Mock };
    priceSubmission: { findFirst: jest.Mock; create: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      itemUnit: { findUnique: jest.fn() },
      market: { findUnique: jest.fn() },
      priceSubmission: { findFirst: jest.fn(), create: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [
        PricesService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: AppConfigService,
          useValue: {
            freshnessWindowDays: 7,
            flagMarkThreshold: 2,
            flagExcludeThreshold: 3,
          },
        },
      ],
    }).compile();

    service = module.get(PricesService);
  });

  // helper: a full Prisma row shaped like PRICE_SELECT returns
  const fakeRow = (overrides = {}) => ({
    id: 'sub_1',
    price: 2100,
    note: null,
    status: 'ACTIVE',
    source: 'REAL_USER',
    createdAt: new Date(),
    item: { id: 'item_1', name: 'Rice (local)' },
    unit: { id: 'unit_1', label: 'derica' },
    market: { id: 'mkt_1', name: 'Mile 3', lga: 'PH', state: 'Rivers' },
    user: { displayName: 'Tester' },
    _count: { flags: 0 },
    ...overrides,
  });

  describe('create', () => {
    const dto = {
      itemId: 'item_1',
      unitId: 'unit_1',
      marketId: 'mkt_1',
      price: 2100,
    };

    it('rejects an illegal (item, unit) pair', async () => {
      prisma.itemUnit.findUnique.mockResolvedValue(null);
      prisma.market.findUnique.mockResolvedValue({ status: 'ACTIVE' });

      await expect(service.create('user_1', dto)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
      expect(prisma.priceSubmission.create).not.toHaveBeenCalled();
    });

    it('rejects an inactive item', async () => {
      prisma.itemUnit.findUnique.mockResolvedValue({
        item: { status: 'INACTIVE' },
      });
      prisma.market.findUnique.mockResolvedValue({ status: 'ACTIVE' });

      await expect(service.create('user_1', dto)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });

    it('rejects an unknown or inactive market', async () => {
      prisma.itemUnit.findUnique.mockResolvedValue({
        item: { status: 'ACTIVE' },
      });
      prisma.market.findUnique.mockResolvedValue(null);

      await expect(service.create('user_1', dto)).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
      });
    });

    it('rejects a duplicate within the dedupe window', async () => {
      prisma.itemUnit.findUnique.mockResolvedValue({
        item: { status: 'ACTIVE' },
      });
      prisma.market.findUnique.mockResolvedValue({ status: 'ACTIVE' });
      prisma.priceSubmission.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.create('user_1', dto)).rejects.toMatchObject({
        code: 'CONFLICT',
      });
      expect(prisma.priceSubmission.create).not.toHaveBeenCalled();
    });

    it('creates a submission and returns a Price object without passwordHash', async () => {
      prisma.itemUnit.findUnique.mockResolvedValue({
        item: { status: 'ACTIVE' },
      });
      prisma.market.findUnique.mockResolvedValue({ status: 'ACTIVE' });
      prisma.priceSubmission.findFirst.mockResolvedValue(null);
      prisma.priceSubmission.create.mockResolvedValue(fakeRow());

      const result = await service.create('user_1', dto);

      expect(result.id).toBe('sub_1');
      expect(result.submitterDisplayName).toBe('Tester');
      expect(result.isStale).toBe(false); // fresh row
      expect(JSON.stringify(result)).not.toContain('passwordHash');
    });
  });
});
