'use strict';
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var CONF;
var fakes;
var apiDescriptor;
var api;
var requestDefinition;
var version;
var releaseName;
var apiName;
var apiUrl;

chai.use(sinonChai);

describe('lib/start/apiDescriptor', function() {

  beforeEach(function() {

    CONF = rewire('config');
    apiDescriptor = rewire(process.cwd() + '/lib/start/apiDescriptor');
    fakes = sinon.sandbox.create();
    version = 'v1';
    releaseName = 'stable';

    apiName = 'apiName';
    apiUrl = 'apiUrl';

    api = {
      method: 'GET',
      type: 'json'
    };

    requestDefinition = {
      params: 10,
      query: 20
    }

  });

  afterEach(function() {

    fakes.restore();

  });

  describe('initialiseVersion', function () {

    it('should create a new array to hold the version descriptor', function() {

      apiDescriptor.initialiseVersion(version);

      expect(apiDescriptor.versions.v1 instanceof Array).to.be.true;

    });

    it('should throw an error if the supplied version has alreay been set', function() {

      apiDescriptor.initialiseVersion(version);
      expect(function () {

        apiDescriptor.initialiseVersion(version);

      }).to.throw(RangeError);

    });

  });


  describe('create', function () {


    it('should push a data structure representing an API on the correct version array', function() {

      apiDescriptor.initialiseVersion(version);
      apiDescriptor.create(apiName, api, apiUrl, version, requestDefinition);

      var v = apiDescriptor.versions[version][0];

      expect(v.id).to.be.equal(apiName);
      expect(v.method).to.be.equal(api.method);
      expect(v.type).to.be.equal(api.type);
      expect(v.url).to.be.equal(CONF.apis.base + '/' + version + apiUrl);
      expect(v.params).to.be.equal(requestDefinition.params);
      expect(v.query).to.be.equal(requestDefinition.query);
    });

    it('should throw an error if the supplied version does not exist', function() {

      expect(function () {

        apiDescriptor.create(apiName, api, apiUrl, version, requestDefinition);

      }).to.throw(RangeError);

    });

  });



  describe('createReleaseVersion', function () {


    it('should push a data structure representing an API on the correct version array', function() {

      apiDescriptor.initialiseVersion(version);
      apiDescriptor.create(apiName, api, apiUrl, version, requestDefinition);

      apiDescriptor.createReleaseVersion(version, releaseName);

      var v = apiDescriptor.versions[releaseName][0];

      expect(v.id).to.be.equal(apiName);
      expect(v.method).to.be.equal(api.method);
      expect(v.type).to.be.equal(api.type);
      expect(v.url).to.be.equal(CONF.apis.base + '/' + releaseName + apiUrl);
      expect(v.params).to.be.equal(requestDefinition.params);
      expect(v.query).to.be.equal(requestDefinition.query);
    });

    it('should throw an error if the supplied releaseName has already been used', function() {

      apiDescriptor.initialiseVersion(releaseName);
      expect(function () {

        apiDescriptor.createReleaseVersion(version, releaseName);

      }).to.throw(RangeError);

    });

  })

});
