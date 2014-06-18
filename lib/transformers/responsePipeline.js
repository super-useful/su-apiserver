/*

  insert the data into a response

*/

module.exports = function responsePipeline (ctx) {
  var response = ctx.body;

  if ( !response ) {
    response = ctx.body = {
      status: {
        httpStatus: 500,
        success: false
      }
    };
  }

  response.links = {};
  response.version = ctx.v.version;
  response.params = ctx.r.params;
  response.query = ctx.r.query;

  return response;
};
