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

describe(modulePath, function() {


  before(co(function * () {

    app = require(path.resolve(modulePath));
    var underTest = yield app(versions);
    request = supertest(underTest);

  }));

  describe('apis by version', function () {

    it('returns the api descriptor for a given version', function (done) {
      co(function * () {
        request.get('/apis/0.0.0')
          .expect(200)
          .end(function (err, res) {

            res = JSON.parse(res.text);

            var expected = [
              {
                "id": "bus-default",
                "method": "GET",
                "type": "json",
                "url": "/apis/0.0.0/bus/station/:station/platform/:platform",
                "version": "0.0.0",
                "params": {
                  "station": {
                    "type": "string"
                  },
                  "platform": {}
                },
                "query": {}
              },
              {
                "id": "train-default",
                "method": "GET",
                "type": "json",
                "url": "/apis/0.0.0/train/station/:station/platform/:platform",
                "version": "0.0.0",
                "params": {
                  "station": {
                    "type": "string"
                  },
                  "platform": {}
                },
                "query": {}
              }
            ];

            expect(res).to.be.deep.equal(expected);
            done();
          })
      })();
    });


    it('returns 200 valid response for an api', function (done) {
      co(function * () {
        request.get('/apis/0.0.0/train/station/open/platform/1')
          .expect(200)
          .end(done)
      })();
    });


    it('returns 500 valid response for an api whose interceptor throws an InternalServerError', function (done) {
      co(function * () {
        request.get('/apis/0.0.0/train/station/closed/platform/1')
          .expect(500)
          .end(done)
      })();
    });


    it('returns 200 valid response for an api whose interceptor modifies the request', function (done) {
      co(function * () {
        request.get('/apis/0.0.0/train/station/open/platform/10')
          .expect(200)
          .end(function (err, res) {
            res = JSON.parse(res.text);
            expect(res.data.platform).to.be.equal(3);
            done();
          })
      })();
    });


    it('returns 200 valid response for an api whose transformer modifies the response', function (done) {
      co(function * () {
        request.get('/apis/0.0.0/train/station/open/platform/10')
          .expect(200)
          .end(function (err, res) {
            res = JSON.parse(res.text);
            expect(res.data.message).to.be.equal('platformChange');
            done();
          })
      })();
    });


    it('returns 400 bad request for a, um, bad request', function (done) {
      co(function * () {
        request.get('/apis/0.0.0/train/station/open/platform/ten')
          .expect(400)
          .end(done)
      })();
    });


    it('returns 404 for invalid route', function (done) {
      co(function * () {
        request.get('/apis/0.0.1/non_existent/foo/1')
          .expect(404)
          .end(done)
      })();
    });

  });

  describe('apis mapped by release tag', function () {

    it('returns the api descriptor for a stable release', function (done) {
      co(function * () {
        request.get('/apis/stable')
          .expect(200)
          .end(function (err, res) {

            res = JSON.parse(res.text);

            var expected = [
              {
                "id": "bus-default",
                "method": "GET",
                "type": "json",
                "url": "/apis/stable/bus",
                "version": "0.1.0",
                "params": {},
                "query": {}
              },
              {
                "id": "train-default",
                "method": "GET",
                "type": "json",
                "url": "/apis/stable/train/station/:station/platform/:platform",
                "version": "0.0.0",
                "params": {
                  "station": {
                    "type": "string"
                  },
                  "platform": {}
                },
                "query": {}
              }
            ];

            expect(res).to.be.deep.equal(expected);
            done();
          })
      })();

    });

    it('returns the api descriptor for a beta release', function (done) {
      co(function * () {
        request.get('/apis/beta')
          .expect(200)
          .end(function (err, res) {

            res = JSON.parse(res.text);

            var expected = [
              {
                "id": "train-default",
                "method": "GET",
                "type": "json",
                "url": "/apis/beta/train/station/:station/platform/:platform",
                "version": "1.0.0",
                "params": {
                  "station": {
                    "type": "string"
                  },
                  "platform": {}
                },
                "query": {}
              }
            ];

            expect(res).to.be.deep.equal(expected);
            done();
          })
      })();

    });

  });

});
