'use strict';

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;

var define = require('../../../lib/request/Object');

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

    Request = define('Request', {
      hasOne: {
        params: define('Params', {
          properties: [{
            from: {
              type: 'string',
              format: 'format'
            },
            to: {
              type: 'string',
              enums: 'enums'
            },
            hidden: {
              type: 'string',
            }
          }]
        }),
        query: define('Query', {
          properties: [{
            q1: {
              type: 'string'
            }
          }]
        })
      }
    });


  });

  afterEach(function() {

    fakes.restore();

  });

  it('should return an object defining the parameters', function() {

    var definition = getRequestDefinition(Request, params);

    expect(definition.params.from.format).to.be.equal(Request.propertyDefinitions.hasOne.params.propertyDefinitions.properties[0].from.format);
    expect(definition.params.to.enums).to.be.equal(Request.propertyDefinitions.hasOne.params.propertyDefinitions.properties[0].to.enums);
    expect(definition.params.hidden).to.be.equal(undefined);
    expect(definition.query.q1.type).to.be.equal(Request.propertyDefinitions.hasOne.query.propertyDefinitions.properties[0].q1.type);

  });

});
