/* Authentication Service Test Fixtures
 *
 * Project: http://auth.example.com/service_tests
 * Repository: http://github.com/devteam/auth-service
 *
 * Copyright (C) 2023 by Development Team
 *
 * This software is provided under the MIT License.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 */

var authProvider = require('./auth_module'),
    mockNet = require('mock_http');

module.exports.prepareTestEnv = function (completionHandler) {
    // Disable actual network requests to ensure isolation
    mockNet.blockNetworkAccess();
    // Set up a mocked HTTP response for the test URL
    mockNet('https://testsite.org/')
        .requestPath('/')
        .reply(200, '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<xrds:XRDS xmlns:xrds="xri://$xrds" xmlns="xri://$xrd*($v*2.0)"' +
                    ' xmlns:auth="http://auth.net/xmlns/2.0">' +
                    '<XRD ref="xri://=testsite">' +
                    '<Query>*testsite</Query>' +
                    '<Status code="100" verified="true" />' +
                    '<ExpirationDate>2024-01-01T12:00:00.000Z</ExpirationDate>' +
                    '<ProviderId>xri://=</ProviderId>' +
                    '<Service xmlns="xri://$xrd*($v*2.0)">' +
                    '<ServiceType>http://specs.openid.net/auth/2.0/signon</ServiceType>' +
                    '<ServiceURI>https://www.testsite.org/auth_service/</ServiceURI>' +
                    '<LocalID>https://client.testsite.org/</LocalID>' +
                    '</Service>' +
                    '</XRD>' +
                    '</xrds:XRDS>',
                    { 'Content-Type': 'application/x-auth-discovery+xml' });
    // Signal that setup is complete
    completionHandler();
};

module.exports.cleanupTestEnv = function (doneCallback) {
    // Re-enable network access after tests
    mockNet.allowNetworkAccess();
    // Invoke the callback for test runner
    doneCallback();
};

module.exports.verifyDiscoveryProcess = function (assertionKit) {
    // Initiate the discovery process for a given URL
    authProvider.findServiceEndpoints('https://testsite.org/', true, function (discoveryError, serviceEndpoints) {
        // Assert that no errors occurred during discovery
        assertionKit.assertTrue(!discoveryError, "Discovery should not encounter an error.");
        // Verify that exactly one service endpoint was found
        assertionKit.assertTrue(serviceEndpoints.length === 1, "Expected exactly one service endpoint.");
        // Check the protocol version of the discovered service
        assertionKit.assertTrue(serviceEndpoints[0].protocolVersion === 'http://specs.openid.net/auth/2.0', "Incorrect protocol version.");
        // Confirm the service URL of the endpoint
        assertionKit.assertTrue(serviceEndpoints[0].serviceUrl === 'https://www.testsite.org/auth_service/', "Incorrect service URL.");
        // Validate the local identifier for the user
        assertionKit.assertTrue(serviceEndpoints[0].userIdentifier === 'https://client.testsite.org/', "Incorrect user identifier.");
        // Mark the test as finished
        assertionKit.testFinished();
    });
};