
var assert = require('assert')
var slice = require('sliced')
var mongo = require('mongodb')
var utils = require('../../').utils;

var uri = process.env.MQUERY_URI || 'mongodb://localhost/mquery';
var db;

exports.getCollection = function (cb) {
  mongo.Db.connect(uri, function (err, db_) {
    assert.ifError(err);
    db = db_;
    var collection = db.collection('stuff');

    // normalize the driver find api
    var find = collection.find;
    collection.find = function () {
      // sidestep need to call toArray
      var args = slice(arguments);
      if ('function' == typeof args[args.length-1]) {
        var cb = args.pop();
        return find.apply(collection, args).toArray(utils.tick(cb));
      } else {
        return find.apply(collection, args);
      }
    }

    // normalize the driver findAndModify api
    var findAndModify = collection.findAndModify;
    collection.findAndModify = function (conds, doc, opts, cb) {
      // node-mongodb-native requires a sort arg
      var sort = opts.sort || [];
      return findAndModify.call(collection, conds, sort, doc, opts, cb);
    }

    collection.opts.safe = true;

    // clean test db before starting
    db.dropDatabase(function () {
      cb(null, collection);
    });
  })
}

exports.dropCollection = function (cb) {
  db.dropDatabase(function () {
    db.close(cb);
  })
}
