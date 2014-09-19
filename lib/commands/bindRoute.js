/*

  attaches helper methods and application functionality specific to the current endpoint's API route map
  if it has one

*/
'use strict';
var func = require('super-func');
var copy = require('useful-copy');
var value = require('useful-value');

var getEndpointById = require('../utils/getEndpointById');
var resolveEndpointUrl = require('../utils/resolveEndpointUrl');

var CONF = require('config');
var RELEASES = value( CONF, 'apis.releases' ) || {};

var partial = func.partial;

module.exports = function * bindRoute(router, routeName, next) {

  var mountPath = '';
  var endpoint = getEndpointById(router, routeName);

  this.su.route = {
    resolveUrl: partial(resolveEndpointUrl, mountPath, endpoint)
  };

  yield next;
};
