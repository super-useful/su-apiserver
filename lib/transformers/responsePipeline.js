/*

  insert the data into a response

*/

module.exports = function responsePipeline (ctx) {
  var response = ctx.body;

  if ( !response ) {
    response = {
      status: {
        httpStatus: 500,
        success: false
      }
    };
  }

  response.links = {};
  response.version = ctx.v.version;
  response.params = ctx.r.params.serialise();
  response.query = ctx.r.query.serialise();

  return response;
};
