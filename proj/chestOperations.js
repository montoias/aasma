var EventEmitter = require('events').EventEmitter;
var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var bot;
var c = null;

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
  17: true, //
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

function deposit (chest, itemType) {
	if(max <= 0) {
		console.log("Deposited all items");
		chest.close();
		setTimeout(function () {bot.emit("DepositComplete");}, 1000);
		return;
	}

	var items = chest.items().filter(function(item) {
	    return itemType[item.type];
	});

	var item = items[0]
	chest.deposit(item.type, null, item.amount, function(err) {
		if (err) {
		  bot.chat("unable to deposit " + item.count + " " + item.name);
		} else {
		  console.log("deposited ",item.amount, item.name)
		  bot.chat("deposited " + item.amount + " " + item.name);
		  setTimeout(function () {deposit(chest, itemType)}, 1000);
		}
	});
}

function enoughBlocksToWithdraw (chest, type, maxItems) {
	var items = chest.items().sort(sortFunction).filter(function(item) {
	    return buildingTypes[item.type];
	});

	var amount = itemSize(items);
	console.log("There is", amount, "in the chest! I Can Now start building");
	if(amount >= maxItems){
		setTimeout(function () {withdraw(chest, maxItems);}, 1000)
	} else {
		console.log("I will wait for more blocks. there is only", amount);
		bot.chat("needblocks")
		chest.close();
		return;
	}	
}

//chest TYPE -> (POSICAO DO BOT, POSICAO DA CAIXA)
var chest = { 'food' : [vec3(1120,4,67),vec3(1119,4,67)],
	   		  'wood' : [vec3(1122,4,67),vec3(1123,4,67)], 
			  'other1' : [vec3(1122,4,66),vec3(1122,4,65)], 
			  'other2' : [vec3(1120,4,66),vec3(1120,4,65)]
			};

function moveToAndOpen (type) {
	var res = chest[type];
 	
	bot.scaffold.to(res[0], function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, res);
      } else {
        bot.chat("made it!");
        console.log("open chest")
        c = bot.openChest(bot.blockAt(res[1]));
     	bot.emit("chestOpen",c, type);
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
exports.enoughBlocksToWithdraw = enoughBlocksToWithdraw;
exports.moveToAndOpen = moveToAndOpen;