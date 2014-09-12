'use strict';
var path = require('path');

var co = require('co');

var chai = require('chai');
var expect = chai.expect;

var next = function * () {};

var modulePath = 'lib/utils/resolveEndpointUrl';

var underTest = require(path.resolve(modulePath));

describe(modulePath, function() {
  it('should return a url, what do you want me to say?', function (done) {
    expect(underTest('/mountPath', {
      url: function() { return '/endpoint'; }
    }, null, {foo : 'bar'})).to.equal('/mountPath/endpoint?foo=bar');

    done();
  });
});
