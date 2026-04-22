/*
 * This file contains Type I clone of a JavaScript module.
 *
 * Original source: Provided by the user.
 *
 * Definition of Type I clone:
 * "Code fragments are exactly equal, except for possible variations
 * in whitespace and comments."
 *
 * This clone adheres to the definition by:
 * - Preserving all identifiers, variable names, function names, operators,
 *   and expressions without any modification.
 * - Introducing extensive changes in whitespace (indentation, spacing,
 *   and blank lines).
 * - Adding, removing, and modifying comments throughout the file.
 *
 * The goal is to make the code look visually distinct while maintaining
 * absolute logical and structural identity to the original.
 */

// Import necessary modules for the test suite.
var Bot    = require('../lib/bot').Bot, // The main bot class
    vows   = require('vows'),           // Vows test framework
    assert = require('assert');         // Node.js assertion library


// Begin the Vows test suite description for the 'Bot' module.
vows.describe('Bot')
    // Add a batch of tests.
    .addBatch({

        // Test case: Missing tasks configuration should cause an error.
        'missing tasks configuration causes error': function () {
            // Assert that an error is thrown when initializing Bot with an empty object.
            assert.throws(function () {
                var bot = new Bot({}); // Attempt to create a new Bot instance.
            }, Error); // Expect an Error to be thrown.
        },


        // Test case: Missing task module (path) should cause an error.
        'missing task module causes error': function () {
            // Assert that an error is thrown.
            assert.throws(function () {
                var bot = new Bot({tasks: { 'Kaboom': '/path/to/nowhere'}}); // Invalid task path.
            }, Error); // Expect an Error.
        },


        // Test case: Missing task object (module exists but not a valid task) should cause an error.
        'missing task object causes error': function () {
            // Assert that an error is thrown.
            assert.throws(function () {
                var bot = new Bot({tasks: { 'Kaboom': '../lib/queue-manager'}}); // QueueManager is a module, not a raw object.
            }, Error); // Expect an Error.
        },


        // A nested context for configuration-related tests.
        'configuration': {
            // Topic function to set up the context for subsequent tests.
            topic: function () {
                // Define a configuration object with a valid task.
                var config = {
                    tasks: {'QueueManager': '../lib/queue-manager'} // A valid task module.
                };
                // Return a new Bot instance initialized with this configuration.
                return new Bot(config);
            },

            // Test case: Bot should bind commands from the configured tasks.
            'binds commands': function (topic) {
                // Assert that specific commands from QueueManager are bound.
                assert.ok(topic.commands.QueueManager['!qadd']); // Check for '!qadd' command.
                assert.ok(topic.commands.QueueManager['!qls']);  // Check for '!qls' command.
            },

            // Test case: Bot should store references to task objects.
            'stores a reference to task objects': function (topic) {
                // Assert that the QueueManager task object exists.
                assert.ok(topic.tasks['QueueManager'], 'Missing task');
                // Assert that the task object has a 'commands' property.
                assert.ok(topic.tasks['QueueManager'].commands);
                // Assert that the task object has a 'bindCommands' property.
                assert.ok(topic.tasks['QueueManager'].bindCommands);
            }
        },


        // A nested context for testing addTask and configuration passing.
        'addTask passes settings along': {
            // Topic function to set up a bot with a task that has custom settings.
            topic: function () {
                // Define a configuration with two tasks, one with custom key-value settings.
                var config = {
                    tasks: {
                        'QueueManager': '../lib/queue-manager', // Standard task.
                        'ConfigTest': {                           // Custom configured task.
                            module: '../test/fixtures',           // Module path.
                            key: 'value'                          // Custom setting.
                        }
                    }
                };
                // Return a new Bot instance.
                return new Bot(config);
            },

            // Test case: The task should receive its custom configuration.
            'task has configuration': function (topic) {
                // Retrieve the 'ConfigTest' task instance from the bot.
                var task = topic.getTask('ConfigTest');
                // Assert that the task's config matches the expected custom settings.
                assert.deepEqual({key: 'value'}, task.config);
            }
        },


        // A nested context for message delegation tests.
        'message delegation': {
            // Topic function to prepare a bot for message handling.
            topic: function () {
                // Create a bot with an empty tasks configuration.
                var bot = new Bot({tasks: {}});
                // Manually add a dummy command for testing.
                bot.commands.Test = {};
                bot.commands.Test['!test'] = function (text) {
                    return text; // Simple echo function.
                };
                // Return the configured bot.
                return bot;
            },

            // Test case: Bot should find and execute task commands based on message body.
            'finds task commands': function (topic) {
                // Simulate an incoming message.
                var result = topic.handleMessage({ body: '!test hello world'});
                // Assert that a response body exists.
                assert.ok(result.body);
                // Assert that the response body matches the expected output.
                assert.equal('hello world', result.body);
            },

            // Test case: Bot should return empty string if no command matches.
            'returns empty on miss': function (topic) {
                // Simulate a message that does not match any command.
                var result = topic.handleMessage({body: '!swing and a miss'});
                // Assert that the result is an empty string.
                assert.equal('', result);
            }
        },


        // A nested context for multi-room task handling tests.
        'multi-room task handling': {
            // Topic function to set up a bot with room-specific task configurations.
            topic: function () {
                // Define a configuration with tasks and room-task mappings.
                var config = {
                    tasks: {
                        'QueueManager': '../lib/queue-manager', // Task 1
                        'Help': '../lib/help'                   // Task 2
                    },
                    rooms: {
                        'test1': ['QueueManager'], // Only QueueManager in room 'test1'
                        'test2': ['Help']         // Only Help in room 'test2'
                    }
                };
                // Create and return a new Bot instance with this configuration.
                var bot = new Bot(config);
                return bot;
            },

            // Test case: Tasks not configured for a specific room should not respond to messages in that room.
            'tasks not in a room will not respond to messages': function (topic) {
                // Request for 'Help' in 'test1' (where 'Help' is not configured).
                var request = {
                    room: 'test1',
                    body: '!help'
                };
                var resp = topic.handleMessage(request);
                // Expect an empty response.
                assert.equal(resp, '', 'Help task is not bound in room test1');

                // Request for 'QueueManager' in 'test2' (where 'QueueManager' is not configured).
                request = {
                    room: 'test2',
                    body: '!qls'
                };
                resp = topic.handleMessage(request);
                // Expect an empty response.
                assert.equal(resp, '');
            },

            // Test case: Tasks configured for a specific room should respond to messages in that room.
            'tasks in a room will respond to messages': function (topic) {
                // Request for 'QueueManager' in 'test1' (where 'QueueManager' IS configured).
                var request = {
                    room: 'test1',
                    body: '!qls'
                };
                var resp = topic.handleMessage(request);
                // Expect a non-empty response containing "Hotfix".
                assert.ok(/Hotfix/.test(resp.body), 'Should have replied');

                // Request for 'Help' in 'test2' (where 'Help' IS configured).
                request = {
                    room: 'test2',
                    body: '!help'
                };
                resp = topic.handleMessage(request);
                // Expect a non-empty response containing "Available Commands".
                assert.ok(/Available Commands/.test(resp), 'Help should have displayed');
            }
        }

    }) // End of addBatch call.
    .export(module); // Export the test suite for Vows to run.