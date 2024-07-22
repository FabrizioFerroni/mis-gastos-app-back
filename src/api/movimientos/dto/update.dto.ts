import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Tipos } from '@/shared/utils/enums/tipos.enum';

export class EditarMovimientoDto {
  @IsEnum(Tipos)
  @IsOptional()
  @ApiProperty()
  tipo: Tipos;

  @IsNumber()
  @IsOptional()
  @ApiProperty()
  estado: number;

  @IsDate()
  @IsOptional()
  @ApiProperty()
  fecha: Date;

  @IsString()
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  concepto: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @ApiProperty()
  movimiento: number;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  categoria_id: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  cuenta_id: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  usuario_id: string;
}
