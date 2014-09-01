"use strict";

require('su-logger');

var iter = require('super-iter');
var forEach = iter.forEach;

var CONF = require('config');

var koa = require('koa');
var mount = require('koa-mount');
var Router = require('koa-router');

var apiDescriptor = require('./lib/start/apiDescriptor');
var createApiVersion = require('./lib/start/createApiVersion');
var createApiDefinition = require('./lib/start/createApiDefinition');
var getRequestDefinition = require('./lib/start/getRequestDefinition');

var routers = require('./lib/utils/routers');

var app = koa();

app.use(Router());

//  to overwrite default koa error response style
//  we bind error handler to the app
app.on('error', function (e, ctx) {

  process.emit('request:error', ctx.request.originalUrl, e);

  var status = e.status || '500';
  var res = {
      status: {
        httpStatus: status,
        success: false
      },
      data: e.toString()
    };

  res = JSON.stringify(res);

  ctx.type = 'json';
  ctx.status = status;
  ctx.length = Buffer.byteLength(res);
  ctx.res.end(res);

});


module.exports = function * (apis) {

  var koaModules = Array.prototype.slice.call(arguments, 1);

  forEach(koaModules, function(mod) {
    app.use(mod);
  });

  var versionApi, versionNumber;

  //  apis are specced by version - process each one
  // for (versionNumber in versions) {
  //   if (Object.prototype.hasOwnProperty.call(versions, versionNumber)) {

  //     versionApi = versions[versionNumber];
  //     console.log(versionApi)
  //     yield createApiVersion(app, routers, versionApi, versionNumber);
  //   }
  // }

  //  start processing each api
  forEach(apis, function (api, endpointName) {

    //  include all version definitions that exist for the api
    forEach(api, function (apiDef, version) {

      //  get the router we need to mount for this version
      var router = routers.getActive(version);
      router = new Router();
      // if there is application functionality specific to this API version, then smoke it up...
      var apiApp = (function * () {
        return typeof apiDef.app === 'function' ? yield apiDef.app() : {};
      }());

      //  grab the file where the endpoints are configured and create them
      forEach(apiDef.index, function (endpoint) {

        var endpointMethod = endpoint.method.toLowerCase();

        //  an endpoint can have more than one path
        forEach(endpoint.paths, function (endpointPath, endpointPathName) {

          //  build the pipeline and register it with the router
          var endpointPipeline = createApiDefinition(endpointName, endpointPathName, endpointPath, endpoint, apiApp);
          router[endpointMethod].apply(router, endpointPipeline);

          //  extract the params from the defined route
          var apiName = endpointPipeline[0];
          var apiUrl = endpointPipeline[1];
          var params = router.route(apiName).params;

          //  get the public facing request params and query
          var requestDefinition = getRequestDefinition(endpointPath.request, params);

          //  create the descriptor
          apiDescriptor.create(apiName, endpoint, apiUrl, version, requestDefinition);

          console.log(apiName, version, requestDefinition);
        });

        // var apiDefinition = yield createApiVersion();

      });


    });

  });

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
