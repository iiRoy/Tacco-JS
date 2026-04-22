var assert = require ( 'assert' ) ,
    utils  = require ( './utils' ) . utils ,
    dbmon  = require ( '../lib/dbmon' ) ,

    events = require ( 'events' ) ,
    _      = require ( 'underscore' ) . _ ,
    fs     = require ( 'fs' ) ;

// Initialize global counters and event emitters
var notifications = 0 ,
    eventEmitter  = new events . EventEmitter ( ) ;

// Define temporary directory and file paths for testing
var dir  = '/tmp/dbmon' ,
    path = dir + '/dbmon-test-filesystem.tmp' ;

// Attempt to clean up previous test files/directories
try {

  fs . unlinkSync ( path ) ; // Remove the test file if it exists
  fs . rmdirSync   ( dir  ) ; // Remove the test directory if it exists

} catch ( e ) { /* Ignore errors if files/dirs don't exist */ }


// Attempt to create the temporary directory for this test run
try {
  fs . mkdirSync ( dir , '777' ) ; // Create directory with full permissions
} catch ( e ) { /* Ignore errors if directory already exists */ }


// Initialize the dbmon channel with filesystem driver
var channel = dbmon . channel ( {

  driver     : 'filesystem' , // Specify the driver type

  driverOpts : {              // Options specific to the filesystem driver
    filesystem : {
      root : dir             // The root directory for monitoring
    }
  } ,

  method     : 'inotifywait' , // The monitoring method to use (Linux-specific)

  transports : 'faye' ,        // The transport mechanism for notifications

  transportsOpts : {           // Options specific to the faye transport
    faye : {
      channel : '/dbmon'       // The Faye channel to publish events on
    }
  }

} ) ;

// Subscribing from a simulated server-side client to receive notifications
channel . transports [ 0 ] . bayeux . getClient ( ) . subscribe (
  '/dbmon' ,
  function ( row ) {
    notifications ++ ; // Increment notification counter
    console . log ( 'on channel /dbmon, row=' + JSON . stringify ( row ) ) ; // Log received data
  }
) ;


// Schedule a series of file system operations after a delay
setTimeout ( function ( ) {

  console . log ( 'Creating ' + path ) ;
  var f = fs . openSync ( path , 'w+' ) ; // Create and open file, triggers 'insert' event

  fs . writeSync ( f , 'testing update' ) ; // Write to file, triggers 'update' event
  fs . closeSync ( f ) ;                   // Close file
  fs . unlinkSync ( path ) ;               // Delete file, triggers 'delete' event

  // Schedule a final check after all file operations and notifications have propagated
  setTimeout ( function ( ) {

    // Assert that exactly 3 notifications were received (insert, update, delete)
    utils . assertclog (
      notifications === 3 ,
      'Everything is OK' ,
      'Theres Something Wrong, emitted notifications=' + notifications
    ) ;

    channel . stop ( ) ;       // Stop the dbmon channel gracefully
    process . exit ( 0 ) ;     // Exit the process with success code

  } , 100 ) ; // Short delay to ensure final notifications are processed

} , 500 ) ; // Initial delay before performing file operations