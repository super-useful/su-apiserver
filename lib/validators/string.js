/*
  coerces a value into a string
*/
'use strict';

module.exports = function string(val) {
  var t = typeof val, v;

  if (t === 'object' || t === 'function') {
    try {
      v = JSON.stringify(val);

      if (typeof v !== 'string') {
        throw new Error;
      }

      return v;
    } catch(e) {
      throw new TypeError('Cannot coerce type (' + Object.prototype.toString.call(val) + ') into a String.');
    }
  }

  return String(val);
};
