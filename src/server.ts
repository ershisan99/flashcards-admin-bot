// Import the framework and instantiate it
import Fastify from 'fastify';
import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');
const dataDir = path.join(rootDir, 'data');

const fastify = Fastify({
  logger: true,
});

// Declare a route
fastify.get('/', async function handler(request, reply) {
  return { hello: 'world' };
});

// Declare a route
fastify.get('/prepare-db', async function handler(request, reply) {
  try {
    fs.writeFileSync(path.join(dataDir, 'data.json'), '{}', 'utf8');
    return reply.code(200).send('ok');
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
});

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
