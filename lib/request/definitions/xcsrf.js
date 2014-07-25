/*

  x-csrf token - requires unique

*/
'use strict';
var typeOf = require('super-is').typeOf;

module.exports = {
  xcsrf: {
    enumerable: true,
    set: function (value) {

      if (!typeOf('string', value)) {
        throw new TypeError('Invalid XCSRF Token');
      }
      return value;
    }
  }

};
