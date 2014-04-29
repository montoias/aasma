var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;


var steps = 0;
var bot = mineflayer.createBot({
  username: "foodBot",
  'spawnPoint': vec3 (1127, 4, 45),
});

//passes to the movementController info about the bot
mvc.setBot(bot);

bot.on('spawn', function(){
	bot.chat("RENASCIIIIIIIIIIIIIIIIIIII");
	bot.setControlState('forward', true);
});

bot.on('respawn', function(){
	bot.chat("RENASCIIIIIIIIIIIIIIIIIIII222222222222222222222222");
	bot.setControlState('forward', true);
});



//when the bot moves it is cheked if there is any mob to kill, around him
bot.on('entityMoved', function () {
	
	var botposition = bot.entity.position;

	//toss the inventory around the storage
	var storage = mvc.typeMaterialNeighbor(botposition, 'bedrock');
	if(storage.length > 0) {
			var inventory = bot.inventory.items();
		if(inventory.length > 0) { 
			inventory.forEach(function (a) {
				bot.tossStack(a, function(err) {
					if (err) {
			          bot.chat("unable to toss " + a.name);
			        } else {
			          bot.chat("tossed " + a.name);
			          mvc.listInventory();
			        }
	        	});
			});
		}
	}

	//see if there are any passiveEntite to be killed, if there is the bot kills it.
	var enemy = mvc.nearestPassiveEntities();
		if(enemy){
			bot.lookAt(enemy.position);
			bot.attack(enemy);
		}

	//see the free positions around the bot and moves forward, after walking 20 steps moves to other (random) direction
	var neighbors = mvc.freeNeighbors(botposition);

	steps ++;

	if(neighbors.length > 0 && steps === 20){
		var random = mvc.randomIntInc(0,(neighbors.length - 1));
		var elem = neighbors[random];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 	steps = 0;
	 } else if (steps === 20) {
	 	steps = 0;
	 } else if(!mvc.isYawValid(bot.entity.yaw,botposition)){
	 	bot.setControlState('jump',true);
		bot.clearControlStates();
		bot.setControlState('forward',true);
	 	steps = 19;
	 }

});


//Indicates the heath and the inventory of the bot
bot.on('health', function() {
  bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food");
  mvc.listInventory();
});

bot.on('entityHurt', function (ent) {
	if(ent.type != 'mob' && (ent.username === bot.entity.username)){
		bot.chat("Please help me! Me ser " + bot.entity.username);
	}
});

bot.on('entityEat', function(entity) {
  bot.chat(entity.username + ": OM NOM NOM NOMONOM. that's what you sound like.");
});

bot.on('death', function() {
  bot.chat(bot.entity.username + "DIED");
});
