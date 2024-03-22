import dotenv from 'dotenv';
import { session, Telegraf } from 'telegraf';

import { Stage, WizardScene } from 'telegraf/scenes';
import * as fs from 'fs';
import { Data, UserData } from './types.js';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is required!');
}

const superWizard = new WizardScene<any>(
  'add_to_team_wizard',
  async (ctx) => {
    console.log('step 0');

    await ctx.reply(
      'Введи свое имя и фамилию, пожалуйста. Например, Иван Иванов',
    );
    ctx.wizard.state.data = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    console.log('step 1');
    if (ctx.message?.text) {
      ctx.wizard.state.data.name = ctx.message.text;
    }
    await ctx.reply(
      'Сколько часов ты можешь уделять проекту в среднем в неделю?',
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'До 10',
                callback_data: JSON.stringify({ from: 0, to: 10 }),
              },
              {
                text: '10-20',
                callback_data: JSON.stringify({ from: 10, to: 20 }),
              },
              {
                text: '20-30',
                callback_data: JSON.stringify({ from: 20, to: 30 }),
              },
            ],
            [
              {
                text: '30-40',
                callback_data: JSON.stringify({ from: 30, to: 40 }),
              },
              {
                text: 'Более 40',
                callback_data: JSON.stringify({ from: 40, to: null }),
              },
              {
                text: '< Назад',
                callback_data: 'back',
              },
            ],
          ],
        },
      },
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery) {
      await ctx.reply(
        'Что-то пошло не так, попробуй выбрать один из предложенных вариантов',
      );
      return ctx.wizard.selectStep(2);
    }
    if (ctx.callbackQuery.data === 'back') {
      console.log('step 2');
      await ctx.answerCbQuery('back');
      await ctx.wizard.selectStep(ctx.wizard.cursor - 2);
      return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    }
    const data = JSON.parse(ctx.callbackQuery.data);

    ctx.wizard.state.data.availableTime = data;
    await ctx.answerCbQuery(
      `You are willing to dedicate from ${data.from} to ${
        data.to ?? 'infinity'
      } hours per week`,
    );
    await ctx.reply(
      `Перепроверь, пожалуйста, все ли верно. Если все верно, нажми "Да", если нет, нажми "Нет" или "< Назад"
      Имя: ${ctx.wizard.state.data.name}
      Время: ${data.from} - ${data.to ?? 'infinity'}
      `,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Да',
                callback_data: 'yes',
              },
              {
                text: 'Нет',
                callback_data: 'no',
              },
              {
                text: '< Назад',
                callback_data: 'back',
              },
            ],
          ],
        },
      },
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.callbackQuery) {
      await ctx.reply(
        'Что-то пошло не так, попробуй выбрать один из предложенных вариантов',
      );
      return ctx.wizard.selectStep(3);
    }
    if (ctx.callbackQuery.data === 'back') {
      console.log('step 3');
      await ctx.answerCbQuery('back');
      await ctx.wizard.selectStep(ctx.wizard.cursor - 2);
      return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    }
    if (ctx.callbackQuery.data === 'no') {
      console.log('step 0');
      await ctx.answerCbQuery('no');
      await ctx.wizard.selectStep(0);
      return ctx.wizard.steps[ctx.wizard.cursor](ctx);
    }
    if (ctx.callbackQuery.data === 'yes') {
      console.log('step 4');
      await ctx.answerCbQuery('yes');
      const data = ctx.wizard.state.data;
      const userId = ctx.from?.id;
      const chatId = ctx.callbackQuery.message.chat.id;
      const dataWithTgUsername = {
        ...data,
        tgUsername: ctx.from?.username,
        chatId,
      };

      updateData({ userId: userId?.toString() ?? '', ...dataWithTgUsername });
      await ctx.reply(
        `Спасибо за регистрацию! Мы свяжемся с тобой в ближайшее время.`,
      );
      return ctx.scene.leave();
    }
    await ctx.reply(
      'Что-то пошло не так, попробуй выбрать один из предложенных вариантов',
    );
    return ctx.wizard.selectStep(3);
  },
);

const stage = new Stage([superWizard]);

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

function updateData({ ...rest }: UserData) {
  const data = fs.readFileSync('./data.json', 'utf8');
  const dataObj = JSON.parse(data) as Data;
  dataObj[rest.userId] = rest;
  const newDataStr = JSON.stringify(dataObj);
  fs.writeFileSync('./data.json', newDataStr, 'utf8');
}
