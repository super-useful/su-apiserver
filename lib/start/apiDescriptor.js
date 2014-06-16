/*

  generates an API descriptor for a given version of an API

*/
'use strict';

var forEach = require('super-iter').forEach;

var CONF = require('config');

module.exports = {

  versions: Object.create(null),

  initialiseVersion: function initialiseVersion (version) {

    if (version in this.versions) {
      throw new RangeError('Specified api version (' + version + ') has already been used');
    }

    this.versions[version] = [];
  },

  create: function create (apiName, api, apiUrl, version, requestDefinition) {

    if (!(version in this.versions)) {
      throw new RangeError('Specified api version (' + version + ') does not exist');
    }

    this.versions[version].push({
      id: apiName,
      method: api.method,
      type: api.type,
      url: CONF.apis.base + '/' + version + apiUrl,
      params: requestDefinition.params || {},
      query: requestDefinition.query  || {}
    });

  },

  createReleaseVersion: function createReleaseVersion (version, releaseName) {

    if (releaseName in this.versions) {
      throw new RangeError('Specified api release name (' + releaseName + ') has already been used');
    }

    this.versions[releaseName] = JSON.parse(JSON.stringify(this.versions[version]));

    forEach(this.versions[releaseName], function (descriptor) {
      descriptor.url = descriptor.url.replace('/apis/' + version, '/apis/' + releaseName);
    });

  }
};