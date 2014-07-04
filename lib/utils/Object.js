"use strict";
var EventEmitter = require('events').EventEmitter;

var uuid = require('node-uuid');
var iter = require('super-iter');
var forEach = iter.forEach;
var map = iter.map;
var chain = iter.chain;

var func = require('super-func');
var partial = func.partial;
var lateBind = func.lateBind;
var identity = func.identity;

var is = require('super-is');
var enforce = is.enforce;
var typeOf = is.typeOf;



function updateDefaultValues (object, def) {

  forEach(def, function (descriptor, prop) {
    if (descriptor.hasOwnProperty('defaultValue')) {
      object[prop] = descriptor.defaultValue;
    }
  });
}

/**
  @description  loops over all the enumerable properties
                and updates their values from data
  @param        {Object} object
  @param        {Object} data
  @param        {Array} e
*/
function updateProperties (object, data, e) {

  object.id = data.id || uuid.v4();

  forEach(object, function (property, name) {

    if (data.hasOwnProperty(name)) {

      try {
        object[name] = data[name];
      }
      catch (err) {
        e.push(err);
      }
    }

  });

}


/**
  @description  create has one child entities
  @param        {Object} model
  @param        {Object} hasOne
*/
function updateHasOne (object, data, e) {

  if (object.hasOne) {

    forEach(object.hasOne, function(Relation, name) {

      if (data.hasOwnProperty(name)) {

        object[name] = new Relation(data[name], e);
      }

    });
  }
}


/**
  @description  generic setter - binds to internal __data__ structure
  @param        {String} prop
  @param        {Function} set
  @param        {string} type
  @param        {any} value
*/
function set (prop, set, type, value) {

  if (type) {
    enforce(type, value);
  }

  var data = set.call(this, value);
  this.__data__[prop] = data;

  this.emit(prop, {
    object: this,
    value: data
  });
}


/**
  @description  relation setter
  @param        {String} Relation
  @param        {object} value
*/
function setRelation (Relation, value) {

  return value instanceof Relation ? value : new Relation(value);

}



/**
  @description  generic getter - binds to internal __data__ structure
  @param        {String} prop
*/
function get (prop) {
  return this.__data__[prop];
}


/*
  recursively serialises all enumarable properties
  uses a custom serialise method
*/
function serialise (object, recurse) {

  var serialised = map(object, function(value, key) {

    if (typeof value !== 'undefined') {

      var propertyDescriptor = Object.getOwnPropertyDescriptor(object, key);
      value = propertyDescriptor.get.serialise(value);
    }

    return value;
  });

  if (recurse && object.hasOne) {

    forEach(object.hasOne, function (relation, name) {

      if (typeof object[name] !== 'undefined') {

        serialised[name] = serialise(object[name], recurse);
      }

    });
  }
  return serialised;

}


module.exports = function define (name, definition) {

  var def = Object.create(null);

  //  set up has one relationships
  if (definition.hasOne) {

    def.hasOne = {
      value: {}
    };

    forEach(definition.hasOne, function (Relation, prop) {

      def.hasOne.value[prop] = Relation;

      def[prop] = {
        set: lateBind(set, prop, partial(setRelation, Relation), null),
        get: lateBind(get, prop)
      }

    });
  }

  if (definition.properties) {

    //  late bind the generic getters and setters
    forEach(chain(definition.properties), function (descriptor, prop) {

      if (typeOf('undefined', descriptor.type) && !typeOf('function', descriptor.set)) {
        throw new TypeError('Object (' + name + ') property definition (' + prop + ') requires either a setter or type');
      }

      def[prop] = {
        enumerable: !! descriptor.enumerable,
        set: lateBind(set, prop, descriptor.set || identity, descriptor.type || null),
        get: lateBind(get, prop)
      };

      //  if the desriptor has a custom serialise method cache it on the getter
      def[prop].get.serialise = descriptor.serialise || identity;

      if (descriptor.hasOwnProperty('value')) {
        def[prop].defaultValue = descriptor.value;
      }

    });
  }

  var Constructor = function (data, e) {

    Object.defineProperties(this, {
      id: {
        value: undefined,
        writable: true,
        configurable: true
      },
      __data__: {
        value: Object.create(null)
      },
      _events: {
        value: Object.create(null)
      },
      _maxListeners: {
        value: Object.create(null)
      },
      domain: {
        value: null
      }
    });

    Object.defineProperties(this, def);

    updateDefaultValues(this, def);

    EventEmitter.call(this);

    var throwErrors = false;

    data = data || {};

    if (!e) {

      throwErrors = true;
      e = [];
    }

    updateProperties(this, data, e);
    updateHasOne(this, data, e);
    // updateHasMany(this, data, e);

    if (throwErrors && e.length > 0) {
      throw e;
    }

    Object.seal(this);

  }

  Constructor.prototype = Object.create(EventEmitter.prototype, {
    constructor: {
      value: Constructor
    },
    name: {
      value: name
    },
    serialise: {
      value: function (recurse) {
        return serialise(this, recurse);
      }
    }
  });

  Constructor.propertyDefinitions = definition;

  return Constructor;

}
