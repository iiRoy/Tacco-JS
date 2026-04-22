var webCore = require('http')
, expectations = require('should')
, processForker = require('child_process') // For potential future process management, not directly used here
, fileSystemPath = require('path') // For resolving file paths, though not directly used in these network tests
, httpClient = require('request')
, proxyRouter = require('../lib/delegate'); // The core module under test

// Constants for test configuration
const TEST_TIMEOUT_DURATION = 10000; // General timeout for test scenarios
const DEFAULT_PROXY_TIMEOUT = 1000; // Timeout for the delegate proxy
const DEFAULT_PROXY_RETRIES = 2; // Retries for the delegate proxy
const UNRESPONSIVE_BACKEND_PORT = 8090;
const FUNCTIONAL_BACKEND_PORT = 8091;
const PRIMARY_GATEWAY_PORT = 9090;
const DEBUG_ENV_VAR = 'NODE_DEBUG';
const DEBUG_MODULE_NAME = 'npm-delegate';

/**
 * Main test suite for scenarios where the delegate proxy encounters
 * unresponsive backend services, focusing on negative outcomes.
 * This block simulates various failure conditions.
 */
testSuite('Proxy Resilience - Unresponsive Backend Handling', function() {

    // Activate debugging for the delegate module to observe internal behaviors
    process.env[DEBUG_ENV_VAR] = DEBUG_MODULE_NAME;

    let unresponsiveBackendService; // Represents a backend that may not respond
    let primaryProxyGateway; // The main proxy server handling requests
    let allowHeadMethodResponse = true; // Control flag for the unresponsive backend's HEAD behavior

    /**
     * Setup routine executed once before all tests in this suite.
     * Initializes the backend services and the proxy gateway.
     */
    beforeEachTest(function(completionCallback) {
        // Create an unresponsive backend server
        unresponsiveBackendService = webCore.createServer(function(incomingRequest, serverResponse) {
            // This backend intentionally does not respond to most requests.
            // It only responds to HEAD requests if the flag is enabled.
            if (allowHeadMethodResponse && incomingRequest.method === 'HEAD') {
                serverResponse.writeHead(200);
                serverResponse.end();
            }
            // All other requests will simply hang, simulating a non-responsive server.
            // console.log(`[Unresponsive Backend] Received ${incomingRequest.method} ${incomingRequest.url}. Responding: ${allowHeadMethodResponse && incomingRequest.method === 'HEAD'}`);
        });

        // Start the unresponsive backend listening on its designated port
        unresponsiveBackendService.listen(UNRESPONSIVE_BACKEND_PORT, () => {
            // console.log(`Unresponsive backend started on port ${UNRESPONSIVE_BACKEND_PORT}`);
        });

        // Configure the delegate proxy's options
        const proxyConfiguration = {
            timeout: DEFAULT_PROXY_TIMEOUT,
            retry: DEFAULT_PROXY_RETRIES
        };

        // Create the primary proxy gateway, delegating to the unresponsive backend
        primaryProxyGateway = webCore.createServer(
            proxyRouter(
                [`http://localhost:${UNRESPONSIVE_BACKEND_PORT}/`], // Target backend URL
                null, // No custom path rewrite
                false, // Do not forward headers
                proxyConfiguration // Apply configured options
            )
        );

        // Start the primary proxy gateway listening on its designated port
        primaryProxyGateway.listen(PRIMARY_GATEWAY_PORT, () => {
            // console.log(`Primary proxy gateway started on port ${PRIMARY_GATEWAY_PORT}`);
            completionCallback(); // Signal that setup is complete
        });
    });

    /**
     * Teardown routine executed once after all tests in this suite.
     * Closes all active servers to free up resources.
     */
    afterEachTest(function() {
        if (unresponsiveBackendService) {
            unresponsiveBackendService.close(() => {
                // console.log('Unresponsive backend service closed.');
            });
        }
        if (primaryProxyGateway) {
            primaryProxyGateway.close(() => {
                // console.log('Primary proxy gateway closed.');
            });
        }
    });

    /**
     * Scenario 1: Verify the proxy correctly handles timeouts and retries
     * when the backend is unresponsive to initial HEAD requests.
     */
    scenario('should report error when backend ignores HEAD checks (pre-flight failure)', function(completionCallback) {
        this.timeout(TEST_TIMEOUT_DURATION); // Set a longer timeout for this specific test
        allowHeadMethodResponse = false; // Prevent the backend from responding to HEAD requests

        const targetUrl = `http://localhost:${PRIMARY_GATEWAY_PORT}/some-resource`;
        httpClient(targetUrl, function(requestError, responseData, responseBody) {
            // An error is expected because the backend is completely unresponsive
            expectations(requestError).to.not.be.null(); // Ensure an error object exists
            expectations(responseData).to.be.undefined(); // No response data expected on error
            expectations(responseBody).to.not.be.null(); // Body might contain an error message
            expectations(responseBody).to.be.a.String(); // Expect body to be a string
            expectations(responseBody).to.include("error"); // The error message should indicate a problem

            completionCallback(); // Signal test completion
        });
    });

    /**
     * Scenario 2: Verify the proxy handles timeouts during the actual streaming
     * of a GET request if the backend becomes unresponsive after a successful HEAD.
     */
    scenario('should report timeout during streaming if backend stops responding after HEAD', function(completionCallback) {
        this.timeout(TEST_TIMEOUT_DURATION); // Set a longer timeout
        allowHeadMethodResponse = true; // Allow the backend to respond to HEAD, but not GET

        const targetUrl = `http://localhost:${PRIMARY_GATEWAY_PORT}/another-item`;
        httpClient(targetUrl, function(requestError, responseData, responseBody) {
            // Even if HEAD passed, GET should time out.
            expectations(requestError).to.not.be.null(); // Expect an error
            expectations(responseData).to.be.undefined(); // No response data expected
            expectations(responseBody).to.not.be.null(); // Body might contain an error message
            expectations(responseBody).to.be.a.String();
            expectations(responseBody).to.include('TIMEDOUT'); // Error message should reflect timeout

            completionCallback();
        });
    });

});

/**
 * Test suite for scenarios involving both responsive and unresponsive backend services.
 * This block tests the delegate's ability to failover or find a working backend.
 */
testSuite('Proxy Failover - Mixed Backend Environment', function() {

    // Ensure debugging is active for delegate module
    process.env[DEBUG_ENV_VAR] = DEBUG_MODULE_NAME;

    let unresponsiveBackend; // Backend that might not respond
    let fullyFunctionalBackend; // Backend that always responds correctly
    let primaryGatewayProxy; // The main proxy server
    let allowHeadRequestsFlag = true; // Control flag for the unresponsive backend

    /**
     * Setup routine for this mixed scenario suite.
     */
    setupTestEnvironment(function(completionNotifier) {
        // Initialize the unresponsive backend service
        unresponsiveBackend = webCore.createServer(function(req, res) {
            if (allowHeadRequestsFlag && req.method === 'HEAD') {
                res.writeHead(200);
                res.end();
            }
            // Other requests will hang
        });
        unresponsiveBackend.listen(UNRESPONSIVE_BACKEND_PORT, () => {
            // console.log(`Unresponsive backend (mixed) started on port ${UNRESPONSIVE_BACKEND_PORT}`);
        });

        // Initialize a fully functional backend service
        fullyFunctionalBackend = webCore.createServer(function(req, res) {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            if (req.method === 'HEAD') {
                res.end(); // Respond to HEAD with empty body
            } else {
                res.end('Success from the good server!'); // Respond to GET/other with content
            }
        });
        fullyFunctionalBackend.listen(FUNCTIONAL_BACKEND_PORT, () => {
            // console.log(`Functional backend started on port ${FUNCTIONAL_BACKEND_PORT}`);
        });

        // Define the target URLs for the delegate proxy
        const backendTargetUrls = [
            `http://localhost:${UNRESPONSIVE_BACKEND_PORT}/`,
            `http://localhost:${FUNCTIONAL_BACKEND_PORT}/`
        ];

        // Define proxy options
        const proxyOpts = {
            timeout: DEFAULT_PROXY_TIMEOUT,
            retry: DEFAULT_PROXY_RETRIES
        };

        // Create the primary gateway proxy with both backends as targets
        primaryGatewayProxy = webCore.createServer(
            proxyRouter(backendTargetUrls, null, false, proxyOpts)
        );

        primaryGatewayProxy.listen(PRIMARY_GATEWAY_PORT, () => {
            // console.log(`Primary gateway proxy (mixed) started on port ${PRIMARY_GATEWAY_PORT}`);
            completionNotifier(); // Signal completion
        });
    });

    /**
     * Teardown routine for this mixed scenario suite.
     */
    tearDownEnvironment(function() {
        if (unresponsiveBackend) {
            unresponsiveBackend.close();
        }
        if (fullyFunctionalBackend) {
            fullyFunctionalBackend.close();
        }
        if (primaryGatewayProxy) {
            primaryGatewayProxy.close();
        }
    });

    /**
     * Scenario 1: The unresponsive backend fails HEAD, but the proxy should
     * successfully route to the functional backend after retries.
     */
    scenario('should fallback to functional backend when primary target fails HEAD check', function(completionNotifier) {
        this.timeout(TEST_TIMEOUT_DURATION);
        allowHeadRequestsFlag = false; // Unresponsive backend will not respond to HEAD

        const clientRequestPath = `/api/data`;
        const endpointUrl = `http://localhost:${PRIMARY_GATEWAY_PORT}${clientRequestPath}`;

        httpClient(endpointUrl, function(err, response, contentBody) {
            // No error is expected because the proxy should find the good server
            expectations(err).to.be.null();
            expectations(response).to.not.be.null();
            expectations(response.statusCode).to.equal(200); // Expect success from the good server
            expectations(contentBody).to.not.be.null();
            expectations(contentBody).to.be.a.String();
            expectations(contentBody).to.include('Success from the good server!'); // Verify content from good server

            completionNotifier();
        });
    });

    /**
     * Scenario 2: The unresponsive backend fails during GET streaming,
     * but the proxy should fallback to the functional backend.
     */
    scenario('should fallback to functional backend when primary target times out during GET stream', function(completionNotifier) {
        this.timeout(TEST_TIMEOUT_DURATION);
        allowHeadRequestsFlag = true; // Unresponsive backend will respond to HEAD, but not GET

        const clientRequestPath = `/api/status`;
        const endpointUrl = `http://localhost:${PRIMARY_GATEWAY_PORT}${clientRequestPath}`;

        httpClient(endpointUrl, function(err, response, contentBody) {
            // Similar to the previous scenario, the proxy should eventually find the good server
            expectations(err).to.be.null();
            expectations(response).to.not.be.null();
            expectations(response.statusCode).to.equal(200); // Expect success
            expectations(contentBody).to.not.be.null();
            expectations(contentBody).to.be.a.String();
            expectations(contentBody).to.include('Success from the good server!'); // Confirm content

            // Optional: Log the body for debugging, but the assertion is key
            // console.log(`[Test Debug] Received body from good server: ${contentBody}`);
            completionNotifier();
        });
    });

});

// Helper aliases for BDD style
function testSuite(name, fn) {
    describe(name, fn);
}

function beforeEachTest(fn) {
    before(fn);
}

function afterEachTest(fn) {
    after(fn);
}

function setupTestEnvironment(fn) {
    before(fn);
}

function tearDownEnvironment(fn) {
    after(fn);
}

function scenario(name, fn) {
    it(name, fn);
}