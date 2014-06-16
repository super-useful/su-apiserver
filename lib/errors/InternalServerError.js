/*

  InternalServerError error

*/
'use strict';

var HttpError = require('./HttpError');


function InternalServerError (e) {
  HttpError.call(this, 'CODE PUCE: Internal Server Error', e);
}
InternalServerError.prototype = Object.create(HttpError.prototype, {

  constructor: {
    value: InternalServerError
  },
  name: {
    value: 'InternalServerError'
  },
  status: {
    value: 500
  }

});

module.exports = InternalServerError;