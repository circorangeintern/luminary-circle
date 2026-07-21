import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import { AppConfigService } from '../config/app-config.service';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(configService: AppConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.databaseUrl,
    });
    super({ adapter });
    // Known upstream issue: @prisma/adapter-pg emits a pg deprecation warning on
    // writes that select relations (prisma/prisma#29407, #29646). Functional today;
    // revisit when Prisma ships a fix or before pg@9. Not caused by our code.
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
