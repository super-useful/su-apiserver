/*

  creates description of an api
  binds parameters to the request and controller generators
  pushes any other specified interceptors queries and pipelines
  onto the returned stack

  response format should be an array in the following format
  [
    name,
    url,
    request generator,
    path level interceptor generators...
    api level interceptor generators...
    controller generator
  ]

  where the controller generator is composed of the api query and stream pipeline

*/
'use strict';
var Stream = require('stream').Stream;

var bodyParser = require('koa-body-parser')();
var compose = require('koa-compose');

var enforce = require('super-is').enforce;
var forEach = require('super-iter').forEach;

var func = require('super-func');
var lateBind = func.lateBind;
var partial = func.partial;

var routers = require('../utils/routers');
var getRoutesMappedtoApi = require('../utils/getRoutesMappedtoApi');


var initialiseContext = require('../commands/initialiseContext');
var initialiseRequest = require('../commands/initialiseRequest');
var bindAPI = require('../commands/bindAPI');
var bindRoute = require('../commands/bindRoute');
var bindVersion = require('../commands/bindVersion');

var queryAndStreamResponse = require('../commands/queryAndStreamResponse');
var queryAndPipeResponse = require('../commands/queryAndPipeResponse');
var cachedOrQueryAndPipeResponse = require('../commands/cachedOrQueryAndPipeResponse');

var responsePipeline = require('../transformers/responsePipeline');
var responseStream = require('../transformers/responseStream');

var isGenerator = partial(enforce, 'generator');
var isFunction = partial(enforce, 'function');
var isStream = partial(enforce, Stream);
var useBodyParser = /POST|PUT/i;

module.exports = function createApiDefinition (name, path, api, apiApp) {

  var pathInterceptors = path.interceptors || [];
  var apiInterceptors = api.interceptors || [];

  enforce(Function, path.request);
  forEach(pathInterceptors, isGenerator);
  forEach(apiInterceptors, isGenerator);
  isGenerator(api.query);

  var apiName = name + '-' + path.id;
  var url = '/' + name + path.params;
  var args = [apiName, url];
  var queryAndRespond;


  if (useBodyParser.test(api.method)) {
    args.push(bodyParser);
  }

  //  add the api name to the apiApp - useful for extracting the api from the router at a later date
  apiApp.apiName = apiName;

  //  each pipeline requires binding the context, api, request, and version
  args.push(
    initialiseContext,
    lateBind(bindAPI, apiApp),
    lateBind(initialiseRequest, path.request),
    bindVersion
  );


  //  if the api has an associated route - bind the route to the pipeline
  var route = getRoutesMappedtoApi(apiApp, apiName);
  if (route) {
    var router = routers.get('__routes__');
    router.get(apiName, route.paths[0], function * () {});
    args.push(lateBind(bindRoute, router, apiName));
  }

  // again, lets shove the caching code in pipeline
  if (path.cache && typeof path.cache.get === 'function') {
    pathInterceptors.unshift(path.cache.get);
  }

  args = args.concat(pathInterceptors, apiInterceptors);

  if (Array.isArray(api.streams)) {

  	if (Array.isArray(api.pipeline)) {
  	  throw new Error('su-apiserver:'  + apiName + ' endpoint can have either a `pipeline` Array or an Array of `streams`, but not both, IDIOT!');
  	}

    delete api.pipeline;

    forEach(api.streams, function (streamMaker) {
      isStream(streamMaker());
    });

    args.push(lateBind(queryAndStreamResponse, name, api.type, api.query, api.streams.concat(responseStream)));
  }
  else if (Array.isArray(api.pipeline)) {

    delete api.streams;

    forEach(api.pipeline, isFunction);

    args.push(lateBind(path.cache && typeof path.cache.get === 'function' ? cachedOrQueryAndPipeResponse : queryAndPipeResponse, name, api.type, api.query), lateBind(responsePipeline, compose(api.pipeline)));

    if (path.cache && typeof path.cache.set === 'function') {
      args.push(path.cache.set);
    }
  }
  else {
  	throw new Error('su-apiserver:'  + apiName + ' endpoint can have either a `pipeline` Array or an Array of `streams`, IDIOT!');
  }

  return args;
};
