/*

  generates an API descriptor for a given version of an API

*/
'use strict';

var forEach = require('super-iter').forEach;

var CONF = require('config');

module.exports = {

  versions: Object.create(null),

  initialiseVersion: function initialiseVersion (version) {

    if (!(version in this.versions)) {
      this.versions[version] = [];
    }

  },

  create: function create (apiName, api, apiUrl, version, release, requestDefinition) {

    if (!(release in this.versions)) {
      throw new RangeError('Specified api version (' + release + ') does not exist');
    }

    this.versions[release].push({
      id: apiName,
      method: api.method,
      type: api.type,
      url: CONF.apis.base + '/' + release + apiUrl,
      params: requestDefinition.params || {},
      query: requestDefinition.query  || {},
      version: version,
      release: release
    });

  }
};
