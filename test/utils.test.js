
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

    it('clones constructors named ObjectID', function(done) {
      function ObjectID (id) {
        this.id = id;
      }

      var o1 = new ObjectID('1234');
      var o2 = utils.clone(o1);

      assert.ok(o2 instanceof ObjectID);
      done();
    });

    it('optionally clones ObjectId constructors using its clone method', function(done) {
      function ObjectID (id) {
        this.id = id;
        this.cloned = false;
      }

      ObjectID.prototype.clone = function () {
        var ret = new ObjectID(this.id);
        ret.cloned = true;
        return ret;
      }

      var id = 1234;
      var o1 = new ObjectID(id);
      assert.equal(id, o1.id);
      assert.equal(false, o1.cloned);

      var o2 = utils.clone(o1);
      assert.ok(o2 instanceof ObjectID);
      assert.equal(id, o2.id);
      assert.ok(o2.cloned);
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
