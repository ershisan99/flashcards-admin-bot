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
import { sendGroupInfo } from './bot/send-group-info.js';

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
  const users = await db.getUsers();
  const groups = await db.getGroups();
  return reply.code(200).send({ users, groups });
});

fastify.get('/prepare-db', async function handler(request, reply) {
  try {
    await db.clearDatabase();
    return reply.code(200).send();
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
});

fastify.get('/generate-groups', async function handler(request, reply) {
  try {
    const users = await db.getUsers();
    const groups = groupByTime(users);

    for (const group of groups) {
      await db.addGroup(group.map((user) => user.id));
    }
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
    const parsedPreregisteredData = JSON.parse(
      preregisteredData,
    ) as Preregistered;
    for (const user of Object.values(parsedPreregisteredData.rawData)) {
      try {
        await db.addUser({
          chatId: user.chatId.toString(),
          name: user.name,
          availableFrom: user.availableTime.from,
          availableTo: user.availableTime.to,
          tgUsername: user.tgUsername,
        });
      } catch (err) {
        console.error(err);
      }
    }
    return reply.code(200).send();
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
});

fastify.get('/send-group-info', async function handler(request, reply) {
  try {
    const groups = await db.getGroups();
    sendGroupInfo(groups, (...rest) => bot.telegram.sendMessage(...rest));
    return reply.code(200).send();
  } catch (err) {
    console.error(err);
    return reply.code(500).send(err);
  }
});

fastify.get('/fix', async (req, reply) => {
  try {
    await db.modifyUser(4, 14);

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

export type AvailableTime = {
  from: number;
  to: number;
};

export type PUser = {
  name: string;
  availableTime: AvailableTime;
  tgUsername: string;
  chatId: number;
  userId: string;
};

export type RawData = Record<string, PUser>;

export type Preregistered = {
  rawData: RawData;
  groups: any[];
};
