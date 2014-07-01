/*

  maps the parameters specified in the params string
  against all those from the specified Request object definition
  and filters out those that only appear in both

*/
'use strict';
var func = require('super-func');
var partial = func.partial;

var iter = require('super-iter');
var reduce = iter.reduce;
var some = iter.some;

function keyInParams (key, param) {
  return key === param.name;
}

module.exports = function getRequestDefinition (Request, params) {

  return reduce(Request.hasOne, function (acc, relation, name) {

    acc[name] = reduce(relation.properties, function (acc, descriptor, propertyName) {

      if ((name === 'query' && !/^id|edit|locked$/.test(propertyName)) || some(params, partial(keyInParams, propertyName))) {

        acc[propertyName] = {};

        if (descriptor.format) {
          acc[propertyName].format = descriptor.format;
        }
        else if (descriptor.enums) {
          acc[propertyName].enums = descriptor.enums;
        }
        else {
          acc[propertyName].type = descriptor.type;
        }

        if (descriptor.defaultValue) {
          acc[propertyName].defaultsTo = descriptor.defaultValue;
        }

      }

      return acc;

    }, {});

    return acc;

  }, {});

}
