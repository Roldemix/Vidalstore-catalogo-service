import { Module } from '@nestjs/common';
import { RabbitService } from '../rabbit/rabbit.service';
import { CatalogoController } from './catalogo.controller';
import { CatalogoService } from './catalogo.service';
import { KafkaService } from '../kafka/kafka.service';

@Module({
  controllers: [CatalogoController],
  providers: [CatalogoService, RabbitService, KafkaService],
})
export class CatalogoModule {}