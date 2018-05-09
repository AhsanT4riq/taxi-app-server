/* eslint-disable */
const printMessage = require('print-message');
const async = require('async');
// Import mongoose.js to define our schema and interact with MongoDB
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

let databaseName = 'taxiApp-development';
let databaseURL = `mongodb://localhost:27017/${databaseName}`;

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === 'development') databaseURL = 'taxiApp-development';
if (nodeEnv === 'production') databaseURL = 'taxiApp-api-production';
if (nodeEnv === 'test') databaseURL = 'mongodb://shesafetest:ETUT0ZCLlxRlykUk@shesafetest-shard-00-00-jgxby.mongodb.net:27017,shesafetest-shard-00-01-jgxby.mongodb.net:27017,shesafetest-shard-00-02-jgxby.mongodb.net:27017/test?ssl=true&replicaSet=SheSafeTest-shard-0&authSource=admin';

printMessage(['Please have patience while TaxiApp get Installed .This will take around 10 - 15 minutes.'], {
  color: 'green',
  borderColor: 'red',
});

//  AIzaSyAnVhbl1bPiwiJaIc6hoxWf3MZecJijJEU
// Setting up the Token

const ServerConfigSchema = new mongoose.Schema({
  type: { type: Schema.Types.Mixed },
  key: { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
});

const ServerConfig = mongoose.model('ServerConfig', ServerConfigSchema);

// Async series method to make sure asynchronous calls below run sequentially
async.series(
  [
    // function - connect to MongoDB using mongoose, which is an asynchronous call
    function(callback) {
      // Open connection to MongoDB
      mongoose.connect(databaseURL);
      // Need to listen to 'connected' event then execute callback method
      // to call the next set of code in the async.serial array
      mongoose.connection.on('connected', () => {
        console.log('db connected via mongoose');
        // Execute callback now we have a successful connection to the DB
        // and move on to the third function below in async.series
        callback(null, 'SUCCESS - Connected to mongodb');
      });
    },

    // function - use Mongoose to create a User model and save it to database
    function(callback) {
      // BEGIN SEED DATABASE
      // Use an array to store a list of User model objects to save to the database
      const serverConfigs = [];
      const serverConfig1 = new ServerConfig({
        type: 'object',
        key: 'cloudinaryConfig',
        value: {
          cloud_name: 'taxiapp',
          api_key: '514294449753777',
          api_secret: 'ch-g8lpWuqOkeGZ0gKUfP711an4'
        },
      });
      // eslint-disable-next-line no-use-before-define
      /*eslint-disable */
        // eslint-disable-next-line no-use-before-define
        const value = serverConfig1;
        serverConfigs.push(eval(value));
        // console.log(eval(value));

      /*eslint-disable */
      console.log('Populating database with %s serverConfigs', serverConfigs.length);
      // Use 'async.eachSeries' to loop through the 'users' array to make
      // sure each asnychronous call to save the user into the database
      // completes before moving to the next User model item in the array
      async.eachSeries(
        // 1st parameter is the 'users' array to iterate over
        serverConfigs,
        (admin, userSavedCallBack) => {
          // There is no need to make a call to create the 'test' database.
          // Saving a model will automatically create the database
          admin.save(err => {
            if (err) {
              // Send JSON response to console for errors
              console.dir(err);
            }

            // Print out which user we are saving
            console.log('Saving user #%s', admin.key);

            // Call 'userSavedCallBack' and NOT 'callback' to ensure that the next
            // 'user' item in the 'users' array gets called to be saved to the database
            userSavedCallBack();
          });
        },
        // 3rd parameter is a function to call when all users in 'users' array have
        // completed their asynchronous user.save function
        err => {
          if (err) {
            console.log('Finished aysnc.each in seeding db');
          }
          console.log('Finished aysnc.each in seeding db');

          // Execute callback function from line 130 to signal to async.series that
          // all asynchronous calls are now done
          callback(null, 'SUCCESS - Seed database');
        },
      );
      // END SEED DATABASE
    },
  ],
  // This function executes when everything above is done
  (err, results) => {
    console.log('\n\n--- Database seed progam completed ---');

    if (err) {
      console.log('Errors = ');
      console.dir(err);
    } else {
      console.log('Results = ');
      console.log(results);
    }

    console.log('\n\n--- Exiting database seed progam ---');
    // Exit the process to get back to terrminal console
    process.exit(0);
  },
);
