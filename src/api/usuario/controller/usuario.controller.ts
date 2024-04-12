import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { UsuarioService } from '../service/usuario.service';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { AgregarUsuarioDto } from '../dto/create.user.dto';

@Controller('usuarios')
@ApiTags('Usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usuarioService.findOne(id);
  }

  @Post()
  @Throttle({ default: { limit: 5, ttl: 3000 } })
  async create(@Body() user: AgregarUsuarioDto) {
    return await this.usuarioService.create(user);
  }

  @Put(':id')
  @Throttle({ default: { limit: 5, ttl: 3000 } })
  async update(@Param('id') id: string) {
    return this.usuarioService.update(id);
  }

  @Delete(':id')
  @Throttle({ default: { limit: 5, ttl: 3000 } })
  async delete(@Param('id') id: string) {
    return this.usuarioService.remove(id);
  }
}
