/*

  ServiceUnavailableError error

*/
'use strict';

var HttpError = require('./HttpError');


function ServiceUnavailableError (e) {
  HttpError.call(this, 'CODE PUCE: Servive unavailable error', e);
}
ServiceUnavailableError.prototype = Object.create(HttpError.prototype, {

  constructor: {
    value: ServiceUnavailableError
  },
  name: {
    value: 'ServiceUnavailableError'
  },
  status: {
    value: 503
  }

});

module.exports = ServiceUnavailableError;