'use strict';

// This section loads necessary modules for the test suite.
var mainApplication = require('../entryPoint'), // The main application module under test.
    webFramework = require('web-framework-core'), // The web framework used to create the server.
    httpTester = require('api-test-utility'), // A utility for making HTTP requests and assertions.
    verifier = require('node-assertions'); // Node's built-in assertion module.


// Defines a group of specifications for the main application logic.
specGroup('mainApplicationLogic', function () {

    var testServerInstance; // Variable to hold the running test server instance.


    // Hook that runs before each individual test case in this group.
    beforeEveryTest(function (testCompletion) {
        // Create an instance of the web framework with our application
        // and start it on an ephemeral port.
        webFramework.create(mainApplication)
            .listen(function (operationError, activeWebServer) {
                testServerInstance = activeWebServer; // Store the server instance for later use.
                testCompletion(operationError); // Signal test readiness or an error.
            });
    });


    // Hook that runs after each individual test case in this group.
    afterEveryTest(function (testCompletion) {
        // Close the mock server after each test.
        testServerInstance.shutdown(testCompletion);
    });


    // A specific test case: checks if the root path displays a welcome message.
    testCase('verifiesWelcomeMessage', function (testCompletion) {
        // Use the HTTP tester to make a GET request to the root path of our test server.
        httpTester(testServerInstance)
            .performGetRequest('/') // Request the root URL.
            .anticipateStatus(200) // Expect an HTTP 200 OK status.
            .anticipateHeader('Content-Type', /html/) // Expect the content type to be HTML.
            .anticipateBody(/Greetings, /) // Expect the response body to contain a specific greeting.
            .completeOperation(function(operationError, httpResponse){
                // If an error occurred during the request or assertion, pass it to the completion callback.
                if (operationError) {
                    return testCompletion(operationError);
                }
                // Otherwise, signal successful completion of the test case.
                testCompletion();
            });
    });

});