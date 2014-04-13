var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;

var steps = 0;
var bot = mineflayer.createBot({
  username: "ritji"
});

mvc.setBot(bot);

bot.on('spawn', function(){
	bot.setControlState('forward', true);
});

var digging = false;

bot.on('entityMoved', function () {
	if(digging)
		return;

	var botposition = bot.entity.position;

	var tree = mvc.treeNeighbor(botposition);
	if(tree.length >0){
		 digging = true;
		 bot.setControlState('forward', false);

		 console.log('so pa ver se entras aqui mais do que uma vez');
		 var digBlocks = mvc.treePossiblePositions(tree[0]);
		 console.log(digBlocks)	
		 digBlocks.forEach (function  (b) {
		 	if(bot.canDigBlock(b)){
		 	 	bot.dig(b,onDiggingCompleted);
		 	 	bot.chat("diging");
		 	}
		 });

		 return;
	}
	var neighbors = mvc.freeNeighbors(botposition);

	steps ++;

	//console.log(neighbors)
	if(neighbors.length > 0 && steps == 10){
		var random = mvc.randomIntInc(0,(neighbors.length - 1));
		var elem = neighbors[random];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 	steps = 0;
	 } else if (steps == 10) {
	 	steps = 0;
	 }

});


function onDiggingCompleted(err,b) {
    bot.chat("finished digging ");
}

bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");
});

bot.on('diggingCompleted', function(block){
	bot.chat("chegamos ao complete");
	digging = false;
	bot.setControlState('forward', true);

});


bot.on('diggingAborted', function(block){
	bot.chat("ABORTEUi!" + block);
});
