const { bot } = require('./app');

const waitingUsers = {};
const activeChats = {};

bot.onText(/\/startChat/, (msg) => {
  const chatId = msg.chat.id;

  if (waitingUsers[chatId] || activeChats[chatId]) {
    bot.sendMessage(chatId, 'Вы уже находитесь в очереди ожидания или в чате.');
    return;
  }

  const availableUser = Object.keys(waitingUsers).find(id => id !== chatId.toString());

  if (availableUser) {
    const partnerChatId = parseInt(availableUser);
    waitingUsers[chatId] = partnerChatId;
    activeChats[chatId] = partnerChatId;
    activeChats[partnerChatId] = chatId;

    bot.sendMessage(chatId, 'Вы подключены к собеседнику. Начинайте общение.');
    bot.sendMessage(partnerChatId, 'Вы подключены к собеседнику. Начинайте общение.');

    delete waitingUsers[partnerChatId];
  } else {
    waitingUsers[chatId] = true;
    bot.sendMessage(chatId, 'Вы добавлены в очередь ожидания. Ожидайте подключения собеседника.');
  }
});

bot.onText(/\/stopChat/, (msg) => {
  const chatId = msg.chat.id;

  if (activeChats[chatId]) {
    const partnerChatId = activeChats[chatId];
    bot.sendMessage(partnerChatId, 'Ваш собеседник покинул чат.');
    bot.sendMessage(chatId, 'Вы покинули чат.');

    delete activeChats[chatId];
    delete activeChats[partnerChatId];
  } else if (waitingUsers[chatId]) {
    delete waitingUsers[chatId];
    bot.sendMessage(chatId, 'Вы покинули очередь ожидания.');
  } else {
    bot.sendMessage(chatId, 'Вы не находитесь в чате.');
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (activeChats[chatId]) {
    const partnerChatId = activeChats[chatId];
    if (!msg.text.startsWith('/')) {
      bot.sendMessage(partnerChatId, msg.text);
    }
  }
});
