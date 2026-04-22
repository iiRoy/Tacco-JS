/*
 * This file presents a collection of verification routines for the AgentSystem class.
 * It employs the 'vows' testing framework for structuring and executing assertions.
 * The primary goal is to ensure the AgentSystem's operational integrity and error handling.
 */

// Acquire necessary components for the test suite.
var AgentSystem = require('../lib/agent-system').AgentSystem, // The main class under examination
    assertionSuite = require('vows'), // The testing framework
    validationApi = require('assert'); // The assertion library

// Initiate the test suite for 'AgentSystem'.
assertionSuite.describe('AgentSystem').addBatch({

    // Test group: Error handling for configuration issues.
    'omitted operations configuration results in an exception': function () {
        // Validation: An empty configuration should trigger an error.
        validationApi.throws(function () {
            var operationalUnit = new AgentSystem({}); // Attempt to instantiate with no config
        }, Error); // Expect an Error object.
    },

    'undefined operation component path causes failure': function () {
        // Validation: An invalid or non-existent module path for an operation should throw.
        validationApi.throws(function () {
            var operationalUnit = new AgentSystem({
                operationalComponents: {
                    'CatastropheModule': '/nonexistent/path/to/component'
                }
            });
        }, Error); // Anticipate an Error.
    },

    'absent operation object reference yields error': function () {
        // Validation: If a module path is provided but the exported object is not valid, an error should occur.
        validationApi.throws(function () {
            var operationalUnit = new AgentSystem({
                operationalComponents: {
                    'CatastropheModule': '../lib/job-dispatcher' // Path exists, but 'CatastropheModule' is not what's exported.
                }
            });
        }, Error);
    },

    // Test group: Core system configuration and component binding.
    'systemSetup': {
        topic: function () {
            // Prepare a configuration object for the AgentSystem.
            var systemSettings = {
                operationalComponents: {
                    'JobDispatcher': '../lib/job-dispatcher' // Link to a valid job dispatcher component.
                }
            };
            return new AgentSystem(systemSettings); // Return a new instance for subsequent tests.
        },

        // Sub-test: Verify that commands (directives) are correctly bound.
        'links operational directives': function (currentSubject) {
            validationApi.ok(currentSubject.directiveRegistry.JobDispatcher['!addJob']); // Check a specific command.
            validationApi.ok(currentSubject.directiveRegistry.JobDispatcher['!listJobs']); // Check another specific command.
        },

        // Sub-test: Ensure the system maintains proper references to its operational components.
        'retains references to component instances': function (currentSubject) {
            validationApi.ok(currentSubject.operationalComponents['JobDispatcher'], 'Job dispatcher component is missing');
            validationApi.ok(currentSubject.operationalComponents['JobDispatcher'].directiveRegistry);
            validationApi.ok(currentSubject.operationalComponents['JobDispatcher'].attachDirectives);
        }
    },

    // Test group: Verifying that settings are passed correctly to new operations.
    'appendOperation propagates configuration parameters': {
        topic: function () {
            var systemSettings = {
                operationalComponents: {
                    'JobDispatcher': '../lib/job-dispatcher',
                    'ConfigVerifier': { // An operation component with custom parameters.
                        module: '../test/mock-data',
                        parameterKey: 'parameterValue'
                    }
                }
            };
            return new AgentSystem(systemSettings);
        },

        // Sub-test: Confirm that a newly added operation receives its specific configuration.
        'operation receives designated configuration': function (currentSubject) {
            var activeOperation = currentSubject.getOperation('ConfigVerifier');
            validationApi.deepEqual({
                parameterKey: 'parameterValue'
            }, activeOperation.config);
        }
    },

    // Test group: Handling and routing of incoming messages.
    'incomingMessageRouting': {
        topic: function () {
            var operationalUnit = new AgentSystem({
                operationalComponents: {}
            }); // Start with no operations.
            operationalUnit.directiveRegistry.TrialComponent = {}; // Manually add a dummy component's directives.
            operationalUnit.directiveRegistry.TrialComponent['!runTrial'] = function (incomingPayload) {
                return incomingPayload;
            };
            return operationalUnit; // Return the configured operational unit.
        },

        // Sub-test: Confirm the system correctly identifies and executes component directives.
        'identifies component directives': function (currentSubject) {
            var processingResult = currentSubject.processIncomingMessage({
                messageBody: '!runTrial hello world sample'
            });
            validationApi.ok(processingResult.messageBody);
            validationApi.equal('hello world sample', processingResult.messageBody);
        },

        // Sub-test: Verify an empty response is given when no matching directive is found.
        'returns void on directive mismatch': function (currentSubject) {
            var processingResult = currentSubject.processIncomingMessage({
                messageBody: '!unrecognizedCommand'
            });
            validationApi.equal('', processingResult);
        }
    },

    // Test group: Managing operations across multiple communication channels (rooms/zones).
    'multiChannelOperationManagement': {
        topic: function () {
            var systemSettings = {
                operationalComponents: {
                    'JobDispatcher': '../lib/job-dispatcher',
                    'SupportSystem': '../lib/guidance-system'
                },
                channelAssignments: { // Define which operations are active in which channels.
                    'channelAlpha': ['JobDispatcher'],
                    'channelBeta': ['SupportSystem']
                }
            };
            var operationalUnit = new AgentSystem(systemSettings);
            return operationalUnit;
        },

        // Sub-test: Operations not explicitly assigned to a channel should not respond to messages in that channel.
        'unassigned operations remain silent in channels': function (currentSubject) {
            var messageQuery = {
                channelId: 'channelAlpha',
                messageBody: '!askForSupport'
            };
            var queryReply = currentSubject.processIncomingMessage(messageQuery);
            validationApi.equal(queryReply, '', 'SupportSystem component is not linked in channelAlpha');

            messageQuery = {
                channelId: 'channelBeta',
                messageBody: '!listJobs'
            };
            queryReply = currentSubject.processIncomingMessage(messageQuery);
            validationApi.equal(queryReply, '');
        },

        // Sub-test: Operations assigned to a channel should actively respond to messages within that channel.
        'assigned operations respond to channel messages': function (currentSubject) {
            var messageQuery = {
                channelId: 'channelAlpha',
                messageBody: '!listJobs'
            };
            var queryReply = currentSubject.processIncomingMessage(messageQuery);
            validationApi.ok(/RapidFix/.test(queryReply.messageBody), 'Expected a positive reply containing RapidFix');

            messageQuery = {
                channelId: 'channelBeta',
                messageBody: '!askForSupport'
            };
            queryReply = currentSubject.processIncomingMessage(messageQuery);
            validationApi.ok(/PermittedDirectives/.test(queryReply), 'Support information should have been displayed');
        }
    }

}).export(module); // Export the entire test suite for execution.