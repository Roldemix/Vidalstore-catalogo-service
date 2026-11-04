// Seed del catálogo: consume la API pública de FreeToGame y genera data/juegos.json.
// Uso (desde catalogo-service):  node data/seed.mjs
//
// La API no trae precios (son juegos gratuitos): el precio se simula de forma determinista
// a partir del id, así el catálogo es el mismo en cada ejecución.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://www.freetogame.com/api/games';
const CANTIDAD = 12;
const PRECIOS = [4990, 7990, 9990, 12990, 14990, 19990];
const DESTINO = join(dirname(fileURLToPath(import.meta.url)), 'juegos.json');

const res = await fetch(API, {
  headers: { 'User-Agent': 'VidalStore-seed/1.0 (proyecto academico DSY1107)' },
  signal: AbortSignal.timeout(15000),
}).catch((err) => {
  console.error('No se pudo contactar la API:', err.message);
  process.exit(1);
});
if (!res.ok) {
  console.error(`La API respondió ${res.status}. No se modificó ${DESTINO}`);
  process.exit(1);
}

const todos = await res.json();
const juegos = todos
  .filter((j) => Number.isInteger(j.id) && typeof j.title === 'string' && j.title.trim())
  .sort((a, b) => a.id - b.id)
  .slice(0, CANTIDAD)
  .map((j) => ({ id: String(j.id), titulo: j.title.trim(), precio: PRECIOS[j.id % PRECIOS.length] }));

if (juegos.length === 0) {
  console.error('La API no devolvió juegos válidos. No se modificó el archivo.');
  process.exit(1);
}

writeFileSync(DESTINO, JSON.stringify(juegos, null, 2) + '\n', 'utf-8');
console.log(`${juegos.length} juegos escritos en ${DESTINO} (fuente: ${API})`);
