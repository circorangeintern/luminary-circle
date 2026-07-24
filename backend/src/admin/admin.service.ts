import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppConfigService } from '../config/app-config.service';
import { AdminRequestListDto, ModerationQueueDto } from './dto/admin.dto';
import { PRICE_SELECT, toPriceDto } from '../prices/price.mapper';
import { AppException } from '../common/errors/app.exception';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async moderationQueue(): Promise<ModerationQueueDto> {
    const rows = await this.prisma.priceSubmission.findMany({
      where: { status: 'UNDER_REVIEW' },
      select: {
        ...PRICE_SELECT,
        flags: {
          select: { reason: true },
          where: { status: 'PENDING' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const mapperOptions = {
      freshnessWindowDays: this.config.freshnessWindowDays,
      flagMarkThreshold: this.config.flagMarkThreshold,
    };

    return {
      items: rows.map((row) => ({
        price: toPriceDto(row, mapperOptions),
        flagCount: row._count.flags,
        // Distinct reasons, so an admin sees WHY at a glance
        reasons: [...new Set(row.flags.map((f) => f.reason as string))],
      })),
    };
  }

  async moderate(submissionId: string, action: string) {
    const submission = await this.prisma.priceSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, status: true },
    });

    if (!submission) {
      throw new AppException('NOT_FOUND', 'That price could not be found');
    }

    const now = new Date();
    const restoring = action === 'RESTORE';

    // One transaction: submission status and flag resolution move together,
    // so the flag-resolution-rate KPI can never see a half-applied decision.
    await this.prisma.$transaction([
      this.prisma.priceSubmission.update({
        where: { id: submissionId },
        data: { status: restoring ? 'ACTIVE' : 'REMOVED' },
      }),
      this.prisma.flag.updateMany({
        where: { submissionId, status: 'PENDING' },
        data: {
          status: restoring ? 'DISMISSED' : 'CONFIRMED',
          resolvedAt: now,
        },
      }),
    ]);

    return {
      submissionId,
      status: restoring ? 'ACTIVE' : 'REMOVED',
      resolvedAt: now.toISOString(),
    };
  }

  async listRequests(status?: string): Promise<AdminRequestListDto> {
    const rows = await this.prisma.marketRequest.findMany({
      where: status ? { status: status as never } : {},
      select: {
        id: true,
        proposedName: true,
        lga: true,
        state: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return {
      requests: rows.map((r) => ({
        id: r.id,
        proposedName: r.proposedName,
        lga: r.lga,
        state: r.state,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      })),
    };
  }

  async reviewRequest(requestId: string, adminId: string, action: string) {
    const request = await this.prisma.marketRequest.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        proposedName: true,
        lga: true,
        state: true,
      },
    });

    if (!request) {
      throw new AppException('NOT_FOUND', 'That request could not be found');
    }
    if (request.status !== 'PENDING') {
      throw new AppException(
        'CONFLICT',
        'That request has already been reviewed',
      );
    }

    const now = new Date();

    if (action === 'DECLINE') {
      await this.prisma.marketRequest.update({
        where: { id: requestId },
        data: {
          status: 'DECLINED',
          reviewedById: adminId,
          reviewedAt: now,
        },
      });
      return { requestId, status: 'DECLINED', marketId: null };
    }

    // APPROVE: create the Market, then link it back to the request.
    // The request row itself is never converted - it stays as an audit record.
    const market = await this.prisma.market.create({
      data: {
        name: request.proposedName,
        lga: request.lga,
        state: request.state,
      },
      select: { id: true },
    });

    await this.prisma.marketRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        reviewedById: adminId,
        reviewedAt: now,
        createdMarketId: market.id,
      },
    });

    return { requestId, status: 'APPROVED', marketId: market.id };
  }
}
