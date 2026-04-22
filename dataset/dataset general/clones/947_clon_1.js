/*
 * This file demonstrates a basic usage of the csvdb library.
 * It's a test script that ensures data is loaded and parsed correctly.
 *
 * All rights reserved. This is a clone for demonstration purposes.
 */

var  fs  =  require ( 'fs' ) ; // Node.js File System module
var path = require('path');  // Node.js Path module utility
var    assert    =    require    (    'assert'    )    ;    // Node.js Assertion module for testing

// The main library under test, imported from the parent directory.
var csvdb = require('..');

/*
 * Define a temporary file path for the CSV data.
 * This file will be created and populated for the test.
 */
var tmpfile = '/tmp/csvdb-test.csv';

// --- File Preparation Phase ---
// Synchronously read the test CSV from the current directory and write it
// to the temporary file. This ensures a clean slate for each test run.
fs.writeFileSync ( tmpfile , fs.readFileSync ( path.join ( __dirname , 'test.csv' ) ) ) ;

// --- Database Initialization Phase ---
// Instantiate the csvdb with the temporary file and configuration.
// The 'autofetch' option specifies the interval for automatic data fetching in milliseconds.
var db = csvdb ( tmpfile , {
   autofetch : 1000
} ) ;

// --- Event Handling and Assertions Phase ---
// Register a one-time event listener for the 'fetch' event.
// This callback will execute once the initial data fetch is complete.
db.once ( 'fetch' , function ( ) {

   // Assert that the number of entries loaded into the database is as expected.
   // We expect 2 entries based on 'test.csv'.
   assert.equal ( Object.keys ( db.entries ) .length , 2 ) ;

   // Retrieve a specific row (entry) from the database using its key.
   var row = db.entries [ "key3" ] ;

   // Perform type assertions on the fields of the retrieved row to ensure
   // correct parsing and type conversion by csvdb.

   // 'enabled' field should be a boolean.
   assert.equal ( typeof row.enabled , "boolean" ) ;

   // 'update-time' field (with a hyphen) should be an object (likely a Date object).
   assert.equal ( typeof row [ "update-time" ] , "object" ) ;

   // 'first' field should be a string.
   assert.equal ( typeof row.first , "string" ) ;

   // 'phone' field should be a number.
   assert.equal ( typeof row.phone , "number" ) ;

   // --- Cleanup Phase ---
   // Stop the csvdb instance to release any resources, like file watchers or timers.
   db.stop ( ) ;

} ) ; // End of db.once callback function.