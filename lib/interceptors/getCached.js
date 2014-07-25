/*

  get the cached data for the request URL if available

*/
var session = require('../secure/session');

module.exports = function * getCached (next) {
  try {
    var data = yield session.getCached(this.r.xcsrf, this.request.method + ':' + this.request.url);

    if (data) {
      this.r.cached = data;
    }
  }
  catch (e) {
    process.emit('app:debug', module, JSON.stringify(e.stack));
  }

  yield next;
};
