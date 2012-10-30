
/*!
 * Module dependencies.
 */

var mongodb = require('mongodb')
  , ReadPref = mongodb.ReadPreference
  , ObjectId = mongodb.ObjectID

/**
 * Object clone with Mongoose natives support.
 *
 * Creates a minimal data Object.
 * It does not clone empty Arrays, empty Objects, and undefined values.
 * This makes the data payload sent to MongoDB as minimal as possible.
 *
 * @param {Object} obj the object to clone
 * @param {Object} options
 * @return {Object} the cloned object
 * @api private
 */

exports.clone = function clone (obj, options) {
  if (obj === undefined || obj === null)
    return obj;

  if (Array.isArray(obj))
    return exports.cloneArray(obj, options);

  if ('Object' === obj.constructor.name)
    return exports.cloneObject(obj, options);

  if ('Date' === obj.constructor.name || 'Function' === obj.constructor.name)
    return new obj.constructor(+obj);

  if ('RegExp' === obj.constructor.name)
    return new RegExp(obj.source);

  if (obj instanceof ObjectId)
    return new ObjectId(obj.id);

  if (obj.valueOf)
    return obj.valueOf();
};
var clone = exports.clone;

/*!
 * ignore
 */

var cloneObject = exports.cloneObject = function cloneObject (obj, options) {
  var retainKeyOrder = options && options.retainKeyOrder
    , minimize = options && options.minimize
    , ret = {}
    , hasKeys
    , keys
    , val
    , k
    , i

  if (retainKeyOrder) {
    for (k in obj) {
      val = clone(obj[k], options);

      if (!minimize || ('undefined' !== typeof val)) {
        hasKeys || (hasKeys = true);
        ret[k] = val;
      }
    }
  } else {
    // faster

    keys = Object.keys(obj);
    i = keys.length;

    while (i--) {
      k = keys[i];
      val = clone(obj[k], options);

      if (!minimize || ('undefined' !== typeof val)) {
        if (!hasKeys) hasKeys = true;
        ret[k] = val;
      }
    }
  }

  return minimize
    ? hasKeys && ret
    : ret;
};

var cloneArray = exports.cloneArray = function cloneArray (arr, options) {
  var ret = [];
  for (var i = 0, l = arr.length; i < l; i++)
    ret.push(clone(arr[i], options));
  return ret;
};

/**
 * process.nextTick helper.
 *
 * Wraps the given `callback` in a try/catch. If an error is
 * caught it will be thrown on nextTick.
 *
 * node-mongodb-native had a habit of state corruption when
 * an error was immediately thrown from within a collection
 * method (find, update, etc) callback.
 *
 * @param {Function} [callback]
 * @api private
 */

var tick = exports.tick = function tick (callback) {
  if ('function' !== typeof callback) return;
  return function () {
    try {
      callback.apply(this, arguments);
    } catch (err) {
      // only nextTick on err to get out of
      // the event loop and avoid state corruption.
      process.nextTick(function () {
        throw err;
      });
    }
  }
}

/**
 * Merges `from` into `to` without overwriting existing properties.
 *
 * @param {Object} to
 * @param {Object} from
 * @api private
 */

var merge = exports.merge = function merge (to, from) {
  var keys = Object.keys(from)
    , i = keys.length
    , key

  while (i--) {
    key = keys[i];
    if ('undefined' === typeof to[key]) {
      to[key] = from[key];
    } else {
      if (exports.isObject(from[key])) {
        merge(to[key], from[key]);
      } else {
        to[key] = from[key];
      }
    }
  }
}

/**
 * Read pref helper (mongo 2.2 drivers support this)
 *
 * Allows using aliases instead of full preference names:
 *
 *     p   primary
 *     pp  primaryPreferred
 *     s   secondary
 *     sp  secondaryPreferred
 *     n   nearest
 *
 * @param {String|Array} pref
 * @param {Array} [tags]
 */

exports.readPref = function readPref (pref, tags) {
  if (Array.isArray(pref)) {
    tags = pref[1];
    pref = pref[0];
  }

  switch (pref) {
    case 'p':
      pref = 'primary';
      break;
    case 'pp':
      pref = 'primaryPrefered';
      break;
    case 's':
      pref = 'secondary';
      break;
    case 'sp':
      pref = 'secondaryPrefered';
      break;
    case 'n':
      pref = 'nearest';
      break;
  }

  return new ReadPref(pref, tags);
}

/**
 * Object.prototype.toString.call helper
 */

var toString = Object.prototype.toString;
exports.toString = function (arg) {
  return toString.call(arg);
}

/**
 * Determines if `arg` is an object.
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @return {Boolean}
 */

exports.isObject = function (arg) {
  return '[object Object]' == exports.toString(arg);
}

/**
 * Determines if `arg` is an array.
 *
 * @param {Object}
 * @return {Boolean}
 * @see nodejs utils
 */

exports.isArray = function (arg) {
  return Array.isArray(arg) ||
    'object' == typeof arg && '[object Array]' == exports.toString(arg);
}

/**
 * Object.keys helper
 */

exports.keys = Object.keys || function (obj) {
  var keys = [];
  for (var k in obj) if (obj.hasOwnProperty(k)) {
    keys.push(k);
  }
  return keys;
}

////////////

/**
 * Copies and merges options with defaults.
 *
 * @param {Object} defaults
 * @param {Object} options
 * @return {Object} the merged object
 * @api private
 */

exports.options = function (defaults, options) {
  var keys = Object.keys(defaults)
    , i = keys.length
    , k ;

  options = options || {};

  while (i--) {
    k = keys[i];
    if (!(k in options)) {
      options[k] = defaults[k];
    }
  }

  return options;
};

/**
 * Generates a random string
 *
 * @api private
 */

exports.random = function () {
  return Math.random().toString().substr(3);
};



/**
 * TODO - remove
 * Determines if `a` and `b` are deep equal.
 *
 * Modified from node/lib/assert.js
 *
 * @param {any} a a value to compare to `b`
 * @param {any} b a value to compare to `a`
 * @return {Boolean}
 * @api private
 */

exports.deepEqual = function deepEqual (a, b) {
  if (a === b) return true;

  if (a instanceof Date && b instanceof Date)
    return a.getTime() === b.getTime();

  if (a instanceof ObjectId && b instanceof ObjectId) {
    return a.toString() === b.toString();
  }

  if (typeof a !== 'object' && typeof b !== 'object')
    return a == b;

  if (a === null || b === null || a === undefined || b === undefined)
    return false

  if (a.prototype !== b.prototype) return false;

  // Handle MongooseNumbers
  if (a instanceof Number && b instanceof Number) {
    return a.valueOf() === b.valueOf();
  }

  if (Buffer.isBuffer(a)) {
    if (!Buffer.isBuffer(b)) return false;
    if (a.length !== b.length) return false;
    for (var i = 0, len = a.length; i < len; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  if (isMongooseObject(a)) a = a.toObject();
  if (isMongooseObject(b)) b = b.toObject();

  try {
    var ka = Object.keys(a),
        kb = Object.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }

  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;

  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();

  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }

  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};
