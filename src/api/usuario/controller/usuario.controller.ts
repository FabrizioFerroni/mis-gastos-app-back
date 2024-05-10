import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UsuarioService } from '../service/usuario.service';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgregarUsuarioDto } from '../dto/create.user.dto';
import { EditarUsuarioDto } from '../dto/update.user';

@Controller('usuarios')
@ApiTags('Usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @ApiOperation({ summary: 'Obtiene todos los usuarios' })
  findAll(
    @Query('deleted') deletedAt: boolean = false,
    @Query('page') skip: number = 1,
    @Query('limit') take: number = 10,
  ) {
    return this.usuarioService.findAll(deletedAt, skip, take);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar un usuario por el id' })
  async findOne(@Param('id') id: string) {
    return await this.usuarioService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Agregar un nuevo usuario' })
  @Throttle({ default: { limit: 5, ttl: 3000 } })
  async create(@Body() user: AgregarUsuarioDto) {
    return await this.usuarioService.create(user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Editar un usuario por su id' })
  @Throttle({ default: { limit: 5, ttl: 3000 } })
  async update(@Param('id') id: string, @Body() data: EditarUsuarioDto) {
    return this.usuarioService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borrar un estado por su id' })
  @Throttle({ default: { limit: 5, ttl: 3000 } })
  async delete(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Recuperar un estado por su id' })
  @Throttle({ default: { limit: 5, ttl: 3000 } })
  async recover(@Param('id') id: string) {
    return this.usuarioService.recover(id);
  }
}
