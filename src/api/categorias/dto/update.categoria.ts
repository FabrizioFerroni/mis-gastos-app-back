import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Tipos } from '@/shared/utils/enums/tipos.enum';

export class EditarCategoriaDto {
  @IsString()
  @MinLength(3)
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
  @IsOptional()
  @ApiProperty()
  tipo: Tipos;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  usuario_id: string;
}
