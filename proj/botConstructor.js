var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);
var ee = require('event-emitter');

var emitter = ee({}), listener;
var mvc = require('./movementController');
var chest = require('./chestOperations.js');
var msg = require('./communications');

var bot = mineflayer.createBot({ username: "bob", 'spawnpoint': vec3 (1121, 4, 91)});
var housePosition = null;
var buildingBlocks = [];
var windowsPositions = [];
var actualBlock = null;
var pendingHouses = [];
var housesCompleted = ["undefined"];
var housePositions = 
  [ vec3(1186,4,57),
    vec3(1186,4,67),
    vec3(1186,4,77),
    vec3(1186,4,87),
    vec3(1186,4,97),
    vec3(1186,4,107),
    vec3(1186,4,117),
    vec3(1186,4,127),
    vec3(1186,4,137),
    vec3(1186,4,147),
    vec3(1186,4,157),
    vec3(1186,4,167)
  ];

var FeelingEnum = {
    HAPPY : 1,
    SAD : 2,
    VERYSAD : 3
}

var Modes = {
  NOTHING: 0,
  BUILDING: 1,
  WAITINGBLOCKS: 2
}

var currentMode = Modes.NOTHING;
var currentLevel = FeelingEnum.HAPPY;

mvc.setBot(bot);
chest.setBot(bot);

// install the plugin
navigatePlugin(bot);
scaffoldPlugin(bot);

// block types allowed to be used as scaffolding
var scaffoldBlockTypes = {
  1:  true, // stone
  2:  true, // grass
  3:  true, // dirt
  4:  true, // cobblestone
  7:  true, // bedrock
  17: true, //
  87: true, // netherrack
};

// optional configuration
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops

var type = process.argv[2]
var x = parseInt(process.argv[3])
var z = parseInt(process.argv[4])


function getBuildingPositions (pos) {

  var botx = pos.floored().x,
      boty = pos.floored().y,
      botz = pos.floored().z,
      result = [],
      xHalf = Math.floor(x / 2),
      zHalf = Math.floor(z / 2);

  // outside wall
  for (i = botx - xHalf + 1; i < botx + xHalf; i++) {
    for (j = botz - zHalf; j <= botz + zHalf; j += 2 * zHalf){
      for (k = boty + 2; k >= boty; k--) {
        result.push(vec3(i,k ,j))
      }
    }
  }

  for (i = botz - zHalf + 1; i < botz + zHalf; i++) {
   for (j = botx - xHalf; j <= botx + xHalf; j += 2 * xHalf){
      for (k = boty + 2; k >=  boty; k--) {
        result.push(vec3(j,k,i))
      }
    }
  }
  return result
}


function getWindowsPositions (pos) {

  var botx = pos.floored().x,
      boty = pos.floored().y,
      botz = pos.floored().z,
      xHalf = Math.floor(x / 2),
      zHalf = Math.floor(z / 2);

  var windows = []
  windows.push([ vec3(botx, boty + 1, botz - zHalf), vec3(botx, boty, botz - zHalf).offset(0,0,+1) ])
  windows.push([ vec3(botx, boty + 1, botz + zHalf), vec3(botx, boty, botz + zHalf).offset(0,0,-1) ])
  windows.push([ vec3(botx - xHalf, boty + 1, botz), vec3(botx - xHalf, boty, botz).offset(+1,0,0) ])
  windows.push([ vec3(botx + xHalf, boty + 1, botz), vec3(botx + xHalf, boty, botz).offset(-1,0,0) ])
  windows.push([ vec3(botx + xHalf, boty, botz), vec3(botx + xHalf, boty, botz).offset(-1,0,0)])
  return windows;

}



bot.on('chat', function(username, message) {
  // navigate to whoever talks
  if (username === bot.username) return;
  var target = bot.players[username].entity;
  if (message === 'come') {
    moveTo(target.position);
  } else if (message === 'stop') {
    bot.navigate.stop();
  } else if (message === 'continue') {
    emitter.emit('wallElemConst'); //continue build house
  } else if (message === 'house') {
    currentMode = Modes.BUILDING;
    buildingBlocks = getBuildingPositions(bot.entity);
    windowsPositions = getWindowsPositions(bot.entity);
    emitter.emit('wallElemConst')
  } else if (message === 'show') {
    if(equipableItem())
    equipBlock(equipableItem());
  } else if (message === 'chest') {
    chest.moveToAndOpen('wood');
  } else if (message === msg.ConstructorScoutMsgs[1]) {
    bot.chat(msg.ConstructorScoutMsgs[2]);
  } else if (message === msg.ScoutLJMsg[5]){
    if(currentMode === Modes.WAITINGBLOCKS) {
      bot.chat(msg.ConstructorScoutMsgs[3]);
      //console.log("Thank you my dear friend", target.username)
      emitter.emit("noEquipableItem");
    }
  }
});


function moveTo (pos) {
  console.log(pos)
  bot.scaffold.to(pos, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, pos, "trying again");
      } else {
        bot.chat("made it!");
      }
    });
}


emitter.on('buildWall', function (callback) {
   bot.scaffold.to(actualBlock, function(err) {
      if (err) {
        console.log("didn't make it: " ,err.code, actualBlock);
        callback();
      } else {
        bot.chat("made it!");
        callback();
      }
   });
});

function digDoorsAndWindows () {
  if(windowsPositions.length === 0) {
     emitter.emit('houseCompleted')
     return;
  }
  emitter.emit('digWindows' , windowsPositions.pop());

}

emitter.on('digWindows', function (block) {
  var pos = block[0];
  var dest = block[1];
   bot.scaffold.to(dest, function(err) {
      if (err) {
          console.log("didn't make it: " , err.code, dest);
      } else {
        if(bot.canDigBlock(bot.blockAt(pos))){
          bot.dig(bot.blockAt(pos),onDiggingCompleted);
          setTimeout(function () { digDoorsAndWindows()}, bot.digTime(bot.blockAt(pos)));
          console.log("diging");
        }
      }
   });
});


function build() {
  bot.clearControlStates();
  setTimeout(function () {
    bot.setControlState('jump', true);
    var targetBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
    var jumpY = bot.entity.position.y + 1;
    bot.on('move', placeIfHighEnough);
    
    function placeIfHighEnough() {
      if (bot.entity.position.y > jumpY) {
        bot.placeBlock(targetBlock, vec3(0, 1, 0));
        bot.setControlState('jump', false);
        setTimeout(function () {buildingBlocks.pop();emitter.emit('wallElemConst')}, 1000);
        bot.removeListener('move', placeIfHighEnough);
      }
    }
  }, 1000);
}

emitter.on('wallElemConst', function () {
 
 if(buildingBlocks.length === 0) {
    emitter.emit("wallsCompleted")
    return;
 }
 actualBlock = buildingBlocks[buildingBlocks.length - 1];

 if (isEquipBuildBlock()) {
  emitter.emit("buildWall" , build);  
 } else {
  var item = equipableItem();
  if(item === null){
    currentMode = Modes.WAITINGBLOCKS;
    emitter.emit('noEquipableItem');
  } else {
    equipBlock(item);
  }
 } 
 
});

emitter.on('wallsCompleted', function () {
  digDoorsAndWindows();
  console.log("wallsCompleted")
})

emitter.on('noEquipableItem', function  () {
  console.log("ME NEEDS ( Construction ) BLOCKSSSS")
    chest.moveToAndOpen('wood');
})

emitter.on('houseCompleted', function () {
  currentMode = Modes.NOTHING;
  console.log('house constructed')
  if(pendingHouses.length >= 0) {
    bot.emit('constructHouse');
  }
})

bot.on('withdrawComplete', function () {
  emitter.emit('wallElemConst'); //continue build house
  console.log('Lets do some building');
  currentMode = Modes.Building;
})

function isEquipBuildBlock() {
  if(bot.heldItem && scaffoldBlockTypes[bot.heldItem.type]) return true; return false;
}

function equipableItem () {
    var scaffoldingItems = bot.inventory.items().filter(function(item) {
      return scaffoldBlockTypes[item.type];
    });
    if(scaffoldingItems.length > 0)
      return scaffoldingItems[0];
    else
      return null;
}

function equipBlock (block) {

    bot.equip(block, 'hand', function(err) {
      if (err) {
        console.log('could not equip that item on the hand')
      } else {
        console.log('item equiped', block, actualBlock)
        if(actualBlock != null){
          setTimeout(function () {emitter.emit("buildWall" , build);}, 1000);  
        }
      }
    });
}

//Indicates the heath and the inventory of the bot
bot.on('health', function() {
  bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food" + " mode " + currentMode);
  mvc.listInventory();
});

//auxiliar function to the operation dig
function onDiggingCompleted(err,b) {
    bot.chat("finished digging");
}

bot.on("entitySpawn", function (entity) {
    if(entity.username === bot.entity.username) return; // eu so discard
    if(entity.type === 'player' && entity.username != bot.entity.username && hasKey(housesCompleted,entity.username) === false){
      addToMap(pendingHouses, entity.username);
      addToMap(housesCompleted, entity.username); //used to know which players have been visited

      if(currentMode === Modes.NOTHING) {
        console.log(entity.username)
        bot.emit('constructHouse')
      }
    }
});

function addToMap(map, key){
  if(!hasKey(map,key))
    map.push(key);
}

function hasKey(map,key){
  return map.indexOf(key) === -1 ? false : true;
}

bot.on('constructHouse', function () {
      var e = pendingHouses.pop();
      var pos = housePositions.pop();
      if(pos && e && bot.blockAt(pos)) {
        console.log("lets build a house to", e, "at", pos)
        bot.chat("Lets create a home to" + e + " " + pos);
        currentMode = Modes.BUILDING;
        housePosition = pos;
        buildingBlocks = getBuildingPositions(pos);
        windowsPositions = getWindowsPositions(pos);
        emitter.emit('wallElemConst')
      }
});

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

var maxItems = 60;

bot.on("chestOpen", function  (c, type) {
  console.log(type);
  setTimeout(function () { chest.enoughBlocksToWithdraw(c, buildingTypes, maxItems)} , 1000);
});

