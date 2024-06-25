const TelegramBot = require('node-telegram-bot-api');
const mysql = require("mysql2");

const token = '7432819616:AAFcIcDQ8_kC5HgFDRHJnDRt3araladJ92o';

const bot = new TelegramBot(token, {polling: true});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ChatBotTests'
});

connection.connect(err=>{
  if(err){
      console.error('Error connection to the DB'. err.stack);
      return;
  }

  console.log('Connected to the DB')
});



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
  !qr генератор qr-кода
  !websqr генератор скриншотов веб-сайта
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

bot.onText(/^\!webscr/, function(msg) {
  console.log(msg);
  var userId = msg.from.id;
  var url = msg.text.substring(8).trim();
  var image = "https://api.letsvalidate.com/v1/thumbs/?url=" + encodeURIComponent(url) + "&width=1280&height=720";
  bot.sendMessage(msg.chat.id, `[📷](${image}) Приветик: ${url}`, {parse_mode : "MarkdownV2"});
});


bot.onText(/^\!qr/, function(msg) {
  console.log(msg);
  var userId = msg.from.id;
  var data = msg.text.substring(4).trim();
  var imageqr = "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" + encodeURIComponent(data);
  bot.sendMessage(msg.chat.id, `[✏️](${imageqr}) Ваш QR код: ${data}`, {parse_mode : "MarkdownV2"});
});
