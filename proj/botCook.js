var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;


var bot = mineflayer.createBot({
  username: "avillez",
  'spawnPoint': vec3 (1121, 4, 89),
});

//passes to the movementController info about the bot
mvc.setBot(bot);

bot.on('spawn', function(){
	//bot.setControlState('forward', true);
});

bot.on('time', function(){
	if(bot.time.day > 0 && bot.time.day < 6000) {
		bot.setControlState('jump', true);
	}
	else bot.setControlState('jump', false);
});
