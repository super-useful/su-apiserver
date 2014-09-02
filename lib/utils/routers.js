/*

*/
"use strict";

var Router = require('koa-router');

var routers = Object.create(null);

module.exports = {

  get: function (version) {

    if (!version) {
      return routers;
    }

    if (!(version in routers)) {
      routers[version] = new Router();
    }

    return routers[version];
  }

}
