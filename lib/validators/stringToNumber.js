/*
  validates a given value against a set of enum values
*/
'use strict';

module.exports = function stringToNumber (numberString) {

  var n = parseInt(numberString, 10);

  if (isNaN(n)) {
    throw new TypeError('Invalid number(' + numberString + ') specified');
  }

  return n;
}
