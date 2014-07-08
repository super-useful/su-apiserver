/*

  calls the specified query and starts the stream response

*/
var func = require('super-func');
var partial = func.partial;

var pipe = require('./pipe');

var captureStackTrace = require('../errors/captureStackTrace');
var InternalServerError = require('../errors/InternalServerError');

function logError (uri, api, e) {
  process.emit('request:error', uri, 'api:'  + api, e);
}

function logSuccess (uri, api) {
  process.emit('request:success', uri, 'api:'  + api, 200);
}

function * queryAndStreamResponse (name, type, query, pipeline) {

  var logE = partial(logError, this.request.originalUrl, name);
  var logS = partial(logSuccess, this.request.originalUrl, name);

  this.type = type;

  if (this.e instanceof Error) {

    this.response.status = this.e.status || '500';

    this.body = JSON.stringify({
      status: {
        httpStatus: this.response.status,
        success: false
      },
      data: this.e.toString()
    }, null, 2);

    logE(this.e);

  }
  else {

    try {

      var cursor = yield query.call(this);

      var body = this.body = pipe(this, [cursor].concat(pipeline));

      this.body.on('error', function (e) {

        body.removeListener('end', logS);
        body.emit('end');
        logE(new InternalServerError(captureStackTrace(e, queryAndStreamResponse)));

      });

      this.body.on('end', logS);
    }
    catch (e) {

      logE(new InternalServerError(e));
    }

  }

};
module.exports = queryAndStreamResponse;
