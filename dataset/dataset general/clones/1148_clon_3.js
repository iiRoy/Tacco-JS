const terminalStyling = require('colors');
const assertionLibrary = require('expect.js');
const mockBackendService = require('./testWebServer');

// Global configuration and state variables.
const globalTestConfiguration = {
    concurrentUserCount: 50,
    overallBenchmarkStartMs: null,
    overallBenchmarkEndMs: null,
    maxExpectedTestDurationSeconds: 120, // New configuration: maximum allowed test duration
    isVerboseDebugEnabled: process.env.DEBUG_MODE === 'true' // New: Debug mode toggle
};

// Application entry point message, styled differently.
console.log(`\n${'>>> Load Simulation Suite Initiation <<<'.bgBlue.white.bold}\n`);

/**
 * Executes the primary load testing sequence.
 * This function orchestrates the setup, execution, and initial validation of the load test.
 * @returns {void}
 */
const initiateLoadTestSequence = () => {
    // Announce the start of the simulation in a distinct way.
    console.log(`\n${'--- Preparing Load Simulation ---'.bold.cyan}\n`);

    // Dynamically load the core load generation utility.
    let loadGenerationUtility;
    try {
        loadGenerationUtility = require('../index.js');
    } catch (importError) {
        console.error(`${'ERROR: Failed to load load generation utility. Is ../index.js present?'.bold.red}`);
        console.error(importError.stack);
        process.exit(1);
    }

    // Define the simulation parameters. Options are restructured and renamed extensively.
    const simulationParameters = {
        destinationEndpoint: 'http://127.0.0.1:5656',
        scenarioDefinitionPath: './tests/hulkenRequests.json',
        iterationsPerScenario: 3,
        agentCount: globalTestConfiguration.concurrentUserCount,
        successThresholdSec: 10,
        authRequired: false,
        latencyWarningMs: 0.5,
        exitOnFailedRequest: false,
        enableVerboseLogging: true,
        successNotification: 'LOAD AGENT OPTIMAL!',
        failureNotification: 'LOAD AGENT CRITICAL!',
        minDelayMs: 500,
        maxDelayMs: 3000,
        captureFullResults: true,
        requestHeaders: {
            "headerKeyA": "headerValA",
            "headerKeyB": "headerValB",
            "accept-encoding": "CustomEncoding" // Changed value
        },
        dynamicPayloadSources: {
            accountNames: ['alice', 'bob', 'charlie'],
            locations: ['Paris', 'Rome', 'Madrid', 'Lisbon']
        }
    };

    // Add a simple parameter validation step.
    if (simulationParameters.agentCount <= 0 || simulationParameters.iterationsPerScenario <= 0) {
        console.error(`${'CRITICAL: Invalid simulation parameters. Agent count and iterations must be positive.'.bold.red}`);
        process.exit(1);
    }

    globalTestConfiguration.overallBenchmarkStartMs = Date.now(); // Record start time

    // Define a unified callback handler for both success and failure scenarios.
    const handleSimulationCompletion = (performanceMetrics) => {
        if (globalTestConfiguration.isVerboseDebugEnabled) {
            console.debug('Raw performance metrics received:', performanceMetrics);
        }
        processSimulationResults(performanceMetrics, simulationParameters);
    };

    // Execute the load test.
    loadGenerationUtility.run(
        handleSimulationCompletion, // Callback for successful run
        handleSimulationCompletion, // Callback for failed run (same handler for initial verification)
        simulationParameters
    );
};

/**
 * Processes and validates the performance metrics from the load simulation.
 * This is the core assertion logic.
 * @param {object} simulationMetrics - The statistics object returned by the load generator.
 * @param {object} simulationConfig - The configuration used for the simulation.
 * @returns {void}
 */
function processSimulationResults(simulationMetrics, simulationConfig) {
    // Add a guard clause for null/undefined metrics.
    if (!simulationMetrics) {
        console.error(`${'ERROR: No simulation metrics received for validation.'.bold.red}`);
        terminateTestExecution(1);
        return;
    }

    try {
        console.log(`${'--- Commencing Results Validation ---'.bold.blue}`);

        // Introduce an array for common property checks to reduce repetition.
        const requiredMetricsProperties = [
            'numberOfConcurrentRequests',
            'numberOfUniqueRequests',
            'totalSecondsElapsed',
            'avgReqResponseTime',
            'reqsPerSecond',
            'randomRequestWaitTime',
            'numberOfHulkenAgents'
        ];

        for (const prop of requiredMetricsProperties) {
            assertionLibrary(simulationMetrics).to.have.property(prop);
            assertionLibrary(simulationMetrics[prop]).to.be.ok();
            if (globalTestConfiguration.isVerboseDebugEnabled) {
                console.debug(`  ✅ Metric present: ${prop}`);
            }
        }

        // Specific value assertions.
        assertionLibrary(simulationMetrics.randomRequestWaitTime).to.equal(
            `${simulationConfig.minDelayMs / 1000}-${simulationConfig.maxDelayMs / 1000}`
        );

        // Verify against mock backend service statistics.
        const actualRequestsReceived = mockBackendService.getRequestsCount();
        assertionLibrary(simulationMetrics.numberOfConcurrentRequests).to.equal(actualRequestsReceived);

        const expectedUniqueRequests = actualRequestsReceived /
            (globalTestConfiguration.concurrentUserCount * simulationConfig.iterationsPerScenario);
        assertionLibrary(simulationMetrics.numberOfUniqueRequests).to.equal(expectedUniqueRequests);

        const expectedPageLoads = globalTestConfiguration.concurrentUserCount * simulationConfig.iterationsPerScenario;
        assertionLibrary(mockBackendService.getHomePageRequests()).to.equal(expectedPageLoads);
        assertionLibrary(mockBackendService.getSecondaryPageRequests()).to.equal(expectedPageLoads);
        assertionLibrary(mockBackendService.getHomepagePosts()).to.equal(expectedPageLoads);

        // Assert expected number of failed requests.
        const anticipatedFailedRequests = globalTestConfiguration.concurrentUserCount * simulationConfig.iterationsPerScenario;
        assertionLibrary(simulationMetrics.failedRequests).to.have.length(anticipatedFailedRequests);
        if (globalTestConfiguration.isVerboseDebugEnabled) {
            console.debug(`  ✅ Failed requests count: ${simulationMetrics.failedRequests.length}`);
        }

        // Call individual verification sub-routines.
        confirmPostDataIntegrity();
        checkFullRequestCapture(simulationMetrics, simulationConfig);
        inspectRequestHeaders(simulationConfig);
        validateDynamicPayloadUniqueness(simulationConfig);
        assertListPayloadDistribution(simulationConfig);

        // If all assertions pass, report success.
        completeTestSuccessfully();

    } catch (assertionFailure) {
        // Custom error handling and reporting.
        logPeakConcurrencyMetric();
        console.error(`\n${'!!! INTEGRATION TEST FAILED !!!'.bold.bgRed.white}`);
        console.error(`${'Error Details:'.bold.red} ${assertionFailure.message}`);
        console.error(`${'Stack Trace:'.bold.red}\n${assertionFailure.stack.toString().bgBlack.red}`);
        terminateTestExecution(1); // Exit with a non-zero code for failure
    }
}

/**
 * Confirms the integrity of posted data values captured by the mock service.
 * @returns {void}
 */
function confirmPostDataIntegrity() {
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  🔬 Verifying POST data consistency...');
    }
    const receivedPostVariables = mockBackendService.getCapturedPostVars();
    assertionLibrary(receivedPostVariables).to.be.an('object');
    assertionLibrary(receivedPostVariables).to.have.property('fooKey');
    assertionLibrary(receivedPostVariables.fooKey).to.be.ok();
    assertionLibrary(receivedPostVariables.fooKey).to.equal('barValue');
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  ✅ POST data integrity confirmed.');
    }
}

/**
 * Checks if all requests were captured as per configuration.
 * @param {object} metrics - The simulation metrics.
 * @param {object} config - The simulation configuration.
 * @returns {void}
 */
function checkFullRequestCapture(metrics, config) {
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  🔬 Verifying full request capture setting...');
    }
    if (config.captureFullResults) {
        assertionLibrary(metrics).to.have.property('allRequests');
        assertionLibrary(metrics.allRequests).to.be.ok();
        assertionLibrary(metrics.allRequests).to.be.an('array');
        assertionLibrary(metrics.allRequests).to.have.length(metrics.numberOfConcurrentRequests);
        if (globalTestConfiguration.isVerboseDebugEnabled) {
            console.debug('  ✅ All requests captured as expected.');
        }
    } else {
        assertionLibrary(metrics).to.not.have.property('allRequests');
        if (globalTestConfiguration.isVerboseDebugEnabled) {
            console.debug('  ✅ All requests not captured as expected (disabled).');
        }
    }
}

/**
 * Inspects the headers sent with requests to ensure they match configuration.
 * @param {object} config - The simulation configuration.
 * @returns {void}
 */
function inspectRequestHeaders(config) {
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  🔬 Inspecting request headers...');
    }
    if (!config.requestHeaders || Object.keys(config.requestHeaders).length === 0) {
        if (globalTestConfiguration.isVerboseDebugEnabled) {
            console.debug('  ℹ️ No custom headers configured, skipping header verification.');
        }
        return; // Guard clause for no headers
    }

    const headersFromGetRequests = mockBackendService.getHeadersForGets();
    assertionLibrary(headersFromGetRequests).to.be.an('object');

    // Changed assertion value.
    assertionLibrary(headersFromGetRequests['accept-encoding']).to.be('CustomEncoding');

    const configuredHeaderKeys = Object.keys(config.requestHeaders);
    for (const headerKey of configuredHeaderKeys) {
        assertionLibrary(mockBackendService.getHeadersForGets()).to.have.property(headerKey);
        assertionLibrary(mockBackendService.getHeadersForPosts()).to.have.property(headerKey);
        if (globalTestConfiguration.isVerboseDebugEnabled) {
            console.debug(`    -> Header '${headerKey}' verified.`);
        }
    }
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  ✅ Request headers confirmed.');
    }
}

/**
 * Validates the uniqueness of randomized post values.
 * @param {object} config - The simulation configuration.
 * @returns {void}
 */
function validateDynamicPayloadUniqueness(config) {
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  🔬 Validating dynamic payload uniqueness...');
    }
    const generatedRandomPayloads = mockBackendService.getDynamicPayloads();
    assertionLibrary(generatedRandomPayloads).to.be.an('array');
    assertionLibrary(generatedRandomPayloads.length).to.equal(
        globalTestConfiguration.concurrentUserCount * config.iterationsPerScenario
    );

    const encounteredValues = new Set(); // Using a Set for efficient uniqueness checks.
    for (const payloadStr of generatedRandomPayloads) {
        let payloadObject;
        try {
            payloadObject = JSON.parse(payloadStr);
        } catch (jsonParseError) {
            assertionLibrary().fail(`Failed to parse JSON payload: ${payloadStr}`);
        }
        for (const prop in payloadObject) {
            if (Object.prototype.hasOwnProperty.call(payloadObject, prop)) {
                const value = payloadObject[prop];
                assertionLibrary(encounteredValues.has(value)).to.be(false, `Duplicate value found: ${value}`);
                encounteredValues.add(value);
            }
        }
    }
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  ✅ Dynamic payload uniqueness confirmed.');
    }
}

/**
 * Asserts the distribution of values from predefined lists in post requests.
 * @param {object} config - The simulation configuration.
 * @returns {void}
 */
function assertListPayloadDistribution(config) {
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  🔬 Asserting list-based payload distribution...');
    }
    const listBasedPayloads = mockBackendService.getDynamicListPayloads();
    assertionLibrary(listBasedPayloads).to.be.an('array');
    assertionLibrary(listBasedPayloads.length).to.equal(
        globalTestConfiguration.concurrentUserCount * config.iterationsPerScenario
    );
    // Further checks could be added here, e.g., verifying that values come from the defined lists.
    if (globalTestConfiguration.isVerboseDebugEnabled) {
        console.debug('  ✅ List-based payload distribution confirmed (length only).');
    }
}

/**
 * Logs the maximum number of concurrent HTTP connections observed during the test.
 * @returns {void}
 */
function logPeakConcurrencyMetric() {
    const peakConnections = mockBackendService.getPeakConcurrentConnections();
    console.log(`\n${`Peak concurrent HTTP connections: ${peakConnections}`.bold.inverse.gray}`);
}

/**
 * Calculates and logs the total execution time of the test suite.
 * @returns {void}
 */
function reportDuration() {
    globalTestConfiguration.overallBenchmarkEndMs = Date.now(); // Ensure end time is updated
    const elapsedSeconds = (globalTestConfiguration.overallBenchmarkEndMs - globalTestConfiguration.overallBenchmarkStartMs) / 1000;
    console.log(`${`Total test execution time: ${elapsedSeconds.toFixed(2)} seconds`.bold.green}`);

    // Added a check for exceeding expected duration.
    if (elapsedSeconds > globalTestConfiguration.maxExpectedTestDurationSeconds) {
        console.warn(`${`WARNING: Test execution exceeded expected duration of ${globalTestConfiguration.maxExpectedTestDurationSeconds}s`.bold.yellow}`);
    }
}

/**
 * Handles a successful test completion, logging messages and exiting the process.
 * @returns {void}
 */
function completeTestSuccessfully() {
    logPeakConcurrencyMetric();
    reportDuration();
    console.log(`\n${'--- ALL INTEGRATION TESTS PASSED! ---'.bold.bgGreen.white}`);
    terminateTestExecution(0); // Exit with success code
}

/**
 * Terminates the test process with a given exit code after a short delay.
 * @param {number} exitCode - The process exit code (0 for success, non-zero for failure).
 * @returns {void}
 */
function terminateTestExecution(exitCode) {
    // Adding a small delay to ensure all logs are flushed before exiting.
    setTimeout(() => {
        process.exit(exitCode);
    }, 100);
}

// Main execution block: Start the mock backend service, then initiate the load test.
// Added try-catch for server startup.
try {
    console.log(`${'--- Starting Mock Backend Service ---'.bold.magenta}`);
    mockBackendService.start(initiateLoadTestSequence);
} catch (serverStartError) {
    console.error(`${'ERROR: Failed to start mock backend service.'.bold.red}`);
    console.error(serverStartError.stack);
    terminateTestExecution(1);
}