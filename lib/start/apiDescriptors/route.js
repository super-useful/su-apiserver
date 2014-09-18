var reduce = require('super-iter').reduce;
var pathToRegexp = require('path-to-regexp');

var CONF = require('config');
var baseApi = require('./base');

module.exports = function (apiName, api, apiUrl, version, release, requestDefinition, route) {

  var baseDescriptor = baseApi(apiName, api, apiUrl, version, release, requestDefinition);

  baseDescriptor.routes = reduce(route.paths, function (acc, path) {

    var regexp = pathToRegexp(path);

    acc.push({
      api: id,
      path: path,
      regexp: regexp.source,
      keys: regexp.keys
    });

  }, []);

  return baseDescriptor;
}

