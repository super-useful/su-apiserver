/*

  initialises the context for su-apiserver on top of the koa context

*/

module.exports = function* initialiseContext(next) {
  this.su = Object.create(null);

  yield next;
};
