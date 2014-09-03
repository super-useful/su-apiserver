'use strict';

require('su-logger');

var iter = require('super-iter');
var forEach = iter.forEach;

var CONF = require('config');

var koa = require('koa');
var mount = require('koa-mount');
var Router = require('koa-router');

var apiDescriptor = require('./lib/start/apiDescriptor');
var createApiVersion = require('./lib/start/createApiVersion');

var routers = require('./lib/utils/routers');

var app = koa();

app.use(Router());

//  to overwrite default koa error repsonse style
//  we bind error handler to the app
app.on('error', function (e, ctx) {

  process.emit('request:error', ctx.request.originalUrl, e);

  var status = e.status || '500';
  var res = {
      status: {
        httpStatus: status,
        success: false
      },
      data: {
        message : e.toString()
      }
    };

  if (CONF.debug === true) {
    res.data.stack = e.stack.split('\n')
  }

  res = JSON.stringify(res);

  ctx.type = 'json';
  ctx.status = status >>> 0;
  ctx.length = Buffer.byteLength(res);
  ctx.res.end(res);

});


module.exports = function* (versions) {
  var koa_modules = Array.prototype.slice.call(arguments, 1);

  forEach(koa_modules, function(mod) {
    app.use(mod);
  });

  var versionApi, versionNumber;

  //  apis are specced by version - process each one
  for (versionNumber in versions) {
    if (Object.prototype.hasOwnProperty.call(versions, versionNumber)) {
      versionApi = versions[versionNumber];

      yield createApiVersion(app, routers, versionApi, versionNumber);
    }
  }

  try {
    //  create a new router for the api descriptor and mount it
    var versionRouter = new Router();

    versionRouter.get('/:version', function * () {
      this.body = JSON.stringify(apiDescriptor.versions[this.params.version], null, 2);
    });
    app.use(mount(CONF.apis.base, versionRouter.middleware()));

    //  add the health check
    var healthRouter = new Router();

    healthRouter.get('/', function * () {
      this.body = JSON.stringify(apiDescriptor.versions.stable, null, 2);
    });

    app.use(mount(CONF.apis.health, healthRouter.middleware()));

    //  listen on port
    return app.listen(CONF.app.port);
  }
  catch (e) {

    process.emit('server:start:error', module, e);
  }
};
