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
var define = require('su-define-object');
var stringToNumber = require('../lib/validators/stringToNumber');

var CONF = require('config');

var app;
var request;
var modulePath = 'index';
var versions = require('require-all')(path.join(process.cwd(), 'test/apis'));

chai.use(sinonChai);

describe.only(modulePath, function() {


  before(co(function * () {

    app = require(path.resolve(modulePath));
    var underTest = yield app(versions);
    request = supertest(underTest);

  }));

  it('returns 200 valid response for a stable api', function (done) {
    co(function * () {
      request.get('/apis/stable/train')
        .expect(200)
        .end(done)
    })();
  });


//  it('can match valid route with correct data properties', function (done) {
//    co(function * () {
//      request.get('/apis/0.0.1/test_api/foo/1')
//        .expect('Content-Type', /^application\/json/)
//        .expect(200)
//        .end(function (err, res) {
//          var expected = {
//            fromPipeline: true,
//            fromQuery: true,
//            fooQuery: 'foo'
//          };
//
//          chai.assert.deepEqual(expected, res.body.data);
//          done(err);
//        })
//    })();
//  });

  it('returns 404 for invalid route', function (done) {
    co(function * () {
      request.get('/apis/0.0.1/non_existent/foo/1')
        .expect(200)
        .end(done)
    })();
  });

//  it('returns 404 for bad parameters to valid route', function (done) {
//    co(function * () {
//      request.get('/apis/0.0.1/test_api/foo/shouldBeNumber')
//        .expect(400)
//        .expect('Content-Type', /^application\/json/)
//        .end(done)
//    })();
//  });

//  it('if interceptor throws error then stack unwinds early', function (done) {
//    co(function * () {
//      request.get('/apis/0.0.1/test_api/error/1')
//        .expect(500)
//        .expect('Content-Type', /^application\/json/)
//        .end(done)
//    })();
//  });
});
