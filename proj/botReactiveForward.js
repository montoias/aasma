var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "tit"
});

mvc.setBot(bot);

bot.on('spawn', function(){
	bot.setControlState('forward', true);
});

bot.on('entityMoved', function () {
	var botposition = bot.entity.position;
	var neighbors = mvc.freeNeighbors(botposition, bot);

	console.log(neighbors)
	if(neighbors.length > 0 && !mvc.isYawValid(bot.entity.yaw, botposition) ){
		var random = mvc.randomIntInc(0,(neighbors.length - 1));
		var elem = neighbors[random];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 }

});

bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");
});

