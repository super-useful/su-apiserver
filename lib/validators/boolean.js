/*
  coerces a value into a boolean
*/
'use strict';

var value = require('useful-value');

module.exports = function boolean(val) {

  val = value.coerce(val);

  return !!val;
};
