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
            type: 'number',
            set: stringToNumber
          }
        }
      ]
    }),
    query: define('Query', {
      properties: [
        {
          steam: {
            enumerable: true,
            type: 'string'
          }
        }
      ]
    })
  }
});
