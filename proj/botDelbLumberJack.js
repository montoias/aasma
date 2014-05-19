var mineflayer = require('mineflayer');
var EventEmitter = require('events').EventEmitter
var mvc = require('./movementController');
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "DelbLumberJack",
  'spawnPoint': vec3 (1121, 4, 89),
});

bot.on('chat', function(username, message) {

}


