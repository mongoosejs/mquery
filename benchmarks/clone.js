'use strict';

const clone = require('../lib/utils').clone;
const Bench = require('benchmark');
const mongo = new require('mongodb');

const doc = {
  first: { second: { third: [3, { name: 'aaron' }, 9] } },
  comments: [
    { name: 'one' },
    { name: 'two', _doc: { name: '2' } },
    {
      name: 'three',
      comments: [{}, { comments: [{ val: 'twoo' }] }],
      _doc: { name: '3', comments: [{}, { _doc: { comments: [{ val: 2 }] } }] }
    }
  ],
  null: null,
  date: new Date(),
  regexp: /objectId/g,
  name: 'jiro',
  array: [
    { o: { array: [{ x: { b: [4, 6, 8] } }, { y: 10 }] } },
    { o: { array: [{ x: { b: [1, 2, 3] } }, { x: { z: 10 } }, { x: { b: 'hi' } }] } },
    { o: { array: [{ x: { b: null } }, { x: { b: [null, 1] } }] } },
    { o: { array: [{ x: null }] } },
    { o: { array: [{ y: 3 }] } },
    { o: { array: [3, 0, null] } },
    { o: { name: 'ha' } }
  ],
  arr: [
    { arr: [{ a: { b: 47 } }, { a: { c: 48 } }, { d: 'yep' }] },
    { yep: true }
  ]
};

function ObjectID(id) {
  this.id = id;
  this.cloned = false;
}

ObjectID.prototype.clone = function() {
  const ret = new ObjectID(this.id);
  ret.cloned = true;
  return ret;
};

const simple = new Array(100).fill('a');
const big = new Array(100000).fill('a');
const complex = new Array(100).fill(doc);
const date = new Date();
const objId = new ObjectID('12341234123');
const buffer = Buffer.allocUnsafe(1024);
const binary = new mongo.Binary(buffer, 2);

new Bench.Suite()
  .add('clone Binary', function() {
    clone(binary);
  })
  .add('clone Buffer', function() {
    clone(buffer);
  })
  .add('clone Date', function() {
    clone(date);
  })
  .add('clone ObjectId', function() {
    clone(objId);
  })
  .add('clone document', function() {
    clone(doc);
  })
  .add('clone RegExp', function() {
    clone(/asdfasdf/gi);
  })
  .add('clone simple array', function() {
    clone(simple);
  })
  .add('clone big array', function() {
    clone(big);
  })
  .add('clone complex array', function() {
    clone(complex);
  })
  .on('cycle', function(e) {
    const s = String(e.target);
    console.log(s);
  })
  .run();

