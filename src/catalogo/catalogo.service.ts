import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ROUTING_KEYS } from '../mensajeria/topologia';
import { RabbitService } from '../rabbit/rabbit.service';
import { ActualizarJuegoDto, CrearJuegoDto } from './dto';

export interface Juego {
  id: string;
  titulo: string;
  precio: number;
}

@Injectable()
export class CatalogoService {
  private readonly logger = new Logger(CatalogoService.name);

  // El catálogo parte del JSON versionado en data/. Los juegos creados después viven en memoria.
  private readonly juegos: Juego[] = JSON.parse(
    readFileSync(join(process.cwd(), 'data', 'juegos.json'), 'utf-8'),
  ) as Juego[];

  constructor(private readonly rabbit: RabbitService) {}

  findAll(): Juego[] {
    return this.juegos;
  }

  async crear(dto: CrearJuegoDto, editorSub: string) {
    const juego: Juego = { id: randomUUID(), titulo: dto.titulo, precio: dto.precio };
    this.juegos.push(juego);
    const eventoPublicado = await this.publicar(juego, editorSub);
    return { ...juego, eventoPublicado };
  }

  actualizar(id: string, dto: ActualizarJuegoDto): Juego {
    const juego = this.juegos.find((j) => j.id === id);
    if (!juego) throw new NotFoundException('El juego no existe');
    Object.assign(juego, dto);
    return juego;
  }

  private async publicar(juego: Juego, editorSub: string): Promise<boolean> {
    try {
      const eventoId = await this.rabbit.publicarEvento(ROUTING_KEYS.juegoPublicado, {
        juegoId: juego.id,
        titulo: juego.titulo,
        editorSub, // sale del token, nunca del body
      });
      this.logger.log(`${ROUTING_KEYS.juegoPublicado} publicado (juego ${juego.id}, evento ${eventoId})`);
      return true;
    } catch (err) {
      const motivo = err instanceof Error ? err.message : String(err);
      this.logger.error(`EVENTO NO PUBLICADO ${ROUTING_KEYS.juegoPublicado} (juego ${juego.id}): ${motivo}`);
      return false;
    }
  }
}