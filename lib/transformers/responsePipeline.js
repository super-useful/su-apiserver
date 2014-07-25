/*

  insert the data into a response

*/
module.exports = function * responsePipeline (pipeline, next) {

  //  set the initial status
  this.status = 200;

  if (!this.r.cached) {
    yield pipeline.call(this);
  }

  //  yield to the middleware that transforms the data for the response
  yield next;

  //  create the response
  return {
    data: this.data,
    status: {
      httpStatus: this.status,
      success: !/(?:4|5)[0-9]{2}/.test(this.status)
    },
    links: {},
    release: this.v.release,
    version: this.v.version,
    params: this.r.params ? this.r.params.serialise() : {},
    query: this.r.query ? this.r.query.serialise() : {}
  };

};
