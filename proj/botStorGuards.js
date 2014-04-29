var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc1 = require('./movementController');
var mvc2 = require('./movementController');
var vec3 = mineflayer.vec3;
var cron = require('cron');


var bot1 = mineflayer.createBot({
  username: "guardStor1",
  'spawnPoint': vec3 (1123, 4, 69),
});

mvc1.setBot(bot1);

var bot2 = mineflayer.createBot({
  username: "guardStor2",
  'spawnPoint': vec3 (1119, 4, 69),
});

mvc2.setBot(bot2);


var cronJob = cron.job("* * * * * *", function(){
	var enemy = mvc1.nearestEntity();
	//console.log(enemy);
		if(enemy){
			bot1.lookAt(enemy.position);
			bot1.attack(enemy);
		}

	var enemy = mvc2.nearestEntity();
		if(enemy){
			bot2.lookAt(enemy.position);
			bot2.attack(enemy);
		}
}); 

cronJob.start();

bot1.on('spawn', function(){
	var item = mvc1.itemByName("swordDiamond");
	if(item != null){
		bot1.equip(item, 'hand', function(err) {
			if (err) {
			  bot1.chat("unable to equip " + "Diamond Sword");
			  console.error(err.stack);
			} else {
			  bot1.chat("equipped " + "Diamond Sword");
			}
		})
	}
});


bot2.on('spawn', function(){
	var item = mvc2.itemByName("swordDiamond");
	if(item != null){
		bot2.equip(item, 'hand', function(err) {
			if (err) {
			  bot2.chat("unable to equip " + "Diamond Sword");
			  console.error(err.stack);
			} else {
			  bot2.chat("equipped " + "Diamond Sword");
			}
		});
	}
});


bot1.on('health', function() {
  bot1.chat("guardStor1 have " + bot1.health);
    mvc1.listInventory();

});

bot2.on('health', function() {
  bot2.chat("guardStor2 have " + bot2.health);
    mvc2.listInventory();
});