var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc1 = require('./movementController');
var mvc2 = require('./movementController');
var vec3 = mineflayer.vec3;
var cron = require('cron');


var bot1 = mineflayer.createBot({
  username: "guard1",
  'spawnPoint': vec3 (1104, 4, 140),
});

mvc1.setBot(bot1);

var bot2 = mineflayer.createBot({
  username: "guard2",
  'spawnPoint': vec3 (1104, 4, 134),
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


function listInventory1() {
  bot1.chat("Inventorio " + bot1.inventory.items().map(itemStr).join(", "));
}

function listInventory2() {
  bot2.chat("Inventorio " + bot2.inventory.items().map(itemStr).join(", "));
}

//function that counts every item that it exits at the bot's inventory 
function itemStr(item) {
  if (item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}


function itemByName (name, bot) {
  return bot.inventory.items().filter(function(item) {
    return item.name === name;
 }) [0];
}

bot1.on('spawn', function(){
	var item = itemByName("swordDiamond", bot1);
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
	var item = itemByName("swordDiamond", bot2);
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
  bot1.chat("guard1 have " + bot1.health);
    listInventory1();

});

bot2.on('health', function() {
  bot2.chat("guard2 have " + bot2.health);
    listInventory2();
});

