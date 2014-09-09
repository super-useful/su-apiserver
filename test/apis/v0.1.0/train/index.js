"use strict";
/*

  test train api def

*/
module.exports = [
  {
    method: 'GET',
    type: 'json',
    paths: [
      {
        id: "get",
        params: '/station/:station/platform/:platform',
        request: require('./Request'),
        interceptors: [
          require('./interceptors/stationClosed'),
          require('../__common__/interceptors/platformChange')
        ]
      },
      {
        id: "delay",
        params: '',
        request: require('./Request'),
        interceptors: [
          require('./interceptors/stationClosed'),
          require('../__common__/interceptors/platformChange')
        ]
      }
    ],
    query: require('./query'),
    pipeline: [
      require('./transformers/platformChange'),
      require('./transformers/links')
    ]
  }
];
