/*

  insert the data into a response

*/
module.exports = function responsePipeline (next) {

  var response = {
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

  return response;
};
