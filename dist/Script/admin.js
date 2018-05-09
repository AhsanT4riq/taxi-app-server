'use strict';

/* eslint-disable */
// Import async.js - utility library for handlng asynchronous calls
var async = require('async');

var databaseName = 'taxiApp-development';
var databaseURL = 'mongodb://localhost:27017/' + databaseName;

var nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'development') databaseURL = 'taxiApp-development';
if (nodeEnv === 'production') databaseURL = 'taxiApp-api-production';
if (nodeEnv === 'test') databaseURL = 'mongodb://shesafetest:ETUT0ZCLlxRlykUk@shesafetest-shard-00-00-jgxby.mongodb.net:27017,shesafetest-shard-00-01-jgxby.mongodb.net:27017,shesafetest-shard-00-02-jgxby.mongodb.net:27017/test?ssl=true&replicaSet=SheSafeTest-shard-0&authSource=admin';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
  fname: { type: String, default: null },
  lname: { type: String, default: null },
  email: { type: String, required: true, rerquired: 'Email of Admin' },
  password: {
    type: String,
    required: true,
    select: false,
    rerquired: 'Password of Admin'
  },
  userType: { type: String, default: 'admin' }
});

// Mongoose middleware that is called before save to hash the password
userSchema.pre('save', function (next, err) {
  //eslint-disable-line
  var user = this;
  var SALT_FACTOR = 10;
  console.log(err); //eslint-disable-line
  if (!user.isNew) {
    // && !user.isModified('password')
    return next();
  }

  // Encrypt password before saving to database
  bcrypt.genSalt(SALT_FACTOR, function (error, salt) {
    //eslint-disable-line
    if (error) return next(error);
    bcrypt.hash(user.password, salt, null, function (errors, hash) {
      //eslint-disable-line
      if (errors) return next(errors);
      user.password = hash;
      next();
    });
  });
});

var User = mongoose.model('User', userSchema);

async.series([function (callback) {
  //eslint-disable-line
  mongoose.connect(databaseURL);
  mongoose.connection.on('connected', function () {
    console.log('db connected via mongoose'); //eslint-disable-line
    callback(null, 'SUCCESS - Connected to mongodb');
  });
}, function (callback) {
  var users = [];
  var user = new User({
    fname: 'Rishabh',
    lname: 'Pandey',
    email: 'admin@taxiApp.com',
    password: '1234',
    userType: 'admin'
  });
  users.push(user);
  console.log('Populating database with %s users', users.length);
  async.eachSeries(users, function (admin, userSavedCallBack) {
    user.save(function (err) {
      if (err) {
        console.dir(err);
      }
      console.log('Saving user #%s', user.name);
      userSavedCallBack();
    });
  }, function (err) {
    if (err) {
      console.dir(err);
    }
    console.log('Finished aysnc.each in seeding db');
    callback(null, 'SUCCESS - Seed database');
  });
}], function (err, results) {
  console.log('\n\n--- Database seed progam completed ---');

  if (err) {
    console.log('Errors = ');
    console.dir(err);
  } else {
    console.log('Results = ');
    console.log(results);
  }
  console.log('\n\n--- Exiting database seed progam ---');
  process.exit(0);
});
//# sourceMappingURL=admin.js.map
