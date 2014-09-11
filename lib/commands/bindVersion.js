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

function * bindVersion (next) {

  try {

    var mountPath = this.mountPath;
    var release = mountPath.split('/').pop();
    var version = release in RELEASES ? RELEASES[release] : release;
    var router = routers.get(version);

    this.su.version = {
      release: release,
      version: version,
      router: router
    };
  }
  catch (e) {

    throw new InternalServerError(captureStackTrace(e, bindVersion));
  }

  yield next;
};

module.exports = bindVersion;
