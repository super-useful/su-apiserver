var iter = require('super-iter');

var CONFIG = require('config');

var HttpError = require('./HttpError');

var reduce = iter.reduce;

if (CONFIG.errors && typeof CONFIG.errors === 'object') {
  module.exports = reduce(CONFIG.errors, function(acc, error, status) {
    var name = error.id + 'Error';

    acc['_' + status] = acc[name] = function(e) {
      HttpError.call(this, error.message, e);
    };

    acc[name].prototype = Object.create(HttpError.prototype, {
      constructor: {
        value: acc[name]
      },
      name: {
        value: name
      },
      status: {
        value: (status >>> 0)
      },
      valueOf: {
        value: function () {
          return "[object " + name + "]";
        }
      }
    });

    return acc;
  }, exports);
}
