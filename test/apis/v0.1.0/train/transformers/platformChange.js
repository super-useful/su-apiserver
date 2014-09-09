
module.exports = function * platformChange (next) {

  if (this.data.platform === 3) {

    this.data.message = 'platformChange';
  }

  yield next;
}
