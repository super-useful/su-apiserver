
module.exports = function * platformChange () {

  if (this.data.platform === 3) {

    this.data.message = 'platformChange';
  }
}