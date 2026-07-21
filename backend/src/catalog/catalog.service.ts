import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogItemsDto, CatalogMarketsDto } from './dto/catalog-response.dto';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getItems(): Promise<CatalogItemsDto> {
    const items = await this.prisma.item.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        localNames: true,
        itemUnits: {
          select: { unit: { select: { id: true, label: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        localNames: item.localNames,
        units: item.itemUnits.map((itemUnit) => ({
          id: itemUnit.unit.id,
          label: itemUnit.unit.label,
        })),
      })),
    };
  }

  async getMarkets(): Promise<CatalogMarketsDto> {
    const markets = await this.prisma.market.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' },
    });

    return {
      markets: markets.map((market) => ({
        id: market.id,
        name: market.name,
        lga: market.lga,
        state: market.state,
      })),
    };
  }
}
