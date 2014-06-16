/*
  validates a given date string
  returns the date string
*/
'use strict';

var moment = require('moment');

module.exports = function date (regExp, format, dateString) {

  if (regExp.test(dateString)) {

    var date = moment(dateString);

    if (!date.isValid()) {

      throw new RangeError('Invalid date (' + dateString + ') specified. Date must be a valid date');
    }

  }
  else {

    throw new TypeError('Invalid date (' + dateString + ') specified. Date must be of format: ' + format);
  }

  return dateString;
}