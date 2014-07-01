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
var chain = iter.chain;

function keyInParams (key, param) {
  return key === param.name;
}

module.exports = function getRequestDefinition (Request, params) {

  if (!Request.propertyDefinitions.hasOne) return {};

  return reduce(Request.propertyDefinitions.hasOne, function (acc, relation, name) {

    acc[name] = reduce(chain(relation.propertyDefinitions.properties), function (acc, descriptor, propertyName) {

      if(name === 'query' || some(params, partial(keyInParams, propertyName))) {

        acc[propertyName] = {};

        if (descriptor.format) {
          acc[propertyName].format = descriptor.format;
        }
        else if (descriptor.enums) {
          acc[propertyName].enums = descriptor.enums;
        }

        if (descriptor.type) {
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
