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
var enforce = require('super-is').enforce;
var forEach = require('super-iter').forEach;

var Base = require('super-base');
var func = require('super-func');
var lateBind = func.lateBind;
var partial = func.partial;

var queryAndStreamResponse = require('../commands/queryAndStreamResponse');
var initialiseRequest = require('../commands/initialiseRequest');
var bindVersion = require('../commands/bindVersion');

var response = require('../transformers/response');

var isGenerator = partial(enforce, 'generator');
var isFunction = partial(enforce, 'function');
var isStream = partial(enforce, Stream);

module.exports = function createApiDefinition (name, pathName, path, api) {

  var pathInterceptors = path.interceptors || [];
  var apiInterceptors = api.interceptors || [];

  enforce(Base, path.request);
  forEach(pathInterceptors, isGenerator);
  forEach(apiInterceptors, isGenerator);
  isGenerator(api.query);
  forEach(api.pipeline, function (streamMaker) {
    isStream(streamMaker());
  });

  var apiName = name + '-' + pathName;
  var url = '/' + name + path.params;
  var args = [apiName, url, lateBind(initialiseRequest, path.request), bindVersion];
  args = args.concat(pathInterceptors, apiInterceptors);

  var pipeline = api.pipeline.concat([response]);

  args.push(lateBind(queryAndStreamResponse, name, api.type, api.query, pipeline));

  return args;
}