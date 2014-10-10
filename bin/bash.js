var util = require('util');
var spawn = require('child_process').spawn;

module.exports = function bash (cmd, args) {

  var cp = spawn(cmd, args);

  cp.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  cp.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  cp.on('exit', function (code) {
    console.log('child process exited with code ' + code);
  });
}
