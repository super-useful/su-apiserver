
var context = require('koa/lib/context');
var copy = require('useful-copy');

var getEndpointById = require('./getEndpointById');

function* identity() {}

module.exports = function* callEndpoint(router, endpointId, currentContext, options) {
  var endpoint = getEndpointById(router, endpointId);

  var ctx = Object.create(context);

  copy.update(ctx, currentContext.toJSON(), true);

  ctx.req = currentContext.req;
  ctx.socket = currentContext.socket;
  ctx.mountPath = currentContext.mountPath;

  copy.merge(ctx, options || {});

  return yield endpoint.middleware.call(ctx, identity);
};
