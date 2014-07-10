'use strict';
var path = require('path');

var co = require('co');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var sleep = require('co-sleep');
var rewire = require('rewire');

var fakes;
var underTest;
var sessionData;
var token;
var SESSION_TIMEOUT = 500;

var version = require('../../helpers/getAPIVersion')(module);
var modulePath = 'lib/secure/session';

chai.use(sinonChai);

describe(modulePath, function() {

  beforeEach(function () {

    fakes = sinon.sandbox.create();

    underTest = rewire(path.resolve(modulePath));

    token = '0987654321';
    underTest.__set__('rack', fakes.stub().returns(token));
    underTest.__set__('SESSION_TIMEOUT', SESSION_TIMEOUT);


    sessionData = {
      elec: {accountNumber: '1234567890'},
      gas: {accountNumber: '1234567890'}
    };

  });

  afterEach(function () {

    fakes.restore();
    underTest = null;
    sessionData = null;

  });

  it('should set a session and return a token', function (done) {

    co(function * () {

      var t = yield underTest.set(sessionData);
      expect(t).to.be.equal(token);

      yield underTest.invalidate(token);

    })(done);

  });

  it('should get a session using a previously generated token', function (done) {

    co(function * () {

      var t = yield underTest.set(sessionData);
      var session = yield underTest.get(token);

      expect(session.id).to.be.equal(token);
      expect(session.data).to.be.deep.equal(sessionData);

      yield underTest.invalidate(token);


    })(done);

  });

  it('should return null if no token is found', function (done) {

    co(function * () {

      var session = yield underTest.get('undefined');

      expect(session).to.be.null;

    })(done);

  });

  it('should invalidate a token if it is too old', function (done) {

    co(function * () {

      var t = yield underTest.set(sessionData);

      yield sleep(SESSION_TIMEOUT * 2);

      var session = yield underTest.get(token);

      expect(session).to.be.null;

      yield underTest.invalidate(token);

    })(done);

  });

  it('should invalidate a token if it is too old, but still return the session data if `force === true`', function (done) {

    co(function * () {

      var t = yield underTest.set(sessionData);

      yield sleep(SESSION_TIMEOUT * 2);

      var session = yield underTest.get(token, true);

      expect(session).to.not.be.null;

      yield underTest.invalidate(token);

    })(done);

  });

  it('should return null if the token is already invalid', function (done) {

    co(function * () {

      yield underTest.set(sessionData);

      yield underTest.invalidate(token);

      var session = yield underTest.get(token);

      expect(session).to.be.null;

    })(done);

  });

  it('should return the session data if the token is already invalid and `force === true`', function (done) {

    co(function * () {

      yield underTest.set(sessionData);

      yield underTest.invalidate(token);

      var session = yield underTest.get(token, true);

      expect(session).to.not.be.null;

    })(done);

  });

  it('should update the session with new data', function (done) {

    co(function * () {

      yield underTest.set(sessionData);

      var session = yield underTest.get(token);

      expect(session.isReady).to.be.false;

      session.isReady = true;

      yield underTest.update(session);

      var session = yield underTest.get(token);

      expect(session.isReady).to.be.true;

      yield underTest.invalidate(token);

    })(done);

  });




});
