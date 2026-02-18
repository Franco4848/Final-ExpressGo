import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { OsrmService } from "../routing/osrm.service";
import { ReorderRouteDto } from "./dto/reorder-route.dto";


@Controller('drivers')
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly osrmService: OsrmService
  
  ) {}

  @Post()
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @Get()
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }
  @Get(":id/route")
  async getRoute(@Param("id") id: string) {
  const driver = await this.driversService.findOne(id);
  const stops = await this.driversService.getDriverStopsOrdered(id);

  const route = await this.osrmService.getRoute(
    stops.map((p) => ({ lat: p.lat, lng: p.lng }))
  );

  return { driver, stops, route };
}


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return this.driversService.update(id, updateDriverDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.driversService.remove(id);
  }
  
  @Patch(":id/route/reorder")
  async reorder(@Param("id") id: string, @Body() dto: ReorderRouteDto) {
  const stops = await this.driversService.reorderRoute(id, dto.orderedPackageIds);

  // Recalcular ruta por calles con el nuevo orden
  const route = await this.osrmService.getRoute(
    stops.map((p) => ({ lat: p.lat, lng: p.lng }))
  );

  return { stops, route };
}

}
