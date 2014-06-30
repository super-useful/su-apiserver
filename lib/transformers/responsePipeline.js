/*

  insert the data into a response

*/
module.exports = function * responsePipeline (next) {


  //  set the initial status
  this.status = 200;

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
    _version: this.v._version,
    version: this.v.version,
    params: this.r.params,
    query: this.r.query
  };

};
