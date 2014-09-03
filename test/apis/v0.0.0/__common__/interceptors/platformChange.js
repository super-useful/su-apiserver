module.exports = function * platformChange (next) {

  if (this.r.params.platform === 10) {
    this.r.params.platform = 3;
  }

  yield next;
}
