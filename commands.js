const connection = require('./database');
const { bot } = require('./app');

const keyboard = [
  [{ text: '/help' }],
  [{ text: '/site' }],
  [{ text: '/creator' }]
];

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Приветствую! Выберите команду:', {
    reply_markup: {
      keyboard: keyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
  Список доступных команд:
  /site - отправляет в чат ссылку на сайт октагона
  /creator - отправляет в чат мое ФИО
  /randomItem - возвращает случайный предмет из БД
  /deleteItem (id объекта, скобки не писать) - удаляет предмет из БД по ID
  /getItemByID (id объекта, скобки не писать)- возвращает предмет из БД по ID
  /getAllItems - возвращает все предметы из БД
  /addItem (name;description) - добавляет предмет в БД
  /updateItem (id;name;description) - обновляет предмет в БД
  /startChat - начать анонимный чат
  /stopChat - завершить анонимный чат
  !qr генератор qr-кода
  !webscr генератор скриншотов веб-сайта
  `;
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/site/, (msg) => {
  const chatId = msg.chat.id;
  const siteUrl = 'https://students.forus.ru/';
  bot.sendMessage(chatId, `Сайт октагона: ${siteUrl}`);
});

bot.onText(/\/creator/, (msg) => {
  const chatId = msg.chat.id;
  const creatorInfo = 'Банников Максим Бесикович';
  bot.sendMessage(chatId, `Его величество: ${creatorInfo}`);
});

bot.onText(/\/randomItem/, (msg) => {
  const chatId = msg.chat.id;
  connection.query('SELECT * FROM items ORDER BY RAND() LIMIT 1', (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при получении случайного предмета.');
      console.error(err);
    } else if (results.length > 0) {
      const item = results[0];
      bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.description}`);
    } else {
      bot.sendMessage(chatId, 'В базе данных нет предметов.');
    }
  });
});

bot.onText(/\/deleteItem (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const itemId = match[1];

  connection.query('DELETE FROM items WHERE id = ?', [itemId], (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при удалении предмета.');
      console.error(err);
    } else if (results.affectedRows > 0) {
      bot.sendMessage(chatId, 'Предмет успешно удален.');
    } else {
      bot.sendMessage(chatId, 'Ошибка: предмет не найден.');
    }
  });
});

bot.onText(/\/getItemByID (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const itemId = match[1];

  connection.query('SELECT * FROM items WHERE id = ?', [itemId], (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при получении предмета.');
      console.error(err);
    } else if (results.length > 0) {
      const item = results[0];
      bot.sendMessage(chatId, `(${item.id}) - ${item.name}: ${item.description}`);
    } else {
      bot.sendMessage(chatId, 'Ошибка: предмет не найден.');
    }
  });
});

bot.onText(/\/getAllItems/, (msg) => {
  const chatId = msg.chat.id;
  connection.query('SELECT * FROM items', (err, results) => {
    if (err) {
      bot.sendMessage(chatId, 'Ошибка при получении списка предметов.');
      console.error(err);
    } else if (results.length > 0) {
      let response = 'Список предметов:\n';
      results.forEach(item => {
        response += `(${item.id}) - ${item.name}: ${item.description}\n`;
      });
      bot.sendMessage(chatId, response);
    } else {
      bot.sendMessage(chatId, 'В базе данных нет предметов.');
    }
  });
});

bot.onText(/\/addItem (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const itemData = match[1].split(';');
  const [name, description] = itemData;

  if (name && description) {
    connection.query('INSERT INTO items (name, description) VALUES (?, ?)', [name, description], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Ошибка при добавлении предмета.');
        console.error(err);
      } else {
        bot.sendMessage(chatId, 'Предмет успешно добавлен.');
      }
    });
  } else {
    bot.sendMessage(chatId, 'Ошибка: неверный формат данных. Ожидается "name;description".');
  }
});

bot.onText(/\/updateItem (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const itemData = match[1].split(';');
  const [id, name, description] = itemData;

  if (id && name && description) {
    connection.query('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, id], (err, results) => {
      if (err) {
        bot.sendMessage(chatId, 'Ошибка при обновлении предмета.');
        console.error(err);
      } else if (results.affectedRows > 0) {
        bot.sendMessage(chatId, 'Предмет успешно обновлен.');
      } else {
        bot.sendMessage(chatId, 'Ошибка: предмет не найден.');
      }
    });
  } else {
    bot.sendMessage(chatId, 'Ошибка: неверный формат данных. Ожидается "id;name;description".');
  }
});

bot.onText(/^\!webscr/, (msg) => {
  const userId = msg.from.id;
  const url = msg.text.substring(8).trim();
  const image = "https://api.letsvalidate.com/v1/thumbs/?url=" + encodeURIComponent(url) + "&width=1280&height=720";
  bot.sendMessage(msg.chat.id, `[📷](${image}) Приветик: ${url}`, {parse_mode: "MarkdownV2"});
});

bot.onText(/^\!qr/, (msg) => {
  const userId = msg.from.id;
  const data = msg.text.substring(4).trim();
  const imageqr = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(data);
  bot.sendMessage(msg.chat.id, `[✏️](${imageqr}) Ваш QR код: ${data}`, {parse_mode: "MarkdownV2"});
});
