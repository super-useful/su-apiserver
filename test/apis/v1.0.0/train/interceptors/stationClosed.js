var InternalServerError = require('../../../../../lib/errors/InternalServerError');

module.exports = function * stationClosed (next) {

  if (this.r.params.station === 'train_v100') {
    throw new InternalServerError(new Error('Station is closed'));
  }

  yield next;
}
