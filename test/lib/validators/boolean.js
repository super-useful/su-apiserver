'use strict';
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var fakes;
var bool;

chai.use(sinonChai);

describe('lib/validators/boolean', function() {

  beforeEach(function() {

    bool = rewire(process.cwd() + '/lib/validators/boolean');
    fakes = sinon.sandbox.create();

  });

  afterEach(function() {

    fakes.restore();

  });

  it('false/"false"/null/"null"/undefined/"undefined"/0/"0" returns false', function () {
  	expect(bool(false)).to.equal(false);
  	expect(bool("false")).to.equal(false);

  	expect(bool(null)).to.equal(false);
  	expect(bool("null")).to.equal(false);

  	expect(bool(undefined)).to.equal(false);
  	expect(bool("undefined")).to.equal(false);

  	expect(bool(0)).to.equal(false);
  	expect(bool("0")).to.equal(false);
  });

  it('everything else returns true', function () {
  	expect(bool(true)).to.equal(true);
  	expect(bool("true")).to.equal(true);

  	expect(bool({})).to.equal(true);
  	expect(bool("foo")).to.equal(true);

  	expect(bool(1)).to.equal(true);
  	expect(bool("1")).to.equal(true);
  });

});
