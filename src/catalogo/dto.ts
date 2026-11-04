import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CrearJuegoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo!: string;

  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  precio!: number;
}

export class ActualizarJuegoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  titulo?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  precio?: number;
}