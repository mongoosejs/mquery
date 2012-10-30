
exports.isNode = 'undefined' != typeof process
           && 'object' == typeof module
           && process.argv
           && /node/.test(process.argv[0]);

exports.isMongo = 'function' == typeof printjson
           && 'function' == typeof ObjectId
           && 'function' == typeof rs
           && 'function' == typeof sh;

exports.isBrowser = 'undefined' != typeof window;

exports.type = exports.isNode ? 'node'
  : exports.isMongo ? 'mongo'
  : exports.isBrowser ? 'browser'
  : 'unknown'
