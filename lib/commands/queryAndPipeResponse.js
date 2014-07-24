/*

  calls the specified query and starts the stream response

*/
var compose = require('koa-compose');
var func = require('super-func');
var partial = func.partial;

var InternalServerError = require('../errors/InternalServerError');

function logError (uri, api, e) {
  process.emit('request:error', uri, 'api:'  + api, e);
}

function logSuccess (uri, api) {
  process.emit('request:success', uri, 'api:'  + api, 200);
}

module.exports = function * queryAndPipeResponse (name, type, query, next) {

  var logE = partial(logError, this.request.originalUrl, name);
  var logS = partial(logSuccess, this.request.originalUrl, name);

  this.type = type;

  if (this.e instanceof Error) {

    this.response.status = this.e.status || '500';

    this.body = {
      status: {
        httpStatus: this.response.status,
        success: false
      },
      data: this.e.toString()
    };

    logE(this.e);

  }
  else {

    try {

      if (this.r.cached) {
        this.data = this.r.cached;
      }
      else {
        this.data = yield query.call(this);
        this.body = yield next;
      }


      logS();
    }
    catch (e) {

      e = new InternalServerError(e);

      this.response.status = 500;
      this.body = {
        status: {
          httpStatus: 500,
          success: false
        },
        data: e.toString()
      };

      logE(e);
    }
  }

};
