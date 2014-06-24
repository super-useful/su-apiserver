/*

  insert the data into a response

*/
module.exports = function * responsePipeline (next) {

  var response = {
    data: this.data,
    status: {
      httpStatus: 200,
      success: true
    }
  };

  yield next;

  response.data = this.data;
  response.links = {};
  response.version = this.v.version;
  response.params = this.r.params;
  response.query = this.r.query;

  response.status.httpStatus = this.response.status;

  if (/(?:4|5)[0-9]{2}/.test(this.response.status)) {
    response.status.success = false;
  }

  return response;
};
