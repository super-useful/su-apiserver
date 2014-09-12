'use strict';
var path = require('path');

var co = require('co');

var chai = require('chai');
var expect = chai.expect;

var next = function * () {};0

var modulePath = 'lib/commands/initialiseContext';

var underTest = require(path.resolve(modulePath));

describe(modulePath, function() {
  it('should add the goddamn `su` context to the goddamn koa context', function (done) {

    co(function * () {
      var ctx = {
        request: {
          body: {}
        },
        params: {
          string: 'string',
          number: 10
        },
        header: {'x-csrf-token': '1234'},
        su: {}
      };

      yield underTest.call(ctx, next);

      expect(ctx.su).to.deep.equal(Object.create(null));

    })(done);

  });

});
