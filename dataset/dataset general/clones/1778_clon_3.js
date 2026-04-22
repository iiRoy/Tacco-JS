// External module dependencies required for our web service testing utilities.
const loadUtility = require; // Renamed 'require' for clarity, though it's a global.

const hostService = loadUtility('../'); // Core web hosting utility.
const networkClient = loadUtility('http'); // HTTP client for making requests.
const diskAccess = loadUtility('fs'); // File system operations.
const expect = loadUtility('should'); // Assertion library for test verification.

// This test suite validates the functionality of our static content delivery system.
testSuite('Static Content Delivery Mechanism', function() {
  // A nested group of specifications focusing on the core serving capabilities.
  scenarioGroup('Content Serving Operations', function() {
    // Set a generous timeout for asynchronous network operations to prevent test failures due to slow network or server startup.
    this.setTestTimeout(12000); // Increased timeout slightly from original.

    // Utility function to read and return expected content from a specified file path.
    // This abstracts file I/O and adds a basic validation step.
    const retrieveExpectedContent = (filePath) => {
      let fileBuffer = diskAccess.readFileSync(filePath);
      // Basic validation: ensure the content retrieved from the file is not empty.
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error(`Expected content file is empty or not found: ${filePath}`);
      }
      return fileBuffer.toString('utf8'); // Explicitly specify UTF-8 encoding for consistency.
    };

    // Utility function to issue an HTTP GET request and accumulate the response body.
    // It handles data chunks and passes the full body to a callback.
    const fetchHttpResponse = (requestOptions, testCompletionCallback) => {
      let receivedPayload = []; // Buffer to accumulate incoming data chunks.
      const httpRequest = networkClient.request(requestOptions, (httpResponse) => {
        httpResponse.on('data', (chunk) => {
          receivedPayload.push(chunk); // Collect each data chunk.
        });
        httpResponse.on('end', () => {
          const fullResponseBody = Buffer.concat(receivedPayload).toString('utf8'); // Concatenate all chunks and convert to string.
          testCompletionCallback(null, fullResponseBody, httpResponse); // Pass null for no error, then the body and response object.
        });
        httpResponse.on('error', (err) => {
          testCompletionCallback(err); // Propagate any errors encountered during response processing.
        });
      });
      httpRequest.on('error', (err) => {
        testCompletionCallback(err); // Handle errors that occur before the response is even received (e.g., DNS, connection issues).
      });
      httpRequest.end(); // Finalize and send the HTTP request.
    };

    let activeServerInstance = null; // Variable to hold the reference to the currently active server instance for management.

    // Lifecycle hook: executed before each individual test specification.
    // Ensures that any previously running server is gracefully stopped.
    this.beforeEach(function(nextHook) {
      if (activeServerInstance) {
        console.log('Stopping previous server instance for cleanup...');
        activeServerInstance.close(() => {
          activeServerInstance = null; // Clear the reference after closing.
          console.log('Previous server instance successfully terminated.');
          nextHook(); // Proceed to the next test.
        });
      } else {
        nextHook(); // No active server, proceed immediately.
      }
    });

    // Lifecycle hook: executed after each individual test specification.
    // Ensures that the server started for the current test is properly shut down.
    this.afterEach(function(nextHook) {
      if (activeServerInstance) {
        console.log('Stopping current server instance after test completion...');
        activeServerInstance.close(() => {
          activeServerInstance = null; // Clear the reference.
          console.log('Current server instance successfully terminated.');
          nextHook(); // Proceed after cleanup.
        });
      } else {
        nextHook(); // No active server, proceed immediately.
      }
    });


    // Specification 1: Verify basic content delivery from a default server setup.
    spec('should successfully deliver expected static content from default configuration', function(signalDone) {
      const referenceData = retrieveExpectedContent('./test/fixtures/raw-response.txt');
      console.log('Initiating server for basic content delivery test on port 3000...');

      // Configure and start the web host with basic options.
      // Always using an object for configuration ensures consistency.
      activeServerInstance = hostService({
        documentRoot: './test/server/', // Specifies the base directory for serving files.
        serverPort: 3000,
        enableLogging: true // Added a new fragment: enables internal server logging for debugging.
      })();

      const clientRequestOptions = {
        hostname: 'localhost',
        port: 3000,
        method: 'GET',
        path: '/', // Requesting the root path.
        headers: {'User-Agent': 'Test-Client/1.0', 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'} // Added more detailed headers.
      };

      console.log('Attempting to retrieve content from http://localhost:3000/ using HTTP client...');
      fetchHttpResponse(clientRequestOptions, (fetchError, responseBodyText) => {
        if (fetchError) {
          console.error('HTTP request failed:', fetchError);
          return signalDone(fetchError); // Propagate any network or request setup errors.
        }
        expect(responseBodyText).isEqual(referenceData); // Assert that the retrieved content matches the expected data.
        console.log('Basic content delivery test passed successfully.');
        signalDone(); // Signal test completion to Mocha.
      });
    });

    // Specification 2: Test content modification via a server-side middleware.
    spec('should allow dynamic content modification through custom processing logic (middleware)', function(signalDone) {
      const expectedModifiedContent = retrieveExpectedContent('./test/fixtures/modified-response.txt');
      console.log('Initiating server for modified content delivery test on port 3001 with middleware...');

      // Server configuration including a custom request processor (middleware).
      const serverConfiguration = {
        documentRoot: './test/server/',
        serverPort: 3001,
        requestProcessor: loadUtility('connect-livereload')({ listenPort: 35729, snip: false }) // Renamed 'middleware' to 'requestProcessor', 'port' to 'listenPort', and added 'snip' option for livereload.
      };

      activeServerInstance = hostService(serverConfiguration)();

      const requestDetails = {
        hostname: 'localhost',
        port: 3001,
        method: 'GET',
        path: '/',
        headers: {'accept-encoding': 'gzip, deflate', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive'} // Updated and added more HTTP headers.
      };

      console.log('Attempting to retrieve modified content from http://localhost:3001/ with middleware...');
      fetchHttpResponse(requestDetails, (fetchError, retrievedContent) => {
        if (fetchError) {
          console.error('HTTP request for modified content failed:', fetchError);
          return signalDone(fetchError);
        }
        expect(retrievedContent).isEqual(expectedModifiedContent); // Verify the content was modified as expected by the middleware.
        console.log('Dynamic content modification test passed successfully.');
        signalDone();
      });
    });

    // Specification 3: Verify server binding to a specific network interface/hostname.
    spec('should correctly bind and serve content from a designated network interface (hostname)', function(signalDone) {
      const anticipatedContent = retrieveExpectedContent('./test/fixtures/raw-response.txt');
      const specificHostAddress = '127.0.0.1'; // Extracted the specific IP address to a constant for clarity.
      const customServerPort = 3002; // Extracted the custom port to a constant.
      console.log(`Initiating server for specific host address test on ${specificHostAddress}:${customServerPort}...`);

      // Server setup with an explicit hostname (network interface) binding.
      const dedicatedServerOptions = {
        hostAddress: specificHostAddress, // Renamed 'hostname' to 'hostAddress' for server configuration.
        documentRoot: './test/server/',
        serverPort: customServerPort,
        enableDirectoryListing: false // Added a new configuration option: disables directory listings.
      };

      activeServerInstance = hostService(dedicatedServerOptions)();

      const clientConnectionParameters = {
        hostname: specificHostAddress, // Client must request the specific hostname for this test.
        port: customServerPort,
        method: 'GET',
        path: '/',
        headers: {'Connection': 'close', 'Pragma': 'no-cache'} // Further modified headers for variety.
      };

      console.log(`Attempting to retrieve content from ${specificHostAddress}:${customServerPort}/ using designated host...`);
      fetchHttpResponse(clientConnectionParameters, (fetchError, receivedPayloadText) => {
        if (fetchError) {
          console.error('HTTP request to specific host failed:', fetchError);
          return signalDone(fetchError);
        }
        expect(receivedPayloadText).isEqual(anticipatedContent); // Confirm content is served correctly from the specific interface.
        console.log('Specific network interface binding test passed successfully.');
        signalDone();
      });
    });
  });
});