'use strict';

/*!
 * Module dependencies.
 */

const specialProperties = new Set(['__proto__', 'constructor', 'prototype']);
const primitiveTypes = new Set(['bigint', 'string', 'number', 'boolean', 'symbol', 'undefined']);
const objectIdVariants = new Set(['ObjectId', 'ObjectID']);
const dateVariants = new Set(['Date', 'Function']);

/**
 * Clones objects
 *
 * @param {Object} obj the object to clone
 * @param {Object} options
 * @return {Object} the cloned object
 * @api private
 */

const clone = exports.clone = function clone(obj, options) {
  if (obj === null || primitiveTypes.has(typeof obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return exports.cloneArray(obj, options);
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }

  if (Buffer.isBuffer(obj)) {
    return Buffer.from(obj.slice());
  }

  if (obj.constructor) {
    const constructorName = obj.constructor.name;
    if (objectIdVariants.has(constructorName)) {
      return typeof obj.clone === 'function' && obj.clone() ||
        new obj.constructor(obj.id);
    }

    if (dateVariants.has(constructorName)) {
      return new obj.constructor(+obj);
    }

    if (obj._bsontype === 'Binary' && obj.buffer && obj.value) {
      return typeof obj.clone === 'function' && obj.clone() ||
        new obj.constructor(obj.value(true), obj.sub_type);
    }

    if (constructorName === 'ReadPreference') {
      return new obj.constructor(obj.mode, clone(obj.tags, options));
    }

  }

  if (isObject(obj)) {
    return exports.cloneObject(obj, options);
  }

  if (obj.valueOf) {
    return obj.valueOf();
  }
};

/*!
 * ignore
 */

exports.cloneObject = function cloneObject(obj, options) {
  const minimize = options && options.minimize,
      ret = {},
      keys = Object.keys(obj),
      len = keys.length;
  let hasKeys = false,
      val,
      k = '',
      i = 0;

  for (i = 0; i < len; ++i) {
    k = keys[i];
    // Not technically prototype pollution because this wouldn't merge properties
    // onto `Object.prototype`, but avoid properties like __proto__ as a precaution.
    if (specialProperties.has(k)) {
      continue;
    }

    val = clone(obj[k], options);

    if (!minimize || (typeof val !== 'undefined')) {
      hasKeys || (hasKeys = true);
      ret[k] = val;
    }
  }

  return minimize
    ? hasKeys && ret
    : ret;
};

exports.cloneArray = function cloneArray(arr, options) {
  const len = arr.length,
      ret = new Array(len);
  let i = 0;
  for (; i < len; ++i) {
    ret[i] = clone(arr[i], options);
  }
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

exports.tick = function tick(callback) {
  if ('function' !== typeof callback) return;
  return function() {
    // callbacks should always be fired on the next
    // turn of the event loop. A side benefit is
    // errors thrown from executing the callback
    // will not cause drivers state to be corrupted
    // which has historically been a problem.
    const args = arguments;
    soon(function() {
      callback.apply(this, args);
    });
  };
};

/**
 * Merges `from` into `to` without overwriting existing properties.
 *
 * @param {Object} to
 * @param {Object} from
 * @api private
 */

exports.merge = function merge(to, from) {
  const keys = Object.keys(from);

  for (const key of keys) {
    if (specialProperties.has(key)) {
      continue;
    }
    if (typeof to[key] === 'undefined') {
      to[key] = from[key];
    } else {
      if (exports.isObject(from[key])) {
        merge(to[key], from[key]);
      } else {
        to[key] = from[key];
      }
    }
  }
};

/**
 * Same as merge but clones the assigned values.
 *
 * @param {Object} to
 * @param {Object} from
 * @api private
 */

exports.mergeClone = function mergeClone(to, from) {
  const keys = Object.keys(from);

  for (const key of keys) {
    if (specialProperties.has(key)) {
      continue;
    }
    if (typeof to[key] === 'undefined') {
      to[key] = clone(from[key]);
    } else {
      if (exports.isObject(from[key])) {
        mergeClone(to[key], from[key]);
      } else {
        to[key] = clone(from[key]);
      }
    }
  }
};

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
 * @param {String} pref
 */

const readPrefLookup = {
  p: 'primary',
  pp: 'primaryPreferred',
  s: 'secondary',
  sp: 'secondaryPreferred',
  n: 'nearest'
};

exports.readPref = function readPref(pref) {
  return readPrefLookup[pref] || pref;
};


/**
 * Read Concern helper (mongo 3.2 drivers support this)
 *
 * Allows using string to specify read concern level:
 *
 *     local          3.2+
 *     available      3.6+
 *     majority       3.2+
 *     linearizable   3.4+
 *     snapshot       4.0+
 *
 * @param {String|Object} concern
 */
const readConcernLookup = {
  l: 'local',
  a: 'available',
  m: 'majority',
  lz: 'linearizable',
  s: 'snapshot'
};

exports.readConcern = function readConcern(concern) {
  if (typeof concern === 'string') {
    concern = { level: readConcernLookup[concern] || concern };
  }
  return concern;
};

/**
 * Object.prototype.toString.call helper
 */

const _toString = Object.prototype.toString;
exports.toString = function toString(arg) {
  return _toString.call(arg);
};

/**
 * Determines if `arg` is an object.
 *
 * @param {Object|Array|String|Function|RegExp|any} arg
 * @return {Boolean}
 */

const isObject = exports.isObject = function isObject(arg) {
  return _toString.call(arg) === '[object Object]';
};

/**
 * Object.keys helper
 */

exports.keys = Object.keys;

/**
 * Basic Object.create polyfill.
 * Only one argument is supported.
 *
 * Based on https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/create
 */

exports.create = typeof Object.create === 'function'
  ? Object.create
  : create;

function create(proto) {
  if (arguments.length > 1) {
    throw new Error('Adding properties is not supported');
  }

  function F() { }
  F.prototype = proto;
  return new F;
}

/**
 * inheritance
 */

exports.inherits = function inherits(ctor, superCtor) {
  ctor.prototype = exports.create(superCtor.prototype);
  ctor.prototype.constructor = ctor;
};

/**
 * nextTick helper
 * compat with node 0.10 which behaves differently than previous versions
 */

const soon = exports.soon = typeof setImmediate === 'function'
  ? setImmediate
  : process.nextTick;

/**
 * Check if this object is an arguments object
 *
 * @param {Any} v
 * @return {Boolean}
 */

exports.isArgumentsObject = function isArgumentsObject(v) {
  return _toString.call(v) === '[object Arguments]';
};
