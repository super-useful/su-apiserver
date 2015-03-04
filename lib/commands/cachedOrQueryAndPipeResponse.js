/*

  returns the cached data if it exists else fowards to the query and pipe response function


*/

var queryAndPipeResponse = require('./queryAndPipeResponse');

module.exports = function * cachedOrQueryAndPipeResponse (name, type, query, next) {
  var cached = this.su.req.cached;

  if (!cached) {
    yield queryAndPipeResponse.apply(this, arguments);
  }
  else {
    if ('data' in cached && 'links' in cached){
      this.data = cached.data;
      this.links = cached.links;
      this.messages = cached.messages;
    }
    else {
      this.data = cached;
    }

    yield next;
  }

};
