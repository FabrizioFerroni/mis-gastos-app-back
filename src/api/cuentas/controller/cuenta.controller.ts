import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CuentaService } from '../service/cuenta.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { configApp } from '@/config/app/config.app';
import { AgregarCuentaDto } from '../dto/create.cuenta.dto';
import { EditarCuentaDto } from '../dto/update.cuenta.dto';

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
  @ApiOperation({
    summary: 'Obtiene todas las cuentas del usuario que se busco por id',
  })
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
  @ApiOperation({ summary: 'Agregar una nueva cuenta' })
  @Throttle({ default: { limit: configApp().limit, ttl: configApp().ttl } })
  async create(@Body() dto: AgregarCuentaDto) {
    return await this.cuentaService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar una cuenta' })
  @Throttle({ default: { limit: configApp().limit, ttl: configApp().ttl } })
  async update(@Param('id') id: string, @Body() dto: EditarCuentaDto) {
    return await this.cuentaService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una cuenta por el id' })
  async remove(@Param('id') id: string) {
    return await this.cuentaService.remove(id);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaura una cuenta por el id' })
  async recover(@Param('id') id: string) {
    return await this.cuentaService.recover(id);
  }
}
