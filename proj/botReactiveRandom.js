var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;

var steps = 0;
var bot = mineflayer.createBot({
  username: "ritjii",
  'spawnPoint': vec3 (1149, 4, 26),
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
	var storage = mvc.typeMaterialNeighbor(botposition, 'bedrock');
	if(storage.length > 0) {
		var inventory = bot.inventory.items();
		if(inventory.length > 0) { 
			inventory.forEach(function (a) {
				var item = mvc.itemByName(a.name);
			    console.log(bot.inventory);
				console.log("a.name " + a.name);
				console.log("O ITEM " + item.type);
				bot.toss(item.type, null, 1, function(err) {
					if (err) {
			          bot.chat("unable to toss " + item.name);
			        } else {
			          bot.chat("tossed " + item.name);
			          mvc.listInventory();
			        }
	        	});
			});
		}
	}

	//see the free positions around the bot and moves forward, after walking 20 steps moves to other (random) direction
	var neighbors = mvc.freeNeighbors(botposition);

	steps ++;

	if(neighbors.length > 0 && steps == 20){
		var random = mvc.randomIntInc(0,(neighbors.length - 1));
		var elem = neighbors[random];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 	steps = 0;
	 } else if (steps == 20) {
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

//auxiliar function to the operation dig
function onDiggingCompleted(err,b) {
    bot.chat("finished digging");
}

//auxiliar function to the operation dig
bot.on('diggingCompleted', function(block){
	digging = false;
	bot.setControlState('forward', true);
});

//auxiliar function to the operation dig
bot.on('diggingAborted', function(block){
	bot.chat("aborted digging" + block);
});


//When the bot was hurt attacks the entity closest to the bot
bot.on('entityHurt', function (ent) {
	if(ent.type != 'mob' && (ent.username === bot.entity.username)) {
		var enemy = mvc.nearestEntity();
		if(bot.health <= 5){
			bot.chat("Please help me! Me ser " + bot.entity.username);
		}
		if(enemy){
			bot.lookAt(enemy.position);
			bot.attack(enemy);
		}
	}
});

bot.on('entityEat', function(entity) {
  bot.chat(entity.username + ": OM NOM NOM NOMONOM. that's what you sound like.");
});
