var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var msg = require('./communications');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "LumberJack",
  'spawnPoint': vec3 (1121, 4, 90),
});

//passes to the movementController info about the bot
mvc.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);

bot.on('chat', function(username, message) {
	if (username === bot.username) return;
	if (message === msg.ScoutLJMsg[4]) {
		bot.chat(msg.ScoutLJMsg[0])
	}
	else if(message.split('(')[0] === msg.ScoutLJMsg[2]){
		var pos = message.split('(').pop().split(')')[0].split(',');
		var position = vec3 (pos[0], pos[1], pos[2]);
		moveTo(position);
	}
});


function moveTo (pos) {
	bot.scaffold.to(pos, function(err) {
		if (err) {
			console.log("didn't make it: " ,err.code, pos, "trying again");
			moveTo(pos);
		} else {
			bot.chat("made it!");
		}
	});
}

function moveRandom () {
	
}