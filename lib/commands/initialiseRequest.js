/*

  initialises a request object which validates incoming
  request params and query data

*/
var forEach = require('super-iter').forEach;
var qs = require('querystring');
var CONF = require('config');

var captureStackTrace = require('../errors/captureStackTrace');
var RequestError = require('../errors/RequestError');

module.exports = function * initialiseRequest (Request, next) {

  try {

    this.su.req = new Request({
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
};
