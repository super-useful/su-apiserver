/*

*/

'use strict';

var routers = Object.create(null);

module.exports = {

  getActive: function (version) {

    return routers[version];
  },

  register: function (version, router) {

    routers[version] = router;
  }

}