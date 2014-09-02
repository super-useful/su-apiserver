var define = require('su-define-object');
var stringToNumber = require('../../../../lib/validators/stringToNumber');

module.exports = define('Request', {
  hasOne: {
    params: define('Params', {
      properties: [
        {
          station: {
            enumerable: true,
            type: 'string'
          },
          platform: {
            enumerable: true,
            set: stringToNumber
          }
        }
      ]
    })
  }
});
