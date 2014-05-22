var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;
var oper = require('./chestOperations');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var ee = require('event-emitter');
var emitter = ee({}), listener;

var cooking = false;
var baking = false;

var wood =  17;

var itemsToCook = [
  319, // porkchop
  363, // beef
  365, // chicken
  392, //potato
];

var itemsToBake = [
  296, //wheat
  353, //sugar
  344, //egg
  335, //milk
  86 //pumpkin
];

var fruit = [
  260, //apple
  391, //carrot
  360, //melon
];

var recipes = [
  297, //bread
  354, //cake
  400  //pumpkin pie
];


var bot = mineflayer.createBot( {
  username: "avillez",
  'spawnPoint': vec3 (1140, 4, 66),
});

//passes to the movementController info about the bot
mvc.setBot(bot);
oper.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);


bot.on('spawn', function() {
	//bot.setControlState('forward', true);
});

bot.on('time', function() {
	if((bot.time.day > 12000 && bot.time.day < 15000) || (bot.time.day > 19000 && bot.time.day < 21000)) {
		if(!cooking && !baking) {
			cook();


		}
	}
	else {
		if(!baking && !cooking) {
			bake();
		}
	}
});

function cook() {
	cooking = true;
	oper.moveToAndOpen('food');

//cooking = false;
}

function bake() {
	//baking = true;
}

bot.on('chestOpen', function(chest, kind) {
	if(kind == 'wood') {
		console.log("WOOD");
		// if(chest.count(wood) > 0) {
		// 	chest.withdraw(wood, null, chest.count(wood), function(err) {
		// 		chest.close();
		// 		bot.emit('gotWood');
		// 	});
		// }
	}

	if(kind == 'food') {
		//if(chest.count(food) > 0) {
			console.log("FOOD " + chest.count(food));
		// 	chest.withdraw(wood, null, chest.count(wood), function(err) {
		// 		chest.close();
		// 		bot.emit('gotWood');
		// 	});
		//}
	}

	else if(cooking) {
		for(item in itemsToCook) {
			if(chest.count(item) > 0) {
				chest.withdraw(item, null, chest.count(item), function(err) {
					chest.close();
					bot.emit('gotIngredients');
				});
				break;
			}
		}	
	}
});

bot.on('gotWood', function() {
	goBackToKitchen();
});

bot.on('gotIngredients', function() {
	if(cooking)
		oper.moveToAndOpen('wood');
	else 
		goBackToKitchen();
});

function goBackToKitchen () {
  bot.scaffold.to(vec3 (1140, 4, 66), function(err) {
    if (err) {
        console.log("didn't make it: " ,err.code, vec3 (1140, 4, 66), "trying again");
    } 
    else {
        bot.chat("made it!");
        bot.emit('backToKitchen');
	}
    });
}

