
// base collection class
//   node
//   shell
//   browser

/**
 * methods a collection must implement
 */

var methods = [
    'find', 'findOne', 'update', 'remove', 'count', 'distict', 'findAndModify'
];

/**
 * creates a function which throws an implementation error
 */

function notImplemented (method) {
  return function () {
    throw new Error('collection.' + method + ' not implemented!');
  }
}


/**
 * Collection base class implementations inherit from
 */

function Collection () {
  // base class
}

for (var i = 0, len = methods.length; i < len; ++i) {
  var method = methods[i];
  Collection.prototype[method] = notImplemented(method);
}

module.exports = exports = Collection;

/**
 * query()
 *   collection
 *     env implementation
 * cloneObject
 *   objectid
 *     env implementation
 */
