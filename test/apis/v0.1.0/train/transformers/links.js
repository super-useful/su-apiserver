
module.exports = function * links (next) {

  if (this.r.params.station === 'link') {

    this.links.next = this.v.url({station: 'link', platform: 2});
  }

  yield next;

}
