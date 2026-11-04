import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { randomUUID } from 'crypto';
import { EXCHANGES } from '../mensajeria/topologia';

// Sin quórum el broker no confirma publicaciones: sin este tope la petición HTTP se colgaría.
const TIMEOUT_CONFIRMACION_MS = 5000;

@Injectable()
export class RabbitService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitService.name);
  private connection!: Awaited<ReturnType<typeof amqp.connect>>;
  private channel!: amqp.ConfirmChannel;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.connection = await amqp.connect(this.config.getOrThrow<string>('RABBITMQ_URL'));
    this.channel = await this.connection.createConfirmChannel();
    await this.channel.assertExchange(EXCHANGES.eventos.nombre, EXCHANGES.eventos.tipo, {
      durable: true,
    });
    this.logger.log(`Conectado a RabbitMQ; exchange ${EXCHANGES.eventos.nombre} declarado`);
  }

  async publicarEvento(routingKey: string, payload: object): Promise<string> {
    const eventoId = randomUUID();
    const confirmado = new Promise<void>((resolve, reject) => {
      this.channel.publish(
        EXCHANGES.eventos.nombre,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        {
          persistent: true,
          contentType: 'application/json',
          headers: { 'x-evento-id': eventoId, 'x-emitido-en': new Date().toISOString() },
        },
        (err) => (err ? reject(err) : resolve()),
      );
    });
    let timer: NodeJS.Timeout | undefined;
    const vencido = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () => reject(new Error('el broker no confirmó la publicación a tiempo')),
        TIMEOUT_CONFIRMACION_MS,
      );
    });
    try {
      await Promise.race([confirmado, vencido]);
    } finally {
      clearTimeout(timer);
    }
    return eventoId;
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }
}