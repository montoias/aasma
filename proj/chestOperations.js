var EventEmitter = require('events').EventEmitter;
var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var bot;
var c = null;
var withdrawMaxItems = 60;

function chestPosition () {
	return vec3(1120,4,59);
}
var setBot = function (botcontroller) {
	bot = botcontroller; 
}


// block types allowed to be used as scaffolding
var buildingTypes = {
  1:  true, // stone
  2:  true, // grass
  3:  true, // dirt
  4:  true, // cobblestone
  7:  true, // bedrock
  87: true, // netherrack
};


function sortFunction (a,b) {
	return b.count > a.count;
}

function withdraw (chest, max) {
	if(max <= 0) {
		console.log("got all items I needed");
		chest.close();
		setTimeout(function () {bot.emit("withdrawComplete");}, 1000);
		return;
	}

	var buildItems = chest.items().sort(sortFunction).filter(function(item) {
	    return buildingTypes[item.type];
	});

	var item = buildItems[0]
	var amount = Math.min(item.count,max);
	chest.withdraw(item.type, null, amount, function(err) {
		if (err) {
		  bot.chat("unable to withdraw " + item.count + " " + item.name);
		} else {
		  console.log("withdrew",amount, item.name)
		  bot.chat("withdrew " + amount + " " + item.name);
		  setTimeout(function () {withdraw(chest, max - amount)}, 1000);
		}
	});
}

function enoughBlocksToWithdraw (chest) {
	var buildItems = chest.items().sort(sortFunction).filter(function(item) {
	    return buildingTypes[item.type];
	});

	var amount = itemSize(buildItems);
	console.log("There is", amount, "in the chest! I Can Now start building");
	if(amount >= withdrawMaxItems){
		setTimeout(function () {withdraw(chest, withdrawMaxItems);}, 1000)
	} else {
		console.log("I will wait for more blocks. there is only", amount);
		bot.chat("needblocks")
		chest.close();
		return;
	}
		
}

function moveToAndOpen (pos) {
	bot.scaffold.to(pos, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, pos);
      } else {
        bot.chat("made it!");
        console.log("open chest")
        c = bot.openChest(bot.blockAt(chestPosition()));
        setTimeout(function  (argument) { enoughBlocksToWithdraw(c);} , 1000);
    }
    });
}

function itemSize (items) {
	var res = 0;
	items.forEach(function (item) {
		res += item.count;
	});
	return res;
}

exports.withdraw = withdraw;
exports.chestPosition = chestPosition;
exports.setBot = setBot;
exports.moveToAndOpen = moveToAndOpen;