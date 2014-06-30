'use strict';
var path = require('path');

var co = require('co');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var InternalServerError = require('../../../lib/errors/InternalServerError');

var fakes;
var underTest;
var next;
var ctxSuccess;
var ctxError;

var modulePath = 'lib/commands/bindVersion';
var routers;
var appApi;

chai.use(sinonChai);

describe(modulePath, function() {

  beforeEach(function() {

    underTest = rewire(path.resolve(modulePath));
    fakes = sinon.sandbox.create();
    appApi = {};
    next = function * () {};

    ctxSuccess = {
      mountPath: '/apis/0.0.0'
    };

    ctxError = {};

    routers = underTest.__get__('routers');
    fakes.stub(routers, 'getActive').returns(10)

  });

  afterEach(function() {

    fakes.restore();
    underTest = null;
    next = null;
    ctxSuccess = null;
    ctxError = null;
    routers = null;
  });


  it('should attach an InternalServerError to the ctx if there is a problem', function (done) {

    co(function * () {

      yield underTest.call(ctxError, appApi, next);

      expect(ctxError.e).to.be.instanceof(InternalServerError);

    })(done);

  });

  it('should attach the version to the ctx', function (done) {

    co(function * () {

      yield underTest.call(ctxSuccess, appApi, next);

      expect(ctxSuccess.v.version).to.be.equal('0.0.0');

    })(done);

  });


  it('should attach the correct router to the ctx', function (done) {

    co(function * () {

      yield underTest.call(ctxSuccess, appApi, next);

      expect(routers.getActive).to.have.been.calledWith('0.0.0');
      expect(ctxSuccess.v.router).to.be.equal(10);

    })(done);

  });


});
