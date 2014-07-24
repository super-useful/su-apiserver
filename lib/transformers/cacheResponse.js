/*

  cache the data into against the request URL

*/
var session = require('../secure/session');

module.exports = function * cacheResponse (next) {
  try {
    yield session.cache(this.r.xcsrf, this.request.method + ':' + this.request.url, this.data);
  }
  catch (e) {
    process.emit('app:debug', module, JSON.stringify(e.stack));
  }

  yield next;
};
