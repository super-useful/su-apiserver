/*

  insert the data into a response

*/
module.exports = function * responsePipeline (pipeline, next) {
  var req = this.su.req;

  //  set the initial status
  this.status = 200;

  if (!this.links || typeof this.links !== 'object') {
    this.links = {};
  }

  if (!req.cached) {
    yield pipeline.call(this);
  }

//  create the response
  this.body = {
    data: this.data,
    status: {
      httpStatus: this.status,
      success: !/(?:4|5)[0-9]{2}/.test(this.status)
    },
    links: this.links,
    release: this.su.version.release,
    version: this.su.version.version,
    params: req.params ? req.params.serialise() : {},
    query: req.query ? req.query.serialise() : {}
  };

  //  yield to the middleware that transforms the data for the response
  yield next;
};
