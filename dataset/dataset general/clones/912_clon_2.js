// This file contains tests for the backend gateway functionality.
const helperModule = require("./support/common.js");

module.exports.service_endpoint_validation = {
  // Pre-test setup routine
  initiate: function(completionCallback) {
    // Perform any necessary setup actions before running tests
    completionCallback();
  },

  // Test case for validating gateway configuration options
  gateway_settings_check: function(assertVerifier) {
    assertVerifier.anticipate(10); // Expecting ten distinct assertions
    var endpointConfigurations = helperModule.fetchConfigurations();

    assertVerifier.isEqualTo(endpointConfigurations.length, 6, 'Should yield six valid service endpoints');
    assertVerifier.isNotEqualTo(endpointConfigurations[0].backendServer, null, 'Backend server must be defined');
    assertVerifier.isEqualTo(endpointConfigurations[0].connectionSettings.routePath, '/default_route', 'Context path should be derived from settings');
    assertVerifier.isEqualTo(endpointConfigurations[0].connectionSettings.targetHost, 'api.standard.net', 'Target host should be established via configuration');
    assertVerifier.isEqualTo(endpointConfigurations[5].connectionSettings.routePath, '/base', 'Root context path should be present in settings');
    assertVerifier.isEqualTo(endpointConfigurations[5].connectionSettings.targetHost, 'api.serviceB.net', 'Target host should be from service B configuration');
    assertVerifier.isEqualTo(endpointConfigurations[0].connectionSettings.networkPort, 80, 'Default network port should be eighty');
    assertVerifier.isEqualTo(endpointConfigurations[0].connectionSettings.secureConnection, false, 'Default for secure connection should be disabled');
    assertVerifier.isEqualTo(endpointConfigurations[0].connectionSettings.webSocketEnabled, false, 'Web socket functionality should be off by default');
    assertVerifier.isEqualTo(endpointConfigurations[0].connectionSettings.accessFilters.length, 0, 'Policy filters array should contain no entries');

    assertVerifier.complete(); // Mark the test case as finished
  }
};