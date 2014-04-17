var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;

var steps = 0;
var bot = mineflayer.createBot({
  username: "ritjii",
  'pvp': true,
  'online-mode':false,
});

//passa ao movementController info sobre o bot
mvc.setBot(bot);

bot.on('spawn', function(){
	bot.setControlState('forward', true);
});

//flag que indica se está a fazer digging ou nao
var digging = false;

//sempre que um bot se move é verificada um nova posicao atraves do random e e verificado se existem coisas pa fazer dig
bot.on('entityMoved', function () {
	if(digging)
		return;
	var botposition = bot.entity.position;

	var tree = mvc.treeNeighbor(botposition);
	if(tree.length >0){
		 digging = true;
		 bot.setControlState('forward', false);
		 tree.forEach(function (a) {
		 	var digBlocks = mvc.treePossiblePositions(a);
		 	digBlocks.forEach (function  (b) {
		 		if(bot.canDigBlock(b)){
			 	 	bot.dig(b,onDiggingCompleted);
			 	 	bot.chat("diging");
		 		}
		 	});
		 });	 
		 return;
	}

	var neighbors = mvc.freeNeighbors(botposition);

	steps ++;

	if(neighbors.length > 0 && steps == 10){
		var random = mvc.randomIntInc(0,(neighbors.length - 1));
		var elem = neighbors[random];

		var lookAtY = botposition.y + bot.entity.height;
	 	var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
	 	bot.lookAt(lookAtPoint);
	 	steps = 0;
	 } else if (steps == 10) {
	 	steps = 0;
	 }
});


//infica a heath do bot
bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");
  listInventory();
});

function listInventory() {
  bot.chat("Inventorio" + bot.inventory.items().map(itemStr).join(", "));
}

function itemStr(item) {
  if (item) {
    return item.name + " x " + item.count;
  } else {
    return "(nothing)";
  }
}

//funcao auxiliar ao dig
function onDiggingCompleted(err,b) {
    bot.chat("finished digging ");
}

//funcao auxiliar ao dig
bot.on('diggingCompleted', function(block){
	bot.chat("chegamos ao complete");
	digging = false;
	bot.setControlState('forward', true);
});

//funcao auxiliar ao dig
bot.on('diggingAborted', function(block){
	bot.chat("ABORTEI!" + block);
});


function nearestEntity(type) {
  var id, entity, dist;
  var best = null;
  var bestDistance = null;
  //console.log("entidades!", bot.entities);
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

bot.on('entityHurt', function (ent) {
	var enemy = nearestEntity();
	if(enemy){
		bot.lookAt(enemy.position);
		bot.attack(enemy);
	}
});
