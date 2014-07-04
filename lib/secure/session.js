/*

  session management

*/
"use strict";

var CONF = require('config');
var rack = require('hat').rack();
var store = require('co-redis')(require('redis').createClient(CONF.app.session.port, CONF.app.session.host));
var SessionData = require('./SessionData');

var SESSION_TIMEOUT = CONF.global_session_timeout;


function * retrieve (token) {

  var data = yield store.get(token);

  if (data === null) {
    return data;
  }

  return new SessionData(JSON.parse(data));
}


function * save (session) {

  var data = JSON.stringify(session.serialise());

  return yield store.set(session.id, data);;
}


module.exports = exports = {

  set: function * set (data) {

    try {

      var token = rack();
      var session = new SessionData({
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

    try {

      var session = yield retrieve(token);

      if (session === null || !session.isValid) {

        return null;
      }
      else if (Date.now() - session.timestamp > SESSION_TIMEOUT) {

        session.isValid = false;
        yield save(session);

        return null;
      }
      else {

        session.timestamp = Date.now();
        yield save(session);

        return session;

      }
    }
    catch (e) {
      console.log('SessionTokenError: ', e.message);
      console.log(e.stack);
    }

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
  },

}