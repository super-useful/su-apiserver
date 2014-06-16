'use strict';
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var fakes;
var enums;
var values;

chai.use(sinonChai);

describe('lib/validators/enums', function() {

  beforeEach(function() {

    enums = rewire(process.cwd() + '/lib/validators/enums');
    fakes = sinon.sandbox.create();
    values = ['simon', 'sarah', 'matilda', 'jefforson', 'elliot'];

  });

  afterEach(function() {

    fakes.restore();
    values = null;

  });


  it('should throw an error if the supplied value is not in the value list', function() {

    expect(function () {

      enums(values, 'christos');

    }).to.throw(RangeError);

  });

  it('should return the supplied value if it passes the validation check', function() {

    var v = 'simon';

    expect(enums(values, v)).to.be.equal(v);

  });

});
