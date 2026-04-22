Error . stackTraceLimit = Infinity ; // Global setting to capture full stack traces

/*
 * This section defines the core modules and database connection setup.
 * It includes an immediately invoked function expression (IIFE)
 * to manage asynchronous callbacks and error handling consistently.
 */

var cps = require ( 'cps' ) ; // Require the cps (Continuation-Passing Style) library

var db = require ( '../lib/node-mysql.js' ) ; // Load the custom node-mysql wrapper
var DB = db . DB ; // Extract the DB class from the module

var cb = function ( ) {

  // Internal helper function for logging errors
  var handleError = function ( e ) {
    if ( e . stack ) {
      console . log ( e . stack ) ; // Log the full stack trace if available
    }
    else {
      console . log ( e ) ; // Otherwise, log the error object directly
    }
  } ; // End of handleError definition

  var start = new Date ( ) ; // Capture the start time for performance tracking

  // This is the main callback function returned by the IIFE
  return function ( err , res ) {
    try {
      var end = new Date ( ) ; // Capture the end time
      console . log ( 'time spent: ' , end - start ) ; // Calculate and log the execution duration

      if ( err ) {
        handleError ( err ) ; // If an error occurred, process it
      }
      else {
        console . log ( res ) ; // Otherwise, log the successful result
      }
      box . end ( ) ; // Ensure the database connection pool is properly closed
    }
    catch ( e ) {
      handleError ( e ) ; // Catch any exceptions during result processing
      box . end ( ) ; // Still ensure cleanup
    }
  } ; // End of returned callback function
} ( ) ; // Immediately invoke this function to initialize `cb`

var box = new DB ( {
  host : 'localhost' , // Database host address
  user : 'root' , // Username for database access
  password : '' , // Password (empty for local development setup)
  database : 'workr-main-service' , // Name of the database to connect to
  connectionLimit : 50 , // Maximum number of connections in the pool

  useTransaction : {
    connectionLimit : 1 // Dedicated connection for transaction handling
  } ,

  useCursor : {
    connectionLimit : 1 // Dedicated connection for cursor operations
  }
} ) ; // End of DB configuration

/**
 * Basic database test function.
 * It performs a simple transaction to query user profiles.
 * @param {Function} cb - The callback function to be invoked upon completion.
 */
var basicTest = function ( cb ) {

  box . transaction ( null , function ( conn , cb ) { // Start a new transaction

    cps . seq (
      [ // Array of asynchronous steps to be executed sequentially
        function ( _ , cb ) {
          // Query the user_profiles table, limiting to 1 row
          conn . query ( 'select * from user_profiles limit 1' , cb ) ;
        } ,
        function ( res , cb ) {
          console . log ( res ) ; // Log the result of the query
          cb ( ) ; // Proceed to the next step
        }
      ] , cb ) ; // Pass the main callback to cps.seq
  } , cb ) ; // Pass the main callback to box.transaction
} ; // End of basicTest

// This function seems to have a typo in its name ('scehma' instead of 'schema')
var scehmaTest = function ( cb ) {
  box . _prepare ( cb ) ; // Calls an internal _prepare method on the box object
} ;

/**
 * Test function for database cursor functionality.
 * It connects to the DB, opens a cursor, processes rows, and handles completion.
 * @param {Function} cb - The callback function.
 */
var cursorTest = function ( cb ) {

  box . connect ( function ( boxConn , cb ) { // Establish a database connection

    var q = 'select * from user_profiles' ; // Define the SQL query for the cursor

    box . cursor ( q , function ( row , cb ) { // Initialize and process cursor rows
      // Original comments from source code:
      // boxConn . query ( q , cb ) ;
      // throw new Error ( 'foobar' ) ;

      console . log ( row ) ; // Log each row fetched by the cursor
      cb ( ) ; // Call callback to fetch the next row
    } , function ( err , res ) { // Callback for when the cursor finishes or errors
      if ( err ) {
        console . log ( err ) ; // Log any errors encountered during cursor operation
      }
      cb ( err , res ) ; // Pass the final result or error to the main callback
    } ) ; // End of box.cursor call
  } , cb ) ; // End of box.connect call
} ; // End of cursorTest definition

/*
 * This function tests the model features of the database wrapper.
 * It defines models, extends them, and demonstrates querying with links.
 */
var modelTest = function ( cb ) {

  box . add ( { // Add the 'coupons' model
    name : 'coupons' ,
    idFieldName : 'coupon_id'
  } )
  ; // Semicolon on a new line, for visual distinction

  box . add ( { // Add the 'products' model
    name : 'products' ,
    idFieldName : 'product_id'
  } )
  ; // Another semicolon on a new line

  var oldBox = box ; // Keep a reference to the original box object

  box = box . clone ( ) ; // Clone the box to work with extended models without affecting the original

  box . extend ( { // Extend the 'coupons' model with custom row methods
    name : 'coupons' ,
    Row : { // Define methods for individual rows of the 'coupons' model
      getDiscountType : function ( ) {
        return this . _data [ 'discount_type' ] ; // Access data from the row
      }
    }
  } )
    . linksTo ( { // Define a link from 'coupons' to 'products'
      name : 'product' , // Name of the linked entity
      table : 'products' , // Table name of the linked entity
      key : 'product_id' // Foreign key relationship
    } )
  ; // Semicolon again, emphasizing the chain

  var Coupon = box . get ( 'coupons' ) . Table ; // Get the Table class for the 'coupons' model

  box . connect ( function ( conn , cb ) { // Connect to perform model-based operations

    cps . seq (
      [ // Sequence of operations for model testing
        function ( _ , cb ) {
          // Construct a base query for coupons where product_id is not null
          var q = Coupon . baseQuery ( 'where product_id is not null limit 1' ) ;
          Coupon . find ( conn , q , cb ) ; // Find coupons based on the query
        } ,
        function ( coupons , cb ) {
          // Use cps.pmap to process multiple coupons in parallel
          cps . pmap ( coupons , function ( coupon , cb ) {
            // Original comment from source:
            // coupon . linksTo ( conn , 'product' , cb ) ;
            cb ( null , coupon . getDiscountType ( ) ) ; // Get the discount type for each coupon
          } , cb ) ; // Pass the main callback to cps.pmap
        }
      ] , cb ) ; // Pass the main callback to cps.seq
  } , cb ) ; // Pass the main callback to box.connect
} ; // End of modelTest function

/*
 * This final block uses cps.rescue to wrap the execution of cursorTest,
 * providing a structured way to handle exceptions.
 */
cps . rescue ( {
  'try' : function ( cb ) {
    cursorTest ( cb ) ; // Execute the cursorTest function within the try block
  } ,
  'catch' : function ( err , cb ) {
    console . log ( 'cps exception caught' ) ; // Log that an exception was caught by cps.rescue
    throw err ; // Re-throw the error to propagate it further
  }
} , cb ) ; // Pass the global callback to cps.rescue