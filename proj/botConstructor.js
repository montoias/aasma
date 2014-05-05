var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);

var mvc = require('./movementController');

var bot = mineflayer.createBot({ username: "master", });
var buildingBlocks = [];
var windowsPositions = [];
var actualBlock;

mvc.setBot(bot);
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
  87: true, // netherrack
};


// optional configuration
bot.navigate.blocksToAvoid[132] = true; // avoid tripwire
bot.navigate.blocksToAvoid[59] = false; // ok to trample crops
bot.navigate.on('pathFound', function (path) {
  bot.chat("found path. I can get there in " + path.length + " moves.");
});

var type = process.argv[2]
var x = parseInt(process.argv[3])
var z = parseInt(process.argv[4])

bot.on('spawn', function(){
});

bot.navigate.on('arrived', function () {
    console.log("cheguei", buildingBlocks.length)
    
});

function buildBlock () {
  console.log("cheguei")
      build(buildHouse); 
}

bot.navigate.on('interrupted', function() {
  bot.chat("stopping");
});

bot.on('chat', function(username, message) {
  // navigate to whoever talks
  if (username === bot.username) return;
  var target = bot.players[username].entity;
  if (message === 'come') {
    bot.navigate.to(target.position);
  } else if (message === 'stop') {
    bot.navigate.stop();
  } else if (message.split(" ")[0] === 'dig') {
    var split = message.split(" ")
    var b = vec3(parseInt(split[1]),parseInt(split[2]),parseInt(split[3]));
    moveTo(b);

  } else if (message === 'build') {
    build(buildHouse)
  } else if (message === 'positions') {
    buildingBlocks = getBuildingPositions();
    windowsPositions = getWindowsPositions();
    buildHouse();

  } else if (message === 'show') {
    console.log  ( bot.heldItem)
    equipBuildingBlock();
    console.log  ( bot.heldItem)

  }
  else if (message.split(" ")[0] === 'move') {
      var split = message.split(" ")
      var dest = vec3(parseInt(split[1]),parseInt(split[2]),parseInt(split[3]))
      bot.navigate.to(dest)
  }
  
  
});

function getWindowsPositions (argument) {

  var botx = bot.entity.position.floored().x,
      boty = bot.entity.position.floored().y,
      botz = bot.entity.position.floored().z,
      xHalf = Math.floor(x / 2),
      zHalf = Math.floor(z / 2);

  var windows = []
  windows.push(vec3(botx, boty + 1, botz - zHalf))
  windows.push(vec3(botx, boty + 1, botz + zHalf))
  windows.push(vec3(botx - xHalf, boty + 1, botz))
  windows.push(vec3(botx + xHalf, boty + 1, botz))
  windows.push(vec3(botx + xHalf, boty, botz))
  console.log(windows.length)
  return windows
}

function buildHouse(){
 if(buildingBlocks.length === 0) {
    console.log("terminei construir as paredes")
    moveToAll(windowsPositions)
    return;
 }

 actualBlock = buildingBlocks.pop();
 moveTo (actualBlock, buildBlock);

}

function moveToAll () {
  if(windowsPositions.length === 0)
      return
  moveTo(windowsPositions.pop(), moveToAll);
}

function moveTo (dest, callback) {
   bot.scaffold.to(dest, function(err) {
      if (err) {
        if(bot.canDigBlock(bot.blockAt(dest))){
          bot.dig(bot.blockAt(dest),onDiggingCompleted);
          setTimeout(function () { callback();}, bot.digTime(bot.blockAt(dest)));
          console.log("diging");
        }
        console.log("didn't make it: " ,err.code, dest);
      } else {
        bot.chat("made it!");
        callback();   
      }
    });
}

function getBuildingPositions () {

  var botx = bot.entity.position.floored().x,
      boty = bot.entity.position.floored().y,
      botz = bot.entity.position.floored().z,
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
 ///
  
  return result

}


function build(callback) {

  if(!equipBuildingBlock() || buildingBlocks === 0) return;

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
        callback();
        bot.removeListener('move', placeIfHighEnough);
      }
    }
  }, 1000);
}



function equipBuildingBlock() {
    if (bot.heldItem && scaffoldBlockTypes[bot.heldItem.type]) return true;
    var scaffoldingItems = bot.inventory.items().filter(function(item) {
      return scaffoldBlockTypes[item.type];
    });
    console.log(scaffoldingItems)
    var item = scaffoldingItems[0];
    if (!item) {
      console.log("no items to build")
      return false;
    }

    bot.equip(scaffoldingItems[0], 'hand', function(err) {
      if (err) {
        console.log('error')
        return false;
      } else {
        console.log('item equiped', scaffoldingItems[0])
      }
    });
    return true;
}

//Indicates the heath and the inventory of the bot
bot.on('health', function() {
  bot.chat(bot.entity.username + " have " + bot.health + " health and " + bot.food + " food");
  mvc.listInventory();
});


//auxiliar function to the operation dig
function onDiggingCompleted(err,b) {
    bot.chat("finished digging");
}
      
