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


var treePositions = 
[
	vec3(1132, 4, 227),	
	vec3(1087, 4, 138),
	vec3(1140, 4, 23),
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
		iterateTree();
	} else if (message === msg.ScoutFoodMsg[0]) {
		bot.chat (msg.ScoutFoodMsg[1]);
		iterateAnimals();
	}
});


////////////////////////////////////////////// ATTENDING LUMBER JACKER/////////////////////////////////////////////////////////
function iterateTree (){
	var pos = treePositions.pop();
	moveTo(pos, checkWood);
}

function checkWood () {
	var botposition = bot.entity.position;
	var wood = mvc.materialNeighbor(botposition, 'wood');
	if(!wood) {
		iterateTree();
		console.log ("cant find any wood");
	} else {
		bot.chat (msg.ScoutLJMsg[2] + botposition);
	}
}


////////////////////////////////////////////// ATTENDING COLLECTS FOOD////////////////////////////////////////////////////////

function iterateAnimals (){
	var pos = animalsPositions.pop();
	moveTo(pos, checkAnimal);
}

function checkAnimal () {
	var botposition = bot.entity.position;
	var animal = mvc.nearestPassiveEntities();
	console.log("BOT position " + botposition);
	console.log("ANIMAL          " + animal);
	if(!animal) {
		iterateAnimals();
		console.log ("cant find any animal");
	} else {
		bot.chat (msg.ScoutFoodMsg[2] + botposition);
	}
}

//////////////////////////////////////////////////////////////

function moveTo (pos, func) {
	bot.scaffold.to(pos, function(err) {
		if (err) {
			console.log("didn't make it: " ,err.code, pos, "trying again");
			moveTo(pos, func);
		} else {
			bot.chat("made it!");
			func();
		}
	});
}

bot.on('health', function() {
  bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food");
  mvc.listInventory();
});

bot.on('entityHurt', function (ent) {
	if(ent.type != 'mob' && (ent.username === bot.entity.username)){
		bot.chat("Please help me! Me ser " + bot.entity.username);
	}
});