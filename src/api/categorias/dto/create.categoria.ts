import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TipoCategoria } from '../utils/tipos.enum';

export class AgregarCategoriaDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @ApiProperty()
  nombre: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  @ApiProperty()
  descripcion: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  color: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  icono: string;

  @IsEnum(TipoCategoria)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty()
  tipo: TipoCategoria;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  usuario_id: string;
}
