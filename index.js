'use strict';

var path = require('path');
var iter = require('super-iter');
var forEach = iter.forEach;
var some = iter.some;

var CONF = require('config');
var koa = require('koa');
var mount = require('koa-mount');
var Router = require('koa-router');

var apiDescriptor = require('./lib/start/apiDescriptor');
var createApiDefinition = require('./lib/start/createApiDefinition');
var getRequestDefinition = require('./lib/start/getRequestDefinition');
var logger = require('./lib/start/logger');

var routers = require('./lib/utils/routers');

var app = koa();

app.use(Router());

//app.all( '/', function* () {
//  if ( some( CONF.apis, function( api_path, id ) {
//    return !!( this.url.indexOf( api_path ) > 0 );
//  }, this.req ) ) {
//    return;
//  }
//
//  console.log( 'NOT API: ', this.req.url );
//} );

module.exports = function(versions) {
	try {

	  //  load all the apis
//	  var versions = require('require-all')(path.join(process.cwd(), 'apis'));

	  //  apis are specced by version - process each one
	  forEach(versions, function (apis, version) {

		//  each version of the api get it's own router
		var router = new Router();

		//  and space to store it's descriptor
		apiDescriptor.initialiseVersion(version);

		//  each api has a definition folder
		forEach(apis.definitions, function (apiDefinition, name) {

		  //  where each file contains at least one definition of an api
		  forEach(apiDefinition, function (api) {

			var method = api.method.toLowerCase();

			//  each api can have more than one set of paths
			forEach(api.paths, function (path, pathName) {

			  //  create and load the api into the router
			  var apiArguments = createApiDefinition(name, pathName, path, api);
			  router[method].apply(router, apiArguments);

			  //  extract the params from the defined route
			  var apiName = apiArguments[0];
			  var apiUrl = apiArguments[1];
			  var params = router.route(apiName).params;

			  //  get the public facing request params and query
			  var requestDefinition = getRequestDefinition(path.request, params);

			  //  create the descriptor
			  apiDescriptor.create(apiName, api, apiUrl, version, requestDefinition);

			});
		  });

		});

		//  extract, mount, and register the router middleware
		var middleware = router.middleware();

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
		this.body = JSON.stringify(apiDescriptor.stable, null, 2);
	  });
	  app.use(mount(CONF.apis.health, healthRouter.middleware()));


	  //  listen on port
	  app.listen(CONF.app.port);

	}
	catch (e) {

	  process.emit('server:start:error', module, e);
	}

	return app;
};
