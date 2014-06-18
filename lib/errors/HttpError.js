/*

  base http error - do not call directly

*/
'use strict';

var map = require('super-iter').map;
var typeOf = require('super-is').typeOf;

function HttpError (message, errors) {
  this.init(message, errors);
}
HttpError.prototype = Object.create(Error.prototype, {

  constructor: {
    value: HttpError
  },
  name: {
    value: 'HttpError'
  },
  status: {
    value: undefined
  },
  init: {
    value: function (message, e) {

      this.message = message;
      this.errors = typeOf('array', e) ? e : [e];

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor); // Creates the this.stack getter
        this.stacks = map(this.errors, function(e) {
          Error.captureStackStrace(e, this.constructor);

          return e.stack;
        }, this);
      }
    }
  },
  logInternal: {
    value: function () {
      return map(this.errors, function (e) {
        return e.toString();
      });
    }
  },
  stackTraces: {
    value: function () {
      return this.stacks;
    }
  },
  toString: {
    value: function () {
      return this.name + ': ' + this.message;
    }
  },
  errors: {
    writable: true
  }
});

module.exports = HttpError;


