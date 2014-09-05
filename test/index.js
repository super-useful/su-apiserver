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

function generateDescriptor (version, release) {
  return [
    {
      "id": "bus-get",
      "method": "GET",
      "type": "json",
      "url": "/apis/" + release + "/bus/station/:station/platform/:platform",
      "version": version,
      "release": release,
      "params": {
        "station": {
          "type": "string"
        },
        "platform": {}
      },
      "query": {}
    },
    {
      "id": "train-get",
      "method": "GET",
      "type": "json",
      "url": "/apis/" + release + "/train/station/:station/platform/:platform",
      "version": version,
      "release": release,
      "params": {
        "station": {
          "type": "string"
        },
        "platform": {}
      },
      "query": {}
    },
    {
      "id": "train-delay",
      "method": "GET",
      "type": "json",
      "url": "/apis/" + release + "/train",
      "version": version,
      "release": release,
      "params": {},
      "query": {}
    }
  ];
}

describe(modulePath, function() {


  before(co(function * () {

    app = require(path.resolve(modulePath));
    var underTest = yield app(versions);
    request = supertest(underTest);

  }));

  describe('descriptor file processes correctly', function () {

    it('returns the api descriptor for a given version', function (done) {
      co(function * () {
        request.get('/apis/v0.0.0')
          .expect(200)
          .end(function (err, res) {

            res = JSON.parse(res.text);

            var expected = generateDescriptor('v0.0.0', 'v0.0.0');

            expect(res).to.be.deep.equal(expected);
            done();
          })
      })();
    });

  });

  describe('apis process all steps in pipeline correctly', function () {


    it('returns 200 valid response for an api', function (done) {
      co(function * () {
        request.get('/apis/v0.0.0/train/station/open/platform/1')
          .expect(200)
          .end(done)
      })();
    });


    it('returns 500 valid response for an api whose interceptor throws an InternalServerError', function (done) {
      co(function * () {
        request.get('/apis/v0.0.0/train/station/train_v000/platform/1')
          .expect(500)
          .end(done)
      })();
    });


    it('returns 200 valid response for an api whose interceptor modifies the request', function (done) {
      co(function * () {
        request.get('/apis/v0.0.0/train/station/open/platform/10')
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
        request.get('/apis/v0.0.0/train/station/open/platform/10')
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
        request.get('/apis/v0.0.0/train/station/open/platform/ten')
          .expect(400)
          .end(done)
      })();
    });


    it('returns 404 for invalid route', function (done) {
      co(function * () {
        request.get('/apis/v0.0.1/non_existent/foo/1')
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

            var expected = generateDescriptor('v0.1.0', 'stable');

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

            var expected = generateDescriptor('v1.0.0', 'beta');

            expect(res).to.be.deep.equal(expected);
            done();
          })
      })();

    });

  });


  describe('each version of the api uses it\'s own localy scoped codebase', function () {

    describe('v0.0.0 errors', function () {

      it('returns 500 response', function (done) {
        co(function * () {
          request.get('/apis/v0.0.0/train/station/train_v000/platform/1')
            .expect(500)
            .end(done)
        })();
      });

      it('returns 200 response', function (done) {
        co(function * () {
          request.get('/apis/v0.1.0/train/station/train_v000/platform/1')
            .expect(200)
            .end(done)
        })();
      });

      it('returns 200 response', function (done) {
        co(function * () {
          request.get('/apis/v1.0.0/train/station/train_v000/platform/1')
            .expect(200)
            .end(done)
        })();
      });

    });

    describe('v0.1.0 errors', function () {

      it('returns 200 response', function (done) {
        co(function * () {
          request.get('/apis/v0.0.0/train/station/train_v010/platform/1')
            .expect(200)
            .end(done)
        })();
      });

      it('returns 500 response', function (done) {
        co(function * () {
          request.get('/apis/v0.1.0/train/station/train_v010/platform/1')
            .expect(500)
            .end(done)
        })();
      });

      it('returns 200 response', function (done) {
        co(function * () {
          request.get('/apis/v1.0.0/train/station/train_v010/platform/1')
            .expect(200)
            .end(done)
        })();
      });

    });


    describe('v1.0.0 errors', function () {

      it('returns 200 response', function (done) {
        co(function * () {
          request.get('/apis/v0.0.0/train/station/train_v100/platform/1')
            .expect(200)
            .end(done)
        })();
      });

      it('returns 200 response', function (done) {
        co(function * () {
          request.get('/apis/v0.1.0/train/station/train_v100/platform/1')
            .expect(200)
            .end(done)
        })();
      });

      it('returns 500 response', function (done) {
        co(function * () {
          request.get('/apis/v1.0.0/train/station/train_v100/platform/1')
            .expect(500)
            .end(done)
        })();
      });

    });
  });

});
