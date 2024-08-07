import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TipoCuenta } from '../utils/cuentas.enum';

export class AgregarCuentaDto {
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

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty()
  @ApiProperty()
  saldo: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  icono: string;

  @IsString()
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty()
  moneda: string;

  @IsEnum(TipoCuenta)
  @MinLength(1)
  @IsNotEmpty()
  @ApiProperty()
  tipo: TipoCuenta;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nro_cuenta: string;

  @IsUUID()
  @IsOptional()
  usuario_id: string;
}
