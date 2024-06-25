const TelegramBot = require('node-telegram-bot-api');

const token = '7432819616:AAFcIcDQ8_kC5HgFDRHJnDRt3araladJ92o';

const bot = new TelegramBot(token, {polling: true});

const keyboard = [
  [{ text: '/help' }],
  [{ text: '/site' }],
  [{ text: '/creator' }],
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