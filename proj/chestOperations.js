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

function depositAux (chest, items) {

	if(items.length === 0 ) {
		console.log("Deposited all items");
		chest.close();
		setTimeout(function () {bot.emit("DepositComplete");}, 1000);
		return;
	}

	var item = items.pop();
	var amount = item.count;
	chest.deposit(item.type, null, amount, function(err) {
		if (err) {
		  bot.chat("unable to deposit " + amount + " " + item.name);
		} else {
		  console.log("deposited ", amount, item.name)
		  bot.chat("deposited " + amount + " " + item.name);
		  setTimeout( function  () {depositAux(chest, items) }, 2000);
		}
	});
}

function deposit (chest, itemType) {
	var items = bot.inventory.items().filter(function(item){
	  		return itemType[item.name];
	})
	depositAux(chest, items);
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
var chestArray = { 'food' : [vec3(1120,4,67),vec3(1119,4,67)],
	   		  'wood' : [vec3(1122,4,67),vec3(1123,4,67)], 
			  'other1' : [vec3(1122,4,66),vec3(1122,4,65)], 
			  'other2' : [vec3(1120,4,66),vec3(1120,4,65)]
			};

function moveToAndOpen (type) {
	var res = chestArray[type];
 	
	bot.scaffold.to(res[0], function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, res);
      } else {
        bot.chat("made it!");
        console.log("open chest")
        c = bot.openChest(bot.blockAt(res[1]));
        c.on("open", function () {
        	bot.emit("chestOpen",c, type);
        });
      }
    });
}


function moveToOpenAndSize (type) {
	var res = chestArray[type];
 	
	bot.scaffold.to(res[0], function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, res);
      } else {
        bot.chat("made it!");
        console.log("open chest")
        c = bot.openChest(bot.blockAt(res[1]));
        bot.emit(type + "Chest", itemSize(getItemsByType(type)));
      }
    });
}


function getItemsByType (type) {
	var items = bot.inventory.items().filter(function(item){
	  		return type[item.name];
	});
	return items;
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
exports.deposit = deposit;
exports.getItemsByType = getItemsByType;
exports.itemSize = itemSize;