import dotenv from 'dotenv';
import { Telegraf } from 'telegraf';
import * as fs from 'fs';
import { UserData } from './types.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required!');
}

const bot = new Telegraf(BOT_TOKEN);

const data = fs.readFileSync('./groups.json', 'utf8');
const userData = JSON.parse(data) as UserData[][];
userData.forEach((group) => {
  group.forEach((user, i, arr) => {
    const otherUsers = group.filter((u) => u.userId !== user.userId);
    if (otherUsers.length === 0) {
      bot.telegram.sendMessage(
        user.chatId,
        'К сожалению, в твою группу не попал никто.',
      );
      return;
    }
    let message = `Привет, ${user.name}! Твои напарники:\n\n${otherUsers
      .map(
        (u) =>
          `- <a href="tg://user?id=${u.userId}">${u.name}</a> @${
            u.tgUsername
          }. Время: ${getAvailableTime(
            u.availableTime.from,
            u.availableTime.to,
          )}`,
      )
      .join(' \n')}`;

    if (i === 0) {
      message +=
        '\n\nТебя выбрали ответственным(ой) за первоначальную коммуникацию. Создай, пожалуйста, группу в телеграме и пригласи в нее своих напарников.';
    } else {
      message += `\n\n${arr[0].name} был(а) выбран(а) ответственным за первоначальную коммуникацию. Он(а) создаст группу в телеграме и пригласит в нее всех участников.`;
    }
    bot.telegram.sendMessage(user.chatId, message, { parse_mode: 'HTML' });
  });
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

function getAvailableTime(from: number, to: number | null) {
  if (from === 0 && to === 10) return 'До 10 часов';
  if (from === 10 && to === 20) return '10-20 часов';
  if (from === 20 && to === 30) return '20-30 часов';
  if (from === 30 && to === 40) return '30-40 часов';
  if (from === 40) return 'Более 40 часов';
  return 'Unknown time';
}
