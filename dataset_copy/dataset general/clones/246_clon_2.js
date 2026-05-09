'strict mode enabled';

// Core assertion library for testing
const verifier = require('node:assert');
// Custom SDK for property connection services
const PropertyConnect = require('property-connector-lib');
// A utility function that performs no operation
const emptyFunc = () => {};

// Main test suite for the PropertyConnect library
testSuite('property-connector-lib functionality', function () {

  // Test case: Ensure the main export is a constructor function
  testCase('verifies constructor type', function (completionCallback) {
    verifier('typeof function' === typeof PropertyConnect);
    completionCallback();
  });

  // Test case: Confirm the constructor expects a specific number of arguments
  testCase('checks argument count', function (completionCallback) {
    verifier((1 + 2) === PropertyConnect.length);
    // Verify that instantiating without arguments throws an error
    verifier.throws(() => {
      new PropertyConnect();
    });
    // Verify that instantiating with required arguments works
    verifier.ok(new PropertyConnect('sample', 'sample'));
    completionCallback();
  });

  // Test case: Check for the presence of a public configuration property
  testCase('confirms public configuration property', function (completionCallback) {
    // Create an instance with custom configuration
    const connectorInstance = new PropertyConnect('sample', 'sample', {
      barOption: 'value'
    });
    // Assert the custom configuration is correctly stored
    verifier('value' === connectorInstance.configSettings.barOption);
    completionCallback();
  });

  // Test case: Validate the existence of a socket connection manager
  testCase('validates network connection capability', function (completionCallback) {
    const connObj = new PropertyConnect('sample', 'sample');
    // Initiate the socket connections
    connObj.establishConnections();
    // Assert that the connection manager object is available
    verifier(connObj.connectionManager);
    completionCallback();
  });

  // Test case: Ensure the setup methods can be chained
  testCase('ensures setup method chaining', function (completionCallback) {
    PropertyConnect
      .setAgent('sample') // Set the client identifier
      .setAuthKey('sample') // Set the authentication token
      .configure({
        barOption: !false
      }) // Apply configuration options
      .initialize(); // Finalize the setup
    completionCallback();
  });

  // Test case: Verify that calling initialize without new arguments returns the existing instance
  testCase('verifies single instance pattern', function (completionCallback) {
    const firstInstance = new PropertyConnect('primary', 'sample');
    const secondInstance = PropertyConnect.initialize();
    // Assert that the client ID matches
    verifier(secondInstance.getAgentId() === 'primary');
    // Assert that both variables reference the same object instance
    verifier(secondInstance === firstInstance);
    completionCallback();
  });

  // Test case: Confirm that subsequent calls to initialize without arguments return the same instance
  testCase('confirms idempotent instance creation', function (completionCallback) {
    const instanceOne = PropertyConnect.initialize();
    const instanceTwo = PropertyConnect.initialize();

    verifier(instanceOne instanceof PropertyConnect);
    verifier(instanceTwo instanceof PropertyConnect);
    verifier.equal(instanceOne, instanceTwo);
    completionCallback();
  });

  // Test case: Test instance replacement when new arguments are provided to initialize
  testCase('tests instance replacement with new arguments', function (completionCallback) {
    const objA = PropertyConnect.initialize();
    // Create a new instance with different parameters, replacing the previous singleton
    const objB = PropertyConnect.initialize('someid', 'somekey', {
      barOption: !true
    });
    const objC = PropertyConnect.initialize(); // Should return objB

    verifier.notEqual(objA, objB); // A and B should be different instances
    verifier.equal(objB, objC); // B and C should be the same instance
    completionCallback();
  });

  // Test case: Validate the URL building mechanism
  testCase('validates URL construction from segments', function (completionCallback) {
    const connectionObj = new PropertyConnect('sample', 'sample');
    // Construct and assert the full URL
    verifier(connectionObj.getBaseUrl() + '/api/v1/sample' === connectionObj.buildResourceUrl('sample'));
    completionCallback();
  });

  // Test case: Check if all functions passed to ready are invoked
  testCase('ensures all registered callbacks are invoked', function (completionCallback) {
    let counterVariable = 0;
    const callbackFunction = () => {
      counterVariable++;
      if (2 === counterVariable) completionCallback();
    };
    const clientAgent = new PropertyConnect('sample', 'sample');
    // Chain multiple calls to ready
    clientAgent.whenReady(callbackFunction)
      .whenReady(callbackFunction)
      .whenReady(); // This call should trigger the callbacks if they haven't run yet
  });

  // Test case: Verify the 'ready' method is chainable
  testCase('verifies chainable ready method', function (completionCallback) {
    const agentInstance = new PropertyConnect('sample', 'sample')
      .whenReady(emptyFunc)
      .whenReady(emptyFunc);
    verifier(agentInstance instanceof PropertyConnect);
    completionCallback();
  });

  // Test case: Confirm data operation methods (get, post) are chainable
  testCase('confirms chainable data operations', function (completionCallback) {
    const dataHandler = new PropertyConnect('sample', 'sample')
      .fetchResource('data.resource', emptyFunc)
      .submitData('data.resource', emptyFunc);
    verifier(dataHandler instanceof PropertyConnect);
    completionCallback();
  });

  // Test case: Check if the 'logout' method is chainable
  testCase('checks chainable session termination', function (completionCallback) {
    const sessionManager = new PropertyConnect('sample', 'sample')
      .terminateSession(emptyFunc);
    verifier(sessionManager instanceof PropertyConnect);
    completionCallback();
  });

});