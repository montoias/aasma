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
	vec3(1140, 4, 23),
	vec3(1163, 4, 68),
	vec3(1174, 4, 26),
	vec3(1191, 4, 26),
	vec3(1192, 4, 43),
	vec3(1134, 4, 33),
	vec3(1169, 4, 37),
	vec3(1087, 4, 138),	
	vec3(1132, 4, 227),
]

var animalsPositions = 
[	
	vec3(1142, 4, 56),
	vec3(1115, 4, 21),
	vec3(1110, 4, 51),
	vec3(1122, 4, 58),
]

bot.on('chat', function(username, message) {
	if (username === bot.username) return;
	if(message === msg.ScoutCookerMsg[0] || message === msg.ScoutCookerMsg[1]){
		bot.chat(msg.ScoutCookerMsg[2]);
		bot.chat(msg.ScoutLJMsg[4]);
		bot.chat(msg.ScoutFoodMsg[4]);
	}
	else if (message === msg.ConstructorScoutMsgs[0]){
		bot.chat(msg.ScoutCookerMsg[2]);
		bot.chat(msg.ScoutLJMsg[4]);
	}
	else if (message === msg.ScoutLJMsg[0]) {
		bot.chat (msg.ScoutLJMsg[1]);
		iterateTree(0);
	} else if (message === msg.ScoutFoodMsg[0]) {
		bot.chat (msg.ScoutFoodMsg[1]);
		iterateAnimals(0);
	} else if (message === 'go'){
		moveTo(vec3(1163, 4, 68))
	}
});


////////////////////////////////////////////// ATTENDING LUMBER JACKER/////////////////////////////////////////////////////////
function iterateTree (index) {
	if(index === treePositions.length){
		return;
	}
	moveTo(treePositions[index], checkWood, index);
}

function checkWood (index) {
	var botposition = bot.entity.position;
	var wood = mvc.findingWood(botposition);
	if(wood === undefined) {
		console.log ("cant find any wood");
		iterateTree(++index);
	} else {
		bot.chat (msg.ScoutLJMsg[2] + botposition);
	}
}


////////////////////////////////////////////// ATTENDING COLLECTS FOOD////////////////////////////////////////////////////////

function iterateAnimals (index){
	if(index === animalsPositions.length){
		return;
	}
	moveTo(animalsPositions[index], checkAnimal, index);
}

function checkAnimal (index) {
	var botposition = bot.entity.position;
	var animal = mvc.nearestPassiveEntities();
	if(!animal) {
		iterateAnimals(++index);
		console.log ("cant find any animal");
	} else {
		bot.chat (msg.ScoutFoodMsg[2] + botposition);
	}
}


function moveTo (pos, func, index) {
	bot.scaffold.to(pos, function(err) {
		if (err) {
			console.log("didn't make it: " ,err.code, pos, "trying again");
		} else {
			console.log("made it!");
			setTimeout( function () {func(index);}, 1000);
		}
	});
}




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