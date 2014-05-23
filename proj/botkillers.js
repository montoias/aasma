var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var msg = require('./communications');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var vec3 = mineflayer.vec3;	

var args = process.argv;

var bot = mineflayer.createBot({
  username: args[2],
  'spawnPoint': vec3 (parseInt(args[3]), parseInt(args[4]), parseInt(args[5])),
});

mvc.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);

bot.on('spawn', function(){
	var item = mvc.itemByName("swordDiamond");
	if(item != null){
		bot.equip(item, 'hand', function(err) {
			if (err) {
			  bot.chat("unable to equip " + item.name);
			  console.error(err.stack);
			} else {
			  bot.chat("equipped " + item.name);
			}
		})
	}
});


bot.on('chat', function(username, message) {
	if (username === bot.username) return;
	else {
		if(message.split('(')[0] === msg.guardsHelp[0]){
			var pos = message.split('(').pop().split(')')[0].split(',');
			var position = vec3 (pos[0], pos[1], pos[2]);
			moveTo(position);
		}
	}
});


function moveTo (pos) {
	bot.scaffold.to(pos, function(err) {
		if (err) {
			console.log("didn't make it: " ,err.code, pos, "trying again");
		} else {
			bot.chat("made it!");
			var enemy = mvc.nearestEnemy();
			//console.log(enemy);
			if(enemy){
				bot.lookAt(enemy.position);
				bot.attack(enemy);
			}
		}
	});
}

bot.on('health', function() {
  bot.chat(args[2] + " have " + bot.health);
  mvc.listInventory();
});
