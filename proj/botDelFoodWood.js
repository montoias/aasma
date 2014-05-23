var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);

var mvc = require('./movementController');
var msg = require('./communications');
var chest = require('./chestOperations.js');


var vec3 = mineflayer.vec3;

var spawnPoint = vec3 (1121, 4, 89);

var bot = mineflayer.createBot({
  username: "foodbotdel",
  'spawnPoint': spawnPoint,
});

//passes to the movementController info about the bot
mvc.setBot(bot);
chest.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);


function startDeliberation () {
  console.log("Start BDI");
  setTimeout( function() {chest.moveToOpenAndSize('food')} , 2000);
}


bot.on("spawn", startDeliberation);


function getVecFromMessage (msg) {
  var array = msg.split("(").pop().split(")")[0].split(",");
  return vec3 (array[0],array[1],array[2]);
}

function getMsgFromMsg(msg) {
   return msg.split("(")[0];
}

var TypesOfI = {
  FOOD: 0,
  WOOD: 1,
  FUGIR: 2,
  COMER: 3,
  ABRIGAR: 4,
  DORMIR: 5,
  INICIO:6
}


/// BELIEFS DESIRES INTENTIONS
var beliefs = [
  false, // rain 0
  false, // night 1
  0, // chest food 2
  0, // chest wood 3
  false, // order food - communication 4
  false, // order wood - communication 5
  false, // hungry 6
  false, // is hurt 7
  ];


function options (b) {
  var result = 
  [
    false, // 0
    false, // 1
    false, // 2
    false, // 3
    false, // 4
    false, // 5
  ];

  if(b[0]){
    result[0] = true;
    // abrigar 0 
  }
  if(b[1]){
    result[1] = true;
    // dormir 1
  }
  if(b[6]){
    result[2] = true;
     // comer 2
  } 
  if(b[7]){
    result[3] = true;
    // fugir 3
  }
  if(b[2] <= 10 || b[4]) {
    result[4] = true;
    // apanhar comida 4
  }
  if(b[3] <= 40 || b[5]) {
    result[5] = true;
    // apanhar wood 5
  }

  intention = filter(b, result);
  console.log(intention);
  executeIntention(intention);
}

function executeIntention (str) {
  switch (str) {
    case "wood":
      executePlanWood();
      break;
    case "food":
      executePlanFood();
      break;
    case "fugir":
      executePlanRunAway();
      break;
    case "comer":
      executePlanEat();
      break;
    case "abrigar":
      executePlanRefuge();
      break;
    case "dormir":
      executePlanSleep();
      break;
    case "inicio":
      executePlanInitial ();
      break;
  }
}


function filter (b, d) {
  console.log("b ", b, " d ", d)
   if(d[5] && b[5]){
      return "wood"
   } else if (d[4] && b[4]){
      return "food"
   } else if (d[5] && (b[2] * 4) >= b[3]){
      return "wood"
   } else if (d[4] && (b[2] * 4) <= b[3]){
      return "food"
   } else if (d[3]) {
      return "fugir"
   } else if (d[2]) {
      return "comer"
   } else if (d[1]){
      return "dormir"
   } else if (d[0]){
      return "abrigar"
   } else {
      return "inicio"
   }
}

//sensors
bot.on("rain", isRaining);
function isRaining () {
  beliefs[0] = !beliefs[0];
}


//When the bot was hurt attacks the entity closest to the bot
bot.on('entityHurt', function (ent) {
  if(ent.type != 'mob' && (ent.username === bot.entity.username)) {
    var enemy = mvc.nearestEntity();
    if(bot.health <= 5){
      beliefs[7] = true;
    }
  }
});


bot.on("time", isNight);
function isNight () {
  if(bot.time.day >= 15000 && bot.time.day <= 23000)
    beliefs[1] = true;
}


bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  if (message === msg.ScoutFoodMsg[4]){
    console.log(msg.ScoutFoodMsg[0]);
    beliefs[4] = true;
  }
  if (message === msg.ScoutLJMsg[4]){
    console.log(msg.ScoutLJMsg[0]);
    beliefs[5] = true;
  } 
})

bot.on("health", isHungry)
function isHungry () {
  if(bot.food <= 16){
    beliefs[6] = true;
  }
}


bot.on("foodChest", function  (c) {
    var items = c.items().filter(function(item){
       return mvc.eatableItem[item.name];
    });

    var amount = chest.itemSize(items);
    beliefs[2] = amount;

    c.close();
    chest.moveToOpenAndSize('wood');
});

bot.on("woodChest", function  (c) {
    var items = c.items().filter(function(item){
        return item.name === 'log';
    });

    var amount = chest.itemSize(items)
    beliefs[3] = amount;    
    
    c.close();

    var b = beliefs.slice(0, beliefs.length);
    beliefs = [
      false, // rain 0
      false, // night 1
      -1, // chest food 2
      -1, // chest wood 3
      false, // order food - communication 4
      false, // order wood - communication 5
      false, // hungry 6
      false, // is hurt 7
      ];
    options(b);
});


//Indicates the heath and the inventory of the bot
bot.on('health', function() {
     bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food");
     mvc.listInventory();
});

var steps = 0;

function executePlanFood(){
  console.log("food")
  steps = 0;
  bot.chat(msg.ScoutFoodMsg[0]);
  currentMode = Modes.WAITING;

  bot.on('chat', function(username, message) {
    if (username === bot.username) return;
    if ( msg.ScoutFoodMsg[2] === getMsgFromMsg(message) && isWaiting()){
      console.log(getVecFromMessage(message))
      moveToFood(getVecFromMessage(message));
    } 
  });

}

function executePlanWood(){
  console.log("wood")
  steps = 0;
  bot.chat(msg.ScoutLJMsg[0]);
}

bot.on('chat', function(username, message) {
  if (username === bot.username) return;
  if ( msg.ScoutLJMsg[2] === getMsgFromMsg(message)){
    setTimeout(function () {moveToWood(getVecFromMessage(message));}, 1000);
  } 
});


function executePlanEat(){
  console.log("eat")
  eat();
}

function executePlanRunAway(){

}

function executePlanRefuge(){
  console.log("refuge")
  moveToHouse(vec3(1137, 5, 85));

}

function executePlanSleep(){
  console.log("sleep")
  moveToSleep(vec3(1137, 5, 85));
}

function executePlanInitial () {
  console.log("initial") 
  startDeliberation();
}

//////////////////////////////////////////////////////////EAT/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function eat () {
  if(bot.food < 20){
    var foods = bot.inventory.items().filter(function(item){
      return mvc.eatableItem[item.name];
    })
    var food = foods[0]; 
    if(!food){
      console.log("nao tenho comida")
      chest.moveToAndOpen('kitchen1')
    } else{
      bot.equip(food, 'hand',  function(err) {
        if (err) {
          bot.chat("unable to equip " + food.name);
        } else {
          bot.chat("equipped " + food.name);
          bot.activateItem();
        }})
    }
  } else {
    startDeliberation();
  }
}

bot.on('entityEat', function(ent) {
  if(ent.type != 'mob' && (ent.username === bot.entity.username)){
      bot.chat(ent.username + ": OM NOM NOM NOMONOM. that's what you sound like.");
      setTimeout(function () {bot.deactivateItem();eat();}, 3000);
    }
});

bot.on("notEnoughFood", function(){
  console.log("nao tenho comida no chest para mim")
});

bot.on("withdrawCompleteFood", function(){
  console.log("Vou comer");
  eat();
});

//////////////////////////////////////////////////////////SLEEP/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function moveToHouse (pos) {
  bot.scaffold.to(pos, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, "trying again");
      } else {
            bot.chat("made it!");
            bot.on('rain', function () {
              setTimeout(function () {
                console.log("parou de chover");
                startDeliberation();
              }, 2000);
            });

      }
    });
}

//////////////////////////////////////////////////////////SLEEP/////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function moveToSleep (pos) {
  bot.scaffold.to(pos, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, "trying again");
      } else {
            bot.chat("made it!");
            var block = bot.blockAt(pos.offset(0,0,1));
            bot.sleep(block)
          }
    });
}

bot.on('wake', function(){
  console.log("acordei");
  startDeliberation();
});

//////////////////////////////////////////////////////////FOOD///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


var Modes = {
  NOTHING : 0,
  WAITING : 1,
  MOVING : 2,
  DEPOSITING : 3,
  KILLING : 4
}

var currentMode = Modes.NOTHING;

function isNothing () {
  return currentMode === Modes.NOTHING;
}
function isWaiting () {
  return currentMode === Modes.WAITING;
}
function isMoving () {
  return currentMode === Modes.MOVING;
}

function isDepositing () {
  return currentMode === Modes.DEPOSITING;
}

function isKilling () {
  return currentMode === Modes.KILLING;
}



function moveToFood (pos) {
  console.log("Lets move to", pos, "mode" ,currentMode)
  currentMode = Modes.MOVING;
  bot.scaffold.to(pos, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, pos, "trying again");
      } else {
          if(isMoving()){
            currentMode = Modes.KILLING;
            bot.chat("made it!");
            setTimeout( function () {
                bot.setControlState('forward',true);
                bot.emit('killingTime');
            }, 1000);
          }
       }
    });
}

function startPosition () {
  currentMode = Modes.MOVING;
  bot.scaffold.to(spawnPoint, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, pos, "trying again");
      } else {
        currentMode = Modes.NOTHING;
        bot.chat("made it!")    
      }
    });
}


bot.on('killingTime', function () {
  currentMode = Modes.KILLING;
  var botposition = bot.entity.position;

  if(chest.itemSize(chest.getItemsByType(mvc.eatableItem)) >= 10){
    console.log("depositing");
    if(isKilling()){
      currentMode = Modes.DEPOSITING;
      bot.emit("enoughToDepositFood");
      return;
    }
  }

  //see if there are any passiveEntite to be killed, if there is the bot kills it.
  var curAnimal = mvc.nearestPassiveEntities();
  if(curAnimal){
    killAnimal(curAnimal);
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

function killAnimal (animal) {
  bot.lookAt(animal.position);
  bot.attack(animal);
}



function getVecFromMessage (msg) {
  var array = msg.split("(").pop().split(")")[0].split(",");
  return vec3 (array[0],array[1],array[2]);
}

function getMsgFromMsg(msg) {
   return msg.split("(")[0];
}

bot.on("enoughToDepositFood", function () {
  if(isDepositing())
    chest.moveToAndOpen('food');
})

bot.on("DepositComplete", function () {
    currentMode = Modes.NOTHING;
    startDeliberation();
});


// bot.on('chat', function(username, message) {
//   if (username === bot.username) return;
//   if (message === msg.ScoutFoodMsg[4] && isNothing()){
//     console.log(msg.ScoutFoodMsg[0]);
//     bot.chat(msg.ScoutFoodMsg[0]);
//     currentMode = Modes.WAITING;
//   } else if ( msg.ScoutFoodMsg[2] === getMsgFromMsg(message) && isWaiting()){
//     moveTo(getVecFromMessage(message));
//   } 
// })

bot.on("chestOpen", function  (c, type) {
  console.log("chest open", type)
  if(type === "food"){
    if(isDepositing()){
      setTimeout(function () { chest.deposit(c, mvc.eatableItem);} , 1000);
    }
  } else if (type === "wood"){
     var items = bot.inventory.items().filter(function(item){
        return item.name === 'log';
    });

    setTimeout(function () { chest.depositAux(c, items);} , 1000);
  }  
  else if (type === "kitchen1"){
     var items = c.items();
     setTimeout(function () { chest.withdrawFood(c, 10);} , 1000);
  }
});


//////////////////////////////////////////////////////////WOOD///////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// bot.on('chat', function(username, message) {
//   if (username === bot.username) return;
//   if (message === msg.ScoutLJMsg[4]) {
//     bot.chat(msg.ScoutLJMsg[0])
//   }
//   else if(message.split('(')[0] === msg.ScoutLJMsg[2]){
//     var pos = message.split('(').pop().split(')')[0].split(',');
//     var position = vec3 (pos[0], pos[1], pos[2]);
//     bot.chat(msg.ScoutLJMsg[3]);
    
//   }
// });

function moveToWood (pos) {
  bot.scaffold.to(pos, function(err) {
    if (err) {
      console.log("didn't make it moveToWood: " ,err.code, pos, "trying again");
      setTimeout( moveRandom, 2000);

    } else {
      bot.chat("made it!");
      setTimeout( moveRandom, 1000);
    }
  });
}

function moveRandom () {
  bot.setControlState('forward', true);

  var botposition = bot.entity.position;

  var woods = chest.getItemsByName('log'); 
  var countItem = chest.itemSize(woods);

  if(countItem >= 5){
      bot.emit("enoughToDepositWood");
      return;
  }

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
    setTimeout(function () {bot.emit("digComplete", b)}, bot.digTime(block) + 1000);
    return;
  }
  bot.emit("digComplete", b)
}

bot.on("enoughToDepositWood", function () {
    chest.moveToAndOpen('wood');
});

bot.on("digComplete", function (b) {
  iterateBlocks(b)
});

//auxiliar function to the operation dig
function onDiggingCompleted(err) {
    bot.chat("finished digging");
}

//auxiliar function to the operation dig
bot.on('diggingCompleted', function(block){

});

//auxiliar function to the operation dig
bot.on('diggingAborted', function(block){
  bot.chat("aborted digging" + block);
});

