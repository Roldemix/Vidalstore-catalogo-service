import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TokenSub } from '../auth/token-sub.decorator';
import { CatalogoService } from './catalogo.service';
import { ActualizarJuegoDto, CrearJuegoDto } from './dto';

@Controller('catalogo')
@UseGuards(JwtAuthGuard)
export class CatalogoController {
  constructor(private readonly catalogo: CatalogoService) {}

  @Get()
  findAll() {
    return this.catalogo.findAll();
  }

  @Post()
  crear(@Body() dto: CrearJuegoDto, @TokenSub() sub: string) {
    return this.catalogo.crear(dto, sub);
  }

  @Put(':juegoId')
  actualizar(@Param('juegoId') juegoId: string, @Body() dto: ActualizarJuegoDto) {
    return this.catalogo.actualizar(juegoId, dto);
  }
}