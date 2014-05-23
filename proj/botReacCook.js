var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;
var oper = require('./chestOperations');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var ee = require('event-emitter');
var emitter = ee({}), listener;
var msg = require('./communications');

var selectedFood;
var cookedFood;

var wood =  17;

var itemsToCook = [
  319, // porkchop
  363, // beef
  365, // chicken
  392, //potato
];

var bot = mineflayer.createBot( {
  username: "avillezR",
  'spawnPoint': vec3 (1140, 4, 66),
});

//passes to the movementController info about the bot
mvc.setBot(bot);
oper.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);


bot.on('spawn', function() {
	setTimeout(cook, 1000);
});

function cook() {
	oper.moveToAndOpen('food');
}

bot.on('chestOpen', function(chest, kind) {
	if(kind == 'wood') {
		if(chest.count(wood) > 0) {
			chest.withdraw(wood, null, 1, function(err) {
				chest.close();
				bot.emit('gotWood');
			});
		}
		else {
			bot.chat(msg.ScoutCookerMsg[1]);
			chest.close();
			setTimeout(function() {oper.moveToAndOpen('wood')}, 10000);
		}
	}
	else if(kind == 'kitchen1') {
		chest.deposit(cookedFood, null, 1, function() {
			bot.chat(msg.CookerBotsMsg[0]);
			chest.close();
			cook();
		});
	}

	else if(kind == 'food') {
		for(item in itemsToCook) {
			if(chest.count(itemsToCook[item]) > 0) {
				selectedFood = itemsToCook[item];
				chest.withdraw(itemsToCook[item], null, 1, function(err) {
					chest.close();
					bot.emit('gotIngredients');
				});
				return;
			}
		}
		bot.chat(msg.ScoutCookerMsg[0]);
		chest.close();
		setTimeout(function() {oper.moveToAndOpen('food')}, 10000);
	}
});

bot.on('gotWood', function() {
	goBackToKitchen();
});

bot.on('gotIngredients', function() {
	oper.moveToAndOpen('wood');
});

bot.on('backToKitchen', function() {
	f = bot.openFurnace(bot.blockAt(vec3(1138, 4, 65)));
	f.on('open', function() {
		f.putInput(selectedFood, null, 1, function() {
			f.putFuel(wood, null, 1);
		});
	});
	f.on('update', checkOutput);
	function checkOutput() {
		if(f.outputItem() != null) {
			f.takeOutput(function(err, item) {
				console.log(item);
				cookedFood = item.type;
				f.close();
				bot.emit('foodReady');
			});
			f.removeListener('update', checkOutput);
		}
	}
});

bot.on('foodReady', function() {
	oper.moveToAndOpen('kitchen1');
});

bot.on('death', function() {
	setTimeout(cook, 1000);
});


function goBackToKitchen () {
  bot.scaffold.to(vec3 (1140, 4, 66), function(err) {
    bot.emit('backToKitchen');
  });
}

