'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var Base = require('super-base');

var fakes;
var getRequestDefinition;
var Request;
var params;

chai.use(sinonChai);

describe('lib/start/getRequestDefinition', function() {

  beforeEach(function() {

    getRequestDefinition = rewire(process.cwd() + '/lib/start/getRequestDefinition');
    fakes = sinon.sandbox.create();

    params = [
      {name: 'from'},
      {name: 'to'}
    ]

    Request = {
      hasOne: {
        params: {
          properties: {
            from: {
              format: 'format'
            },
            to: {
              enums: 'enums'
            },
            hidden: {}
          }
        },
        query: {
          properties: {
            q1: {
              type: 'string'
            }
          }
        }
      }
    };


  });

  afterEach(function() {

    fakes.restore();

  });

  it('should return an object defining the parameters', function() {

    var definition = getRequestDefinition(Request, params);

    expect(definition.params.from.format).to.be.equal(Request.hasOne.params.properties.from.format);
    expect(definition.params.to.enums).to.be.equal(Request.hasOne.params.properties.to.enums);
    expect(definition.params.hidden).to.be.equal(undefined);
    expect(definition.query.q1.type).to.be.equal(Request.hasOne.query.properties.q1.type);

  });

});
