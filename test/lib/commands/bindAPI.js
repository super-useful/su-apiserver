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

var modulePath = 'lib/commands/bindAPI';
var apiApp;
var routers;

chai.use(sinonChai);

describe(modulePath, function() {

  beforeEach(function() {

    underTest = rewire(path.resolve(modulePath));
    fakes = sinon.sandbox.create();
    apiApp = {apiName: 'foo'};
    next = function * () {};

    ctxSuccess = {
      mountPath: '/apis/0.0.0',
      su: {}
    };

    ctxError = {};

    routers = underTest.__get__('routers');

    fakes.stub(routers, 'get').returns({
      routes: [{
        name: 'foo'
      }]
    });

  });

  afterEach(function() {

    fakes.restore();
    underTest = null;
    next = null;
    ctxSuccess = null;
    ctxError = null;
    routers = null;
  });


  it('should attach the current API version to the ctx', function (done) {

    co.wrap(function * () {

      yield underTest.call(ctxSuccess, apiApp, next);

      expect(ctxSuccess.su.api.currentEndpoint).to.deep.equal({
        name: 'foo'
      });
      expect(ctxSuccess.su.api.router).to.deep.equal({
        routes: [{
          name: 'foo'
        }]
      });
      expect(ctxSuccess.su.api.getEndpointById).to.be.a.function;
      expect(ctxSuccess.su.api.callEndpoint).to.be.a.function;
      expect(ctxSuccess.su.api.resolveEndpointUrl).to.be.a.function;

      done();
    })();

  });


});
