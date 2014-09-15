var url = require('url');

module.exports = function resolveEndpointUrl(mountPath, endpoint, params, query) {

  var uri = url.format({
    pathname: mountPath + endpoint.url(params),
    query: query
  });

  //  koa router adds the ? from /:param?/ bit to the end of interpolated
  //  urls...
  //  added this in here now until I add a bug fix to koa
  return uri.replace(/%3F/g, '');
};
