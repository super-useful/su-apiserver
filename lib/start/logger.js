
//  server start
process.on('server:start:error', function (module, e) {
  console.error.apply(console, ['ERROR: ', 'server:start', module.id]);
  console.error(e.stack);
});


//  requests
process.on('request:error', function (module, api, e) {

  // console.error(JSON.stringify({
  //   error: e.status,
  //   api: api,
  //   module: module.id,
  //   internal: e.logInternal(),
  //   stack: e.stack
  // }));

  console.error.apply(console, ['ERROR: ', e.status, api, module.id]);
  console.error(e.logInternal());
  console.error(e.stack);
});


process.on('request:success', function (module, api, status) {
  console.log.apply(console, ['SUCCESS: ', status, api, module.id]);
});
