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
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AgregarCuentaDto } from '../dto/create.cuenta.dto';
import { EditarCuentaDto } from '../dto/update.cuenta.dto';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';

@Controller('cuentas')
@ApiTags('Cuentas')
export class CuentaController {
  constructor(private readonly cuentaService: CuentaService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtiene todas las cuentas del usuario',
  })
  @ApiQuery({ name: 'page', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  findAllByUser(@Query() pagination: PaginationDto) {
    const usuario_id = '1e785ed5-fe90-404a-b08f-a85e07895a27'; //TODO: Cambiar cuando este hecho el modulo de auth con el id que viene del token
    return this.cuentaService.findAllByUser(usuario_id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar una cuenta por el id' })
  async findOne(@Param('id') id: string) {
    return await this.cuentaService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar una nueva cuenta' })
  async create(@Body() dto: AgregarCuentaDto) {
    return await this.cuentaService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar una cuenta' })
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
