/*

  base http error - do not call directly

*/
'use strict';

var map = require('super-iter').map;
var typeOf = require('super-is').typeOf;
var reRemoveBasePath = new RegExp( '' + process.cwd(), 'gim' );

function HttpError (message, errors) {
  Error.call(this, message);

  this.message = message;
  this.errors = typeOf('array', errors) ? errors : [errors];

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor); // Creates the this.stack getter
  }
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
  logInternal: {
    value: function () {
      return map(this.errors, function (e) {
        return e.toString();
      });
    }
  },
  safeStack: {
    value: function () {
      return this.stack.replace(reRemoveBasePath, '').split('\n');
    }
  },
  stackTraces: {
    value: function () {
      return map(this.errors, function (e) {
        return e.stack.split('\n');
      });
    }
  },
  toString: {
    value: function () {
      return this.name + ': ' + this.message;
    }
  },
  errors: {
    writable: true
  },
  valueOf: {
    value: function () {
      return "[object HttpError]";
    }
  }
});

module.exports = HttpError;
