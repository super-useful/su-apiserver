'use strict';
var path = require('path');

var co = require('co');
var sleep = require('co-sleep');
var koaContext = require('koa/lib/context');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

chai.use(sinonChai);

var rewire = require('rewire');

var next = function * () {};

var modulePath = 'lib/utils/callEndpoint';

var fakes;
var context;
var underTest;

var router;

describe(modulePath, function() {
  beforeEach(function() {
    underTest = rewire(path.resolve(modulePath));

    fakes = sinon.sandbox.create();

    context = Object.create(koaContext);
    context.mountPath = '/apis/v0.0.0.0.0.1';

    fakes.stub(context, 'toJSON').returns({
      params: {foo : 'bar'}
    });

    router = {
      routes: [{
        name: 'foo',
        middleware: function* () {
          yield sleep(100);

          return this.params;
        }
      }]
    };
  });

  afterEach(function() {
    fakes.restore();
    underTest = null;
    context = null;
  });

  it('should call the passed endpoint with a new koa context', function (done) {
    co.wrap(function* () {

      expect(yield underTest(router, 'foo', context, {params: {bar: 'foo'}})).to.deep.equal({
          bar: 'foo',
          foo: 'bar'
      });
      done();
    })();
  });
});
