/*

  grab the incoming request version and bind it to the request
  also attaches this versions router for later use

*/
'use strict';

var copy = require('useful-copy');
var value = require('useful-value');

var captureStackTrace = require('../errors/captureStackTrace');
var InternalServerError = require('../errors/InternalServerError');
var routers = require('../utils/routers');

var CONF = require('config');
var RELEASES = value( CONF, 'apis.releases' ) || {};

function * bindVersion (apiApp, next) {

  try {

    var version = this.mountPath.split('/').pop();
    var _version = version in RELEASES ? RELEASES[version] : version;

    this.v = copy({
      _version: _version,
      version: version,
      router: routers.getActive(version)
    }, apiApp || {}, true);
  }
  catch (e) {

    this.e = new InternalServerError(captureStackTrace(e, bindVersion));
  }

  yield next;
};
module.exports = bindVersion;
