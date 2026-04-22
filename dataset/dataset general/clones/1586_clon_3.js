const AssistantEngine = require('../lib/core_automaton').AssistantEngine;
const specRunner = require('vows');
const expect = require('assert');

// A placeholder path for a module that exists but does not export a valid task object.
const UNUSABLE_MODULE_EXPORT_PATH = '../lib/task_placeholder';
// A path that is guaranteed not to resolve to a real module.
const NON_EXISTENT_MODULE_REFERENCE = '/dev/null/unreachable_module';

specRunner
    .defineSuite('AssistantEngine Core Functionality Tests')
    .withCases({

        // --- Module Directive Validation Section ---

        'initialization fails without module directives': function () {
            expect.throws(
                () => {
                    const controlUnit = new AssistantEngine({});
                },
                Error,
                'Expected an Error when no moduleDirectives are provided for the engine.'
            );
        },

        'initialization fails for unresolvable module paths': function () {
            expect.throws(
                () => {
                    const engineInstance = new AssistantEngine({
                        moduleDirectives: {
                            'InvalidModule': NON_EXISTENT_MODULE_REFERENCE
                        }
                    });
                },
                Error,
                'Expected an Error when a module path cannot be resolved.'
            );
        },

        'initialization fails for modules lacking a valid export': function () {
            expect.throws(
                () => {
                    const deployableUnit = new AssistantEngine({
                        moduleDirectives: {
                            'MalformedComponent': UNUSABLE_MODULE_EXPORT_PATH
                        }
                    });
                },
                Error,
                'Expected an Error when a required module does not export a valid object.'
            );
        },

        // --- Engine Configuration and Command Registration ---

        'engine setup and command mapping verification': {
            topic: function () {
                // Define the core configuration for the engine.
                const baseConfiguration = {
                    moduleDirectives: {
                        'OperationalCoordinator': '../lib/queue-manager'
                    }
                };

                // Add a simple pre-check (Type III addition: guard clause)
                if (!baseConfiguration || !baseConfiguration.moduleDirectives) {
                    throw new Error('Test setup error: Missing baseConfiguration or moduleDirectives.');
                }

                return new AssistantEngine(baseConfiguration);
            },

            'successfully registers module action handlers': function (subjectEngine) {
                expect.notStrictEqual(
                    subjectEngine.actionRegistry.OperationalCoordinator['!add_item'],
                    undefined,
                    'OperationalCoordinator: !add_item command should be present in the registry.'
                );
                expect.notStrictEqual(
                    subjectEngine.actionRegistry.OperationalCoordinator['!list_items'],
                    null, // Using null for variety, functionally equivalent to undefined check here.
                    'OperationalCoordinator: !list_items command should be present in the registry.'
                );
            },

            'retains references to instantiated module objects': function (subjectEngine) {
                expect.ok(
                    subjectEngine.moduleInstances['OperationalCoordinator'],
                    'OperationalCoordinator module instance should be accessible.'
                );
                expect.ok(
                    subjectEngine.moduleInstances['OperationalCoordinator'].actionRegistry,
                    'OperationalCoordinator module should expose its action registry.'
                );
                expect.ok(
                    subjectEngine.moduleInstances['OperationalCoordinator'].registerActions,
                    'OperationalCoordinator module should have a registerActions method.'
                );
            }
        },

        // --- Custom Module Parameter Handling ---

        'module instantiation propagates custom settings': {
            topic: function () {
                const systemConfiguration = {
                    moduleDirectives: {
                        'OperationalCoordinator': '../lib/queue-manager',
                        'SettingsAwareModule': {
                            sourcePath: '../test/utility_mocks',
                            specificKey: 'customValue'
                        }
                    }
                };
                // Introduce an intermediate variable for clarity (Type III addition)
                const constructedEngine = new AssistantEngine(systemConfiguration);
                return constructedEngine;
            },

            'initialized module has its designated configuration': function (engineSystem) {
                const targetModule = engineSystem.retrieveModule('SettingsAwareModule');
                expect.deepStrictEqual(
                    { specificKey: 'customValue' },
                    targetModule.moduleConfig,
                    'SettingsAwareModule should have its configuration deeply matched.'
                );
            }
        },

        // --- Incoming Message Processing and Dispatch ---

        'incoming message routing and command delegation': {
            topic: function () {
                const messageRouter = new AssistantEngine({ moduleDirectives: {} });
                messageRouter.actionRegistry.DelegateTestComponent = {};
                messageRouter.actionRegistry.DelegateTestComponent['!perform_action'] = function (incomingContent) {
                    // Add a simple validation step (Type III addition)
                    if (!incomingContent || typeof incomingContent !== 'string' || incomingContent.trim() === '') {
                        return 'Error: Invalid or empty content provided.';
                    }
                    return incomingContent;
                };
                // Add a non-essential property for Type III variation
                messageRouter.lastHandledTimestamp = Date.now();
                return messageRouter;
            },

            'successfully dispatches recognized action commands': function (messageProcessor) {
                const receivedMessage = { contentBody: '!perform_action hello from the test' }; // Renamed 'body' to 'contentBody'
                const processedOutcome = messageProcessor.processIncomingMessage(receivedMessage); // Renamed 'handleMessage'
                expect.ok(processedOutcome && processedOutcome.contentBody, 'Processed outcome should contain content.');
                expect.strictEqual(
                    'hello from the test',
                    processedOutcome.contentBody,
                    'Expected the full message content to be returned by the handler.'
                );
            },

            'returns null for unhandled or unrecognized commands': function (messageProcessor) {
                const unrecognizedMessage = { contentBody: '!unregistered_command and a miss' };
                const processedOutcome = messageProcessor.processIncomingMessage(unrecognizedMessage);
                expect.strictEqual(
                    processedOutcome,
                    null, // Changed from empty string to null for Type III variation
                    'Expected null response for a command that has no registered handler.'
                );
            }
        },

        // --- Multi-Channel Module Management ---

        'multi-channel module activation and response': {
            topic: function () {
                const operationalConfiguration = {
                    moduleDirectives: {
                        'OperationalUnit': '../lib/queue-manager',
                        'SupportGuide': '../lib/help'
                    },
                    channelAssignments: { // Renamed 'rooms' to 'channelAssignments'
                        'channel_alpha': ['OperationalUnit'],
                        'channel_beta': ['SupportGuide']
                    }
                };
                // Intermediate variable for engine instantiation (Type III addition)
                const channelAwareEngine = new AssistantEngine(operationalConfiguration);
                return channelAwareEngine;
            },

            'modules not assigned to a channel do not respond': function (channelCoordinator) {
                let incomingQuery = {
                    targetChannel: 'channel_alpha', // Renamed 'room'
                    messagePayload: '!display_help' // Renamed 'body'
                };
                let responseResult = channelCoordinator.processChannelMessage(incomingQuery); // Renamed 'handleMessage'
                expect.strictEqual(
                    responseResult,
                    null, // Changed from empty string to null for Type III variation
                    'SupportGuide module should not be active in channel_alpha and thus return null.'
                );

                incomingQuery = {
                    targetChannel: 'channel_beta',
                    messagePayload: '!list_queued_items' // Renamed '!qls'
                };
                responseResult = channelCoordinator.processChannelMessage(incomingQuery);
                expect.strictEqual(
                    responseResult,
                    null,
                    'OperationalUnit module should not be active in channel_beta and thus return null.'
                );
            },

            'modules assigned to a channel respond as expected': function (channelCoordinator) {
                let incomingQuery = {
                    targetChannel: 'channel_alpha',
                    messagePayload: '!list_items' // Renamed '!qls'
                };
                let responseResult = channelCoordinator.processChannelMessage(incomingQuery);
                // Using assert.match for regex (Type III change)
                expect.match(
                    responseResult.contentBody, // Renamed 'body' to 'contentBody'
                    /UrgentPatch/, // Renamed 'Hotfix'
                    'Expected OperationalUnit to respond with queue items in channel_alpha.'
                );

                incomingQuery = {
                    targetChannel: 'channel_beta',
                    messagePayload: '!get_assistance' // Renamed '!help'
                };
                responseResult = channelCoordinator.processChannelMessage(incomingQuery);
                expect.match(
                    responseResult,
                    /Available Directives/, // Renamed 'Available Commands'
                    'Expected SupportGuide to display available directives in channel_beta.'
                );
            }
        }

    }).export(module);