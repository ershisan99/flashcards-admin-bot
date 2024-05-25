import dotenv from 'dotenv';
import { session, Telegraf } from 'telegraf';

import { stage } from './bot/setup-wizard-stage.js';

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

void bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
