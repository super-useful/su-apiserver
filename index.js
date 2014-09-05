"use strict";

require('su-logger');

var iter = require('super-iter');
var forEach = iter.forEach;
var reduce = iter.reduce;

var CONF = require('config');

var koa = require('koa');
var mount = require('koa-mount');
var Router = require('koa-router');

var apiDescriptor = require('./lib/start/apiDescriptor');
var createApiDefinition = require('./lib/start/createApiDefinition');
var getRequestDefinition = require('./lib/start/getRequestDefinition');

var routers = require('./lib/utils/routers');

var releases = CONF.apis.releases;

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


module.exports = function * (apis) {

  try {

    var koaModules = Array.prototype.slice.call(arguments, 1);

    forEach(koaModules, function(mod) {
      app.use(mod);
    });

    //  start processing each version of the api
    forEach(apis, function (api, version) {

      //  init the container for the descriptors
      apiDescriptor.initialiseVersion(version);

      //  get the release routers bound to this version
      var releaseRouters = reduce(releases, function (acc, v, release) {

        if (v === version) {
          apiDescriptor.initialiseVersion(release);
          acc[release] = routers.get(release);
        }
        return acc;

      }, Object.create(null));

      //  get the router we need to mount for this version
      var versionRouter = routers.get(version);

      // if there is application functionality specific to this API version, then smoke it up...
      var apiApp = (function * () {
        return typeof apiDef.app === 'function' ? yield apiDef.app() : {};
      })();


      //  include all endpoints that exist for the api
      forEach(api, function (apiDef, endpointName) {

        if (typeof apiDef.index === 'undefined') return;

        //  grab the file where the endpoints are configured and create them
        forEach(apiDef.index, function (endpoint) {

          var endpointMethod = endpoint.method.toLowerCase();

          var uniquePath;

          //  an endpoint can have more than one path
          forEach(endpoint.paths, function (endpointPath) {

            //  ensure the api path id exists and is unique to this api
            if (typeof endpointPath.id === 'undefined' || endpointPath.id === uniquePath) {
              throw new ReferenceError('Path id must exist and be unique to the API it\'s defined in');
            }
            uniquePath = endpointPath.id;

            //  build the pipeline and register it with the routers
            var endpointPipeline = createApiDefinition(endpointName, endpointPath, endpoint, apiApp);

            versionRouter[endpointMethod].apply(versionRouter, endpointPipeline);

            forEach(releaseRouters, function (router, release) {
              router[endpointMethod].apply(router, endpointPipeline);
            });

            //  extract the params from the defined route
            var apiName = endpointPipeline[0];
            var apiUrl = endpointPipeline[1];
            var params = versionRouter.route(apiName).params;

            //  get the public facing request params and query
            var requestDefinition = getRequestDefinition(endpointPath.request, params);

            //  create the descriptors
            apiDescriptor.create(apiName, endpoint, apiUrl, version, version,requestDefinition);

            forEach(releaseRouters, function (router, release) {
              apiDescriptor.create(apiName, endpoint, apiUrl, version, release, requestDefinition);
            });

          });

        });

      });

    });


    //  mount the apis by version
    forEach(routers.get(), function (router, version) {

      app.use(mount(CONF.apis.base + '/' + version, router.middleware()));

    });

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
    console.log(e)
    process.emit('server:start:error', module, e);
  }
};
