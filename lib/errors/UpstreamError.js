/*

  UpstreamError error

*/
'use strict';

var HttpError = require('./HttpError');


function UpstreamError (e) {
  HttpError.call(this, 'CODE PUCE: Upstream connection error', e);
}
UpstreamError.prototype = Object.create(HttpError.prototype, {

  constructor: {
    value: UpstreamError
  },
  name: {
    value: 'UpstreamError'
  },
  status: {
    value: 502
  }

});

module.exports = UpstreamError;