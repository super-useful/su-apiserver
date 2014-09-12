var iter = require('super-iter');
var find = iter.find;

module.exports = function getEndpointById(router, id) {

  return find(router.routes, function (route) {
    return route.name === id;
  });

};
