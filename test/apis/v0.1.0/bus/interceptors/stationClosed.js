var InternalServerError = require('../../../../../lib/errors/InternalServerError');

module.exports = function * stationClosed (next) {

  if (this.su.req.params.station === 'closed') {
    throw new InternalServerError(new Error());
  }

  yield next;
}
