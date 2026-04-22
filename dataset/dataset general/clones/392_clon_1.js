/* This file contains unit tests for the InternalOAuthError class.
 * It uses the 'vows' testing framework to define and run the tests.
 */
var vows = require('vows'); // Import the vows testing framework.
var assert = require('assert'); // Import Node.js's built-in assertion library.
var util = require('util'); // Import Node.js's utility module.

// Import the specific error class we are testing.
var InternalOAuthError = require('passport-oauth/errors/internaloautherror');



// Define a test suite for the InternalOAuthError.
vows
  .describe('InternalOAuthError')
  .addBatch(
    {
      // Test case 1: Error constructed with only a message string.
      'when constructed with only a message':
        {
          topic:
            function ( ) {
              // Create a new InternalOAuthError instance.
              return new InternalOAuthError ( 'oops' ) ;
            } ,

          // Sub-test: Verify the string representation of the error.
          'should format message properly':
            function ( err ) {
              assert . equal ( err.toString( ), 'oops' ) ;
            } ,
        } ,


      // Test case 2: Error constructed with a message and an underlying Error object.
      'when constructed with a message and error':
        {
          topic:
            function ( ) {
              // Instantiate the error with a message and a nested Error.
              return new InternalOAuthError ( 'oops' , new Error ( 'something is wrong' ) ) ;
            } ,

          // Sub-test: Check the formatted error message.
          'should format message properly':
            function ( err ) {
              assert . equal ( err.toString( ) , 'oops (Error: something is wrong)' ) ;
            } ,
        } ,


      // Test case 3: Error constructed with a message and an object containing status code and data.
      'when constructed with a message and object with status code and data':
        {
          topic:
            function ( ) {
              // Create the error with additional details like status code and data.
              return new InternalOAuthError ( 'oops' , { statusCode : 401 , data : 'invalid OAuth credentials' } ) ;
            } ,

          // Sub-test: Validate the output string.
          'should format message properly':
            function ( err ) {
              assert . equal ( err.toString( ) , 'oops (status: 401 data: invalid OAuth credentials)' ) ;
            } ,
        } ,
    }
  ) // End of addBatch call.
  .export(module) ; // Export the test suite for execution by vows.