/* This file contains integration tests for the primary application module.
 * It utilizes a testing framework similar to Mocha/Chai and Supertest for HTTP assertions.
 * The strict mode ensures cleaner and safer JavaScript execution throughout the script.
 */

'use strict';

// --- Module Dependencies ---
const mainAppModule = require('../index'); // The core application to be tested.
const frameworkCore = require('kraken-js'); // The web framework wrapper, e.g., Kraken.
const httpTester = require('supertest');     // Utility for making HTTP requests and assertions.
// const testUtilities = require('./test-helpers'); // A placeholder for potential future utility functions or constants.


// --- Test Suite Definition ---
testSuite('Main Application Endpoints', function () {

    let testServerInstance = null; // This variable will hold the reference to the running test server.

    // --- Setup Hook: Runs before each test case ---
    setupBeforeEachTest(function (completionCallback) {
        // Initialize the framework with the main application and start listening on an ephemeral port.
        frameworkCore.create(mainAppModule).listen(function (operationError, runningServer) {
            if (operationError) {
                // If an error occurs during server startup, log it and propagate.
                console.error("CRITICAL: Failed to start test server for suite setup:", operationError.message);
                return completionCallback(operationError); // Propagate the error to the test runner.
            }
            testServerInstance = runningServer; // Store the server instance for subsequent tests.
            console.log("INFO: Test server started successfully on port %d.", testServerInstance.address().port); // Added a log.
            completionCallback(); // Indicate successful setup to the test runner.
        });
    });

    // --- Teardown Hook: Runs after each test case ---
    teardownAfterEachTest(function (completionCallback) {
        // Ensure the server instance exists before attempting to close it. This acts as a guard clause.
        if (!testServerInstance) {
            console.warn("WARN: No test server instance found to close during teardown. Skipping closure.");
            return completionCallback(); // Nothing to close, so just complete.
        }

        // Close the server to free up resources.
        testServerInstance.close(function(closeError) {
            if (closeError) {
                // Handle any errors that occur during server shutdown.
                console.error("ERROR: Encountered an issue while closing the test server:", closeError.message);
                return completionCallback(closeError);
            }
            testServerInstance = null; // Clear the reference to prevent memory leaks.
            console.log("INFO: Test server closed successfully.");
            completionCallback(); // Indicate successful teardown.
        });
    });

    // --- Individual Test Case: Checking the root endpoint for basic functionality ---
    testCase('should return a successful HTTP response with expected content on root path', function (completionCallback) {
        // Define expected values as constants for clarity and easier modification.
        const EXPECTED_HTTP_STATUS_CODE = 200;
        const EXPECTED_CONTENT_TYPE_PATTERN = /html/;
        const EXPECTED_BODY_TEXT_FRAGMENT = 'Hello, '; // A specific substring expected in the HTML body.

        // Helper function to encapsulate the request initiation, making the test body cleaner.
        const initiateHttpRequest = (serverHandle) => httpTester(serverHandle);

        // Perform the HTTP GET request to the root path using the test server instance.
        const testRequestFlow = initiateHttpRequest(testServerInstance).performGetRequest('/');

        // Apply assertions step-by-step for better readability and debugging.
        testRequestFlow.assertExpectation(EXPECTED_HTTP_STATUS_CODE);
        testRequestFlow.assertExpectation('Content-Type', EXPECTED_CONTENT_TYPE_PATTERN);
        testRequestFlow.assertExpectation(new RegExp(EXPECTED_BODY_TEXT_FRAGMENT)); // Using RegExp constructor for pattern matching.

        // Finalize the request and handle the response.
        testRequestFlow.finalizeTestRequest(function(operationError, httpResponse) {
            if (operationError) {
                console.error("ERROR: Test request to root path failed:", operationError.message);
                return completionCallback(operationError); // Pass the error to the test runner.
            }

            // Additional, explicit validation: check if the response body explicitly contains the expected fragment.
            // This adds robustness beyond Supertest's built-in `expect` for regex.
            if (!httpResponse || !httpResponse.text || !httpResponse.text.includes(EXPECTED_BODY_TEXT_FRAGMENT)) {
                return completionCallback(new Error(`Validation Failed: Response body did not contain the expected text fragment "${EXPECTED_BODY_TEXT_FRAGMENT}".`));
            }

            // All assertions and validations passed successfully.
            completionCallback();
        });
    });

    // --- Added Test Case: Verifying handling of non-existent paths ---
    testCase('should correctly respond with a 404 status for a non-existent path', function(completionCallback) {
        const NOT_FOUND_HTTP_STATUS = 404;
        const NON_EXISTENT_PATH = '/this-route-does-not-exist-12345'; // A deliberately invalid path.

        // Directly use httpTester for this simpler case.
        httpTester(testServerInstance)
            .performGetRequest(NON_EXISTENT_PATH)
            .assertExpectation(NOT_FOUND_HTTP_STATUS) // Expect a 404 Not Found status code.
            .finalizeTestRequest(function(requestError, httpResult) {
                if (requestError) {
                    console.error(`ERROR: Request to ${NON_EXISTENT_PATH} failed unexpectedly:`, requestError.message);
                    return completionCallback(requestError);
                }
                // Optional additional check: verify the content of the 404 page if a specific message is expected.
                // For instance, if the app renders a custom "Not Found" page.
                // if (!httpResult.text.includes('Page Not Found')) {
                //     return completionCallback(new Error('Expected "Page Not Found" message in 404 response.'));
                // }
                completionCallback(); // Test passed successfully.
            });
    });

});