/*

  calls the specified query and starts the stream response

*/

var queryAndPipeResponse = require('./queryAndPipeResponse');

module.exports = function * cachedOrQueryAndPipeResponse (name, type, query, next) {
  if (this.r.cached) {
    this.data = this.r.cached;

    yield next;
  }
  else {
    yield queryAndPipeResponse.apply(this, arguments);
  }
};
