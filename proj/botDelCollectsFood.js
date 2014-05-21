var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);

var mvc = require('./movementController');
var msg = require('./communications');
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "foodBotDel",
  'spawnPoint': vec3 (1121, 4, 89),
});

//passes to the movementController info about the bot
mvc.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);

var Modes = {
	NOTHING : 0,
	MOVING : 1,
	DEPOSITING : 2,
	KILLING : 3
}




function moveTo (pos) {
  console.log(pos)
  bot.scaffold.to(pos, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, pos, "trying again");
      } else {
        bot.chat("made it!");
      }
    });
}

