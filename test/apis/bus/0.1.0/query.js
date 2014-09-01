var sleep = require('co-sleep');

module.exports = function * query (next) {

  yield sleep(100);

  return {
    onTime: true,
    platform: this.r.params.platform,
    station: this.r.params.station
  };

}
