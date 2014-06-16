

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

module.exports = function () {

 return yaml.load(fs.readFileSync(path.join.apply(path, arguments), 'utf8'));

}
