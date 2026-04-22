const webProto = require('http');
const assertOps = require('assert');

// --- Custom Test Execution Framework ---
const testCaseQueue = [];
let defaultScenarioInterval = 5000; // Default scenario timeout in milliseconds

/**
 * Creates a new logical grouping for test scenarios.
 * @param {string} groupLabel - The descriptive name for the test group.
 * @param {Function} groupSetupFn - An async function to execute before any scenarios in the group.
 *                                   `this` context provides `tearDown` property for cleanup.
 */
function createTestGroup(groupLabel, groupSetupFn) {
    testCaseQueue.push({ label: groupLabel, scenarios: [], setup: groupSetupFn });
}

/**
 * Defines an individual test scenario within the current test group.
 * @param {string} scenarioLabel - The descriptive name for the scenario.
 * @param {Function} scenarioTestFn - An async function containing the test logic.
 *                                    `this` context provides `setScenarioTimeout(ms)` to override default timeout.
 */
function defineScenario(scenarioLabel, scenarioTestFn) {
    if (testCaseQueue.length === 0) {
        throw new Error('Scenarios must be defined within a test group created by `createTestGroup`.');
    }
    const currentGroup = testCaseQueue[testCaseQueue.length - 1];
    currentGroup.scenarios.push({ label: scenarioLabel, func: scenarioTestFn });
}

/**
 * Executes all defined test groups and their scenarios sequentially.
 * Reports success or failure and exits on the first failure.
 */
async function commenceTesting() {
    console.log('Initiating custom test sequence...');
    for (const group of testCaseQueue) {
        console.log(`\nTest Group: ${group.label}`);
        const groupExecutionContext = {}; // Context for setup/teardown within the group
        try {
            // Execute group setup function
            await group.setup.call(groupExecutionContext);

            for (const scenario of group.scenarios) {
                console.log(`  Scenario: ${scenario.label}`);
                const scenarioExecutionContext = {
                    ...groupExecutionContext, // Inherit context from group setup
                    setScenarioTimeout: (ms) => { defaultScenarioInterval = ms; } // Allow per-scenario timeout adjustment
                };
                let timeoutHandle;
                try {
                    const scenarioPromise = new Promise(async (resolve, reject) => {
                        try {
                            await scenario.func.call(scenarioExecutionContext);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    });

                    // Implement scenario timeout
                    timeoutHandle = setTimeout(() => {
                        throw new Error(`Scenario exceeded allotted time (${defaultScenarioInterval}ms)`);
                    }, defaultScenarioInterval);

                    await scenarioPromise;
                    console.log(`    ✓ Concluded successfully`);
                } catch (e) {
                    console.error(`    ✗ FAILED: ${e.message}`);
                    if (e.stack) {
                        console.error(e.stack);
                    }
                    process.exit(1); // Terminate on first scenario failure
                } finally {
                    clearTimeout(timeoutHandle);
                    defaultScenarioInterval = 5000; // Reset timeout for subsequent scenarios
                }
            }
        } finally {
            // Execute group teardown function if defined
            if (groupExecutionContext.tearDown) {
                await groupExecutionContext.tearDown();
            }
        }
    }
    console.log('\nAll custom tests finished.');
}

// --- Custom Assertion Utility (replacement for 'should') ---
class VerificationAgent {
    constructor(evaluationTarget) {
        this.target = evaluationTarget;
    }

    /** Asserts strict equality. */
    isIdenticalTo(expectedValue) {
        assertOps.strictEqual(this.target, expectedValue, `Expected ${this.target} to be identical to ${expectedValue}`);
        return this;
    }

    /** Asserts that a string includes a specific substring. */
    containsSubstring(segment) {
        assertOps.ok(typeof this.target === 'string' && this.target.includes(segment), `Expected "${this.target}" to contain "${segment}"`);
        return this;
    }

    /** Asserts that a number is greater than another. */
    isAbove(threshold) {
        assertOps.ok(this.target > threshold, `Expected ${this.target} to be greater than ${threshold}`);
        return this;
    }
    // Additional assertion methods can be added here as needed
}

/**
 * Initiates an assertion chain for a given value.
 * @param {*} value - The value to be asserted.
 * @returns {VerificationAgent} An object with assertion methods.
 */
function verifyValue(value) {
    return new VerificationAgent(value);
}

// --- Custom HTTP Client for Tests (replacement for 'request') ---
/**
 * Makes an HTTP GET request and passes response data to a callback.
 * @param {string} targetUrl - The URL to request.
 * @param {Function} responseCallback - Callback(error, httpResponse, bodyContent).
 */
function performClientRequest(targetUrl, responseCallback) {
    const { hostname, port, pathname } = new URL(targetUrl);
    const connectionOptions = {
        hostname: hostname,
        port: port,
        path: pathname,
        method: 'GET',
    };

    const outboundQuery = webProto.request(connectionOptions, (upstreamResponse) => {
        let accumulatedData = '';
        upstreamResponse.on('data', (chunk) => {
            accumulatedData += chunk.toString();
        });
        upstreamResponse.on('end', () => {
            responseCallback(null, upstreamResponse, accumulatedData);
        });
    });

    outboundQuery.on('error', (problem) => {
        responseCallback(problem);
    });

    outboundQuery.end();
}

// --- Custom Proxy/Load Balancer Logic (replacement for 'delegate') ---
/**
 * Creates an HTTP request handler that proxies incoming requests to a list of upstream services.
 * Implements timeout and retry logic.
 * @param {string[]} upstreamDestinations - Array of upstream base URLs.
 * @param {*} _param1 - Unused parameter (matches original signature).
 * @param {*} _param2 - Unused parameter (matches original signature).
 * @param {{timeout: number, retry: number}} configuration - Proxy configuration.
 * @returns {Function} An async request handler for `http.createServer`.
 */
function requestRouter(upstreamDestinations, _param1, _param2, configuration) {
    const { timeout, retry } = configuration;

    return async (incomingRequest, outgoingResponse) => {
        let currentDestinationIndex = 0;
        let lastReportedError = 'Proxy Error: No upstream services available or all failed.'; // Default message

        /**
         * Attempts to proxy a single request to a given upstream URL.
         * @param {string} destinationUrl - The base URL of the upstream service.
         * @returns {Promise<void>} Resolves on success, rejects on error/timeout.
         */
        const executeProxyAttempt = async (destinationUrl) => {
            return new Promise((resolve, reject) => {
                const { hostname, port, pathname } = new URL(destinationUrl + incomingRequest.url);
                const proxyConnectionSettings = {
                    hostname: hostname,
                    port: port,
                    path: pathname,
                    method: incomingRequest.method,
                    headers: incomingRequest.headers,
                };

                const proxyOutbound = webProto.request(proxyConnectionSettings, (upstreamReply) => {
                    outgoingResponse.writeHead(upstreamReply.statusCode, upstreamReply.headers);
                    upstreamReply.pipe(outgoingResponse);
                    upstreamReply.on('end', resolve);
                    upstreamReply.on('error', reject); // Catch errors during response streaming
                });

                proxyOutbound.on('error', reject); // Catch connection/request errors

                // Implement timeout for the proxy request
                const connectionTimeout = setTimeout(() => {
                    proxyOutbound.destroy(new Error('TIMEDOUT')); // Force error on timeout
                }, timeout);

                incomingRequest.pipe(proxyOutbound); // Pipe incoming request body to upstream

                // Clear timeout once request/response cycle completes or fails
                proxyOutbound.on('close', () => clearTimeout(connectionTimeout));
                proxyOutbound.on('finish', () => clearTimeout(connectionTimeout));
            });
        };

        /**
         * Attempts to connect to a single upstream, with retries.
         * @param {string} destinationUrl - The upstream base URL.
         * @param {number} remainingAttempts - Number of retries left (initial attempt + retries).
         * @returns {Promise<boolean>} True if successful, throws an error if all attempts fail.
         */
        const tryDestinationWithRetries = async (destinationUrl, remainingAttempts) => {
            try {
                await executeProxyAttempt(destinationUrl);
                return true; // Success
            } catch (problemReport) {
                // Check for specific retryable errors
                if (problemReport.message === 'TIMEDOUT' || problemReport.code === 'ECONNREFUSED' || problemReport.code === 'ENOTFOUND') {
                    if (remainingAttempts > 0) {
                        console.log(`  Router: Retrying upstream ${destinationUrl} (${remainingAttempts} attempts remaining) due to ${problemReport.message || problemReport.code}`);
                        await new Promise(res => setTimeout(res, 100)); // Small delay before retry
                        return tryDestinationWithRetries(destinationUrl, remainingAttempts - 1);
                    } else {
                        console.log(`  Router: Exhausted all attempts for ${destinationUrl}`);
                        throw new Error('All attempts failed for upstream: ' + destinationUrl);
                    }
                } else {
                    throw problemReport; // Re-throw unhandled errors immediately
                }
            }
        };

        // Iterate through configured upstream destinations
        while (currentDestinationIndex < upstreamDestinations.length) {
            const currentDestination = upstreamDestinations[currentDestinationIndex];
            try {
                const success = await tryDestinationWithRetries(currentDestination, retry);
                if (success) {
                    return; // Request successfully handled by an upstream
                }
            } catch (problemReport) {
                // Current upstream failed even after retries, try the next one
                console.log(`  Router: Moving to next upstream after failure of ${currentDestination}: ${problemReport.message}`);
                lastReportedError = problemReport.message; // Capture the last specific error
                currentDestinationIndex++;
            }
        }

        // If all upstreams and all retries failed
        outgoingResponse.writeHead(503, { 'Content-Type': 'application/json' });
        outgoingResponse.end(JSON.stringify({ error: lastReportedError }));
    };
}


// --- Test Group 1: Negative Scenarios ---
createTestGroup('Gateway Fault Simulation', async function() {
    process.env['NODE_DEBUG'] = 'proxy-engine'; // Renamed environment variable for debugging

    let malfunctioningService;
    let mainGateway;
    let allowPreliminaryQuery = true; // Renamed variable, equivalent to allowHead

    // Teardown function for this group
    this.tearDown = async () => {
        await new Promise(resolve => malfunctioningService.close(() => resolve()));
        await new Promise(resolve => mainGateway.close(() => resolve()));
    };

    // Setup function for the group (equivalent to Mocha's `before`)
    await new Promise(resolve => {
        malfunctioningService = webProto.createServer((incomingQuery, outgoingReply) => {
            // This service only responds to HEAD if allowed, otherwise no response (simulates timeout)
            if (allowPreliminaryQuery && incomingQuery.method === 'HEAD') {
                outgoingReply.writeHead(200);
                outgoingReply.end();
            }
            // For GET and other methods, it intentionally does not respond, leading to timeout
        });
        malfunctioningService.listen(8090, () => {
            mainGateway = webProto.createServer(
                requestRouter(
                    ['http://localhost:8090/'], null, false, {
                        timeout: 1000,
                        retry: 2
                    }));
            mainGateway.listen(9090, () => resolve());
        });
    });

    defineScenario('should manage timeout and retries when upstream is unresponsive to HEAD query during initial check', async function() {
        this.setScenarioTimeout(10000); // Override default timeout for this scenario
        allowPreliminaryQuery = false; // Disable HEAD response for malfunctioning service

        await new Promise((resolve, reject) => {
            performClientRequest('http://localhost:9090/resource-a', (problemReport, upstreamResponse, contentPayload) => {
                if (problemReport) {
                    reject(problemReport);
                    return;
                }
                verifyValue(contentPayload).containsSubstring('error'); // Expect body to indicate an error
                resolve();
            });
        });
    });

    defineScenario('should manage timeout when upstream is unresponsive to GET query during data transfer', async function() {
        this.setScenarioTimeout(10000);
        allowPreliminaryQuery = true; // Allow HEAD, but GET will still timeout

        await new Promise((resolve, reject) => {
            performClientRequest('http://localhost:9090/resource-b', (problemReport, upstreamResponse, contentPayload) => {
                if (problemReport) {
                    reject(problemReport);
                    return;
                }
                verifyValue(contentPayload).containsSubstring('TIMEDOUT'); // Expect body to indicate timeout
                resolve();
            });
        });
    });
});

// --- Test Group 2: Negative + Positive Scenarios ---
createTestGroup('Gateway Mixed Service Availability', async function() {
    process.env['NODE_DEBUG'] = 'proxy-engine';

    let malfunctioningService, operationalService;
    let mainGateway;
    let allowPreliminaryQuery = true;

    this.tearDown = async () => {
        await new Promise(resolve => malfunctioningService.close(() => resolve()));
        await new Promise(resolve => operationalService.close(() => resolve()));
        await new Promise(resolve => mainGateway.close(() => resolve()));
    };

    // Setup function for the group
    await new Promise(resolve => {
        malfunctioningService = webProto.createServer((incomingQuery, outgoingReply) => {
            if (allowPreliminaryQuery && incomingQuery.method === 'HEAD') {
                outgoingReply.writeHead(200);
                outgoingReply.end();
            }
            // No GET response
        });
        malfunctioningService.listen(8090, () => {
            operationalService = webProto.createServer((incomingQuery, outgoingReply) => {
                outgoingReply.writeHead(200);
                if (incomingQuery.method === 'HEAD') {
                    outgoingReply.end();
                } else {
                    outgoingReply.end('successful retrieval'); // Different response content
                }
            });
            operationalService.listen(8091, () => {
                mainGateway = webProto.createServer(
                    requestRouter(
                        ['http://localhost:8090/', 'http://localhost:8091/'], null, false, {
                            timeout: 1000,
                            retry: 2
                        }));
                mainGateway.listen(9090, () => resolve());
            });
        });
    });

    defineScenario('should manage timeout and retries for first unresponsive service, then route to the second functional service', async function() {
        this.setScenarioTimeout(10000);
        allowPreliminaryQuery = false; // First service will fail HEAD check

        await new Promise((resolve, reject) => {
            performClientRequest('http://localhost:9090/resource-c', (problemReport, upstreamResponse, contentPayload) => {
                if (problemReport) {
                    reject(problemReport);
                    return;
                }
                verifyValue(upstreamResponse.statusCode).isIdenticalTo(200);
                verifyValue(contentPayload).containsSubstring('successful retrieval');
                resolve();
            });
        });
    });

    defineScenario('should manage timeout for first service GET request, then route to the second functional service', async function() {
        this.setScenarioTimeout(10000);
        allowPreliminaryQuery = true; // First service HEAD works, but GET will timeout

        await new Promise((resolve, reject) => {
            performClientRequest('http://localhost:9090/resource-d', (problemReport, upstreamResponse, contentPayload) => {
                if (problemReport) {
                    reject(problemReport);
                    return;
                }
                verifyValue(upstreamResponse.statusCode).isIdenticalTo(200);
                verifyValue(contentPayload).containsSubstring('successful retrieval');
                resolve();
            });
        });
    });
});

// Execute the test suite
commenceTesting();