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
import { CategoriaService } from '../service/categoria.service';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { AgregarCategoriaDto } from '../dto/create.categoria';
import { EditarCategoriaDto } from '../dto/update.categoria';

@Controller('categorias')
@ApiTags('Categorias')
export class CategoriaController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtiene todas las categorias del usuario',
  })
  @ApiQuery({ name: 'page', type: 'number' })
  @ApiQuery({ name: 'limit', type: 'number' })
  findAll(@Query() pagination: PaginationDto) {
    const usuario_id = '1e785ed5-fe90-404a-b08f-a85e07895a27'; //TODO: Cambiar cuando este hecho el modulo de auth con el id que viene del token
    return this.categoriaService.findAll(usuario_id, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar una categoria por el id' })
  async findOne(@Param('id') id: string) {
    return await this.categoriaService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar una nueva categoria' })
  async create(@Body() dto: AgregarCategoriaDto) {
    // const usuario_id = '1e785ed5-fe90-404a-b08f-a85e07895a27'; //TODO: Cambiar cuando este hecho el modulo de auth con el id que viene del token
    const usuario_id = '279abc05-4e5d-42e8-bdfa-f471b57fbd98';
    return await this.categoriaService.create(dto, usuario_id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar categoria' })
  async update(@Param('id') id: string, @Body() dto: EditarCategoriaDto) {
    const usuario_id = '1e785ed5-fe90-404a-b08f-a85e07895a27'; //TODO: Cambiar cuando este hecho el modulo de auth con el id que viene del token
    return await this.categoriaService.update(id, dto, usuario_id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una categoria por el id' })
  async remove(@Param('id') id: string) {
    return await this.categoriaService.remove(id);
  }

  @Post(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaura una categoria por el id' })
  async recover(@Param('id') id: string) {
    return await this.categoriaService.recover(id);
  }
}
