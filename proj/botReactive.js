var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var EventEmitter = require('events').EventEmitter

var bot = mineflayer.createBot({
  username: "ritj"
});


bot.on('spawn', function(){
	bot.setControlState('forward', true);
});

bot.on('entityMoved', function () {
	var botposition = bot.entity.position;
	var neighbors = freeNeighbors(botposition);

	console.log(neighbors)
	if(neighbors.length > 0 && !isYawValid(bot.entity.yaw, botposition)){
		var elem = neighbors[randomIntInc(0,(neighbors.length - 1))];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 }

}
);

bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");
});

// bot.on('entityHurt', function(entity) {
// 	bot.attack(entity);
// }); 

function isYawValid (yaw, pos) {
	var n = freeNeighbors(pos);
	if(n.length > 0){
		var direction = getVecFromYaw(yaw);
		if(!isValidDirection (n, direction)){
			bot.setControlState('jump',true);
			bot.clearControlStates();
			bot.setControlState('forward',true);
			return false;
		}
		return true;		
	}
	return false;
}

function isValidDirection (vec, elem) {
	var result = false;
	vec.forEach( function  (e) {
		if (e.x == elem.x && e.z == elem.z)
			result = true;
	});
	return result;	
}

var unit = [
    vec3(-1, 0,  0), // north
    vec3( 1, 0,  0), // south
    vec3( 0, 0, -1), // east
    vec3( 0, 0,  1), // west
]; 

function getVecFromYaw (yaw) {
	yaw = checkYaw(yaw);
	if (yaw >= (Math.PI *3)/2) 
		return unit[1];
	if (yaw >= Math.PI) 
		return unit[3];
	if (yaw >= (Math.PI/2)) 
		return unit[0];
	if (yaw >= 0)  
		return unit[2];
}

function checkYaw (yaw) {
	yaw = yaw % (2 * Math.PI)
	if(yaw < 0)
		yaw = (2 * Math.PI) - Math.abs(yaw)
	return yaw;
}

function isBlockEmpty (pos) {
	var res = true;
	unit.forEach(function (vec) {
		res = res && isEmpty(pos.plus(vec));	
	});
	return res;
}

function freeNeighbors (pos) {
	var neighbors = [];
	unit.forEach(function (vec) {
		if (isEmpty(pos.plus(vec)))
			neighbors.push(vec);
	});
	return neighbors;
}

function isEmpty (pos) {
	return bot.blockAt(pos) && bot.blockAt(pos).boundingBox === 'empty' 
}	

function isBlockingElement(pos) {
	if (bot.blockAt(pos)){
		return  bot.blockAt(pos).name === 'vine'
	}

}

function boundingBox (pos) {
	var block = bot.blockAt(pos)
	if(block != null)
		return block.boundingBox;
}

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