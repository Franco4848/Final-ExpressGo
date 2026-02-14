import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DriversModule } from './drivers/drivers.module';
import { PackagesModule } from './packages/packages.module';

@Module({
  imports: [DriversModule, PackagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
