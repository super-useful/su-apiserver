'use strict';
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var fakes;
var stringToNumber;

chai.use(sinonChai);

describe('lib/validators/stringToNumber', function() {

  beforeEach(function() {

    stringToNumber = rewire(process.cwd() + '/lib/validators/stringToNumber');
    fakes = sinon.sandbox.create();

  });

  afterEach(function() {

    fakes.restore();

  });


  it('should throw an error if the supplied string is not convertible to a number', function() {

    expect(function () {

      stringToNumber('f');

    }).to.throw(TypeError);

  });

  it('should return the converted number if it passes the validation check', function() {

    expect(stringToNumber('3')).to.be.equal(3);

  });

});
