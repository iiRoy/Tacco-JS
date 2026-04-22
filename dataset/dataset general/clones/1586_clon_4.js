const fs = require('fs');
const path = require('path');

// --- Custom Assertion Functions ---
function checkTrue(condition, errorMessage = 'Expected condition to be true') {
    if (!condition) {
        throw new Error(errorMessage);
    }
}

function checkEquality(actual, expected, errorMessage) {
    if (actual !== expected) {
        throw new Error(errorMessage || `Expected ${JSON.stringify(expected)}, but received ${JSON.stringify(actual)}`);
    }
}

function checkDeepEquality(actual, expected, errorMessage = 'Expected deep equality') {
    // A simplified deep equality check suitable for JSON-serializable objects
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`${errorMessage}: Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
    }
}

function verifyException(operation, expectedErrorType = Error, errorMessage = 'Function did not throw an expected exception') {
    let didThrow = false;
    try {
        operation();
    } catch (e) {
        didThrow = true;
        if (expectedErrorType && !(e instanceof expectedErrorType)) {
            throw new Error(`${errorMessage}: Threw ${e.constructor.name} instead of ${expectedErrorType.name}`);
        }
    }
    if (!didThrow) {
        throw new Error(errorMessage);
    }
}

// --- Custom Test Conductor ---
class TestConductor {
    constructor() {
        this.totalEvaluations = 0;
        this.failedEvaluations = 0;
    }

    commenceSuite(description, suiteExecution) {
        console.log(`\n--- ${description} ---`);
        suiteExecution(this.composeTestUnit.bind(this));
    }

    composeTestUnit(description, testRoutine) {
        this.totalEvaluations++;
        try {
            testRoutine();
            console.log(`  ✓ ${description}`);
        } catch (error) {
            this.failedEvaluations++;
            console.error(`  ✗ ${description}`);
            console.error(`    ${error.message}`);
            // console.error(error.stack); // Uncomment for detailed debugging
        }
    }

    summarizeResults() {
        console.log(`\n--- Evaluation Summary ---`);
        console.log(`Total evaluations: ${this.totalEvaluations}`);
        console.log(`Successful: ${this.totalEvaluations - this.failedEvaluations}`);
        console.log(`Failed: ${this.failedEvaluations}`);
        if (this.failedEvaluations > 0) {
            process.exit(1); // Indicate failure for CI/CD
        } else {
            process.exit(0); // Indicate success
        }
    }
}

const evaluationEngine = new TestConductor();

// --- The System Under Test (SUT) ---
// Assuming this test file is in 'test/' and the original 'Bot' is in 'lib/bot.js'
const SystemOverseer = require('../lib/bot').Bot;

// --- Begin Test Cases for SystemOverseer ---

evaluationEngine.commenceSuite('SystemOverseer Initialization and Configuration', (executeUnit) => {

    executeUnit('Initialization without processing unit configuration should trigger an error', () => {
        verifyException(() => {
            new SystemOverseer({});
        }, Error, 'Expected an error when configuration is empty');
    });

    executeUnit('Initialization with a non-existent processing unit module path should trigger an error', () => {
        verifyException(() => {
            new SystemOverseer({ processingUnits: { 'PhantomUnit': '/path/to/nonexistent/module.js' } });
        }, Error, 'Expected an error for a non-existent module path');
    });

    executeUnit('Initialization with a processing unit module exporting an invalid structure should trigger an error', () => {
        // Create a temporary mock module that exists but exports a string, which is invalid for Bot's expectations
        const invalidModulePath = path.join(__dirname, '_temp_invalid_module.js');
        fs.writeFileSync(invalidModulePath, 'module.exports = "invalid content";');

        try {
            verifyException(() => {
                new SystemOverseer({ processingUnits: { 'MalformedUnit': invalidModulePath } });
            }, Error, 'Expected an error for a module with an invalid structure (missing commands/bindCommands)');
        } finally {
            fs.unlinkSync(invalidModulePath); // Clean up the temporary file
        }
    });

    // Setup for valid configuration tests
    let configuredOverseerInstance;
    executeUnit('Successful instantiation with valid processing unit configuration', () => {
        const agentConfig = {
            processingUnits: { 'WorkHandler': '../lib/queue-manager' }
        };
        configuredOverseerInstance = new SystemOverseer(agentConfig);
        checkTrue(configuredOverseerInstance, 'SystemOverseer instance should be successfully created');
    });

    executeUnit('Operations from configured units should be correctly mapped', () => {
        checkTrue(configuredOverseerInstance.commands.WorkHandler['!qadd'], 'Queue add operation should be accessible');
        checkTrue(configuredOverseerInstance.commands.WorkHandler['!qls'], 'Queue list operation should be accessible');
    });

    executeUnit('References to processing unit objects should be stored within the overseer', () => {
        checkTrue(configuredOverseerInstance.tasks['WorkHandler'], 'WorkHandler unit reference should exist');
        checkTrue(configuredOverseerInstance.tasks['WorkHandler'].commands, 'WorkHandler unit should expose a commands object');
        checkTrue(configuredOverseerInstance.tasks['WorkHandler'].bindCommands, 'WorkHandler unit should expose a bindCommands function');
    });
});

evaluationEngine.commenceSuite('Processing Unit Settings and Message Routing', (executeUnit) => {
    let settingsPropagatingOverseer;
    executeUnit('Processing unit-specific settings should be correctly passed during initialization', () => {
        const specificConfig = {
            processingUnits: {
                'WorkHandler': '../lib/queue-manager',
                'SettingsInspector': {
                    module: '../test/fixtures', // This path refers to the original test's fixture
                    parameter: 'settingValue'
                }
            }
        };
        settingsPropagatingOverseer = new SystemOverseer(specificConfig);
        checkTrue(settingsPropagatingOverseer, 'Overseer instance with specific settings should be created');
    });

    executeUnit('An individual unit should receive its dedicated configuration object', () => {
        const inspectedUnit = settingsPropagatingOverseer.getTask('SettingsInspector');
        checkDeepEquality({ parameter: 'settingValue' }, inspectedUnit.config, 'Unit config should match the provided settings');
    });

    let messageRoutingOverseer;
    executeUnit('Setup for testing message routing capabilities', () => {
        messageRoutingOverseer = new SystemOverseer({ processingUnits: {} });
        messageRoutingOverseer.commands.TestModule = {};
        messageRoutingOverseer.commands.TestModule['!test'] = function (data) {
            return data;
        };
        checkTrue(messageRoutingOverseer, 'Overseer for message routing should be initialized');
    });

    executeUnit('An incoming message command should be found and its associated operation executed', () => {
        const receivedOutcome = messageRoutingOverseer.handleMessage({ body: '!test hello universe' });
        checkTrue(receivedOutcome && receivedOutcome.body, 'Response body should be present');
        checkEquality('hello universe', receivedOutcome.body, 'Response body should reflect the input payload');
    });

    executeUnit('An unrecognized command in an incoming message should yield an empty response', () => {
        const receivedOutcome = messageRoutingOverseer.handleMessage({ body: '!unmatched command phrase' });
        checkEquality('', receivedOutcome, 'Unmatched command should return an empty string');
    });
});

evaluationEngine.commenceSuite('Channel-Specific Processing Unit Management', (executeUnit) => {
    let channelAwareOverseer;
    executeUnit('Setup for channel-specific unit binding and message handling', () => {
        const channelConfig = {
            processingUnits: {
                'WorkHandler': '../lib/queue-manager',
                'AssistanceProvider': '../lib/help'
            },
            rooms: { // Renamed from 'channels' to 'rooms' to align with original 'Bot' internal property 'rooms'
                'channelAlpha': ['WorkHandler'],
                'channelBeta': ['AssistanceProvider']
            }
        };
        channelAwareOverseer = new SystemOverseer(channelConfig);
        checkTrue(channelAwareOverseer, 'Channel-aware overseer instance should be successfully created');
    });

    executeUnit('Processing units not assigned to a specific channel should not respond to messages within that channel', () => {
        let requestAlpha = {
            room: 'channelAlpha',
            body: '!help'
        };
        let responseAlpha = channelAwareOverseer.handleMessage(requestAlpha);
        checkEquality(responseAlpha, '', 'AssistanceProvider should not respond in channelAlpha');

        let requestBeta = {
            room: 'channelBeta',
            body: '!qls'
        };
        let responseBeta = channelAwareOverseer.handleMessage(requestBeta);
        checkEquality(responseBeta, '', 'WorkHandler should not respond in channelBeta');
    });

    executeUnit('Processing units assigned to a specific channel should respond to messages correctly within that channel', () => {
        let requestAlpha = {
            room: 'channelAlpha',
            body: '!qls'
        };
        let responseAlpha = channelAwareOverseer.handleMessage(requestAlpha);
        checkTrue(responseAlpha && /Hotfix/.test(responseAlpha.body), 'WorkHandler should respond in channelAlpha with queue status');

        let requestBeta = {
            room: 'channelBeta',
            body: '!help'
        };
        let responseBeta = channelAwareOverseer.handleMessage(requestBeta);
        checkTrue(responseBeta && /Available Commands/.test(responseBeta), 'AssistanceProvider should respond in channelBeta with help info');
    });
});

// --- Final Evaluation Report ---
evaluationEngine.summarizeResults();