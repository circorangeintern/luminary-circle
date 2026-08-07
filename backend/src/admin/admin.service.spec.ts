import { Test } from '@nestjs/testing'
import { AppConfigService } from '../config/app-config.service'
import { PrismaService } from '../prisma/prisma.service'
import { AdminService } from './admin.service'

describe('AdminService', () => {
  let service: AdminService
  let prisma: {
    priceSubmission: {
      findUnique: jest.Mock
      findMany: jest.Mock
      update: jest.Mock
    }
    flag: { updateMany: jest.Mock }
    marketRequest: {
      findUnique: jest.Mock
      findMany: jest.Mock
      update: jest.Mock
    }
    market: { create: jest.Mock }
    $transaction: jest.Mock
  }

  beforeEach(async () => {
    prisma = {
      priceSubmission: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      flag: { updateMany: jest.fn() },
      marketRequest: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
      market: { create: jest.fn() },
      $transaction: jest.fn(),
    }

    const module = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: AppConfigService,
          useValue: { freshnessWindowDays: 7, flagMarkThreshold: 2 },
        },
      ],
    }).compile()

    service = module.get(AdminService)
  })

  describe('moderate', () => {
    it('rejects a nonexistent submission', async () => {
      prisma.priceSubmission.findUnique.mockResolvedValue(null)

      await expect(service.moderate('bad-id', 'RESTORE')).rejects.toMatchObject(
        {
          code: 'NOT_FOUND',
        },
      )
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })

    it('RESTORE sets status ACTIVE and resolves flags in one transaction', async () => {
      prisma.priceSubmission.findUnique.mockResolvedValue({
        id: 'sub_1',
        status: 'UNDER_REVIEW',
      })
      // $transaction receives an array of prisma operations; we don't need
      // to execute them for real, just confirm the call happened once.
      prisma.$transaction.mockResolvedValue([{}, {}])

      const result = await service.moderate('sub_1', 'RESTORE')

      expect(result.status).toBe('ACTIVE')
      // The whole point of using $transaction here: submission status and
      // flag resolution move together in ONE round trip, so a KPI query
      // can never observe a half-applied moderation decision.
      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    })

    it('REMOVE sets status REMOVED', async () => {
      prisma.priceSubmission.findUnique.mockResolvedValue({
        id: 'sub_1',
        status: 'UNDER_REVIEW',
      })
      prisma.$transaction.mockResolvedValue([{}, {}])

      const result = await service.moderate('sub_1', 'REMOVE')

      expect(result.status).toBe('REMOVED')
      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
    })

    it('returns a resolvedAt timestamp', async () => {
      prisma.priceSubmission.findUnique.mockResolvedValue({
        id: 'sub_1',
        status: 'UNDER_REVIEW',
      })
      prisma.$transaction.mockResolvedValue([{}, {}])

      const result = await service.moderate('sub_1', 'RESTORE')

      expect(result.resolvedAt).toBeDefined()
      expect(new Date(result.resolvedAt).getTime()).not.toBeNaN()
    })
  })

  describe('reviewRequest', () => {
    const pendingRequest = {
      id: 'req_1',
      status: 'PENDING',
      proposedName: 'Rumuokoro Market',
      lga: 'Obio/Akpor',
      state: 'Rivers',
    }

    it('rejects a nonexistent request', async () => {
      prisma.marketRequest.findUnique.mockResolvedValue(null)

      await expect(
        service.reviewRequest('bad-id', 'admin_1', 'APPROVE'),
      ).rejects.toMatchObject({ code: 'NOT_FOUND' })
    })

    it('rejects a request that was already reviewed', async () => {
      prisma.marketRequest.findUnique.mockResolvedValue({
        ...pendingRequest,
        status: 'APPROVED',
      })

      await expect(
        service.reviewRequest('req_1', 'admin_1', 'APPROVE'),
      ).rejects.toMatchObject({ code: 'CONFLICT' })
      expect(prisma.market.create).not.toHaveBeenCalled()
    })

    it('DECLINE updates status without creating a market', async () => {
      prisma.marketRequest.findUnique.mockResolvedValue(pendingRequest)
      prisma.marketRequest.update.mockResolvedValue({})

      const result = await service.reviewRequest('req_1', 'admin_1', 'DECLINE')

      expect(result.status).toBe('DECLINED')
      expect(result.marketId).toBeNull()
      expect(prisma.market.create).not.toHaveBeenCalled()
    })

    it('APPROVE creates a market using the request\u2019s proposed details', async () => {
      prisma.marketRequest.findUnique.mockResolvedValue(pendingRequest)
      prisma.market.create.mockResolvedValue({ id: 'market_new' })
      prisma.marketRequest.update.mockResolvedValue({})

      const result = await service.reviewRequest('req_1', 'admin_1', 'APPROVE')

      expect(prisma.market.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Rumuokoro Market',
            lga: 'Obio/Akpor',
            state: 'Rivers',
          }) as Record<string, unknown>,
        }),
      )
      expect(result.status).toBe('APPROVED')
      expect(result.marketId).toBe('market_new')
    })

    it('APPROVE links the new market back to the request (audit trail)', async () => {
      prisma.marketRequest.findUnique.mockResolvedValue(pendingRequest)
      prisma.market.create.mockResolvedValue({ id: 'market_new' })
      prisma.marketRequest.update.mockResolvedValue({})

      await service.reviewRequest('req_1', 'admin_1', 'APPROVE')

      expect(prisma.marketRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'req_1' },
          data: expect.objectContaining({
            status: 'APPROVED',
            createdMarketId: 'market_new',
            reviewedById: 'admin_1',
          }) as Record<string, unknown>,
        }),
      )
    })
  })
})
