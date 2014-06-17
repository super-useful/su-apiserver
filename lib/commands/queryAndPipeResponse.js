/*

  calls the specified query and starts the stream response

*/
var func = require('super-func');
var partial = func.partial;

var InternalServerError = require('../errors/InternalServerError');

function logError (module, api, e) {
  process.emit('request:error', module, 'api:'  + api, e);
}

function logSuccess (module, api) {
  process.emit('request:success', module, 'api:'  + api, 200);
}

module.exports = function * queryAndPipeResponse (name, type, query, pipeline) {

  var logE = partial(logError, module, name);
  var logS = partial(logSuccess, module, name);

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
      var data = yield query.call(this);

      this.body = {
        status: {
          httpStatus: 200,
          success: true
        },
        data: data
      };
    }
    catch (e) {
      this.body = {
        status: {
          httpStatus: 500,
          success: false
        },
        data: e
      };

      logE(new InternalServerError(e));
    }

  }

};
