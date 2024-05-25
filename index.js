const data = [
  [
    {
      userId: '257862776',
      name: 'Катя Разуева',
      availableTime: { from: 10, to: 20 },
      tgUsername: 'ekate_25',
      chatId: 257862776,
    },
    {
      userId: '320185869',
      name: 'Евгений Березкин',
      availableTime: { from: 10, to: 20 },
      tgUsername: 'breznovic',
      chatId: 320185869,
    },
    {
      userId: '484619169',
      name: 'Владислав Беляев',
      availableTime: { from: 10, to: 20 },
      tgUsername: 'buladzislau',
      chatId: 484619169,
    },
  ],
  [
    {
      userId: '550022173',
      name: 'Садов Артем',
      availableTime: { from: 10, to: 20 },
      tgUsername: 'SadovArtem',
      chatId: 550022173,
    },
    {
      userId: '1534716020',
      name: 'Игорь Шаргин',
      availableTime: { from: 10, to: 20 },
      tgUsername: 'Igor_Shargin',
      chatId: 1534716020,
    },
    {
      userId: '178615283',
      name: 'Артур Ислакаев',
      availableTime: { from: 20, to: 30 },
      tgUsername: 'kven_a',
      chatId: 178615283,
    },
  ],
  [
    {
      userId: '1111257233',
      name: 'Александр Черемных',
      availableTime: { from: 20, to: 30 },
      chatId: 1111257233,
    },
    {
      userId: '74330176',
      name: 'Герман Владислав',
      availableTime: { from: 30, to: 40 },
      tgUsername: 'vladloot',
      chatId: 74330176,
    },
    {
      userId: '212999392',
      name: 'Листопад Георгий',
      availableTime: { from: 30, to: 40 },
      tgUsername: 'thencatchfinally',
      chatId: 212999392,
    },
  ],
  [
    {
      userId: '855517731',
      name: '/add_to_team',
      availableTime: { from: 30, to: 40 },
      tgUsername: 'go_phase',
      chatId: 855517731,
    },
  ],
];

const root = document.getElementById('root');

const html = `<div>${data
  .map((group) => {
    return `<table><thead>
      <tr>
        <th>Имя</th>
        <th>Время</th>
        <th>Telegram</th>
      </tr>
    </thead>
    <tbody>${group
      .map((el) => {
        return `<tr>
        <td >${el.name}</td>
        <td style='width: 200px'">${el.availableTime.from} - ${el.availableTime.to}</td>
        <td style='width: 200px'>${el.tgUsername}</td>
      </tr>`;
      })
      .join('')}</tbody>
  </table>`;
  })
  .join('')}</div>`;

root.innerHTML = html;
