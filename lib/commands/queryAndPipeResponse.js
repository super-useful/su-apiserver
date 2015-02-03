/*

  calls the specified query and starts the stream response

*/
var compose = require('koa-compose');
var func = require('super-func');
var partial = func.partial;

var HttpError = require('../errors/HttpError');
var InternalServerError = require('../errors/InternalServerError');


module.exports = function * queryAndPipeResponse (name, type, query, next) {

  this.type = type;

  try {
    this.data = yield query.call(this);

    yield next;

    process.emit('request:success', 200, this.request.method, this.request.originalUrl);
  }
  catch (e) {

    if (e instanceof HttpError) {
      throw e;
    }

    throw new InternalServerError(e);
  }

};
