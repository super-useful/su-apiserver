/*
  validates a given date string
  returns the date string
*/
'use strict';

var value = require('useful-value');

module.exports = function boolean(val) {
  val = value.coerce(val);

  return !!val;
};
