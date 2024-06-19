import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Tipos } from '@/shared/utils/enums/tipos.enum';

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

  @IsEnum(Tipos)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty()
  tipo: Tipos;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  usuario_id: string;
}
