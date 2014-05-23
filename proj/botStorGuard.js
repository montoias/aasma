var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var msg = require('./communications');
var vec3 = mineflayer.vec3;
var cron = require('cron');

var args = process.argv;

var bot = mineflayer.createBot({
  username: args[2],
  'spawnPoint': vec3 (parseInt(args[3]), parseInt(args[4]), parseInt(args[5])),
});

mvc.setBot(bot);


var cronJob = cron.job("* * * * * *", function(){
	try {
		var enemy = mvc.nearestEntity();
		//console.log(enemy);
		if(enemy){
			bot.lookAt(enemy.position);
			bot.attack(enemy);
		}
	} catch (ex) {
		console.log ("nheeeee")
	}
}); 

cronJob.start();

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





bot.on('health', function() {
  bot.chat(args[2] + " have " + bot.health);
  mvc.listInventory();
});

bot.on('death', function () {
	cronJob.stop();
});
