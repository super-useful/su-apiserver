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

    var release = this.mountPath.split('/').pop();
    var version = release in RELEASES ? RELEASES[release] : release;

    this.v = copy({
      release: release,
      version: version,
      router: routers.get(version)
    }, apiApp || {}, true);
  }
  catch (e) {

    throw new InternalServerError(captureStackTrace(e, bindVersion));
  }

  yield next;
};

module.exports = bindVersion;
