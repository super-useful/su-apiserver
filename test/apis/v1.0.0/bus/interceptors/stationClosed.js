var InternalServerError = require('../../../../../lib/errors/InternalServerError');

module.exports = function * stationClosed (next) {

  if (this.su.req.params.station === 'bus_v100') {
    throw new InternalServerError(new Error());
  }

  yield next;
}
