var path = require('path');

module.exports = function getAPIVersion(mod) {
  return path.relative(path.resolve('test', 'apis'), path.dirname(mod.filename)).split(path.sep)[0];
};
