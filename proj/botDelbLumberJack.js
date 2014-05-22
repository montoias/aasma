var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var msg = require('./communications');
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "LumberJack",
  'spawnPoint': vec3 (1121, 4, 90),
});

//passes to the movementController info about the bot
mvc.setBot(bot);

var steps = 0;

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);

bot.on('chat', function(username, message) {
	if (username === bot.username) return;
	if (message === msg.ScoutLJMsg[4]) {
		bot.chat(msg.ScoutLJMsg[0])
	}
	else if(message.split('(')[0] === msg.ScoutLJMsg[2]){
		var pos = message.split('(').pop().split(')')[0].split(',');
		var position = vec3 (pos[0], pos[1], pos[2]);
		moveTo(position);
	}
});


function moveTo (pos) {
	bot.scaffold.to(pos, function(err) {
		if (err) {
			console.log("didn't make it: " ,err.code, pos, "trying again");
			moveTo(pos);
		} else {
			bot.chat("made it!");
			moveRandom();
		}
	});
}

function moveRandom () {
	bot.setControlState('forward', true);

	var botposition = bot.entity.position;

	var tree = mvc.materialNeighbor(botposition, 'wood');
	if(tree.length >0){
		bot.setControlState('forward', false);
		iterateTree(tree)
		return;
	}

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
	 setTimeout(function (){ moveRandom()}, 50);
}

function iterateTree (a) {
	if (a === undefined || a.length === 0){
		moveRandom();
		return;
	}
	var digBlocks = mvc.treePossiblePositions(a.pop());
	iterateBlocks(digBlocks,a);
}

function iterateBlocks (b,a) {
	if(b.length === 0){
		iterateTree(a);
		return;
	}

	var block = b.pop();
	if(block && bot.canDigBlock(block)){
		bot.dig(block,onDiggingCompleted);
		bot.chat("diging");
		setTimeout(function () {bot.emit("digComplete", b)}, bot.digTime(block));
		return;
	}
	bot.emit("digComplete", b)
}

bot.on("digComplete", function (b) {
	iterateBlocks(b)
});

//auxiliar function to the operation dig
function onDiggingCompleted(err) {
    bot.chat("finished digging");
}

//auxiliar function to the operation dig
bot.on('diggingCompleted', function(block){
	console.log("chegou ao completed");
	// bot.setControlState('forward', true);
});

//auxiliar function to the operation dig
bot.on('diggingAborted', function(block){
	bot.chat("aborted digging" + block);
});
