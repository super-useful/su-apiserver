'use strict';
var path = require('path');

var co = require('co');

var chai = require('chai');
var expect = chai.expect;

var next = function * () {};

var modulePath = 'lib/utils/getEndPointById';

var underTest = require(path.resolve(modulePath));

describe(modulePath, function() {
  it('should return the router whose name matches the passed ID', function (done) {
    expect(underTest({
      routes: [{
        name: 'foo'
      }]
    }, 'foo')).to.deep.equal({
        name: 'foo'
    });

    done();
  });

  it('should return undefined if no router name matches the passed ID', function (done) {
    expect(underTest({
      routes: [{
        name: 'foo'
      }]
    }, 'bar')).to.be.undefined;

    done();
  });

});
