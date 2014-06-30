'use strict';

var iter = require('super-iter');
var forEach = iter.forEach;

var CONF = require('config');

var mount = require('koa-mount');
var Router = require('koa-router');

var apiDescriptor = require('../start/apiDescriptor');
var createApiDefinition = require('../start/createApiDefinition');
var getRequestDefinition = require('../start/getRequestDefinition');

module.exports = function* createApiVersion(app, routers, apis, version) {
  var apiApp, apiName, apiUrl, definitionName, definitionEndpoints,
      endpoint, endpointMethod, endpointPath, endpointPathName, endpointPipeline,
      i, l, middleware, params, requestDefinition, router;

	try {
    //  each version of the api get it's own router
    router = new Router();

    // if there is application functionality specific to this API version, then smoke it up...
    apiApp = typeof apis.app === 'function'
           ? yield apis.app()
           : {};

    //  and space to store it's descriptor
    apiDescriptor.initialiseVersion(version);

    for (definitionName in apis.definitions) {
      if (Object.prototype.hasOwnProperty.call(apis.definitions, definitionName)) {
        definitionEndpoints = apis.definitions[definitionName];

        if (Array.isArray(definitionEndpoints)) {
          i = -1;
          l = definitionEndpoints.length;

          while (++i < l) {
            endpoint = definitionEndpoints[i];
            endpointMethod = endpoint.method.toLowerCase();

            for (endpointPathName in endpoint.paths) {
              if (Object.prototype.hasOwnProperty.call(endpoint.paths, endpointPathName)) {
                endpointPath = endpoint.paths[endpointPathName];

                endpointPipeline = createApiDefinition(definitionName, endpointPathName, endpointPath, endpoint, apiApp);
                router[endpointMethod].apply(router, endpointPipeline);

                //  extract the params from the defined route
                apiName = endpointPipeline[0];
                apiUrl = endpointPipeline[1];
                params = router.route(apiName).params;

                //  get the public facing request params and query
                requestDefinition = getRequestDefinition(endpointPath.request, params);

                //  create the descriptor
                apiDescriptor.create(apiName, endpoint, apiUrl, version, requestDefinition);
              }
            }
          }
        }
      }
    }

		//  extract, mount, and register the router middleware
		middleware = router.middleware();

		app.use(mount(CONF.apis.base + '/' + version, middleware));

		routers.register(version, router);

		//  does the current version match a release candidate
		forEach(CONF.apis.releases, function (releaseVersion, releaseName) {
		  if (version === releaseVersion) {
        //  create the release version of the descriptor
        apiDescriptor.createReleaseVersion(version, releaseName);

        //  mount and register the release version of the api
        app.use(mount(CONF.apis.base + '/' + releaseName, middleware));

        routers.register(releaseName, router);
		  }
		});
  }
  catch (e) {
    process.emit('server:start:error', module, e);
  }
};
