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
  messages: {
    /**
     * @param {Boolean} [include_this] Default: true. Whether or not to include this error's message or just the previous errors' messages
     */
    value: function(include_this) {
      if (typeof include_this !== "boolean") {
        include_this = true;
      }
      var msgs = map(this.errors, function(e) {
        return (e.messages ? e.messages() : { message: e.toString()});
      });

      if (include_this === false) {
        return msgs;
      }
      else {
        return {
          message: this.toString(),
          messages: msgs
        };
      }
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
