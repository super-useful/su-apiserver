"use strict";
/*

  test train api def

*/
module.exports = [
  {
    method: 'GET',
    type: 'json',
    paths: {
      default: {
        params: '/station/:station/platform/:platform',
        request: require('./Request'),
        interceptors: [
          require('./interceptors/stationClosed'),
          require('./interceptors/platformChange')
        ]
      }
    },
    query: require('./query'),
    pipeline: [
      require('./transformers/platformChange')
    ]
  }
];
