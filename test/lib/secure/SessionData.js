'use strict';
var path = require('path');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var fakes;
var underTest;
var data;

var modulePath = 'lib/secure/SessionData';

chai.use(sinonChai);

describe(modulePath, function() {

  beforeEach(function() {

    underTest = rewire(path.resolve(modulePath));
    fakes = sinon.sandbox.create();
    data = {
      id: '1234567890',
      data: {
        elec: {accountNumber: '1234567890'},
        gas: {accountNumber: '1234567890'}
      }
    };

  });

  afterEach(function() {

    underTest = null;
    fakes.restore();
    data = null;

  });


  it('should set a the correct properties on the session', function() {

    var session = new underTest(data);

    expect(session.isValid).to.be.true;
    expect(session.isReady).to.be.false;
    expect(session.timestamp).to.be.a.number;
    expect(session.id).to.be.equal(data.id);
    expect(session.data).to.be.equal(data.data);

  });

});
