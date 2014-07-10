var path = require('path');

var co = require('co');
var defer = require('co-defer');
var iter = require('super-iter');
var CONF = require('config');

var session = require(path.resolve('./lib/secure/session'));
var store = require('co-redis')(require('redis').createClient(CONF.app.session.port, CONF.app.session.host));

var bus = new require('events').EventEmitter;

var cleanupTime = CONF.app.session.cleanup_time;
var cleanupInterval = CONF.app.session.cleanup_interval;
var map = iter.map;

function* checkAndInvalidate(token) {
  var data = yield session.fget(token);
  var ms;

  if (data) {
    ms = Date.now() - data.timeout;

    if (!data.isValid || ms >= cleanupTime) {
      yield invalidate(token, data);
    }
  }

  return token;
}

function* invalidate(token, data) {
  yield store.del(token);

  bus.emit('session:expired', data);
}

module.exports = exports = {
  cleanup: function* () {
    var tokens = yield store.lrange('token_list', 0, -1);

    if (Array.isArray(tokens)) {
      yield map(tokens, co(checkAndInvalidate));
    }

    return exports;
  },
  listen: function(cb) {
    if (typeof cb === 'function') {
      bus.on('session:expired', cb);
    }

    return exports;
  }
};

defer.interval(exports.cleanup, cleanupInterval);
