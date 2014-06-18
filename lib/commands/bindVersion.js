/*

  grab the incoming request version and bind it to the request
  also attaches this versions router for later use

*/
'use strict';

var captureStackTrace = require('../errors/captureStackTrace');
var InternalServerError = require('../errors/InternalServerError');
var routers = require('../utils/routers');

function * bindVersion (next) {

  try {

    var version = this.mountPath.split('/').pop();

    this.v = {
      version: version,
      router: routers.getActive(version)
    }
  }
  catch (e) {

    this.e = new InternalServerError(captureStackTrace(e, bindVersion));
  }

  yield next;
};
module.exports = bindVersion;
