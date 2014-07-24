/*

  session management

*/
"use strict";

var CONF = require('config');
var rack = require('hat').rack();
var store = require('co-redis')(require('redis').createClient(CONF.app.session.port, CONF.app.session.host));
var SessionData = require('./SessionData');

var SESSION_TIMEOUT = CONF.global_session_timeout;

function * getData (token, force) {

    try {

      var session = yield retrieve(token);

      if (session === null || (!session.isValid && force !== true)) {

        return null;
      }

      if (Date.now() - session.timestamp > SESSION_TIMEOUT) {

        session.isValid = false;
        yield save(session);

        if (force !== true) {
          return null;
        }
      }

      if (force !== true) {
        session.timestamp = Date.now();

        yield save(session);
      }

      return session;
    }
    catch (e) {
      console.log('SessionTokenError: ', e.message);
      console.log(e.stack);

      return null;
    }
}

function * retrieve (token) {

  var data = yield store.get(token);

  if (data === null) {
    return data;
  }

  return new SessionData(JSON.parse(data));
}


function * save (session) {

  var data = JSON.stringify(session.serialise());

  data = yield store.set(session.id, data);

// redis doesn't have an indexOf like method, so we just remove the token from the list
  yield store.lrem('token_list', 0, session.id);
// and push it on again, to ensure it's only in there once
  yield store.rpush('token_list', session.id);

  return data;
}


module.exports = exports = {
  cache: function(token, key, data) {
    try {
      var session = yield getData(token);

      if (session) {
        session.cache[key] = data;

        yield save(session);

        return true;
      }
    }
    catch (e) {

      console.log(e);
    }

    return false;
  },
  set: function * set (data) {

    try {

      var token = rack();
      var session = new SessionData({
        cache: {},
        data: data,
        id: token,
        timestamp: Date.now()
      });

      yield save(session);

      return token;
    }
    catch (e) {

      console.log(e);
    }

    return null;
  },

  get: function * get (token) {
    return yield getData(token);
  },

  getCached: function * getCached(token, key) {
    try {
      var session = yield getData(token);

      return session && key in session.cache
           ? session.cache[key]
           : null;
    }
    catch (e) {
      console.log(e);
    }

    return null;
  },

  fget: function * fget (token) {
    return yield getData(token, true);
  },

  invalidate: function * invalidate (token) {

    try {

      var session = yield retrieve(token);

      session.isValid = false;
      yield save(session);

      return true;
    }
    catch (e) {
      console.log('SessionTokenError: ', e.message);
      console.log(e.stack);
    }

    return false;
  },

  update: function * update (session) {

    try {

      yield save(session);
      return yield retrieve(session.id);
    }
    catch (e) {

      console.log(e);
    }

    return null;
  }

}
