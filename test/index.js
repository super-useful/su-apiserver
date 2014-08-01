'use strict';
var path = require('path');
var co = require('co');
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var supertest = require('supertest');
var rewire = require('rewire');

var InternalServerError = require('../lib/errors/InternalServerError');
var define = require('../lib/request/Object');
var stringToNumber = require('../lib/validators/stringToNumber');

var CONF = require('config');

var app;
var request;
var modulePath = 'index';
var versions;

chai.use(sinonChai);

describe(modulePath, function() {

  before(co(function * () {
    versions = {
      '0.0.1': {
        'definitions': {
          'test_api':     [
            {
              method: 'GET',
              type: 'json',
              paths: {
                default: {
                  params: '/:foo/:bar',
                  request: define('Request', {
                    hasOne: {
                      params: define('Params', {
                        properties: [
                            {
                              foo: {
                                enumerable: true,
                                type: 'string'
                              },
                              bar: {
                                enumerable: true,
                                set: stringToNumber
                              }
                            }
                        ]
                      })
                    }
                  }),
                  interceptors: [
                    function * (next) {
                      if (!this.e) {
                        if (this.r.params.foo == 'error') {
                          this.e = new InternalServerError();
                        }
                      }
                      yield next;
                    }
                  ]
                }
              },
              query: function* () {
                return {
                  fromQuery: true
                };
              },
              pipeline: [
                function* () {
                  this.data.fromPipeline = true;
                  this.data.fooQuery = this.r.params.foo;
                }
              ]
            }
          ]
        }
      }
    };
    app = rewire(path.resolve(modulePath));
    var underTest = yield app(versions);
    request = supertest(underTest);
  }));

  it('can match valid route with correct data properties', function (done) {
    co(function * () {
      request.get('/apis/0.0.1/test_api/foo/1')
        .expect('Content-Type', /^application\/json/)
        .expect(200)
        .end(function (err, res) {
          var expected = {
            fromPipeline: true,
            fromQuery: true,
            fooQuery: 'foo'
          };

          chai.assert.deepEqual(expected, res.body.data);
          done(err);
        })
    })();
  });

  it('returns 404 for invalid route', function (done) {
    co(function * () {
      request.get('/apis/0.0.1/non_existent/foo/1')
        .expect(404)
        .end(done)
    })();
  });

  it('returns 404 for bad parameters to valid route', function (done) {
    co(function * () {
      request.get('/apis/0.0.1/test_api/foo/shouldBeNumber')
        .expect(400)
        .end(done)
    })();
  });

  it('if interceptor sets error then stack unwinds early', function (done) {
    co(function * () {
      request.get('/apis/0.0.1/test_api/error/1')
        .expect(500)
        .end(done)
    })();
  });
});
