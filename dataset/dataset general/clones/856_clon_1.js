/*
 * This file contains Unit Tests for the Uri class.
 * It uses the 'assert' module for making assertions.
 */

var assert = require("assert"); // Load the standard Node.js assertion library.

// Determine the Uri class source based on the environment.
// If 'require' is a function (Node.js environment), use the local Uri module.
// Otherwise (browser environment), assume 'window.Uri' is available.
var Uri = ( typeof ( require ) === 'function' )
            ? require('../../Uri')
            : window.Uri;


// Main test suite for the Uri class functionality.
describe ( 'Uri' , function ( ) {

   // Sub-suite focusing on the fluent setter methods of the Uri class.
   describe ( 'fluent setters' , function ( ) {
      var u; // Declare a variable to hold the Uri instance for each test case.


      // Test case: Verify that path and anchor can be added fluently.
      it ( 'can fluently add a path and anchor' , function ( ) {
         // Initialize a Uri instance and chain setter calls.
         u = new Uri ( 'www.yahoo.com' )
             .setPath ( '/index.html' )
             .setAnchor ( 'content' );

         // Assert that the resulting URI string is as expected.
         assert.equal ( u.toString ( ) ,
                        'www.yahoo.com/index.html#content' );
      } );


      // Test case: Verify that host and protocol can be replaced fluently.
      it ( 'can fluently replace host and protocol' , function ( ) {

         u = new Uri ( 'www.yahoo.com/index.html' )
             .setHost ( 'test.com' ) // Replace the host.
             .setProtocol ( 'https' ); // Change the protocol.

         // Check the final URI string.
         assert.equal ( u.toString ( ) ,
                        'https://test.com/index.html' );
      } );


      // Test case: Construct a complete URL step-by-step using fluent setters.
      it ( 'can fluently construct a url out of nothing' , function ( ) {

         u = new Uri ( ) // Start with an empty Uri.
             .setPath ( '/index.html' )
             .setAnchor ( 'content' )
             .setHost ( 'www.test.com' )
             .setPort ( 8080 )
             .setUserInfo ( 'username:password' )
             .setProtocol ( 'https' )
             .setQuery ( 'this=that&some=thing' );

         // Compare the constructed URI with the expected string.
         assert.equal ( u.toString ( ) ,
                        'https://username:password@www.test.com:8080/index.html?this=that&some=thing#content' );
      } );


      // Test case: Fluently clear all parts of an existing URL.
      it ( 'can fluently destroy all parts of a url' , function ( ) {

         // Start with a complex URI string.
         u = new Uri ( 'https://username:password@www.test.com:8080/index.html?this=that&some=thing#content' )
             .setPath ( null )       // Remove path component.
             .setAnchor ( null )     // Remove anchor.
             .setHost ( null )       // Clear host.
             .setPort ( null )       // Clear port.
             .setUserInfo ( null )   // Remove user info.
             .setProtocol ( null )   // Clear protocol.
             .setQuery ( null );     // Remove query string.

         // After clearing all parts, the URI should be an empty string.
         assert.equal ( u.toString ( ) ,
                        '' );
      } );

   } ); // End of 'fluent setters' describe block.

} ); // End of 'Uri' describe block.