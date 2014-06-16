/*
  validates a given value against a set of enum values
*/
'use strict';

var enforce = require('super-is').enforce;

module.exports = function enums (enums, value) {

  enforce('array', enums);

  if (enums.indexOf(value) === -1) {
    throw new RangeError('Invalid value (' + value + ') specified. Must be one of [' + enums.join(', ') + ']');
  }

  return value;
}