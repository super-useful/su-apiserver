/*

  attaches helper methods and application functionality specific to the current endpoint's API version

*/
'use strict';

var func = require('super-func');
var copy = require('useful-copy');
var value = require('useful-value');

var callEndpoint = require('../utils/callEndpoint');
var getEndpointById = require('../utils/getEndpointById');
var resolveEndpointUrl = require('../utils/resolveEndpointUrl');
var routers = require('../utils/routers');

var CONF = require('config');
var RELEASES = value( CONF, 'apis.releases' ) || {};

var partial = func.partial;

module.exports = function* bindAPI(apiApp, next) {

  var mountPath = this.mountPath;
  var release = mountPath.split('/').pop();
  var version = release in RELEASES ? RELEASES[release] : release;
  var router = routers.get(version);
  var endpoint = getEndpointById(router, apiApp.apiName);

  this.su.api = copy({
    currentEndpoint: endpoint,
    getEndPointById: partial(getEndpointById, router),
    router: router,
    callEndpoint: partial(callEndpoint, router),
    resolveUrl: partial(resolveEndpointUrl, mountPath, endpoint)
  }, apiApp);

  yield next;
};
