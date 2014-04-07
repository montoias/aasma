var mineflayer = require('mineflayer');
var vec3 = mineflayer.vec3;

var bot = mineflayer.createBot({
  username: "GrupolindoAASMA",
  viewDistance: "normal",
});

bot.on('move', function() {
	bot.clearControlStates();
	var moves = ['forward', 'back', 'right', 'left'];
	var rand = math.random()%3;
	bot.setControlState(moves[rand], true);
	if (true) {};

});


bot.on('health', function() {
  bot.chat("I have " + bot.health + " health and " + bot.food + " food");

});

bot.on('entityHurt', function(entity) {
	bot.attack(entity);
}); 



