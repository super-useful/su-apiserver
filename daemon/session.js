var EventEmitter = require('events').EventEmitter;
var path = require('path');

var co = require('co');
var defer = require('co-defer');
var is = require('super-is');
var iter = require('super-iter');
var CONF = require('config');

var session = require('../lib/secure/session');
var store = require('co-redis')(require('redis').createClient(CONF.app.session.port, CONF.app.session.host));

var bus = new EventEmitter();

var cleanupTime = CONF.app.session.cleanup_time;
var cleanupInterval = CONF.app.session.cleanup_interval;

var map = iter.map;
var typeOf = is.typeOf;

var intervalId = null;

function* checkAndInvalidate(token) {
  var data = yield session.fget(token);

  if (data) {
    var ms = Date.now() - data.timestamp;

    if (!data.isValid || ms >= cleanupTime) {
      yield invalidate(token, data);
    }
  }
  else {
      yield invalidate(token, null);
  }

  return token;
}

function* invalidate(token, data) {
  yield store.del(token);
  yield store.lrem('token_list', 0, token);

  if (data !== null) {
    bus.emit('session:expired', token, data);
  }
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
  },
  start: function() {
    intervalId = defer.interval(exports.cleanup, cleanupInterval);

    return exports;
  },
  stop: function() {
    clearInterval(intervalId);

    intervalId = null;

    return exports;
  }
};

