'use strict';
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require("sinon-chai");
var es = require('event-stream');

var rewire = require('rewire');

var expect = chai.expect;

var fakes;
var pipe;
var streams;
var stream;
var ctx;

chai.use(sinonChai);

function writeMaker (done) {

  return es.writeArray(function (err, array) {
    expect(array).to.deep.equal([4, 8, 12]);
    done();
  });
}

function readMaker () {

  return es.readArray([1, 2, 3]);
}


function transformMaker (force) {

  function write (data) {
    if (force === 'error') {

      this.emit('error', new Error('stream error'));
    }
    else {

      this.emit('data', data + data);
    }
  }

  function end () {
    this.emit('end');
  }

  return es.through(write, end);
}

describe('lib/commands/pipe', function() {

  beforeEach(function() {

    fakes = sinon.sandbox.create();
    pipe = rewire(process.cwd() + '/lib/commands/pipe');

    streams = [
      fakes.spy(readMaker),
      fakes.spy(transformMaker),
      fakes.spy(transformMaker)
    ];

    ctx = {
      id: 'ctx'
    }

  });

  afterEach(function() {

    fakes.restore();
    stream = null;

  });

  it('should take a context and an array of functions that return streams and pipe them together', function(done) {

    stream = pipe(ctx, streams);
    stream.pipe(writeMaker(done));

  });

  it('should pass the ctx object to each stream making function', function(done) {

    stream = pipe(ctx, streams);
    streams.forEach(function (streamMaker) {
      expect(streamMaker).to.have.been.calledWith(ctx);
    });
    stream.pipe(writeMaker(done));

  });


  it('should wire up error handlers on each stream that delegate to the stream the pipe returns', function(done) {

    streams[1] = transformMaker.bind(null, 'error');

    stream = pipe(ctx, streams);
    stream.on('error', function (e) {
      expect(e.message).to.be.equal('stream error');
      done();
    })
    stream.on('end', function () {
      expect(true).to.be.equal(false);
      done();
    })

  });


  it('should should still work if the first parameter is a stream as opposed function that returns a stream', function(done) {

    streams[0] = readMaker();

    stream = pipe(ctx, streams);
    stream.pipe(writeMaker(done));

  });

});
