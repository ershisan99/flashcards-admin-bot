import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import * as fs from 'fs';
import { UserData } from './types.js';
import { sendGroupInfo } from './bot/send-group-info.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required!');
}

const bot = new Telegraf(BOT_TOKEN);

const data = fs.readFileSync('./groups.json', 'utf8');
const userData = JSON.parse(data) as UserData[][];
// sendGroupInfo(userData, bot.telegram.sendMessage);

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
