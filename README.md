#mquery
===========

Expressive MongoDB query builder

##Features

  - fluent query builder api
  - custom base query support
  - MongoDB 2.4 geoJSON support
  - method + option combinations validation
  - node.js driver compatibility
  - environment detection
  - [debug](https://github.com/visionmedia/debug) support
  - separated collection implementations for maximum flexibility

##Use

```js
require('mongodb').connect(uri, function (err, db) {
  if (err) return handleError(err);

  // get a collection
  var collection = db.collection('artists');

  // pass it to the constructor
  mquery(collection).find({..}, callback);

  // or pass it to the collection method
  mquery().find({..}).collection(collection).exec(callback)

  // or better yet, create a custom query constructor that has it always set
  var Artist = mquery(collection).toConstructor();
  Artist().find(..).where(..).exec(callback)
})
```

`mquery` requires a collection object to work with. In the example above we just pass the collection object created using the official [MongoDB driver](https://github.com/mongodb/node-mongodb-native).


##Fluent API

###find()

Declares this query a _find_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().find()
mquery().find(match)
mquery().find(callback)
mquery().find(match, function (err, docs) {
  assert(Array.isArray(docs));
})
```

###findOne()

Declares this query a _findOne_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().findOne()
mquery().findOne(match)
mquery().findOne(callback)
mquery().findOne(match, function (err, doc) {
  if (doc) {
    // the document may not be found
    console.log(doc);
  }
})
```

###count()

Declares this query a _count_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().count()
mquery().count(match)
mquery().count(callback)
mquery().count(match, function (err, number){
  console.log('we found %d matching documents', number);
})
```

###remove()

Declares this query a _remove_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().remove()
mquery().remove(match)
mquery().remove(callback)
mquery().remove(match, function (err){})
```

###update()

Declares this query an _update_ query. Optionally pass an update document, match clause, options or callback. If a callback is passed, the query is executed. To force execution without passing a callback, run `update(true)`.

```js
mquery().update()
mquery().update(match, updateDocument)
mquery().update(match, updateDocument, options)

// the following all execute the command
mquery().update(callback)
mquery().update({$set: updateDocument, callback)
mquery().update(match, updateDocument, callback)
mquery().update(match, updateDocument, options, function (err, result){})
mquery().update(true) // executes (unsafe write)
```

#####the update document

All paths passed that are not `$atomic` operations will become `$set` ops. For example:

```js
mquery(collection).where({ _id: id }).update({ title: 'words' }, callback)
```

becomes

```js
collection.update({ _id: id }, { $set: { title: 'words' }}, callback)
```

This behavior can be overridden using the `overwrite` option (see below).

#####options

Options are passed to the `setOptions()` method.

- overwrite

Passing an empty object `{ }` as the update document will result in a no-op unless the `overwrite` option is passed. Without the `overwrite` option, the update operation will be ignored and the callback executed without sending the command to MongoDB to prevent accidently overwritting documents in the collection.

```js
var q = mquery(collection).where({ _id: id }).setOptions({ overwrite: true });
q.update({ }, callback); // overwrite with an empty doc
```

The `overwrite` option isn't just for empty objects, it also provides a means to override the default `$set` conversion and send the update document as is.

```js
// create a base query
var base = mquery({ _id: 108 }).collection(collection).toConstructor();

base().findOne(function (err, doc) {
  console.log(doc); // { _id: 108, name: 'cajon' })

  base().setOptions({ overwrite: true }).update({ changed: true }, function (err) {
    base.findOne(function (err, doc) {
      console.log(doc); // { _id: 108, changed: true }) - the doc was overwritten
    });
  });
})
```

- multi

Updates only modify a single document by default. To update multiple documents, set the `multi` option to `true`.

```js
mquery()
  .collection(coll)
  .update({ name: /^match/ }, { $addToSet: { arr: 4 }}, { multi: true }, callback)

// another way of doing it
mquery({ name: /^match/ })
  .collection(coll)
  .setOptions({ multi: true })
  .update({ $addToSet: { arr: 4 }}, callback)

// update multiple documents with an empty doc
var q = mquery(collection).where({ name: /^match/ });
q.setOptions({ multi: true, overwrite: true })
q.update({ });
q.update(function (err, result) {
  console.log(arguments);
});
```

###findOneAndUpdate()

Declares this query a _findAndModify_ with update query. Optionally pass a match clause, update document, options, or callback. If a callback is passed, the query is executed.

When executed, the first matching document (if found) is modified according to the update document and passed back to the callback.

#####options

Options are passed to the `setOptions()` method.

- `new`: boolean - true to return the modified document rather than the original. defaults to true
- `upsert`: boolean - creates the object if it doesn't exist. defaults to false
- `sort`: if multiple docs are found by the match condition, sets the sort order to choose which doc to update

```js
query.findOneAndUpdate()
query.findOneAndUpdate(updateDocument)
query.findOneAndUpdate(match, updateDocument)
query.findOneAndUpdate(match, updateDocument, options)

// the following all execute the command
query.findOneAndUpdate(callback)
query.findOneAndUpdate(updateDocument, callback)
query.findOneAndUpdate(match, updateDocument, callback)
query.findOneAndUpdate(match, updateDocument, options, function (err, doc) {
  if (doc) {
    // the document may not be found
    console.log(doc);
  }
})
 ```

###findOneAndRemove()

Declares this query a _findAndModify_ with remove query. Optionally pass a match clause, options, or callback. If a callback is passed, the query is executed.

When executed, the first matching document (if found) is modified according to the update document, removed from the collection and passed to the callback.

#####options

Options are passed to the `setOptions()` method.

- `sort`: if multiple docs are found by the condition, sets the sort order to choose which doc to modify and remove

```js
A.where().findOneAndRemove()
A.where().findOneAndRemove(match)
A.where().findOneAndRemove(match, options)

// the following all execute the command
A.where().findOneAndRemove(callback)
A.where().findOneAndRemove(match, callback)
A.where().findOneAndRemove(match, options, function (err, doc) {
  if (doc) {
    // the document may not be found
    console.log(doc);
  }
})
 ```

###distinct()

Declares this query a _distinct_ query. Optionally pass the distinct field, a match clause or callback. If a callback is passed the query is executed.

```js
mquery().distinct()
mquery().distinct(match)
mquery().distinct(match, field)
mquery().distinct(field)

// the following all execute the command
mquery().distinct(callback)
mquery().distinct(field, callback)
mquery().distinct(match, callback)
mquery().distinct(match, field, function (err, result) {
  console.log(result);
})
```

###exec()

Executes the query.

```js
mquery().findOne().where('route').intersects(polygon).exec(function (err, docs){})
```

==================

###and()
###box()
###circle()
###elemMatch()

###equals()

Specifies the complementary comparison value for the path specified with `where()`.

```js
mquery().where('age').equals(49);

// is the same as

mquery().where({ 'age': 49 });
```

###exists()
###geometry()
###gt()
###gte()
###in()
###intersects()
###lt()
###lte()
###maxDistance()
###mod()
###ne()
###nor()
###or()
###polygon()
###nin()
###regex()
###select()
###size()
###slice()
###within()

###where()

Specifies a `path` for use with chaining.

```js
// instead of writing:
mquery().find({age: {$gte: 21, $lte: 65}});

// we can instead write:
mquery().where('age').gte(21).lte(65);

// passing query conditions is permitted too
mquery().find().where({ name: 'vonderful' })

// chaining
mquery()
.where('age').gte(21).lte(65)
.where({ 'name': /^vonderful/i })
.where('friends').slice(10)
.exec(callback)
```


###$where()

Specifies a `$where` condition.

Use `$where` when you need to select documents using a JavaScript expression.

```js
query.$where('this.comments.length > 10 || this.name.length > 5').exec(callback)

query.$where(function () {
  return this.comments.length > 10 || this.name.length > 5;
})
```

Only use `$where` when you have a condition that cannot be met using other MongoDB operators like `$lt`. Be sure to read about all of [its caveats](http://docs.mongodb.org/manual/reference/operator/where/) before using.

================

###batchSize()

Specifies the batchSize option.

```js
query.batchSize(100)
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/method/cursor.batchSize/)

###comment()

Specifies the comment option.

```js
query.comment('login query');
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/operator/)

###hint()

Sets query hints.

```js
mquery().hint({ indexA: 1, indexB: -1 })
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/operator/hint/)

###limit()

Specifies the limit option.

```js
query.limit(20)
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/method/cursor.limit/)

###maxScan()

Specifies the maxScan option.

```js
query.maxScan(100)
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/operator/maxScan/)


###skip()

Specifies the skip option.

```js
query.skip(100).limit(20)
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/method/cursor.skip/)

###sort()

Sets the query sort order.

If an object is passed, key values allowed are `asc`, `desc`, `ascending`, `descending`, `1`, and `-1`.

If a string is passed, it must be a space delimited list of path names. The sort order of each path is ascending unless the path name is prefixed with `-` which will be treated as descending.

```js
// these are equivalent
query.sort({ field: 'asc', test: -1 });
query.sort('field -test');
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/method/cursor.sort/)

###read()

Sets the readPreference option for the query.

```js
mquery().read('primary')
mquery().read('p')  // same as primary

mquery().read('primaryPreferred')
mquery().read('pp') // same as primaryPreferred

mquery().read('secondary')
mquery().read('s')  // same as secondary

mquery().read('secondaryPreferred')
mquery().read('sp') // same as secondaryPreferred

mquery().read('nearest')
mquery().read('n')  // same as nearest

// specifying tags
mquery().read('s', [{ dc:'sf', s: 1 },{ dc:'ma', s: 2 }])
```

#####Preferences:

- `primary` - (default) Read from primary only. Operations will produce an error if primary is unavailable. Cannot be combined with tags.
- `secondary` - Read from secondary if available, otherwise error.
- `primaryPreferred` - Read from primary if available, otherwise a secondary.
- `secondaryPreferred` - Read from a secondary if available, otherwise read from the primary.
- `nearest` - All operations read from among the nearest candidates, but unlike other modes, this option will include both the primary and all secondaries in the random selection.

Aliases

- `p`   primary
- `pp`  primaryPreferred
- `s`   secondary
- `sp`  secondaryPreferred
- `n`   nearest

Read more about how to use read preferrences [here](http://docs.mongodb.org/manual/applications/replication/#read-preference) and [here](http://mongodb.github.com/node-mongodb-native/driver-articles/anintroductionto1_1and2_2.html#read-preferences).

###slaveOk()

Sets the slaveOk option. `true` allows reading from secondaries.

**deprecated** use [read()](#read) preferences instead if on mongodb >= 2.2

```js
query.slaveOk() // true
query.slaveOk(true)
query.slaveOk(false)
```

[MongoDB documentation](http://docs.mongodb.org/manual/reference/method/rs.slaveOk/)

###snapshot()

Specifies this query as a snapshot query.

```js
mquery().snapshot() // true
mquery().snapshot(true)
mquery().snapshot(false)
```

_Cannot be used with `distinct()`._

[MongoDB documentation](http://docs.mongodb.org/manual/reference/operator/snapshot/)

###tailable()

Sets tailable option.

```js
mquery().tailable() <== true
mquery().tailable(true)
mquery().tailable(false)
```

_Cannot be used with `distinct()`._

[MongoDB Documentation](http://docs.mongodb.org/manual/tutorial/create-tailable-cursor/)

##Helpers

###merge(object)

Merges other mquery or match condition objects into this one. When an muery instance is passed, its match conditions, field selection and options are merged.

```js
var drum = mquery({ type: 'drum' }).collection(instruments);
var redDrum = mqery({ color: 'red' }).merge(drum);
redDrum.count(function (err, n) {
  console.log('there are %d red drums', n);
})
```

Internally uses `Query.canMerge` to determine validity.

###setOptions(options)

Sets query options.

```js
mquery().setOptions({ collection: coll, limit: 20 })
```

#####options

- [tailable](#tailable) *
- [sort](#sort) *
- [limit](#limit) *
- [skip](#skip) *
- [maxScan](#maxScan) *
- [batchSize](#batchSize) *
- [comment](#comment) *
- [snapshot](#snapshot) *
- [hint](#hint) *
- [slaveOk](#slaveOk) *
- [safe](http://docs.mongodb.org/manual/reference/write-concern/): Boolean - passed through to the collection. Setting to `true` is equivalent to `{ w: 1 }`
- [collection](#collection): the collection to query against

_* denotes a query helper method is also available_

###collection()

Sets the querys collection.

```js
mquery().collection(aCollection)
```

###Query.canMerge(conditions)

Determines if `conditions` can be merged using `mquery().merge()`.

```js
var query = mquery({ type: 'drum' });
var okToMerge = mquery.canMerge(anObject)
if (okToMerge) {
  query.merge(anObject);
}
```

##Custom Base Queries

Often times we want custom base queries that encapsulate predefined criteria. With `mquery` this is easy. First create the query you want to reuse and call its `toConstructor()` method which returns a new subclass of `mquery` that retains all options and criteria of the original.

```js
var greatMovies = mquery(movieCollection).where('rating').gte(4.5).toConstructor();

// use it!
greatMovies().count(function (err, n) {
  console.log('There are %d great movies', n);
});

greatMovies().where({ name: /^Life/ }).select('name').find(function (err, docs) {
  console.log(docs);
});
```

##Validation

Method and options combinations are checked for validity at runtime to prevent creation of invalid query constructs. For example, a `distinct` query does not support specifying options like `hint` or field selection. In this case an error will be thrown so you can catch these mistakes in development.

##Debug support

Debug mode is provided through the use of the [debug](https://github.com/visionmedia/debug) module. To enable:

    DEBUG=mquery node yourprogram.js

Read the debug module documentation for more details.

##Future goals

  - mongo shell compatibility
  - browser compatibility
  - mongoose compatibility

## Installation

    $ npm install mquery

## License

[MIT](https://github.com/aheckmann/mquery/blob/master/LICENSE)

