module.exports = function * platformChange (next) {

  if (this.su.req.params.platform === 10) {
    this.su.req.params.platform = 3;
  }

  yield next;
}
