
/**
 * Module dependencies
 */

var Collection = require('./collection');
var utils = require('../utils');

function NodeCollection (col) {
  this.collection = col;
}

/**
 * Expose
 */

module.exports = exports = NodeCollection;

/**
 * inherit from collection base class
 */

NodeCollection.prototype = utils.create(Collection.prototype);

/**
 * find
 */

NodeCollection.prototype.find = function (match, options, cb) {
  this.collection.find(match, options).toArray(cb);
}

/**
 * findOne
 */

NodeCollection.prototype.findOne = function (match, options, cb) {
  this.collection.findOne(match, options, cb);
}

/**
 * count
 */

NodeCollection.prototype.count = function (match, options, cb) {
  this.collection.count(match, options, cb);
}

/**
 * distinct
 */

NodeCollection.prototype.distinct  = function (prop, match, options, cb) {
  this.collection.distinct(prop, match, options, cb);
}

/**
 * update
 */

NodeCollection.prototype.update = function (match, update, options, cb) {
  this.collection.update(match, update, options, cb);
}

/**
 * remove
 */

NodeCollection.prototype.remove = function (match, options, cb) {
  this.collection.remove(match, options, cb);
}

/**
 * findAndModify
 */

NodeCollection.prototype.findAndModify = function (match, update, options, cb) {
  var sort = Array.isArray(options.sort) ? options.sort : [];
  this.collection.findAndModify(match, sort, update, options, cb);
}

