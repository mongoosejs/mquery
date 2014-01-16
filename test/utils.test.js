
var utils = require('../lib/utils');
var assert = require('assert');

describe('lib/utils', function() {
  describe('clone', function() {
    it('clones constructors named ObjectId', function(done) {
      function ObjectId (id) {
        this.id = id;
      }

      var o1 = new ObjectId('1234');
      var o2 = utils.clone(o1);
      assert.ok(o2 instanceof ObjectId);

      done();
    });

    it('handles objects with no constructor', function(done) {
      var name ='335';

      var o = Object.create(null);
      o.name = name;

      var clone;
      assert.doesNotThrow(function() {
        clone = utils.clone(o);
      });

      assert.equal(name, clone.name);
      assert.ok(o != clone);
      done();
    });
  });
});
