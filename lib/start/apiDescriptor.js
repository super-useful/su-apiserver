/*

  generates an API descriptor for a given version of an API

*/
'use strict';

var CONF = require('config');

var getRoutesMappedtoApi = require('../utils/getRoutesMappedtoApi');
var baseApi = require('./apiDescriptors/base');
var routeApi = require('./apiDescriptors/route');

module.exports = {

  versions: Object.create(null),

  initialiseVersion: function initialiseVersion (version) {

    if (!(version in this.versions)) {
      this.versions[version] = [];
    }

  },

  create: function create (apiName, api, apiUrl, version, release, requestDefinition, apiApp) {

    if (!(release in this.versions)) {
      throw new RangeError('Specified api version (' + release + ') does not exist');
    }

    var route = getRoutesMappedtoApi(apiApp, apiName);

    if (route) {
      var descriptor = routeApi(apiName, api, apiUrl, version, release, requestDefinition, route);
    }
    else {
      var descriptor = baseApi(apiName, api, apiUrl, version, release, requestDefinition);
    }

    this.versions[release].push(descriptor);

  }
};
