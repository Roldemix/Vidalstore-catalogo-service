import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { compatibilityPartitioner, ProduceAcks, Producer, stringSerializers } from '@platformatic/kafka';
import { randomUUID } from 'crypto';

@Injectable()
export class KafkaService implements OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private readonly producer = new Producer({
    clientId: 'vidalstore-catalogo',
    bootstrapBrokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    serializers: stringSerializers,
    idempotent: true,
    acks: ProduceAcks.ALL,
    retries: 10,
    partitioner: compatibilityPartitioner,
    autocreateTopics: false,
  });

  async publicar(
    juego: { id: string; titulo: string; precio: number },
    tipo: 'juego.publicado' | 'precio.cambiado',
  ): Promise<void> {
    await this.producer.send({
      messages: [
        {
          topic: 'vidalstore.catalogo',
          key: juego.id,
          value: JSON.stringify({
            juegoId: juego.id,
            titulo: juego.titulo,
            precio: juego.precio,
          }),
          headers: {
            'x-evento-id': randomUUID(),
            'x-tipo-evento': tipo,
            'x-emitido-en': new Date().toISOString(),
          },
        },
      ],
      acks: ProduceAcks.ALL,
      idempotent: true,
    });
    this.logger.log(`${tipo} publicado para ${juego.id}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.close();
  }
}
