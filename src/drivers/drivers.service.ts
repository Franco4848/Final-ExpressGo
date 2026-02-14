import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  constructor(private prisma: PrismaService){}


  create(createDriverDto: CreateDriverDto) {
    return this.prisma.driver.create({
      data: createDriverDto,
    });
  }

  findAll() {
    return this.prisma.driver.findMany({
      include: {packages: true},
    })
  }

  findOne(id: string) {
    return this.prisma.driver.findUnique({
      where: {id},
      include: {packages: true},
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto) {
    const driverUpdated = await this.prisma.driver.update({
      where: {id},
      data: updateDriverDto,
    });
    return driverUpdated;
  }

  async remove(id: string) {
    const driverRemoved = await this.prisma.driver.delete({
      where: {id},
    });  
    return `This action removes a #${id} driver`;
  }
}
