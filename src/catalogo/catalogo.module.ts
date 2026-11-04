import { Module } from '@nestjs/common';
import { RabbitService } from '../rabbit/rabbit.service';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';

@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService, RabbitService],
})
export class CatalogoModule {}