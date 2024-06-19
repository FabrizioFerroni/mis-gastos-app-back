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
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { MovimientosService } from '../service/movimientos.service';
import { AgregarMovimientoDto } from '../dto/create.dto';
import { EditarMovimientoDto } from '../dto/update.dto';

@Controller('movimientos')
@ApiTags('Movimientos')
export class MovimientosController {
  constructor(private readonly movimientoService: MovimientosService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtiene todos los movimientos del usuario',
  })
  @ApiQuery({ name: 'page', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  findAllByUser(@Query() pagination: PaginationDto) {
    const usuario_id = '1e785ed5-fe90-404a-b08f-a85e07895a27'; //TODO: Cambiar cuando este hecho el modulo de auth con el id que viene del token
    return this.movimientoService.findAllByUser(usuario_id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar un movimietno por el id' })
  async findOne(@Param('id') id: string) {
    return await this.movimientoService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar un nuevo movimiento' })
  async create(@Body() dto: AgregarMovimientoDto) {
    return await this.movimientoService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar un movimiento por su id' })
  async update(@Param('id') id: string, @Body() dto: EditarMovimientoDto) {
    return await this.movimientoService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina un movimiento por el id' })
  async remove(@Param('id') id: string) {
    return await this.movimientoService.remove(id);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaura un movimiento por el id' })
  async recover(@Param('id') id: string) {
    return await this.movimientoService.recover(id);
  }
}
