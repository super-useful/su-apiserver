

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function () {

  var file_name = path.join.apply(path, arguments);

  if (/.yaml$/.test(file_name)) {

    return yaml.load(fs.readFileSync(file_name, 'utf8'));
  }
  else {

    return JSON.parse(fs.readFileSync(file_name, 'utf8'));
  }
}
