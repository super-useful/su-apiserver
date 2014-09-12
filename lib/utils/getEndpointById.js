var iter = require('super-iter');
var some = iter.some;

module.exports = function getEndpointById(router, id) {
  var endpoint = null;

  some(router.routes, function(route) {
    if (route.name === id) {
      endpoint = route;
    }

    return !!endpoint;
  });

  return endpoint;
};
