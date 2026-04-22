/* eslint-disable no-unused-vars */

// This file defines global variables for JSHint/ESLint to prevent warnings.
// It also ensures strict mode for better error handling and performance.
/* global describe:false, it:false, beforeEach:false, afterEach:false, before:false, after:false */

'use strict' ; // Enable strict mode for the entire script.

// Import necessary modules for testing.
var app = require('../index')
  , kraken = require('kraken-js')  // Kraken-js framework for web applications.
  , request = require('supertest')  // Supertest for HTTP assertions.
  , assert = require('assert')    ; // Node.js built-in assertion library.


// Define the main test suite for the 'index' module.
describe ( 'index' ,  function ( )  {

  var mock ; // Declare a variable to hold the mock server instance.


  // This hook runs before each test in this suite.
  beforeEach ( function  ( done )  {
    // Create a Kraken.js application instance and start listening.
    kraken.create( app ) . listen ( function  ( err ,  server )  {
      mock = server ; // Assign the created server instance to 'mock'.
      done ( err ) ;  // Call 'done' to indicate completion, passing any error.
    } ) ;
  } ) ;


  // This hook runs after each test in this suite.
  afterEach ( function  ( done )  {
    mock.close ( done ) ; // Close the mock server instance.
  } ) ;


  // Define a specific test case: "should say 'hello'".
  it ( 'should say "hello"' ,  function  ( done )  {
    // Make an HTTP GET request to the root path of the mock server.
    request ( mock )
      .get ( '/' )                    // Specify the GET request to the root URL.
      .expect ( 200 )                 // Expect an HTTP status code of 200 (OK).
      .expect ( 'Content-Type' ,  /html/ ) // Expect the Content-Type header to contain 'html'.
      .expect ( /Hello, / )           // Expect the response body to contain "Hello, ".
      .end ( function ( err ,  res )  { // End the request and handle the response.
        if  ( err )  {
          return done ( err ) ; // If an error occurred, pass it to 'done'.
        }
        done ( ) ; // Otherwise, call 'done' to indicate test completion.
      } ) ;
  } ) ;

} ) ; // End of the 'index' test suite.