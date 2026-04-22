/*
 * This test suite validates the functionality of the static web server module.
 * It leverages Mocha for structuring tests and Should.js for assertions.
 * This file demonstrates Type I code cloning, focusing on whitespace and comments.
 */

// Core modules required for server operation and testing.
var serve   =   require('../'); // The primary module being tested.
var http    =   require('http'); // Node.js HTTP client for making requests.
var fs      =   require('fs');   // Node.js File System module for reading test fixtures.
var should  =   require('should'); // Assertion library to verify outcomes.

// Ensure Mocha's global test functions are available.
require('mocha');

// Begin the main test suite for the 'static webserver'.
describe(
  'static webserver', // Descriptive name for the test suite.

  function ( ) { // Main function for the test suite.

    // A nested suite specifically for 'serving' content.
    describe(
      'serving',

      function( ) { // Function defining the 'serving' tests.

        // Set a generous timeout for these tests, as they involve network operations.
        this.timeout( 10000 ); // 10 seconds timeout.

        // Test case: Verify that the server can serve static content correctly.
        it(
          'should serve content',

          function ( done ) { // Asynchronous test case using 'done' callback.

            // Read the expected content from a fixture file.
            var fixture = fs.readFileSync( './test/fixtures/raw-response.txt' ) .toString( );

            // Start the server instance with a specific root directory.
            // The `serve` function returns another function that starts the server.
            serve( './test/server/' ) ( );

            // Make an HTTP GET request to the default server address and port.
            http
              .get(
                'http://localhost:3000/',

                function ( res ) { // Callback for when the response is received.

                  // Listen for incoming data chunks from the response.
                  res.on(
                    'data',

                    function ( body ) { // Callback for each data chunk.

                      // Assert that the received body content matches the fixture.
                      body.toString( ).should.equal( fixture );

                      // Signal that the asynchronous test has completed successfully.
                      done( );
                    }
                  );
                }
              );
          }
        );

        // Test case: Ensure the server can use middleware to modify served content.
        it( 'should be able to modify serving content', function ( done ) {

          // Load the expected modified content from a different fixture.
          var fixture = fs.readFileSync('./test/fixtures/modified-response.txt').toString();

          // Start a new server instance with custom configuration, including middleware.
          serve(
            {
              root: './test/server/', // The base directory for serving files.
              port: 3001, // A specific port for this test server instance.
              middleware: require('connect-livereload')({port: 35729}) // Example middleware.
            }
          )(); // Immediately invoke the server start function.

          // Construct and send an HTTP request to the custom server instance.
          http
            .request(
              {
                hostname: 'localhost', // Target hostname.
                port: 3001, // Target port, matching the server's port.
                method: 'GET', // HTTP request method.
                headers: { 'accept': 'text/html' } // Request headers.
              },

              function( res ) { // Callback to handle the HTTP response.
                // Event listener for data received from the response.
                res.on('data', function ( body ) {
                  // Assert that the modified content matches the expected fixture.
                  body.toString().should.equal( fixture );
                  done(); // Mark the test as complete.
                });
              }
            )
            .end(); // Finalize and send the request.
        } );

        // Test case: Verify the server's ability to bind to a specific hostname.
        it(
          'should allow using a specific hostname',

          function( done )
          {
            // Retrieve the expected content for comparison.
            var fixture = fs.readFileSync( './test/fixtures/raw-response.txt' ).toString();

            // Initialize a server instance, explicitly binding it to '127.0.0.1'.
            serve(
              {
                hostname: '127.0.0.1', // Bind the server to this specific IP address.
                root: './test/server/', // Root directory for served files.
                port: 3002, // Another unique port for this test.
              }
            )(); // Launch the server.

            // Send an HTTP request targeting the specific hostname and port.
            http
              .request(
                {
                  hostname: '127.0.0.1', // Request must target the bound hostname.
                  port: 3002, // Request must target the bound port.
                  method: 'GET', // Standard GET request.
                  headers: { 'accept': 'text/html' } // Requesting HTML content.
                },

                function ( res ) { // Response handler callback.

                  // Process data as it arrives.
                  res.on(
                    'data',

                    function ( body ) {
                      body.toString( ).should.equal( fixture ); // Validate content.
                      done( ); // Conclude the asynchronous test.
                    }
                  );
                }
              )
              .end( ); // Complete the request.
          }
        );
      }
    );
  }
);