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

export class AgregarMovimientoDto {
  @IsEnum(Tipos)
  @IsNotEmpty()
  @ApiProperty()
  tipo: Tipos;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  estado: number;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty()
  fecha: Date;

  @IsString()
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  concepto: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @ApiProperty()
  movimiento: number;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  categoria_id: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  cuenta_id: string;
}
