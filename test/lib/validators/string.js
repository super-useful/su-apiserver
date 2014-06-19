'use strict';
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var fakes;
var string;

chai.use(sinonChai);

describe('lib/validators/string', function() {

  beforeEach(function() {

    string = rewire(process.cwd() + '/lib/validators/string');
    fakes = sinon.sandbox.create();

  });

  afterEach(function() {

    fakes.restore();

  });

  it('coerces values into strings', function () {
  	expect(string(false)).to.equal('false');
  	expect(string("false")).to.equal('false');

  	expect(string(null)).to.equal('null');
  	expect(string("null")).to.equal('null');

  	expect(string(undefined)).to.equal('undefined');
  	expect(string("undefined")).to.equal('undefined');

  	expect(string(0)).to.equal('0');
  	expect(string("0")).to.equal('0');

  	expect(string({foo : 'bar'})).to.equal('{"foo":"bar"}');
  	expect(string([{foo : 'bar'}, {foo : 'bar'}])).to.equal('[{"foo":"bar"},{"foo":"bar"}]');
  });

});
