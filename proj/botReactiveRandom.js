var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;

var steps = 0;
var bot = mineflayer.createBot({
  username: "ritjii",
  'pvp': true,
  'online-mode':false,
});

//passes to the movementController info about the bot
mvc.setBot(bot);

bot.on('spawn', function(){
	bot.setControlState('forward', true);
});
//flag que indica se está a fazer digging ou nao
var digging = false;

//when the bot moves it is cheked if there is something, around him, that it is to be digged
bot.on('entityMoved', function () {
	if(digging)
		return;
	var botposition = bot.entity.position;

	var tree = mvc.materialNeighbor(botposition, 'wood');
	if(tree.length >0){
		 digging = true;
		 bot.setControlState('forward', false);
		 tree.forEach(function (a) {
		 	var digBlocks = mvc.treePossiblePositions(a);
		 	digBlocks.forEach (function  (b) {
		 		if(bot.canDigBlock(b)){
			 	 	bot.dig(b,onDiggingCompleted);
			 	 	bot.chat("diging");
		 		}
		 	});
		 });	 
		 return;
	}

	//toss the inventory around the storage
	var storage = mvc.typeMaterialNeighbor(botposition, 'oreGold');
	if(storage.length > 0) {
			var inventory = bot.inventory.items();
		if(inventory.length > 0) { 
			inventory.forEach(function (a) {
				bot.tossStack(a, function(err) {
					if (err) {
			          bot.chat("unable to toss " + a.name);
			        } else {
			          bot.chat("tossed " + a.name);
			        }
	        	});
			});
		}
	}

	//see the free positions around the bot and moves forward, after walking 10 steps moves to other (random) direction
	var neighbors = mvc.freeNeighbors(botposition);

	steps ++;

	if(neighbors.length > 0 && steps == 10){
		var random = mvc.randomIntInc(0,(neighbors.length - 1));
		var elem = neighbors[random];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 	steps = 0;
	 } else if (steps == 10) {
	 	steps = 0;
	 } else if(!mvc.isYawValid(bot.entity.yaw,botposition)){
	 	bot.setControlState('jump',true);
		bot.clearControlStates();
		bot.setControlState('forward',true);
	 	steps = 9;
	 }
});


//Indicates the heath and the inventory of the bot
bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");
  listInventory();
});

//function that lists the bot's inventory
function listInventory() {
  bot.chat("Inventorio" + bot.inventory.items().map(itemStr).join(", "));
}

//function that ounts every item that it exits at the bot's inventory 
function itemStr(item) {
  if (item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}

//auxiliar function to the operation dig
function onDiggingCompleted(err,b) {
    bot.chat("finished digging ");
}

//auxiliar function to the operation dig
bot.on('diggingCompleted', function(block){
	bot.chat("chegamos ao complete");
	digging = false;
	bot.setControlState('forward', true);
});

//auxiliar function to the operation dig
bot.on('diggingAborted', function(block){
	bot.chat("ABORTEI!" + block);
});


//When the bot was hurt attacks the entity closest to the bot
bot.on('entityHurt', function (ent) {
	var enemy = mvc.nearestEntity();
	if(enemy){
		bot.lookAt(enemy.position);
		bot.attack(enemy);
	}
});
