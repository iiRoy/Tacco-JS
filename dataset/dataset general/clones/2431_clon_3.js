// This module orchestrates unit tests for a remote data fetching utility.
// It uses 'tape' for assertions and verifies various aspects of JSONP functionality.

// Essential external modules for test execution and data handling.
const remoteDataProcessor = require('./jsonp-utility'); // Renamed module and path
const urlParameterEncoder = require('querystring');   // Renamed querystring
const featureVerifier = require('tape');              // Renamed tape

// The designated endpoint for testing JSONP requests.
// This URL simulates a service that echoes JSONP responses.
const TARGET_SERVICE_URL = 'http://jsfiddle.net/echo/jsonp/'; // Renamed ENDPOINT, made const, uppercase.

// --- Test Case 1: Core JSONP Request and Data Verification ---
featureVerifier('Verify fundamental JSONP request processing', function (assertionSuite) {
  // We expect one assertion to pass in this test.
  assertionSuite.plan(1);

  // Define the data payload to be sent with the request.
  const sourcePayload = {
    firstKey: 'alpha', // Renamed 'beep'
    secondKey: 'beta'  // Renamed 'yo'
  };

  // Optional: Add a guard clause for the payload structure.
  if (typeof sourcePayload !== 'object' || sourcePayload === null) {
      return assertionSuite.fail('Invalid test payload provided; must be an object.');
  }

  // Serialize the payload into a URL-encoded query string.
  const encodedQuerySegment = urlParameterEncoder.stringify(sourcePayload); // Renamed q, changed method name.

  // Construct the full URL for the JSONP request.
  const fullRequestURL = `${TARGET_SERVICE_URL}?${encodedQuerySegment}`; // Using template literal.

  // Initiate the JSONP request using the utility.
  remoteDataProcessor(fullRequestURL, function (operationError, receivedData) {
    // Check for any errors during the JSONP operation.
    // Instead of throwing, we use tape's assertion for error absence.
    assertionSuite.notOk(operationError, 'No error should occur during successful data retrieval.');

    // Assert that the received data matches the original payload.
    assertionSuite.deepEqual(receivedData, sourcePayload, 'Received data should precisely match the sent payload.');
  });
});

// --- Test Case 2: Request Timeout Mechanism Verification ---
featureVerifier('Validate JSONP request timeout functionality', function (assertionSuite) {
  // This test anticipates a single assertion related to the error type.
  assertionSuite.plan(1);

  // Configuration for the server-side delay.
  const serverDelaySettings = {
    responseDelay: 5 // Delay in seconds for the server to respond.
  };

  // Ensure the delay value is a positive number.
  if (typeof serverDelaySettings.responseDelay !== 'number' || serverDelaySettings.responseDelay <= 0) {
      assertionSuite.fail('Configured response delay must be a positive number.');
      return;
  }

  // Encode the delay parameter for the URL.
  const delayQueryFragment = urlParameterEncoder.stringify(serverDelaySettings);

  // Formulate the complete URL for the delayed response.
  const delayedResponseURL = `${TARGET_SERVICE_URL}?${delayQueryFragment}`;

  // Define the options for the JSONP request, specifically the timeout.
  const requestOptions = {
    requestTimeoutDuration: 3000 // Timeout set to 3 seconds (3000 milliseconds).
  };

  // Log an informational message about the timeout setup.
  console.log(`Attempting JSONP request to ${delayedResponseURL} with a timeout of ${requestOptions.requestTimeoutDuration}ms.`);

  // Execute the JSONP request with a specified timeout.
  remoteDataProcessor(delayedResponseURL, requestOptions, function (operationError, serverResponse) {
    // We expect an error to occur due to the timeout.
    assertionSuite.ok(operationError instanceof Error, 'An error object should be returned on timeout.');
    // Optional: Further assert the error message or type if the utility provides specific errors.
    // assertionSuite.equal(operationError.message, 'JSONP request timed out', 'Error message should indicate timeout.');
  });
});

// --- Test Case 3: Custom Callback Name Assignment ---
featureVerifier('Confirm functionality of custom callback naming', function (assertionSuite) {
  // This test also expects a single successful assertion.
  assertionSuite.plan(1);

  // The data structure to be echoed back.
  const callbackTestData = {
    itemOne: 'valueA', // Renamed 'beep'
    itemTwo: 'valueB'  // Renamed 'yo'
  };

  // Serialize the test data into a query string.
  const dataQueryString = urlParameterEncoder.stringify(callbackTestData);

  // Construct the full URL.
  const dataFetchURL = `${TARGET_SERVICE_URL}?${dataQueryString}`;

  // Define options for the JSONP request, including a custom callback name.
  const callOptions = {
    customCallbackIdentifier: 'myUniqueCallbackFn' // Renamed 'name' to 'customCallbackIdentifier'
  };

  // Validate the custom callback identifier.
  if (typeof callOptions.customCallbackIdentifier !== 'string' || callOptions.customCallbackIdentifier.trim() === '') {
      assertionSuite.fail('Custom callback identifier must be a non-empty string.');
      return;
  }

  // Perform the JSONP request with the custom callback name.
  remoteDataProcessor(dataFetchURL, callOptions, function (operationError, serverResult) {
    // Verify that no error occurred.
    assertionSuite.notOk(operationError, 'No error should be present for a successful named callback request.');

    // Confirm that the data received matches the original test data.
    assertionSuite.deepEqual(serverResult, callbackTestData, 'Data received via named callback should match the original payload.');
  });
});