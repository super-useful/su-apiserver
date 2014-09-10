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

  //  filter optional params that have not been set in the request
  //  this.params seems to be an associative array - WTF!!!
  var koaParams = this.params;
  var params = {};

  Object.keys(this.params).forEach(function (key) {
    if (typeof koaParams[key] !== 'undefined') {
      params[key] = koaParams[key];
    }
  });

  try {

    this.r = new Request({
      body: this.request.body,
      params: this.params,
      query: qs.parse(this.request.querystring),
      xcsrf: this.header['x-csrf-token']
    });

  }
  catch (e) {

    throw new RequestError(e);
  }

  yield next;
}
