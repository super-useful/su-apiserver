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

var initialiseRequest = require('../commands/initialiseRequest');
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

module.exports = function createApiDefinition (name, pathName, path, api, apiApp) {

  var pathInterceptors = path.interceptors || [];
  var apiInterceptors = api.interceptors || [];

  enforce(Function, path.request);
  forEach(pathInterceptors, isGenerator);
  forEach(apiInterceptors, isGenerator);
  isGenerator(api.query);

  var apiName = name + '-' + pathName;
  var url = '/' + name + path.params;
  var args = [apiName, url];
  var queryAndRespond;

  if (useBodyParser.test(api.method)) {
    args.push(bodyParser);
  }

  args.push(lateBind(initialiseRequest, path.request), lateBind(bindVersion, apiApp));

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

    forEach(api.pipeline, function (fn) {
      isFunction(fn);
    });

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
