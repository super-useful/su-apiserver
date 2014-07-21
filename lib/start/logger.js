var Module = require('module');

var func = require('super-func');
var iter = require('super-iter');

var partial = func.partial;
var forEach = iter.forEach;

function logConsole(method, module) {
  var args = [(new Date()).toJSON(), method];
  var index = 1;

  if (module instanceof Module) {
    args.push(module.id);
    index = 2;
  }

  args.concat(Array.prototype.slice.call(arguments, index));

  console.log.apply(console, args);
}

//  server start
process.on('server:start:error', function (module, e) {
  console.error.apply(console, [(new Date()).toJSON(), 'ERROR: ', 'server:start', module.id]);
  console.error(e.stack);
});


//  requests
process.on('request:error', function (uri, api, e) {

  // console.error(JSON.stringify({
  //   error: e.status,
  //   api: api,
  //   module: module.id,
  //   internal: e.logInternal(),
  //   stack: e.stack
  // }));

  console.error.apply(console, [(new Date()).toJSON(), 'ERROR: ', e.status, api, uri]);
  console.error(e.logInternal());
  console.error(e.stack);
  console.error(e.stackTraces());
});


process.on('request:success', function (uri, api, status) {
  console.log.apply(console, [(new Date()).toJSON(), 'SUCCESS: ', status, api, uri]);
});

forEach(['debug', 'error', 'info', 'log', 'warn'], function(consoleMethod) {
  process.on('app:' + consoleMethod, partial(logConsole, consoleMethod.toUpperCase()));
});
