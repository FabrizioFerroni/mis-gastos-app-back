import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CuentaService } from '../service/cuenta.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { configApp } from '@/config/app/config.app';
import { AgregarCuentaDto } from '../dto/create.cuenta.dto';

@Controller('cuentas')
@ApiTags('Cuentas')
export class CuentaController {
  constructor(private readonly cuentaService: CuentaService) {}

  @Get()
  @ApiOperation({ summary: 'Obtiene todos las cuentas de los usuarios' })
  @Throttle({ default: { limit: configApp().limit, ttl: configApp().ttl } })
  findAll(@Query('page') skip: number = 1, @Query('limit') take: number = 10) {
    return this.cuentaService.findAll(skip, take);
  }

  @Get('usuario/:id')
  @ApiOperation({ summary: 'Obtiene todos las cuentas de los usuarios' })
  @Throttle({ default: { limit: configApp().limit, ttl: configApp().ttl } })
  findAllByUser(
    @Param('id') id: string,
    @Query('page') skip: number = 1,
    @Query('limit') take: number = 10,
  ) {
    return this.cuentaService.findAllByUser(id, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar una cuenta por el id' })
  async findOne(@Param('id') id: string) {
    return await this.cuentaService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar una nueva cuenta a un usuario' })
  @Throttle({ default: { limit: configApp().limit, ttl: configApp().ttl } })
  async create(@Body() user: AgregarCuentaDto) {
    return await this.cuentaService.create(user);
  }
}
