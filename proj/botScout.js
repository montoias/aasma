var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;


var bot = mineflayer.createBot({
  username: "scout",
  'spawnPoint': vec3 (1121, 4, 89),
});

//passes to the movementController info about the bot
mvc.setBot(bot);

bot.on('spawn', function(){
	bot.setControlState('forward', true);
});

var steps = 0;

//when the bot moves it is cheked if there is something, around him, that it is to be digged
bot.on('entityMoved', function () {
	if(digging)
		return;

	var botposition = bot.entity.position;

	//see the free positions around the bot and moves forward, after walking 20 steps moves to other (random) direction
	var neighbors = mvc.freeNeighbors(botposition);

	steps ++;

	if(neighbors.length > 0 && steps === 50){
		var random = mvc.randomIntInc(0,(neighbors.length - 1));
		var elem = neighbors[random];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 	steps = 0;
	 } else if (steps === 50) {
	 	steps = 0;
	 } else if(!mvc.isYawValid(bot.entity.yaw,botposition)){
	 	bot.setControlState('jump',true);
		bot.clearControlStates();
		bot.setControlState('forward',true);
	 	steps = 49;
	 }

	var tree = mvc.materialNeighbor(botposition, 'wood');
	if(tree.length >0){
		bot.chat("Trees at " + botposition);
	}

	var enemy = mvc.nearestPassiveEntities();
	if(enemy){
		bot.chat("Animals to be killed at " + botposition);
	}
});


bot.on('health', function() {
  bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food");
  mvc.listInventory();
});

bot.on('entityHurt', function (ent) {
	if(ent.type != 'mob' && (ent.username === bot.entity.username)){
		bot.chat("Please help me! Me ser " + bot.entity.username);
	}
});