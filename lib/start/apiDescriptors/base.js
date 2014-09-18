var CONF = require('config');

module.exports = function (apiName, api, apiUrl, version, release, requestDefinition) {

  return {
    id: apiName,
    method: api.method,
    type: api.type,
    url: CONF.apis.base + '/' + release + apiUrl,
    params: requestDefinition.params || {},
    query: requestDefinition.query  || {},
    version: version,
    release: release
  };

}

