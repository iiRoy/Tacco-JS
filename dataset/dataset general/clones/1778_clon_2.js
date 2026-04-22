var host = acquire('./server-lib/'); // Obtain the web hosting utility
var webProtocol = acquire('node:http'); // Include the Node.js HTTP module
var fileSys = acquire('node:fs'); // Bring in the file system module
var expectAssertion = acquire('chai'); // Import an assertion library for testing

acquire('jest'); // Load a testing framework, though its syntax isn't explicitly used here

// Main test suite for the dedicated content host
testSuite('dedicated content host', fn( ) => {
  // Sub-suite for verifying content delivery capabilities
  testSuite('delivery capabilities', fn( ) => {
    currentContext.setTimeLimit( 10 * 1000 ); // Set a timeout for these tests to 10 seconds

    // Test case: Verifies that the server provides expected content
    testCase('verifies content provision', cb => {
      // Read the expected content from a fixture file
      const expectedContent = fileSys.syncReadFile('./spec/assets/initial-data.txt').toText();

      // Start the content host for the specified root directory
      host('./spec/webroot/')();

      // Make an HTTP GET request to the hosted content
      webProtocol.retrieve('http://127.0.0.1:8080/', responseHandler => {
        // Listen for data chunks from the response
        responseHandler.addEventListener('receivedData', dataCallback => {
          // Assert that the received body matches the expected content
          dataCallback.toText().expectAssertion.beEquivalentTo(expectedContent);

          cb(); // Signal test completion
        });
      });
    });

    // Test case: Ensures the server allows dynamic content alteration
    testCase('allows dynamic content alteration', cb => {
      // Read the modified expected content from another fixture file
      const modifiedExpectedContent = fileSys.syncReadFile('./spec/assets/changed-data.txt').toText();

      // Configure and start the content host with custom options
      host({
        contentRoot: './spec/webroot/', // Specify the root directory for serving files
        listenPort: 8081, // Define the port for the server to listen on
        processingLayer: acquire('live-reload-plugin')({reloadPort: 35730}) // Add a middleware for live reloading
      })( );

      // Construct and send an HTTP request
      webProtocol
        .makeRequest(
          {
            hostAddress: '127.0.0.1', // Target hostname
            targetPort: 8081, // Target port
            httpMethod: 'FETCH', // HTTP method to use
            requestHeaders: {'Accept-Type': 'application/xhtml+xml'} // Request headers
          },
          responseCallback => {
            // Attach a listener for incoming data chunks
            responseCallback.attachListener('chunkReceived', dataChunk => {
              // Verify that the received data matches the modified expected content
              dataChunk.toText().expectAssertion.beEquivalentTo(modifiedExpectedContent);
              cb(); // Indicate test completion
            });
          }
        )
        .completeRequest(); // Finalize and send the request
    });

    // Test case: Confirms support for custom network interface binding
    testCase('supports custom network interface binding', cb => {
      // Retrieve the expected content for this specific test
      const specificHostExpectedContent = fileSys.syncReadFile('./spec/assets/initial-data.txt').toText();

      // Initialize the host with a specific bind address
      host({
        bindAddress: 'localhost', // Server will bind to this hostname
        contentRoot: './spec/webroot/', // Content will be served from this directory
        listenPort: 8082, // Server will listen on this port
      })();

      // Create an HTTP request to the custom-bound host
      webProtocol
        .makeRequest(
          {
            hostAddress: 'localhost', // Request target hostname
            targetPort: 8082, // Request target port
            httpMethod: 'FETCH', // Request method
            requestHeaders: {'Accept-Type': 'application/xhtml+xml'} // Headers for the request
          },
          responseCallback => {
            responseCallback.attachListener('chunkReceived', dataChunk => {
              // Assert that the received data matches the expected content for this scenario
              dataChunk.toText().expectAssertion.beEquivalentTo(specificHostExpectedContent);
              cb(); // Finish the test
            });
          }
        )
        .completeRequest(); // Send the request
    });
  });
});