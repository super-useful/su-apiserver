/*

  insert the stream into a response

*/
var through = require('through');

var InternalServerError = require('../errors/InternalServerError');

module.exports = function responseStream (ctx) {

  var started = false;
  var _data;

  var links = {};

  var params = ctx.r.params.serialise();
  var query = ctx.r.query.serialise();

  var status = {
    httpStatus: 200,
    success: true
  };

  function write (data) {

    if (!started) {

      this.emit('data', '{"data": [');
      started = true;
      _data = data;
    }
    else {

      this.emit('data', JSON.stringify(_data, null, 2) + ',\n');
      _data = data;
    }
  }

  function end () {

    this.emit('data', JSON.stringify(_data, null, 2));
    this.emit('data', '],\n"version": ' + JSON.stringify(ctx.v.version) + ',\n"_version": ' + JSON.stringify(ctx.v._version) + ',\n"links": {},\n"params": ' + JSON.stringify(params, null, 2) + ',\n"query": ' + JSON.stringify(query, null, 2) + ',\n"status": ' + JSON.stringify(status, null, 2) + '}');
    this.emit('end');
  }

  var stream = through(write, end);

  stream.on('error', function (e){

    var data = '{}]';

    if (!started) {
      data = '{"data": [' + data;
    }

    var status = {
      httpStatus: 500,
      success: false
    };

    stream.emit('data', data + ',\n"status": ' + JSON.stringify(status, null, 2) + '}');

  });

  return stream;
}
