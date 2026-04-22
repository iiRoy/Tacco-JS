// This module provides foundational testing utilities for the environment.
const testSupport = require('../support/test-utils');

// We utilize Node.js's built-in assertion module for verification steps.
const verifier = require('assert');

// Importing the core message parsing component from the library.
const ProtocolCore = require('../../lib').Base;

// A constant for the standard line termination sequence used in messages.
const LINE_TERMINATOR = '\r\n';

// Initiate the primary test suite for the ProtocolCore class's functionalities.
suite('Core Message Processing Unit', function () {

  // Scenario block focusing on the utility for extracting the initial command.
  scenario('Command Extraction Routine', function () {

    // Test case: Verifies that the method correctly isolates the leading command.
    testCase('successfully identifies the primary command from a well-formed message', function () {
      // Instantiate a new parser object for isolation.
      const messageHandler = new ProtocolCore();

      // Construct a sample raw network packet as a multi-line string.
      const inputPacket = [
        'INITIATE /some/resource HTTP/1.1',
        'Cache-Control: no-cache',
        'User-Agent: TestClient/1.0',
        'Arbitrary body content starts here'
      ].join(LINE_TERMINATOR);

      // Execute the internal method to retrieve the command.
      const parsedCommand = messageHandler._getMethod(inputPacket);

      // Validate the type and content of the extracted command.
      verifier.ok(typeof parsedCommand === 'string', 'The extracted command must be a string data type.');
      verifier.strictEqual(parsedCommand, 'INITIATE', 'The first word of the initial line should be returned as the command.');
    });

    // Test case: Ensures robustness against malformed or empty message inputs.
    testCase('handles messages with unusual or missing initial commands gracefully', function () {
      const handlerInstance = new ProtocolCore();

      // Test with a packet where the first line starts with whitespace.
      const leadingSpacePacket = [
        '   GET /path HTTP/1.0',
        'Host: example.com'
      ].join(LINE_TERMINATOR);

      // Test with an entirely empty input string.
      const voidPacket = '';

      // Test with a packet containing only a line terminator.
      const emptyLinePacket = LINE_TERMINATOR;

      // Assert expected behavior for various malformed inputs.
      verifier.strictEqual(handlerInstance._getMethod(leadingSpacePacket), '', 'Should return an empty string for a command line starting with spaces.');
      verifier.strictEqual(handlerInstance._getMethod(voidPacket), '', 'Should return an empty string for an entirely empty message.');
      verifier.strictEqual(handlerInstance._getMethod(emptyLinePacket), '', 'Should return an empty string for a message consisting only of a line break.');
    });
  });

  // Scenario block focusing on the header field parsing utility.
  scenario('Header Field Parsing Mechanism', function () {

    // Test case: Validates the accurate extraction of key-value header pairs.
    testCase('correctly extracts and normalizes header key-value pairs', function () {
      // Create a dedicated processor instance for this test.
      const dataProcessor = new ProtocolCore();

      // Define a comprehensive input payload containing diverse header formats.
      const complexPayload = [
        'POST /api/data HTTP/1.1',
        'Content-Type: application/json; charset=utf-8',
        'X-Request-ID :   abc-123 ', // Header with extra spaces around colon
        'Accept-Encoding: gzip, deflate',
        'Host: local.test',
        'This line is part of the body, no header here',
        '  Another-Custom-Header : value with spaces ' // Indented header
      ].join(LINE_TERMINATOR);

      // Invoke the internal method to obtain the header attributes.
      const retrievedAttributes = dataProcessor._getHeaders(complexPayload);

      // Perform initial validation on the returned object.
      verifier.ok(retrievedAttributes && typeof retrievedAttributes === 'object', 'The result of header parsing must be a valid object.');

      // Check for a non-header line to ensure it's not mistakenly parsed.
      verifier.ok(!retrievedAttributes['THIS LINE IS PART OF THE BODY'], 'Content lines without a colon should not be parsed as headers.');

      // Define expected header keys for dynamic counting and assertion.
      const expectedKeys = ['CONTENT-TYPE', 'X-REQUEST-ID', 'ACCEPT-ENCODING', 'HOST', 'ANOTHER-CUSTOM-HEADER'];
      verifier.strictEqual(Object.keys(retrievedAttributes).length, expectedKeys.length, `Expected exactly ${expectedKeys.length} headers to be parsed.`);

      // Assert the values of specific headers, accounting for case insensitivity in keys.
      verifier.strictEqual(retrievedAttributes['CONTENT-TYPE'], 'application/json; charset=utf-8', 'Content-Type header value mismatch.');
      verifier.strictEqual(retrievedAttributes['X-REQUEST-ID'], 'abc-123', 'X-Request-ID header value should be trimmed.');
      verifier.strictEqual(retrievedAttributes['ACCEPT-ENCODING'], 'gzip, deflate', 'Accept-Encoding header value mismatch.');
      verifier.strictEqual(retrievedAttributes['HOST'], 'local.test', 'Host header value mismatch.');
      verifier.strictEqual(retrievedAttributes['ANOTHER-CUSTOM-HEADER'], 'value with spaces', 'Indented custom header value mismatch.');
    });

    // Test case: Confirms correct behavior when a message contains no headers.
    testCase('appropriately handles messages that lack any header fields', function () {
      const processorInstance = new ProtocolCore();
      // A simple message with only a status line and body, no headers.
      const simpleResponse = 'HTTP/1.0 200 OK' + LINE_TERMINATOR + LINE_TERMINATOR + 'This is the body content.';
      const headerlessResult = processorInstance._getHeaders(simpleResponse);

      // Verify that an empty object is returned, indicating no headers were found.
      verifier.ok(headerlessResult && typeof headerlessResult === 'object', 'Result for headerless message should still be an object.');
      verifier.strictEqual(Object.keys(headerlessResult).length, 0, 'No headers should be identified in a message without header lines.');
    });
  });
});