var sleep = require('co-sleep');

module.exports = function * query (next) {

  yield sleep(100);

  return {
    onTime: true,
    platform: this.su.req.params.platform,
    station: this.su.req.params.station
  };

}
