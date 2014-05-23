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

var cooking = false;
var baking = false;
var selectedFood;
var cookedFood;
var actualIntention;

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

var fruits = [
  260, //apple
  391, //carrot
  360 //melon
];

var recipes = {
	297: { //bread
		296: 3
	},
	354: { //cake
		296: 3,
		353: 2,
		344: 1,
		335: 3
	},
	400: { //pumpkin pie
		344: 1,
		353: 1,
		86: 1
	},
	320: { //pork
		319: 1
	},
	366: { //chicken
		365: 1
	},
	364: { //steak
		363: 1
	}
};

var recipesForIntention = {
	'cookPorkchops': 320,
	'cookChicken': 366,
	'cookSteak': 364,
	'bakeBread':297,
	'bakeCake': 354,
	'bakePie':400
};

var beliefs = {
	'rain': false,
	'time': 0,
}

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

bot.on('rain', function() {
	beliefs['rain'] = !beliefs['rain'];
});

bot.on('time', function() {
	beliefs['time'] = bot.time.day;
});

bot.on('spawn', function() {
	setTimeout(deliberate, 1000);
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
		chest.deposit(actualIntention == 'getFruit' ? selectedFood : recipesForIntention[actualIntention], null, 1, function() {
			bot.chat(msg.CookerBotsMsg[0]);
			chest.close();
			deliberate();
		});
	}

	else if(kind == 'food') {
		if(actualIntention == 'getFruit') {
			for(fruit in fruits) {
				if(chest.count(fruits[fruit]) > 0) {
					selectedFood = fruits[fruit];
					chest.withdraw(fruits[fruit], null, 1, function(err) {
						chest.close();
						bot.emit('foodReady');
					});
					return;
				}
			}
		}
		
		else { 
			if(hasIngredients(chest)) {
				withdrawIngredients(chest);
			}
			else {
				bot.chat(msg.ScoutCookerMsg[0]);
				chest.close();
				setTimeout(function() {oper.moveToAndOpen('food')}, 10000);
			}
		}
	}
});

bot.on('gotWood', function() {
	goBackToKitchen();
});

bot.on('gotIngredients', function() {
	if(actualIntention == 'cookPorkchops' || actualIntention == 'cookChicken' || actualIntention == 'cookSteak')
		oper.moveToAndOpen('wood');
	else goBackToKitchen();
});

bot.on('backToKitchen', function() {
	if(actualIntention == 'cookPorkchops' || actualIntention == 'cookChicken' || actualIntention == 'cookSteak') {

		f = bot.openFurnace(bot.blockAt(vec3(1138, 4, 65)));
		f.on('open', function() {
			f.putInput(recipesForIntention[actualIntention] - 1, null, 1, function() {
				f.putFuel(wood, null, 1);
			});
		});
		f.on('update', checkOutput);
		function checkOutput() {
			if(f.outputItem() != null) {
				f.takeOutput(function(err, item) {
					cookedFood = item.type;
					f.close();
					bot.emit('foodReady');
				});
				f.removeListener('update', checkOutput);
			}
		}
	}
	else {
		bot.lookAt(vec3(1138, 4, 66));
		setTimeout(function() {
			bot.craft(bot.recipesFor(recipesForIntention[actualIntention], null, 1, bot.blockAt(vec3(1138, 4, 66)))[0], 1, bot.blockAt(vec3(1138, 4, 66)), function() {
				setTimeout(function() {
					bot.emit('foodReady');
				}, 3000);
			});
		}, 1000);
	}
});

bot.on('foodReady', function() {
	oper.moveToAndOpen('kitchen1');
});


function goBackToKitchen () {
  bot.scaffold.to(vec3 (1140, 4, 66), function(err) {
    bot.emit('backToKitchen');
  });
}

function deliberate() {
	var desires = options();
	var intention = filter(desires);

	console.log(intention);
	execute(intention);
}

function options() {
	var options = [];
	var time = beliefs['time'];

	if((time > 6000 && time < 9000) || (time > 13000 && time < 16000)) {
		options.push('cookPorkchops');
		options.push('cookChicken');
		options.push('cookSteak');
	}
	else if(time > 18000 && time < 24000) {
		options.push('bakeBread');
	}
	else if(beliefs['rain']) {
		//options.push('bakeCake');
		options.push('bakePie');
	}
	else
		options.push('getFruit');

	return options;
}

function filter(desires) {
	return desires[Math.floor(Math.random() * desires.length)];
}

function execute(intention) {
	actualIntention = intention;
	oper.moveToAndOpen('food');
}

function hasIngredients(chest) {
	var ingredients = recipes[recipesForIntention[actualIntention]];

	for(var ingredient in ingredients) {
		if(chest.count(ingredient) < ingredients[ingredient])
			return false;
	}
	return true;
}

function withdrawIngredients(chest) {
	var ingredients = recipes[recipesForIntention[actualIntention]];
	console.log(ingredients);
	var timeout = 1000;
	for(var ingredient in ingredients) {
		(function(ingredient) {
			setTimeout(function() {
				chest.withdraw(parseInt(ingredient), null, ingredients[ingredient]);
			}, timeout);
		})(ingredient);
		timeout += 1000;
	}

	setTimeout(function() {
		chest.close();
		bot.emit("gotIngredients")
	}, timeout);
}

