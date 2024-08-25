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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AgregarCuentaDto } from '../dto/create.cuenta.dto';
import { EditarCuentaDto } from '../dto/update.cuenta.dto';
import { PaginationDto } from '@/shared/utils/dtos/pagination.dto';
import { UsuarioEntity } from '@/api/usuario/entity/usuario.entity';
import { User } from '@/auth/decorators/user.decorator';
import { Authorize } from '@/auth/decorators/authorized.decorator';
import { ErrorResponseDto } from '@/shared/utils/dtos/swagger/errorresponse.dto';
import { OkResponseDto } from '@/shared/utils/dtos/swagger/okresponse.dto';
import { CreateResponseDto } from '@/shared/utils/dtos/swagger/createresponse.dto';

@Controller('cuentas')
@ApiTags('Cuentas')
@ApiBearerAuth()
@Authorize()
export class CuentaController {
  constructor(private readonly cuentaService: CuentaService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    description: 'Metodo para obtener todas las cuentas del usuario',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({
    summary: 'Obtiene todas las cuentas del usuario',
  })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  findAllByUser(
    @User() { id: usuario_id }: UsuarioEntity,
    @Query() param: PaginationDto,
  ) {
    return this.cuentaService.findAllByUser(usuario_id, param);
  }

  @Get('listar')
  findAll(@User() { id: usuario_id }: UsuarioEntity) {
    return this.cuentaService.findAll(usuario_id);
  }

  @Get(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    description: 'Metodo para obtener una cuenta del usuario por id',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({ summary: 'Buscar una cuenta por el id' })
  async findOne(
    @User() { id: usuario_id }: UsuarioEntity,
    @Param('id') id: string,
  ) {
    return await this.cuentaService.getById(id, usuario_id);
  }

  @Post()
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateResponseDto,
    description: 'Metodo para crear una cuenta al usuario',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({ summary: 'Agregar una nueva cuenta' })
  async create(
    @User() { id: usuario_id }: UsuarioEntity,
    @Body() dto: AgregarCuentaDto,
  ) {
    dto.usuario_id = usuario_id;
    return await this.cuentaService.create(dto);
  }

  @Put(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    description: 'Metodo para editar la cuenta del usuario por su id',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({ summary: 'Editar una cuenta' })
  async update(
    @User() { id: usuario_id }: UsuarioEntity,
    @Param('id') id: string,
    @Body() dto: EditarCuentaDto,
  ) {
    dto.usuario_id = usuario_id;
    return await this.cuentaService.update(id, dto);
  }

  @Delete(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    description: 'Metodo para eliminar una cuenta del usuario por su id',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @ApiOperation({ summary: 'Elimina una cuenta por el id' })
  async remove(@Param('id') id: string) {
    return await this.cuentaService.remove(id);
  }

  @Post(':id')
  @ApiResponse({
    status: HttpStatus.OK,
    type: OkResponseDto,
    description:
      'Metodo para restaurar una cuenta borrada del usuario por su ip',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: ErrorResponseDto,
    description: 'Datos incorrectos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: ErrorResponseDto,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: ErrorResponseDto,
    description: 'Cuenta no encontrada',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: ErrorResponseDto,
    description: 'Hubo un error interno en el servidor',
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restaura una cuenta por el id' })
  async recover(@Param('id') id: string) {
    return await this.cuentaService.recover(id);
  }
}
