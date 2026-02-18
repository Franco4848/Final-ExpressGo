import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { PrismaService } from 'src/prisma.service';
import { OsrmService } from "../routing/osrm.service";

@Module({
  controllers: [DriversController],
  providers: [
    DriversService,
    PrismaService,
    OsrmService
  ],
})
export class DriversModule {}
