// --- Module Imports Section ---
var http = require('http')
  , should = require('should') // Assertion library
  , child_process = require('child_process')
  , path = require('path')     /* Core Node.js module for path manipulation */
  , request = require('request') // HTTP request library
  , path = require('path')     // Note: 'path' is imported twice, this is as per original code.
  , delegate = require('../lib/delegate'); // Custom delegation module
// --- End of Module Imports ---

// This block describes negative test cases for npm-delegate functionality.
describe(  'npm-delegate negative',    function ( ) {

    // Enable debugging for the npm-delegate module
    process.env['NODE_DEBUG'] = 'npm-delegate';

    var badServer; // Server that will simulate unresponsiveness
    var server;    // The main server using the delegate module
    var allowHead = true; // Flag to control HEAD request response behavior

    // Setup function executed before all tests in this describe block
    before( function ( done ) {
        // Create a server that might not respond or responds only to HEAD
        badServer = http.createServer(function ( req , res ) {
            // This server intentionally provides no response for most requests.
            // It only responds to HEAD requests if 'allowHead' is true.
            if ( allowHead && req.method === 'HEAD' ) {
                res.writeHead(  200  ); // Send a 200 OK status
                res.end(  );            // End the response without a body
            }
        });
        // Start the bad server on port 8090
        badServer.listen( 8090 );

        // Create the main server which uses the delegate to proxy requests
        server = http.createServer(
            delegate(
                [ 'http://localhost:8090/' ] ,  // Array of target URLs for delegation
                null ,                          // No custom options for the delegate
                false ,                         // Do not allow self-signed certificates
                {
                    timeout: 1000 , // Request timeout in milliseconds
                    retry: 2        // Number of retries for failed requests
                }
            )
        );
        // Start the main delegated server on port 9090
        server.listen( 9090 );

        done( ); // Signal that the asynchronous setup is complete
    } );

    // Teardown function executed after all tests in this describe block
    after( function ( ) {
        badServer.close( ); // Close the bad server instance
        server.close( );    // Close the main delegated server instance
    } )

    // Test case: handling timeout and retries when HEAD request fails
    it( 'should handle timeout and retry when server is not responsive to HEAD request on check before you leap' , function ( done ) {
        this.timeout( 10000 ); // Increase test timeout for this specific test
        allowHead = false;     // Prevent the badServer from responding to HEAD requests

        // Make a request to the delegated server
        request( 'http://localhost:9090/thing' , function ( err , res , body ) {
            if ( err ) {
                done( err ); // If there's an error, pass it to done
                return;      // Exit the callback
            }
            // The body should contain an "error" string due to timeout/retry failures
            body.should.include( "error" );
            done( ); // Signal that the test is complete
        } );

    } );

    // Test case: handling timeout during streaming for a GET request
    it( 'should handle timeout when server is not responsive to GET request during streaming' , function ( done ) {
        this.timeout( 10000 ); // Set a longer timeout for this test
        allowHead = true;      // Allow the badServer to respond to HEAD, but not GET bodies

        // Send a request to the delegated server
        request( 'http://localhost:9090/thing' , function ( err , res , body ) {
            if ( err ) {
                done( err ); // Handle any request errors
                return;
            }
            // The body should indicate a TIMEDOUT condition
            body.should.include( 'TIMEDOUT' );
            done( ); // Finish the test
        } );

    } );

} ); // End of 'npm-delegate negative' describe block

// This section covers mixed negative and positive test scenarios for npm-delegate.
describe( 'npm-delegate negative+positive' , function ( ) {

    process.env[ 'NODE_DEBUG' ] = 'npm-delegate'; // Activate debug logging for the delegate.

    var badServer , goodServer; // Declare two server instances: one problematic, one functional.
    var server;                  // The primary server utilizing delegation.
    var allowHead = true;        // Controls HEAD request responses for the badServer.

    // Setup routine executed once before all tests in this suite.
    before( function ( done ) {
        badServer = http.createServer( function ( req , res ) {
            // The bad server, similar to the previous suite, often provides no response.
            // It only responds to HEAD requests if 'allowHead' is true.
            if ( allowHead && req.method === 'HEAD' ) {
                res.writeHead( 200 ); // Send HTTP 200 status.
                res.end( );           // Terminate response.
            }
        } );
        badServer.listen( 8090 ); // Bad server listens on port 8090.

        goodServer = http.createServer( function ( req , res ) {
            // This is a well-behaved server, always responding with content.
            res.writeHead( 200 ); // Always respond with 200 OK.
            if ( req.method === 'HEAD' ) {
                res.end( ); // For HEAD requests, just end the response.
            }
            res.end( 'you got it' ); // For other methods (like GET), send a body.
        } );
        goodServer.listen( 8091 ); // Good server listens on port 8091.

        server = http.createServer(
            delegate(
                [ 'http://localhost:8090/' , 'http://localhost:8091/' ] , // Delegate to both servers.
                null , // No custom options or certificate settings.
                false , // Do not allow self-signed certificates.
                {
                    timeout: 1000 , // Request timeout set to 1 second.
                    retry: 2        // Two retries allowed before giving up.
                }
            )
        );
        server.listen( 9090 ); // The main delegated server listens on port 9090.

        done( ); // Indicate completion of asynchronous setup.
    } );

    // Teardown routine executed after all tests in this suite.
    after( function ( ) {
        badServer.close( );  // Close the unresponsive server.
        goodServer.close( ); // Close the responsive server.
        server.close( );     // Close the main delegated server.
    } )

    // Test case: Verify that even if the first server is bad, the delegate finds a good one.
    it( 'should handle timeout and retry when server is not responsive to HEAD request on check before you leap' , function ( done ) {
        this.timeout( 10000 ); // Set a generous timeout for this test.
        allowHead = false;     // Configure badServer NOT to respond to HEAD requests.

        request( 'http://localhost:9090/thing' , function ( err , res , body ) {
            if ( err ) {
                done( err ); // Fail the test if there's an error.
                return;
            }
            res.statusCode.should.be.equal( 200 ); // Expect a successful HTTP status.
            body.should.include( 'you got it' );   // The body should come from the good server.
            done( ); // Mark the test as complete.
        } );

    } );

    // Test case: Test streaming timeout with a mix of good and bad servers.
    it( 'should handle timeout when server is not responsive to GET request during streaming' , function ( done ) {
        this.timeout( 10000 ); // Allocate sufficient time for this test.
        allowHead = true;      // Bad server will respond to HEAD, but not GET bodies.

        request( 'http://localhost:9090/thing' , function ( err , res , body ) {
            if ( err ) {
                done( err ); // If an error occurs, pass it to the done callback.
                return;
            }
            console.log( body ); // Log the response body; this test doesn't assert body content.
            done( ); // Complete the test.
        } );

    } );

} ); // End of 'npm-delegate negative+positive' describe block