/*

  returns the cached data if it exists else fowards to the query and pipe response function


*/

var queryAndPipeResponse = require('./queryAndPipeResponse');

module.exports = function * cachedOrQueryAndPipeResponse (name, type, query, next) {

  if (!this.su.req.cached) {

    yield queryAndPipeResponse.apply(this, arguments);
  }
  else {

    this.data = this.su.req.cached;

    yield next;
  }

};
