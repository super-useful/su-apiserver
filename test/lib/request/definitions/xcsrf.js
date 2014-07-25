'use strict';
var path = require('path');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var fakes;
var underTest;

var version = require('../../../helpers/getAPIVersion')(module);
var modulePath = 'lib/request/definitions/xcsrf';

chai.use(sinonChai);

describe(modulePath, function() {

  beforeEach(function() {

    underTest = rewire(path.resolve(modulePath));
    fakes = sinon.sandbox.create();

  });

  afterEach(function() {

    underTest = null;
    fakes.restore();

  });


  it('should have a custom setter', function() {

    expect(typeof underTest.xcsrf.set).to.be.equal('function');

  });

  it('should throw an error if the xcsrf is not valid', function() {

    expect(function () {
      underTest.xcsrf.set(1);
    }).to.throw(TypeError, /Invalid XCSRF Token/);

  });



});
