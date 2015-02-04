/*

  initialises a request object which validates incoming
  request params and query data

*/
var copy = require('useful-copy');
var iter = require('super-iter');
var filter = iter.filter;
var qs = require('querystring');
var CONF = require('config');

var captureStackTrace = require('../errors/captureStackTrace');
var HttpError = require('../errors/HttpError');
var RequestError = require('../errors/RequestError');

module.exports = function * initialiseRequest (Request, next) {

  //  filter optional params (:p?) that have not been set in the request
  //  this.params seems to be an associative array - WTF!!!
  var params = {};
  for (var key in this.params) {
   if (typeof this.params[key] !== 'undefined') {
     params[key] = this.params[key];
   }
  };

  try {

    this.su.req = new Request({
      body: this.request.body ? copy(copy({}, this.request.body.fields), this.request.body.files) : null,
      params: params,
      query: qs.parse(this.request.querystring),
      xcsrf: this.header['x-csrf-token']
    });

  }
  catch (e) {
// please do not delete this as we need to throw the correct HttpError for invalid sessions
// if you do delete this, you better be sending the correct http status code back!!!
    throw Array.isArray(e) && e[0] instanceof HttpError ? e[0] : new RequestError(e);
  }

  yield next;
};
