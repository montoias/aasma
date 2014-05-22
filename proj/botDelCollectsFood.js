var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);

var mvc = require('./movementController');
var msg = require('./communications');
var chest = require('./chestOperations.js');

var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "foodBotDel",
  'spawnPoint': vec3 (1121, 4, 89),
});

//passes to the movementController info about the bot
mvc.setBot(bot);
chest.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);

var Modes = {
	NOTHING : 0,
	WAITING : 1,
	MOVING : 2,
	DEPOSITING : 3,
	KILLING : 4
}

var currentMode = Modes.NOTHING;

bot.on('chat', function(username, message) {
	if (username === bot.username) return;
  console.log(username,message,getMsgFromMsg(message))
	if (message === msg.ScoutFoodMsg[4] && currentMode === Modes.NOTHING){
    bot.chat(msg.ScoutFoodMsg[0]);
    currentMode = Modes.WAITING;
	} else if ( msg.ScoutFoodMsg[2] === getMsgFromMsg(message) && Modes.WAITING){
    moveTo(getVecFromMessage(message));
  } else if (message === 'deposit'){
    chest.moveToAndOpen('food');
  }
})

bot.on("chestOpen", function  (c, type) {
   setTimeout(function () { chest.deposit(c, mvc.eatableItem)} , 1000);
});

function askResources(){
  bot.chat(msg.ScoutFoodMsg[0]);
  currentMode = Modes.WAITING;
}

function moveTo (pos) {
  console.log(pos)
  currentMode = Modes.MOVING;
  bot.scaffold.to(pos, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, pos, "trying again");
      } else {
        bot.chat("made it!");
        bot.setControlState('forward',true);
        bot.emit('killingTime');
      }
    });
}


var steps = 0;
bot.on('killingTime', function () {

  var botposition = bot.entity.position;

  //see if there are any passiveEntite to be killed, if there is the bot kills it.
  var enemy = mvc.nearestPassiveEntities();
  if(enemy){
    bot.lookAt(enemy.position);
    bot.attack(enemy);
  }


  //see the free positions around the bot and moves forward, after walking 20 steps moves to other (random) direction
  var neighbors = mvc.freeNeighbors(botposition);

  steps ++;
  console.log(steps);
  if(neighbors.length > 0 && steps === 20){
    var random = mvc.randomIntInc(0,(neighbors.length - 1));
    var elem = neighbors[random];

    var lookAtY = botposition.y + bot.entity.height;
    var lookAtPoint = vec3(botposition.x + elem.x, lookAtY, botposition.z + elem.z);
    bot.lookAt(lookAtPoint);
    steps = 0;
   } else if (steps === 20) {
    steps = 0;
   } else if(!mvc.isYawValid(bot.entity.yaw,botposition)){
    bot.setControlState('jump',true);
    bot.clearControlStates();
    bot.setControlState('forward',true);
    steps = 19;
   }
   setTimeout(function () { bot.emit('killingTime') }, 100); 
 })

function getVecFromMessage (msg) {
  var array = msg.split("(").pop().split(")")[0].split(",");
  return vec3 (array[0],array[1],array[2]);
}

function getMsgFromMsg(msg) {
   return msg.split("(")[0];
}

//Indicates the heath and the inventory of the bot
bot.on('health', function() {
  bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food" + " mode " + currentMode);
  mvc.listInventory()
});
