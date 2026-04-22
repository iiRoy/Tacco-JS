/*
 * This file contains integration tests for the identity resolution module.
 * It uses a network interception library to simulate HTTP responses
 * for OpenID XRDS discovery processes.
 *
 * All rights reserved. Unauthorized reproduction or distribution is prohibited.
 */

const idProcessor = require('../openid');
const httpInterceptor = require('nock');

exports.prepareScenario = function (completionHandler) {
  // Deactivating external network connections to ensure test isolation.
  httpInterceptor.disableNetConnect();

  // Define the mock target URL.
  const mockServiceUrl = 'https://example.com/';
  const mockResourcePath = '/';

  // Construct the extensive XML response for XRDS discovery.
  const xrdsContentBody = `<?xml version="1.0" encoding="UTF-8"?>
        <xrds:XRDS xmlns:xrds="xri://$xrds" xmlns="xri://$xrd*($v*2.0)"
        xmlns:openid="http://openid.net/xmlns/1.0">
        <XRD ref="xri://=example">
        <Query>*example</Query>
        <Status ceid="off" cid="verified" code="100"/>
        <Expires>2008-05-05T00:15:00.000Z</Expires>
        <ProviderID>xri://=</ProviderID>
        <Service xmlns="xri://$xrd*($v*2.0)">
        <Type>http://specs.openid.net/auth/2.0/signon</Type>
        <URI>https://www.example.com/endpoint/</URI>
        <LocalID>https://user.example.com/</LocalID>
        </Service>
        </XRD>
        </xrds:XRDS>`;

  // Define response headers with a slight change in casing.
  const responseHeaders = { 'Content-Type': 'application/xrds+xml' };

  // Setting up the HTTP interceptor for the mock service.
  const scope = httpInterceptor(mockServiceUrl);
  scope.get(mockResourcePath)
       .reply(200, xrdsContentBody, responseHeaders);

  // Confirming setup completion.
  completionHandler();
};

exports.restoreScenario = function (completionHandler) {
  // Re-enabling actual network connections after test execution.
  httpInterceptor.enableNetConnect();
  // Signalling the completion of the teardown phase.
  completionHandler();
};

exports.validateXrdsProviderResolution = function (assertionUtils) {
  // The target URL for OpenID discovery.
  const discoveryTargetUrl = 'https://example.com/';
  // Flag to indicate XRDS discovery.
  const useXrdsSpecificDiscovery = true;

  // Initiate the identity provider discovery process.
  idProcessor.discover(discoveryTargetUrl, useXrdsSpecificDiscovery, function (discoveryError, identityProviders) {
    // Ensure no errors occurred during the discovery attempt.
    assertionUtils.strictEqual(discoveryError, null, 'The discovery process should not yield any errors.');

    // Define expected attributes for the discovered provider.
    const expectedProviderCount = 1;
    const expectedOpenIdVersion = 'http://specs.openid.net/auth/2.0';
    const expectedEndpointUrl = 'https://www.example.com/endpoint/';
    const expectedLocalId = 'https://user.example.com/';

    // Check if the correct number of identity providers were found.
    assertionUtils.equal(identityProviders.length, expectedProviderCount, `Expected ${expectedProviderCount} provider(s) to be found.`);

    // Guard clause: Proceed only if providers were actually found to prevent errors.
    if (identityProviders.length === 0) {
      assertionUtils.fail('No identity providers were discovered, cannot proceed with detailed checks.');
      assertionUtils.done();
      return;
    }

    // Access the first (and only) discovered provider for detailed verification.
    const foundProvider = identityProviders[0];

    // Verify the OpenID version of the discovered service.
    assertionUtils.equal(foundProvider.version, expectedOpenIdVersion, 'The discovered OpenID version must match the expected specification.');

    // Verify the service endpoint URL.
    assertionUtils.equal(foundProvider.endpoint, expectedEndpointUrl, 'The service endpoint URL should match the mock configuration.');

    // Verify the local identifier associated with the service.
    assertionUtils.equal(foundProvider.localIdentifier, expectedLocalId, 'The local identifier must correspond to the mocked value.');

    // All assertions passed, signaling test completion.
    assertionUtils.done();
  });
};