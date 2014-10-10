// initialise a new project
var co = require('co');
var fs = require('co-fs-plus');

var dirs = [
  'apis/v0.0.1',
  'config',
  'logs',
  'test/apis/v0.0.1'
];


function * mkdirp (dir) {

  // [15:02:38] Starting 'clean'
  yield fs.mkdirp(dir);

  console.log('create path: ', dir);
}


co(function * () {

  yield dirs.map(mkdirp);

})();
