var exec = require('child_process').exec,
	child1,
	child2;


child = exec('node botStorGuard.js guardStor1 1123 4 69',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

child = exec('node botStorGuard.js guardStor2 1119 4 69',
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});
