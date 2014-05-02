var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var mvc = require('./movementController');

var bot = mineflayer.createBot({ username: "master", });
var freeHouses = [];

mvc.setBot(bot);

// block types allowed to be used as scaffolding
var scaffoldBlockTypes = {
  1:  true, // stone
  2:  true, // grass
  3:  true, // dirt
  4:  true, // cobblestone
  7:  true, // bedrock
  87: true, // netherrack
};

// install the plugin
navigatePlugin(bot);

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

bot.navigate.on('cannotFind', function (closestPath) {
  bot.chat("unable to find path. getting as close as possible");
  bot.navigate.walk(closestPath, function(reason){
      console.log(reason);
  if(reason==='arrived')
      buildBlock();      
  });
});

bot.navigate.on('arrived', function () {
    console.log("cheguei", freeHouses.length)
    if(freeHouses.length > 0) {   
      buildBlock();   
    }
});

function buildBlock () {
      build(); 
      console.log("builded")
      setTimeout(function(){buildHouse()}, 1000);
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
  } else if (message === 'dig') {
    dig()
  } else if (message === 'build') {
    build()
  } else if (message === 'positions') {
    console.log(getBuildingPositions())
    freeHouses = getBuildingPositions()
    buildHouse()
  } else if (message === 'show') {
    console.log  ( bot.heldItem)
    equipBuildingBlock();
    console.log  ( bot.heldItem)

  }
  else if (message.split(" ")[0] === 'move') {
      var split = message.split(" ")
      var dest = vec3(parseInt(split[1]),parseInt(split[2]),parseInt(split[3]))
      console.log(dest)
      bot.navigate.to(dest)
  }
  
  
});


function buildHouse(){
 if(freeHouses.length === 0)
    return;

 var next = freeHouses.pop();
 console.log(next);
 console.log('before');
 bot.navigate.to(next, {timeout: 1});
 console.log('after');
}


function getBuildingPositions () {

  var botx = bot.entity.position.floored().x,
      boty = bot.entity.position.floored().y,
      botz = bot.entity.position.floored().z,
      result = [],
      xHalf = Math.floor(x / 2),
      zHalf = Math.floor(z / 2);

  console.log("x")
  for (i = botx - xHalf; i <= botx + xHalf; i++) {
    for (j = botz - zHalf; j <= botz + zHalf; j += 2 * zHalf){
      for (k = boty + 2; k >= boty; k--) {
        result.push(vec3(i,k ,j))
      }
    }
  }

  console.log("z")
  for (i = botz - zHalf; i <= botz + zHalf; i++) {
   for (j = botx - xHalf; j <= botx + xHalf; j += 2 * xHalf){
      for (k = boty + 2; k >=  boty; k--) {
        result.push(vec3(j,k,i))
      }
    }
  }

  return result

}


function dig() {
  if (bot.targetDigBlock) {
    bot.chat("already digging " + bot.targetDigBlock.name);
  } else {
    var target = bot.blockAt(bot.entity.position.offset(0, -1,  0));
    if (target && bot.canDigBlock(target)) {
      bot.chat("starting to dig " + target.name);
      bot.dig(target, onDiggingCompleted);
    } else {
      bot.chat("cannot dig");
    }
  }

  function onDiggingCompleted() {
    bot.chat("finished digging " + target.name);
  }
}



function build() {

  if(!equipBuildingBlock()) return;

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
        bot.removeListener('move', placeIfHighEnough);
      }
    }
  }, 500);
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