import { Stage, WizardScene } from 'telegraf/scenes';
import { UserData } from '../types.js';
import * as db from '../db.js';

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
        userId: userId?.toString() ?? '',
      };

      await updateData(dataWithTgUsername);
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

export const stage = new Stage([superWizard]);

async function updateData({ availableTime, ...user }: UserData) {
  await db.addUser({
    ...user,
    availableFrom: availableTime.from,
    availableTo: availableTime.to,
    chatId: user.chatId.toString(),
  });
}
