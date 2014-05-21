var exec = require('child_process').exec,
	child1,
	child2;

// stor guards
execChild('node botStorGuard.js guardStor1 1123 4 70,5');
execChild('node botStorGuard.js guardStor2 1119 4 70,5');

// village guards
execChild('node botStorGuard.js guard1 1104 4 140');
execChild('node botStorGuard.js guard2 1104 4 134');

// kitchen guards
execChild('node botStorGuard.js guardKitchen1 1131 4 67');
execChild('node botStorGuard.js guardKitchen2 1131 4 64');

function execChild(process){
	exec(process,
	  function (error, stdout, stderr) {
	    console.log('stdout: ' + stdout);
	    console.log('stderr: ' + stderr);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
	});
}