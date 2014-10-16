/*

  x-csrf token - requires unique

*/
'use strict';
var typeOf = require('super-is').typeOf;

var e = require('../../errors');

module.exports = {
  xcsrf: {
    enumerable: true,
    set: function (value) {

      if (!typeOf('string', value) || !value.trim().length) {
        throw new e.UnauthorizedError();
      }

      return value;
    }
  }

};
