const TelegramBot = require('node-telegram-bot-api');

const token = '7432819616:AAFcIcDQ8_kC5HgFDRHJnDRt3araladJ92o';

const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Привет, октагон!');
});