/*

  initialises a request object which validates incoming
  request params and query data

*/
var iter = require('super-iter');
var filter = iter.filter;
var qs = require('querystring');
var CONF = require('config');

var captureStackTrace = require('../errors/captureStackTrace');
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
      body: this.request.body,
      params: params,
      query: qs.parse(this.request.querystring),
      xcsrf: this.header['x-csrf-token']
    });

  }
  catch (e) {

    throw new RequestError(e);
  }

  yield next;
};
