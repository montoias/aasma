var EventEmitter = require('events').EventEmitter;
var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;


var bot;
var setBot = function (botcontroller) {
	bot = botcontroller; 
}

var isYawValid = function (yaw, pos) {
	var n = freeNeighbors(pos);
	if(n.length > 0){
		var direction = getVecFromYaw(yaw);
		return isValidDirection(n, direction);
	}
	return false;
}

var isValidDirection = function  (vec, elem) {
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

var getVecFromYaw = function (yaw) {
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

var checkYaw = function (yaw) {
	yaw = yaw % (2 * Math.PI)
	if(yaw < 0)
		yaw = (2 * Math.PI) - Math.abs(yaw)
	return yaw;
}

var isBlockEmpty = function (pos) {
	var res = true;
	unit.forEach(function (vec) {
		res = res && isEmpty(pos.plus(vec));	
	});
	return res;
}

var freeNeighbors = function (pos) {
	var neighbors = [];
	unit.forEach(function (vec) {
		if (isEmpty(pos.plus(vec)))
			neighbors.push(vec);
	});
	return neighbors;
}

var isEmpty = function (pos) {
	return bot.blockAt(pos) && bot.blockAt(pos).boundingBox === 'empty' 
}	

var isBlockingElement = function (pos) {
	if (bot.blockAt(pos)){
			console.log(bot.blockAt(pos));
			console.log(bot.blockAt(pos).name);

		if (bot.blockAt(pos).name === 'vine' || bot.blockAt(pos).name === 'Water' || bot.blockAt(pos).name === 'Lava'
			|| bot.blockAt(pos).name === 'Stationary Lava' || bot.blockAt(pos).name === 'tallgrass')  {
			return true;
		}
	}
}

var boundingBox = function (pos) {
	var block = bot.blockAt(pos)
	if(block != null)
		return block.boundingBox;
}

var randomIntInc = function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

//function that sees if there are a certain material in the four positions around the bot.
var materialNeighbor  = function (pos, material){
	var neighbors = [];
	unit.forEach(function (vec) {
		var w = new vec3(vec.x, vec.y, vec.z);
		if (!isEmpty(pos.plus(w)) && bot.blockAt(pos.plus(w)) && bot.blockAt(pos.plus(w)).material === material) {
			 if(isHomeZone(pos) === false) {
				neighbors.push(pos.plus(w));
			}
		}
	});
	return neighbors;
}

var isHomeZone = function (pos){
	for (var i = 0; i < (unit.length-1); i++){
		var w = new vec3(i.x, i.y, i.z);
		if(((1112 <= pos.plus(w).x) && (pos.plus(w).x <= 1189)) && ((60 <= pos.plus(w).z) && (pos.plus(w).z <= 166))) {
			return true;
		}
		return false;
	}
}


function findingWood() {
	  var cursor = mineflayer.vec3();
	  for(cursor.x = bot.entity.position.x - 4; cursor.x < bot.entity.position.x + 4; cursor.x++) {
		    for(cursor.y = bot.entity.position.y - 4; cursor.y < bot.entity.position.y + 4; cursor.y++) {
			      for(cursor.z = bot.entity.position.z - 4; cursor.z < bot.entity.position.z + 4; cursor.z++) {
				        var block = bot.blockAt(cursor);
				        if (block.material === 'wood') return block;
			      }
		    }
	  }
}

var treePossiblePositions = function (pos) {
	var vec = []
	var v1 = vec3 (pos.x,pos.y,pos.z);
	var v2 = vec3 (pos.x,pos.y +2,pos.z);
	var v3 = vec3 (pos.x,pos.y + 1,pos.z);

		vec.push(bot.blockAt(v1));
		vec.push(bot.blockAt(v2));
		vec.push(bot.blockAt(v3));
	return vec;
}

//function that sees if there are any entities around the bot, if it is the closest is return.
var nearestEntity =  function (type) {
  var id, entity, dist;
  var best = null;
  var bestDistance = null;
 // console.log("entidades! do ", bot.username , bot.entities);
  for (id in bot.entities) {
    entity = bot.entities[id];
    if (type && entity.type !== type) continue;
    if (entity === bot.entity) continue;
    if (entity.type !== 'mob') continue;
    dist = bot.entity.position.distanceTo(entity.position);
    if (! best || dist < bestDistance) {
      best = entity;
      bestDistance = dist;
    }
  }
  return best;
}

//function that sees if there are passiveEntities around the bot, if it is the closest is return.
var nearestPassiveEntities =  function () {
  var id, entity, dist;
  var best = null;
  var bestDistance = 3;
 // console.log("entidades! do ", bot.username , bot.entities);
  for (id in bot.entities) {
    entity = bot.entities[id];
    if (entity === bot.entity) continue;
    if (entity.type !== 'mob') continue;
    if(entity.mobType === 'pig' || entity.mobType === 'sheep' || entity.mobType === 'cow' || entity.mobType === 'chicken' 
    	|| entity.mobType === 'mooshroom'){
    		dist = bot.entity.position.distanceTo(entity.position);
		    if (dist < bestDistance) {
		      best = entity;
		      bestDistance = dist;
		    }
  	}
  }
  return best;
}


var itemByName = function (name) {
  return bot.inventory.items().filter(function(item) {
    return item.name === name;
  })[0];
}

var typeMaterialNeighbor  = function (pos, type){
	var neighbors = [];
	unit.forEach(function (vec) {
		var v = new vec3(vec.x, bot.entity.height, vec.z);
		if (!isEmpty(pos.plus(v)) && bot.blockAt(pos.plus(v)) && bot.blockAt(pos.plus(v)).name === type)
			neighbors.push(pos.plus(v));
	});
	return neighbors;
}

//function that lists the bot's inventory
var listInventory = function () {
  bot.chat(bot.entity.username + " Inventorio " + bot.inventory.items().map(itemStr).join(", "));
}

//function that ounts every item that it exits at the bot's inventory 
var itemStr = function (item) {
  if (item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}


var tossInventory = function (list) {
	if(list.length == 0) {
		return;
	}
	var item = list.pop();		
	bot.tossStack(item, function(err) {
		if (err) {
			bot.chat("unable to toss " + item.name);
		} else {      
			bot.chat("tossed " + item.name);
		}
		tossInventory(list);
	});	
}


var isStorage = function (pos){
	return ((pos.x <= 1123) && (pos.x >= 1119) && (pos.z <= 66) && (pos.z >= 61))
}


var eatableItem = {
	'beefRaw': true, 
	'porkchopRaw': true, 
	'spiderEye': true, 
	'chickenRaw' :true
};

exports.unit = unit;
exports.isYawValid = isYawValid;
exports.isValidDirection = isValidDirection;
exports.getVecFromYaw = getVecFromYaw;
exports.checkYaw = checkYaw;
exports.isEmpty = isEmpty;
exports.isBlockEmpty = isBlockEmpty;
exports.freeNeighbors = freeNeighbors;
exports.isBlockingElement = isBlockingElement;
exports.boundingBox = boundingBox;
exports.randomIntInc = randomIntInc;
exports.setBot = setBot;
exports.materialNeighbor = materialNeighbor;
exports.treePossiblePositions =treePossiblePositions;
exports.nearestEntity= nearestEntity;
exports.itemByName = itemByName;
exports.typeMaterialNeighbor = typeMaterialNeighbor;
exports.nearestPassiveEntities = nearestPassiveEntities;
exports.listInventory = listInventory;
exports.itemStr = itemStr;
exports.tossInventory = tossInventory;
exports.isStorage = isStorage;
exports.eatableItem = eatableItem;
exports.isHomeZone = isHomeZone;
