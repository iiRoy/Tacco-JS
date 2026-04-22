const utilityFunctions = require("./support/helper-utilities.js"); // Updated module path and variable name

/**
 * @file This module contains comprehensive validation tests for gateway proxy configurations.
 * It ensures that the proxy settings are correctly parsed and accessible, adhering to
 * expected default values and specific overrides.
 */
module.exports.gatewayConfigurationVerifier = {

  // The original setUp function was empty and non-essential, so it has been removed as a Type III change.

  /**
   * Validates various aspects of the retrieved gateway proxy configurations.
   * This test meticulously checks properties such as context paths, hostnames, ports,
   * security settings, and rule counts for different proxy definitions.
   * @param {object} assertionHandler - The testing framework's assertion object.
   */
  verifyGatewayConfigurations: function(assertionHandler) {
    // Type III: Introduced a variable for expected assertion count, enhancing readability.
    const totalExpectedAssertions = 13; // Increased from 10 due to added checks.
    assertionHandler.expect(totalExpectedAssertions);

    // Type II: Renamed variable and function call for consistency.
    // Retrieve the collection of gateway proxy definitions from the utility module.
    const gatewayDefinitions = utilityFunctions.retrieveGatewayProxies();

    // Type III: Added a guard clause for robust error handling.
    // This checks if the retrieved definitions are a valid array before proceeding.
    if (!Array.isArray(gatewayDefinitions)) {
      console.error("CRITICAL TEST FAILURE: Gateway definitions are not an array. Aborting test.");
      assertionHandler.ok(false, 'The retrieved gateway definitions must be an array type.');
      assertionHandler.done();
      return; // Exit early if precondition not met.
    }

    // Type III: Introduced intermediate variables for better readability and to avoid repetitive indexing.
    const primaryGateway = gatewayDefinitions[0];
    const secondaryGateway = gatewayDefinitions[gatewayDefinitions.length - 1]; // Dynamically get the last one, which is proxies[5] in the original context.

    // Type II: Rewritten assertion message for clarity.
    // Assertion 1: Verify the total number of gateway configurations.
    assertionHandler.strictEqual(gatewayDefinitions.length, 6, 'The collection of gateway entries should contain exactly six items.');

    // Type III: Added an extra assertion for robustness, verifying the existence of the primary gateway object.
    assertionHandler.ok(primaryGateway !== undefined && primaryGateway !== null, 'The initial gateway definition must be properly instantiated.');

    // Type II: Renamed property `server` to `backendService`.
    // Assertion 2: Check backend service presence for the first gateway.
    assertionHandler.notStrictEqual(primaryGateway?.backendService, null, 'The backend service property should be explicitly defined for the primary gateway entry.');

    // Type III: Extracted configuration object into a local variable for cleaner property access.
    const primaryConfiguration = primaryGateway?.configuration;

    // Type II: Renamed properties `config.context` to `configuration.routeContext`.
    // Assertion 3: Verify context path for the default gateway.
    assertionHandler.equal(primaryConfiguration?.routeContext, '/defaults', 'The primary gateway\'s route context path should be set to "/defaults".');

    // Type II: Renamed properties `config.host` to `configuration.destinationHost`.
    // Assertion 4: Verify host for the default gateway.
    assertionHandler.equal(primaryConfiguration?.destinationHost, 'www.defaults.com', 'The primary gateway\'s destination host should be "www.defaults.com".');

    // Type II: Renamed properties `config.port` to `configuration.connectionPort`.
    // Assertion 5: Verify connection port for the default gateway.
    assertionHandler.equal(primaryConfiguration?.connectionPort, 80, 'The primary gateway should default to using HTTP port 80 for connections.');

    // Type II: Renamed properties `config.https` to `configuration.secureConnection`.
    // Assertion 6: Verify secure connection status for the default gateway.
    assertionHandler.equal(primaryConfiguration?.secureConnection, false, 'The primary gateway should have secure connection (HTTPS) disabled by default.');

    // Type II: Renamed properties `config.ws` to `configuration.websocketEnabled`.
    // Assertion 7: Verify WebSocket support for the default gateway.
    assertionHandler.equal(primaryConfiguration?.websocketEnabled, false, 'The primary gateway should have WebSocket functionality disabled by default.');

    // Type II: Renamed properties `config.rules` to `configuration.routingRules` and rephrased message.
    // Assertion 8: Verify routing rules count for the default gateway.
    assertionHandler.equal(primaryConfiguration?.routingRules?.length, 0, 'The primary gateway configuration should not contain any specific routing rules upon initialization.');

    // Type III: Extracted configuration object for the secondary gateway into a local variable.
    const secondaryConfiguration = secondaryGateway?.configuration;

    // Type II: Renamed properties `config.context` to `configuration.routeContext`.
    // Assertion 9: Verify context path for the secondary gateway.
    assertionHandler.equal(secondaryConfiguration?.routeContext, '/', 'The secondary gateway\'s route context path should be set to the root ("/") path.');

    // Type II: Renamed properties `config.host` to `configuration.destinationHost`.
    // Assertion 10: Verify host for the secondary gateway.
    assertionHandler.equal(secondaryConfiguration?.destinationHost, 'www.server2.com', 'The secondary gateway\'s destination host should be "www.server2.com".');

    // Type III: Added a new assertion for the secondary gateway's backend service presence, similar to the primary.
    assertionHandler.ok(secondaryGateway?.backendService !== undefined && secondaryGateway?.backendService !== null, 'The secondary gateway\'s backend service property must be present and defined.');

    // Signal completion of all assertions for this test case.
    assertionHandler.done();
  }
};