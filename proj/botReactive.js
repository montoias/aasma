var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "rtjiia"
});

bot.on('spawn', function(){
	bot.setControlState('forward', true);
	bot.entity.yaw = 0;
});

bot.on('move', function() {
	var botposition = bot.entity.position.floored();
	var block = bot.blockAt(getNextBlock(bot.entity.yaw, botposition));

	//console.log(block);
	if(block && block.boundingBlock != 'empty'){
		var moves = [0, Math.PI, Math.PI/2, (Math.PI *3)/2];
		bot.entity.yaw = moves[randomIntInc(0,3)];
	}
});

bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");
});

// bot.on('entityHurt', function(entity) {
// 	bot.attack(entity);
// }); 

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

function getNextBlock (yaw, position) {
	switch(yaw) {
		case 0:
			position.x = position.x + 1;
			break;
		case Math.PI/2:
			position.y = position.y + 1;
			break;
		case Math.PI:
			position.x = position.x - 1;
			break;
		case (Math.PI * 3)/2:
			position.y = position.y - 1;
			break; 
	}
	console.log(position);
	return position;
}