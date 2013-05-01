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

###find

Declares this query a _find_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().find()
mquery().find(match)
mquery().find(callback)
mquery().find(match, callback)
```

###findOne

Declares this query a _findOne_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().findOne()
mquery().findOne(match)
mquery().findOne(callback)
mquery().findOne(match, callback)
```

###count

Declares this query a _count_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().count()
mquery().count(match)
mquery().count(callback)
mquery().count(match, function (err, number){})
```

###remove

Declares this query a _remove_ query. Optionally pass a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().remove()
mquery().remove(match)
mquery().remove(callback)
mquery().remove(match, function (err){})
```

###update

###findOneAndUpdate
###findOneAndRemove

###distinct

Declares this query a _distinct_ query. Optionally pass the distinct field, a match clause and / or callback. If a callback is passed the query is executed.

```js
mquery().distinct()
mquery().distinct(field)
mquery().distinct(field, callback)
mquery().distinct(match)
mquery().distinct(match, callback)
mquery().distinct(match, field)
mquery().distinct(match, field, callback)
mquery().distinct(function (err, result) {})
```

###exec

Executes the query.

```js
mquery().findOne().where('route').intersects(polygon).exec(function (err, docs){})
```

###$where
###where
###equals
###or
###nor
###and
###gt
###gte
###lt
###lte
###ne
###in
###nin
###regex
###size
###maxDistance
###mod
###exists
###elemMatch
###within
###box
###polygon
###circle
###geometry
###intersects
###select
###slice
###sort
###limit
###skip
###maxScan
###batchSize
###comment
###snapshot
###hint
###slaveOk
###read
###tailable

##Helpers

###merge
###setOptions
###collection
###canMerge

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

