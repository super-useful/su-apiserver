var find = require('super-iter').find;

module.exports = function (apiApp, apiName) {

  return find(apiApp.routes || [], function (route) {
    return route.api_id === apiName;
  });
}
