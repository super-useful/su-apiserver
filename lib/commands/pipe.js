/*

  pipe data down a set of streams
  each function that creates the stream is passed the context
  it runs in - in KOA land the 'this' the request is bound to

*/
var iter = require('super-iter');
var reduce = iter.reduce;

module.exports = function pipe (ctx, streams) {

  function err (e) {
    var args = [].slice.call(arguments);
    args.unshift('error');
    stream.emit.apply(stream, args);
  }

  var stream = reduce(streams, function (acc, stream) {
    acc = (typeof acc === "function") ? acc(ctx) : acc;
    return acc.on('error', err).pipe(stream(ctx));
  }, streams.shift());

  return stream;
}