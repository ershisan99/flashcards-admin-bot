import { FmtString } from 'telegraf/format';
import { Group } from '../db.js';

export function sendGroupInfo(
  groups: Group[],
  sendMessage: (
    chatId: number | string,
    text: string | FmtString,
    extra?: any,
  ) => void,
) {
  groups.forEach((group) => {
    group.users.forEach((user, i, arr) => {
      const otherUsers = group.users.filter((u) => u.chatId !== user.chatId);
      if (otherUsers.length === 0) {
        sendMessage(user.chatId, 'К сожалению, в твою группу не попал никто.');
        return;
      }
      let message = `Привет, ${user.name}! Твои напарники:\n\n${otherUsers
        .map(
          (u) =>
            `- <a href="tg://user?id=${u.chatId}">${u.name}</a> @${
              u.tgUsername
            }. Время: ${getAvailableTime(u.availableFrom, u.availableTo)}`,
        )
        .join(' \n')}`;

      if (i === 0) {
        message +=
          '\n\nТебя выбрали ответственным(ой) за первоначальную коммуникацию. Создай, пожалуйста, группу в телеграме и пригласи в нее своих напарников.';
      } else {
        message += `\n\n${arr[0].name} был(а) выбран(а) ответственным за первоначальную коммуникацию. Он(а) создаст группу в телеграме и пригласит в нее всех участников.`;
      }
      sendMessage(user.chatId, message, { parse_mode: 'HTML' });
    });
  });
}

function getAvailableTime(from: number, to: number | null) {
  if (from === 0 && to === 10) return 'До 10 часов';
  if (from === 10 && to === 20) return '10-20 часов';
  if (from === 20 && to === 30) return '20-30 часов';
  if (from === 30 && to === 40) return '30-40 часов';
  if (from === 40) return 'Более 40 часов';
  return 'Unknown time';
}
