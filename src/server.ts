// Import the framework and instantiate it
import Fastify from 'fastify';

import * as db from './db.js';
import { promises as fsp } from 'node:fs';
import { groupByTime } from './handlers/group-users.js';
import dotenv from 'dotenv';
import { session, Telegraf } from 'telegraf';
import { stage } from './bot/setup-wizard-stage.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');
const dataDir = path.join(rootDir, 'data');
const dataFilePath = path.join(dataDir, 'data.json');
const preregisteredFilePath = path.join(dataDir, 'preregistered.json');

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required!');
}

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());
bot.use(stage.middleware());
bot.command('add_to_team', (ctx) => {
  // @ts-expect-error wtf
  ctx.scene.enter('add_to_team_wizard');
});

const fastify = Fastify({
  logger: true,
});

fastify.get('/', async function handler(request, reply) {
  return await db.readData();
});

fastify.get('/prepare-db', async function handler(request, reply) {
  try {
    await db.writeData(db.initialData);
    return reply.code(200).send();
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
});

fastify.get('/generate-groups', async function handler(request, reply) {
  try {
    const data = await db.readData();
    data.groups = groupByTime(data.rawData);
    await db.writeData(data);
    return reply.code(200).send();
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
});

fastify.get('/fill-preregistered', async function handler(request, reply) {
  try {
    const preregisteredData = await fsp.readFile(
      preregisteredFilePath,
      'utf-8',
    );
    const parsedPreregisteredData = JSON.parse(preregisteredData);
    await db.writeData(parsedPreregisteredData);
    return reply.code(200).send();
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
});

void bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// Run the server!
try {
  await fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
