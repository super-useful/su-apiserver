/*

  calls the specified query and starts the stream response

*/

var queryAndPipeResponse = require('./queryAndPipeResponse');
//var responsePipeline = require('../transformers/responsePipeline');

module.exports = function * cachedOrQueryAndPipeResponse (name, type, query, next) {
  if (this.r.cached) {
    this.data = this.r.cached;
//    this.body = yield responsePipeline.call(this);

    yield next;
  }
  else {
    yield queryAndPipeResponse.apply(this, arguments);
  }
};
