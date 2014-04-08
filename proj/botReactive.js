var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "GrupolindoAASMA",
  viewDistance: "normal",
});

bot.on('move', function() {
	bot.clearControlStates();
	var moves = ['forward', 'back', 'right', 'left'];
	bot.setControlState(moves[randomIntInc(0,3)], true);
});


bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");

});

bot.on('entityHurt', function(entity) {
	bot.attack(entity);
}); 

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}
