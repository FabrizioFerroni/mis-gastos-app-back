import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { TipoCuenta } from '../utils/cuentas.enum';

export class EditarCuentaDto {
  @IsString()
  @MinLength(3)
  @IsOptional()
  @ApiProperty()
  nombre: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  @ApiProperty()
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @ApiProperty()
  saldo: number;

  @IsString()
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  icono: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  moneda: string;

  @IsEnum(TipoCuenta)
  @MinLength(1)
  @IsOptional()
  @ApiProperty()
  tipo: TipoCuenta;

  @IsString()
  @IsOptional()
  @ApiProperty()
  nro_cuenta: string;

  @IsUUID()
  @IsOptional()
  @ApiProperty()
  usuario_id: string;
}
