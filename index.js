'use strict';

var iter = require('super-iter');
var forEach = iter.forEach;

var CONF = require('config');

var koa = require('koa');
var mount = require('koa-mount');
var Router = require('koa-router');

var apiDescriptor = require('./lib/start/apiDescriptor');
var createApiVersion = require('./lib/start/createApiVersion');

var routers = require('./lib/utils/routers');

require('./lib/start/logger');

var app = koa();

app.use(Router());

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

    return app.listen(CONF.app.port);
  }
  catch (e) {
    process.emit('server:start:error', module, e);
  }
};
