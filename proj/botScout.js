var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var msg = require('./communications');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var vec3 = mineflayer.vec3;


var bot = mineflayer.createBot({
  username: "scout",
  'spawnPoint': vec3 (1121, 4, 89),
});

//passes to the movementController info about the bot
mvc.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);

bot.on('spawn', function(){
	//bot.setControlState('forward', true);
});

	// vec3(1140, 4, 23),
	// vec3(1087, 4, 138),	
	// vec3(1132, 4, 227),
var treePositions = 
[
	vec3(1140, 4, 23),
	vec3(1145, 4, 50),	
	vec3(1150, 4, 45),

]

var animalsPositions = 
[	
	vec3(1142, 4, 56),
	vec3(1115, 4, 21),

]

bot.on('chat', function(username, message) {
	if (username === bot.username) return;
	if(message === msg.ScoutCookerMsg[0]){
		bot.chat(msg.ScoutCookerMsg[1]);
		bot.chat(msg.ScoutLJMsg[4]);
		bot.chat(msg.ScoutFoodMsg[4]);
	}
	else if (message === msg.ScoutLJMsg[0]) {
		bot.chat (msg.ScoutLJMsg[1]);
		bot.emit("iterateTree");
	} else if (message === msg.ScoutFoodMsg[0]) {
		bot.chat (msg.ScoutFoodMsg[1]);
		iterateAnimals();
	} else if (message === 'come')
		moveTo(vec3(1140, 4, 23))
});


var index = 0;
////////////////////////////////////////////// ATTENDING LUMBER JACKER/////////////////////////////////////////////////////////
bot.on ("iterateTree", function () {
	if(index === treePositions.length){
		console.log(treePositions)
		return;
	}
	console.log("Entrei", treePositions[index]);
	moveTo(treePositions[index++]);
});

function checkWood () {}


////////////////////////////////////////////// ATTENDING COLLECTS FOOD////////////////////////////////////////////////////////

// function iterateAnimals (){
// 	var pos = animalsPositions.pop();
// 	moveTo(pos, checkAnimal);
// }

// function checkAnimal () {
// 	var botposition = bot.entity.position;
// 	var animal = mvc.nearestPassiveEntities();
// 	console.log("BOT position " + botposition);
// 	console.log("ANIMAL          " + animal);
// 	if(!animal) {
// 		iterateAnimals();
// 		console.log ("cant find any animal");
// 	} else {
// 		bot.chat (msg.ScoutFoodMsg[2] + botposition);
// 	}
// }


function moveTo (pos) {
	bot.scaffold.to(pos, function(err) {
		if (err) {
			console.log("didn't make it: " ,err.code, pos, "trying again");
			bot.emit("iterateTree")

		} else {
			console.log("made it!");
			bot.emit("treeArrived");
		}
	});
}

bot.on("treeArrived", function () {
	var botposition = bot.entity.position;
	var wood = mvc.materialNeighbor(botposition, 'wood');
	console.log(wood)
	if(wood.length === 0) {
		console.log ("cant find any wood");
		bot.emit("iterateTree")
	} else {
		bot.chat (msg.ScoutLJMsg[2] + botposition);
	}

})



//////////////////////////////////////////////////////////////

bot.on('health', function() {
  bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food");
  mvc.listInventory();
});

bot.on('entityHurt', function (ent) {
	if(ent.type != 'mob' && (ent.username === bot.entity.username)){
		bot.chat("Please help me! Me ser " + bot.entity.username);
	}
});