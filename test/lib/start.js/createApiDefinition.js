'use strict';

var Stream = require('stream').Stream;
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var Base = require('super-base');

var fakes;
var createApiDefinition;
var name;
var pathName;
var path;
var api;
var bindVersion;
var lb;
var lbRequest;
var lbController;

chai.use(sinonChai);

describe('lib/start/createApiDefinition', function() {

  beforeEach(function() {

    createApiDefinition = rewire(process.cwd() + '/lib/start/createApiDefinition');
    fakes = sinon.sandbox.create();

    name = 'api';
    pathName = 'pathName';

    path = {
      params: '/params/:params',
      interceptors: [
        function * () {},
        function * () {}
      ],
      request: Base.extend({})
    }

    api = {
      type: 'json',
      interceptors: [
        function * () {},
        function * () {}
      ],
      query: function * () {},
      streams: [
        function () {return new Stream},
        function () {return new Stream}
      ]
    };

    bindVersion = 'bindVersion';
    lbRequest = 'request';
    lbController = 'controller';
    lb = sinon.stub();
    lb.onCall(0).returns(lbRequest);
    lb.onCall(1).returns(lbController);
    createApiDefinition.__set__('lateBind', lb);
    createApiDefinition.__set__('bindVersion', 'bindVersion');

  });

  afterEach(function() {

    fakes.restore();

  });

  it('should return an array containing values and functions that describe a controller pipeline', function() {

    var definition = createApiDefinition(name, pathName, path, api);

    expect(definition[0]).to.be.equal(name + '-' + pathName);
    expect(definition[1]).to.be.equal('/' + name + path.params);
    expect(definition[2]).to.be.equal(lbRequest);
    expect(definition[3]).to.be.equal(bindVersion);
    expect(definition[4]).to.be.equal(path.interceptors[0]);
    expect(definition[5]).to.be.equal(path.interceptors[1]);
    expect(definition[6]).to.be.equal(api.interceptors[0]);
    expect(definition[7]).to.be.equal(api.interceptors[1]);
    expect(definition[8]).to.be.equal(lbController);
  });


  it('should enforce that the path request has prototype of Base', function() {

    path.request = {};

    expect(function () {
      createApiDefinition(name, pathName, path, api);
    }).to.throw(TypeError);

  });

  it('should enforce that the path interceptors consists of generators', function() {

    path.interceptors = [
      function () {},
      {}
    ];

    expect(function () {
      createApiDefinition(name, pathName, path, api);
    }).to.throw(TypeError);


  });

  it('should enforce that the api interceptors consists of generators', function() {

    api.interceptors = [
      function () {},
      {}
    ];

    expect(function () {
      createApiDefinition(name, pathName, path, api);
    }).to.throw(TypeError);

  });

  it('should enforce that the api query is a generator', function() {

    api.query = function () {};

    expect(function () {
      createApiDefinition(name, pathName, path, api);
    }).to.throw(TypeError);

  });


  it('should enforce that the api streaming pipeline consists of functions that return a Stream', function() {

    api.streams = [
      function () {return {};},
      function () {return {};}
    ];

    expect(function () {
      createApiDefinition(name, pathName, path, api);
    }).to.throw(TypeError);

  });


  it('should enforce that the api pipeline consists of functions', function() {
    delete api.streams;

    api.pipeline = [
      function () {return {};},
      function () {return {};}
    ];

    expect(function () {
      createApiDefinition(name, pathName, path, api);
    }).to.not.throw(Error);

  });


  it('should enforce that the api can not contain both a streaming pipeline and function pipeline for the same definition', function() {

    api.pipeline = [
      function () {return {};},
      function () {return {};}
    ];

    expect(function () {
      createApiDefinition(name, pathName, path, api);
    }).to.throw(Error);

  });


});
