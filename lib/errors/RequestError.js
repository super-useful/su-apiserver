/*

  Request error - container error that takes an array of errors on instantiaton

*/
'use strict';

var map = require('super-iter').map;

var HttpError = require('./HttpError');


function RequestError (e) {
  HttpError.call(this, 'CODE RED: Request error', e);
}
RequestError.prototype = Object.create(HttpError.prototype, {

  constructor: {
    value: RequestError
  },
  name: {
    value: 'RequestError'
  },
  status: {
    value: 400
  },
  toString: {
    value: function () {
      return this.logInternal();
    }
  },
});

module.exports = RequestError;