'use strict';
var path = require('path');

var co = require('co');

var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var InternalServerError = require('lib/errors/InternalServerError');
var define = require('lib/request/Object');

var fakes;
var underTest;
var next;
var ctxSuccess;
var ctxError;

var modulePath = 'index';
var routers;
var versions;

chai.use(sinonChai);

describe(modulePath, function() {

  beforeEach(function() {

    underTest = rewire(path.resolve(modulePath));
    fakes = sinon.sandbox.create();
    appApi = {};
    next = function * () {};

    versions = {};
    [
      {
        method: 'GET',
        type: 'json',
        paths: {
          default: {
            params: '',
            request: define("Request", {
              hasOne: {
                params: define("Params", {
                  properties: [
                    {
                      appliance: {
                        set: partial(enums,)
                      },
                    }
                  ]
                })
              }
            }),
            //  generator -> next
            interceptors: [
              require('../interceptors/xcsrf')
            ]
          }
        },
        //  generator -> stream
        query: require('../queries/dataRange'),
        //  generator -> koa
        pipeline: [
          require('../transformers/dataRange')
        ]
      }
    ];


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

});

