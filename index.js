const root = document.getElementById('root');
async function getData() {
  const data1 = await fetch('./groups.json').then((res) => res.json());
  root.innerHTML = getHtml(data1);
}
function getHtml(data) {
  return `<div>${data
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
}
getData();
