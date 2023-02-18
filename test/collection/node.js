'use strict';

const mongo = require('mongodb');

const uri = process.env.MQUERY_URI || 'mongodb://localhost/mquery';
let client;
let db;

exports.getCollection = async function() {
  const client = new mongo.MongoClient(uri);
  await client.connect();
  db = client.db();

  const collection = db.collection('stuff');

  // clean test db before starting
  await db.dropDatabase();

  return collection;
};

exports.dropCollection = async function() {
  if (db) {
    await db.dropDatabase();
  }
  if (client) {
    await client.close();
  }
};
