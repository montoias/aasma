var mineflayer = require('../');
var bot = mineflayer.createBot({
  username: "Rita",
  // either put email and password here,
  // or test this against a server with
  // online-mode set to false.
});
bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  bot.chat(message);
});
