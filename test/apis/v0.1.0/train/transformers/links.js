
module.exports = function * links (next) {

  if (this.su.req.params.station === 'link') {

    this.links.next = this.su.api.resolveUrl({station: 'link', platform: 2});
  }

  yield next;

}
