/*

  initialises a request object which validates incoming
  request params and query data

*/
var forEach = require('super-iter').forEach;
var qs = require('querystring');
var CONF = require('config');

var RequestError = require('../errors/RequestError');

module.exports = function * initialiseRequest (Request, next) {

  try {
    this.r = Request.init({
      body: this.request.body,
      params: this.params,
      query: qs.parse(this.request.querystring),
      xcsrf: this.header['x-csrf-token'] || CONF.data.xcsrf
    });

  }
  catch (e) {

    this.e = new RequestError(e);
  }

  yield next;
}
