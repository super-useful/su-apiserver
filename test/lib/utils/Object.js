'use strict';
var path = require('path');
var EventEmitter = require('events').EventEmitter;

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");

var rewire = require('rewire');

var expect = chai.expect;
var fakes;
var underTest;
var modulePath = 'lib/utils/Object';
var Model;
var Relation;
var Parent;
var model;

chai.use(sinonChai);

describe(modulePath, function() {

  beforeEach(function() {

    underTest = rewire(path.resolve(modulePath));
    fakes = sinon.sandbox.create();

    Relation = underTest('Relation', {
      properties: [{
        childName: {
          enumerable: true,
          set: function (v) {
            if (v === 'fail') throw new TypeError();
            return v;
          }
        },
        typeTest: {
          enumerable: true,
          type: 'string'
        }

      }]
    });

    Model = underTest('Model', {

      hasOne: {
        onInit: Relation,
        afterInit: Relation
      },
      properties: [
        {
          theProperty: {
            enumerable: true,
            set: function (v) {
              if (v === 'fail') throw new TypeError();
              return v;
            }
          },
          anotherProperty: {
            enumerable: true,
            set: function (v) {
              if (v === 'fail') throw new TypeError();
              return v + v;
            }
          }
        },
        {
          setTest: {
            enumerable: true,
            set: function (v) {
              if (v === 'fail') throw new TypeError();
              return v * 100;
            }
          }
        }
      ]
    });

    model = new Model({
      id: 'id',
      setTest: 1,
      theProperty: 'simon',
      anotherProperty: 'sarah',
      onInit: {childName: 'Matilda'}
    });

  });

  afterEach(function() {

    fakes.restore();
    underTest = null;
    Model = null;
    Parent = null;
    Relation = null;
    model = null;

  });


  describe('definition', function () {

    it('should throw an error if the property descriptors have no set method', function () {

      expect(function () {
        underTest('Relation', {
          properties: [{
            childName: {
              enumerable: true
            }
          }]
        });
      }).to.throw(TypeError);

    });

  });

  describe('Constructor', function () {

    it("should create a new object which is an instanceof EventEmitter", function() {

      expect(model).to.be.an.instanceof(EventEmitter);

    });


    it("should create a new object which is an instanceof Model", function() {

      expect(model).to.be.an.instanceof(Model);

    });

    it("should set the id", function() {

      expect(model.id).to.be.equal('id');

    });

    it("should set the properties", function() {

      expect(model.theProperty).to.be.equal('simon');

    });

    it("should create a related object which is an instanceof Relation", function() {

      expect(model.onInit).to.be.an.instanceof(Relation);

    });

    it("should set the properties on the related object", function() {

      expect(model.onInit.childName).to.be.equal('Matilda');

    });

    it("should catch all property errors thrown during initialisation and then throw them all as an array of errors", function() {

      expect(function() {

        model = new Model({
          theProperty: 'fail',
          anotherProperty: 'fail'
        }).to.throw(Array);

      });

      var err = [];
      try {
        model = new Model({
          theProperty: 'fail',
          anotherProperty: 'fail'
        });
      }
      catch (e) {
        err = e;
      }
      expect(err.length).to.be.equal(2);
      expect(err[0]).to.be.instanceof(TypeError);
      expect(err[1]).to.be.instanceof(TypeError);

    });

    it("should catch all property errors of related objects thrown during initialisation and then throw them all as array of errors", function() {

      expect(function() {

        model = new Model({
          onInit: {childName: 'fail'}
        });

      }).to.throw(Array);

      var err = [];
      try {
        model = new Model({
          onInit: {childName: 'fail'}
        });
      }
      catch (e) {
        err = e;
      }
      expect(err.length).to.be.equal(1);
      expect(err[0]).to.be.instanceof(TypeError);

    });

  });

});
