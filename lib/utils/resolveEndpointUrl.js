var url = require('url');

module.exports = function resolveEndpointUrl(mountPath, endpoint, params, query) {
  return url.format({
    pathname: mountPath + endpoint.url(params),
    query: query
  });
};
