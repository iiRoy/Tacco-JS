'use strict'; // Enforce strict mode for cleaner code practices

// Import necessary modules using modern JavaScript syntax
const RemoteShell = require('../lib/ssh.js'); // The core SSH client library, aliased for clarity
const assert = require('expect.js'); // Assertion library for testing outcomes
const fileSystem = require('fs'); // Node.js file system module for reading files

// Load connection parameters from a configuration file
const connectionSettings = require('../config/ssh.json');
let remoteClient; // Instance of our remote shell client, initialized per test

/**
 * Utility function to log test activities.
 * @param {string} message - The message to log.
 */
function logTestActivity(message) {
    // console.log(`[TEST_ACTIVITY] ${message}`); // Uncomment for verbose test logging
}

// Top-level test suite for the RemoteShell client functionality
suite('RemoteShell Client Operations', function() {
    // Pre-check and process connection key if specified in settings.
    // This is a common setup step for secure connections.
    if (connectionSettings.keyPath) { // Renamed 'key' to 'keyPath' for clarity
        try {
            // Read the SSH private key from the specified path
            connectionSettings.key = fileSystem.readFileSync(connectionSettings.keyPath, 'utf8'); // Added 'utf8' encoding
            logTestActivity(`Successfully loaded SSH key from: ${connectionSettings.keyPath}`);
        } catch (fileError) {
            console.error(`ERROR: Could not read SSH key file at ${connectionSettings.keyPath}.`, fileError.message);
            // Optionally, we could throw an error here to halt tests if key is essential
            // throw new Error(`Failed to load SSH key: ${fileError.message}`);
        }
    } else {
        logTestActivity('No SSH key path specified in connection settings. Proceeding without key.');
    }

    // Setup routine executed before each individual test case
    setupEachTest(function() {
        // Initialize a new RemoteShell instance with the connection parameters
        remoteClient = new RemoteShell(connectionSettings);
        assert.ok(remoteClient, 'RemoteShell client should be instantiated successfully.'); // Added guard clause
        logTestActivity('New RemoteShell client initialized for test.');
    });

    // Teardown routine executed after each individual test case
    // Ensuring connections are properly closed to prevent resource leaks
    teardownEachTest(function(testCompleted) { // Changed `done` to `testCompleted`
        if (remoteClient && remoteClient._activeConnectionInstance) {
            logTestActivity('Ensuring connection is terminated after test.');
            // A small delay to allow any pending operations to complete, if necessary
            setTimeout(() => {
                remoteClient.terminateConnection();
                testCompleted();
            }, 50);
        } else {
            testCompleted();
        }
    });

    // Nested suite for connection initiation functionality
    suite('Connection Initiation (initiateConnection)', function() {
        testCase('should establish a connection when provided with valid credentials', function(testCompleted) {
            logTestActivity('Attempting to connect with valid information...');
            remoteClient.initiateConnection({
                onSuccess: () => {
                    logTestActivity('Connection established successfully.');
                    assert.ok(remoteClient._activeConnectionInstance, 'Active connection instance should exist.'); // Added validation
                    testCompleted(); // Signal test completion on success
                },
                onError: (errorDetail) => {
                    logTestActivity(`Connection failed unexpectedly: ${errorDetail.message}`);
                    assert.fail(`Connection should have succeeded, but failed with: ${errorDetail.message}`); // More descriptive failure
                }
            });
        });

        testCase('should fail to connect when given invalid host information', function(testCompleted) {
            logTestActivity('Attempting to connect with invalid host...');
            // Intentionally setting an invalid target host for this specific test
            remoteClient.targetHost = 'this.is.definitely.not.a.valid.hostname.local';
            remoteClient.initiateConnection({
                onSuccess: () => {
                    logTestActivity('ERROR: Connected successfully with invalid host, this should not happen.');
                    assert.fail('Should not be able to connect with an invalid hostname.');
                },
                onError: (errorDetail) => {
                    logTestActivity(`Connection failed as expected with: ${errorDetail.message}`);
                    assert.ok(errorDetail, 'An error object should be provided on failure.'); // Added validation
                    testCompleted(); // Signal test completion on expected failure
                }
            });
        });
    });

    // Nested suite for connection termination functionality
    suite('Connection Termination (terminateConnection)', function() {
        testCase('should properly close the current active connection', function(testCompleted) {
            logTestActivity('Setting up connection for termination test...');
            // Ensure connection is established before attempting to terminate it
            remoteClient.initiateConnection({
                onSuccess: () => {
                    assert.ok(remoteClient._activeConnectionInstance, 'Connection must be active before termination.');
                    // Listen for the 'connectionClosed' event on the internal connection object
                    remoteClient._activeConnectionInstance.addEventHandler('connectionClosed', () => { // Renamed 'on' to 'addEventHandler', 'close' to 'connectionClosed'
                        logTestActivity('Connection closed event received.');
                        assert.notOk(remoteClient._activeConnectionInstance, 'Active connection instance should be null after termination.'); // Added validation
                        testCompleted(); // Signal test completion once closed
                    });
                    logTestActivity('Initiating connection termination.');
                    remoteClient.terminateConnection(); // Call the termination method
                },
                onError: (errorDetail) => {
                    assert.fail(`Failed to establish connection for termination test: ${errorDetail.message}`);
                }
            });
        });
    });

    // Nested suite for command execution functionality
    suite('Command Execution (executeCommand)', function() {
        testCase('should enqueue a single command for later execution', function() {
            logTestActivity('Testing command queuing...');
            remoteClient.executeCommand('list_items');
            assert.equal(remoteClient._queuedCommands.length, 1, 'Command queue should contain exactly one command.');
        });

        testCase('should correctly append arguments to the command string', function() {
            logTestActivity('Testing command argument appending...');
            const baseCommand = 'process_data';
            const argumentList = ['--input', 'file.txt', '--output', 'result.json'];
            remoteClient.executeCommand(baseCommand, {
                commandArguments: argumentList
            });

            const queuedCommandDetails = remoteClient._queuedCommands[0];
            const fullCommandString = queuedCommandDetails.commandString;

            // Reconstructing the expected command string
            const expectedCommand = `${baseCommand} ${argumentList.map(arg => arg.includes(' ') ? `'${arg}'` : arg).join(' ')}`; // Enhanced argument handling
            assert.equal(fullCommandString, expectedCommand, 'Command string should include all arguments correctly.');
        });

        testCase('should capture and return standard output (stdout)', function(testCompleted) {
            logTestActivity('Testing stdout capture...');
            const expectedOutputContent = 'Hello Remote World!';
            remoteClient.executeCommand('echo', {
                commandArguments: [`"${expectedOutputContent}"`],
                onStdout: (standardOutput) => {
                    const cleanedOutput = standardOutput.removeWhitespace(); // Renamed 'trim' to 'removeWhitespace'
                    logTestActivity(`Captured stdout: '${cleanedOutput}'`);
                    assert.equal(cleanedOutput, expectedOutputContent, 'Captured stdout should match expected output.');
                    testCompleted();
                }
            }).initiateConnection(); // Start connection after queueing
        });

        testCase('should capture and return standard error (stderr)', function(testCompleted) {
            logTestActivity('Testing stderr capture...');
            const errorMessageContent = 'Something went wrong!';
            remoteClient.executeCommand('bash', { // Using bash to reliably redirect to stderr
                commandArguments: ['-c', `echo "${errorMessageContent}" >&2`],
                onStderr: (standardError) => {
                    const cleanedError = standardError.removeWhitespace();
                    logTestActivity(`Captured stderr: '${cleanedError}'`);
                    assert.equal(cleanedError, errorMessageContent, 'Captured stderr should match expected error message.');
                    testCompleted();
                }
            }).initiateConnection();
        });

        testCase('should capture and return the command exit code', function(testCompleted) {
            logTestActivity('Testing exit code capture...');
            const minCode = 1;
            const maxCode = 127; // Standard max exit code
            const randomExitCode = Math.floor(Math.random() * (maxCode - minCode + 1)) + minCode; // Generate random code within a reasonable range

            remoteClient.executeCommand('exit', {
                commandArguments: [randomExitCode.toString()], // Ensure argument is a string
                onExit: (returnedExitCode) => {
                    logTestActivity(`Captured exit code: ${returnedExitCode}`);
                    assert.equal(returnedExitCode, randomExitCode, 'Captured exit code should match the set exit code.');
                    testCompleted();
                }
            }).initiateConnection();
        });

        testCase('should correctly handle a sequence of multiple commands', function(testCompleted) {
            logTestActivity('Testing multiple command execution...');
            let commandsExecuted = 0;
            const totalCommands = 3;

            // Adding a guard function for command completion
            const onCommandComplete = (cmdName) => {
                commandsExecuted++;
                logTestActivity(`Command '${cmdName}' completed. Total: ${commandsExecuted}`);
                if (commandsExecuted === totalCommands) {
                    testCompleted();
                }
            };

            remoteClient
                .executeCommand('echo "First"', { onExit: () => onCommandComplete('First') })
                .executeCommand('echo "Second"', { onExit: () => onCommandComplete('Second') })
                .executeCommand('echo "Third"', { onExit: () => onCommandComplete('Third') })
                .initiateConnection();
        });

        testCase('should allow dynamic adjustment of the base working directory', function(testCompleted) {
            logTestActivity('Testing working directory changes...');
            const rootDir = '/';
            const userHomeDir = '/home/user'; // Example path, assuming 'user' exists

            remoteClient.workingDirectory = rootDir; // Set initial base directory
            remoteClient
                .executeCommand('pwd', {
                    onStdout: (receivedData) => {
                        const currentDir = receivedData.removeWhitespace();
                        logTestActivity(`First PWD output: '${currentDir}'`);
                        assert.equal(currentDir, rootDir, 'First PWD should be the root directory.');
                        remoteClient.workingDirectory = userHomeDir; // Change base directory for the next command
                    }
                })
                .executeCommand('pwd', {
                    onStdout: (receivedData) => {
                        const currentDir = receivedData.removeWhitespace();
                        logTestActivity(`Second PWD output: '${currentDir}'`);
                        assert.equal(currentDir, userHomeDir, 'Second PWD should be the user home directory.');
                        testCompleted();
                    }
                })
                .initiateConnection();
        });

        testCase('should correctly process `sudo` commands when pseudo-terminal (pty) is enabled', function(testCompleted) {
            logTestActivity('Testing sudo command with PTY...');
            const testInputString = 'SecretData';
            let collectedOutput = '';

            remoteClient.executeCommand('sudo echo', {
                allocatePseudoTerminal: true, // Renamed 'pty'
                commandArguments: [`"${testInputString}"`],
                onStdout: (receivedData) => {
                    collectedOutput += receivedData.removeWhitespace();
                    logTestActivity(`Sudo command stdout part: '${receivedData.removeWhitespace()}'`);
                },
                onExit: (exitCode) => {
                    logTestActivity(`Sudo command exited with code: ${exitCode}. Collected output: '${collectedOutput}'`);
                    assert.equal(collectedOutput, testInputString, 'Sudo command output should match the input string.');
                    assert.equal(exitCode, 0, 'Sudo command should exit with code 0 on success.');
                    testCompleted();
                }
            }).initiateConnection();
        });

        testCase('should halt subsequent command execution if an `onExit` handler returns false', function(testCompleted) {
            logTestActivity('Testing command queue interruption...');
            let firstCommandExecuted = false;

            remoteClient
                .executeCommand('echo "First command"', {
                    onExit: () => {
                        firstCommandExecuted = true;
                        logTestActivity('First command completed and returned false to stop queue.');
                        testCompleted(); // Indicate test completion here as the second command should not run
                        return false; // Crucial for stopping the queue
                    }
                })
                .executeCommand('echo "Second command - should be ignored"', {
                    onExit: () => {
                        assert.fail('This command should have been ignored due to previous handler returning false.');
                    }
                })
                .initiateConnection();
        });

        testCase('should start a fresh command queue if `onExit` returns false and new commands are added', function(testCompleted) {
            logTestActivity('Testing new command queue creation after interruption...');
            let initialQueueInterrupted = false;

            remoteClient
                .executeCommand('echo "Initial command"', {
                    onExit: () => {
                        initialQueueInterrupted = true;
                        logTestActivity('Initial command completed, interrupting queue and adding new commands.');
                        // Add a new command to a fresh queue
                        remoteClient.executeCommand('echo "New queue command"', {
                            onExit: () => {
                                logTestActivity('New queue command completed successfully.');
                                assert.ok(initialQueueInterrupted, 'Initial queue must have been interrupted.');
                                testCompleted();
                            }
                        });
                        return false; // Interrupt the current queue
                    }
                })
                .executeCommand('echo "Should be ignored by interruption"', {
                    onExit: () => {
                        assert.fail('This command from the original queue should have been ignored.');
                    }
                })
                .initiateConnection();
        });

        testCase('should append new commands to the existing queue if `onExit` does not return false', function(testCompleted) {
            logTestActivity('Testing command appending to continuous queue...');
            let executionCounter = 0; // Renamed callCount

            remoteClient
                .executeCommand('cmd_alpha', {
                    onExit: () => {
                        assert.equal(executionCounter, 0, 'Alpha should be first.');
                        executionCounter += 1;
                        logTestActivity('Alpha command executed.');
                    }
                })
                .executeCommand('cmd_beta', {
                    onExit: () => {
                        assert.equal(executionCounter, 1, 'Beta should be second.');
                        executionCounter += 1;
                        logTestActivity('Beta command executed. Adding new command.');

                        // Dynamically add a new command in the middle of execution
                        remoteClient.executeCommand('cmd_dynamic', {
                            onExit: () => {
                                assert.equal(executionCounter, 3, 'Dynamic command should be fourth.'); // This would be 3 if gamma runs after dynamic.
                                executionCounter += 1;
                                logTestActivity('Dynamic command executed.');
                                testCompleted(); // All commands done
                            }
                        });
                    }
                })
                .executeCommand('cmd_gamma', {
                    onExit: () => {
                        assert.equal(executionCounter, 2, 'Gamma should be third.');
                        executionCounter += 1;
                        logTestActivity('Gamma command executed.');
                    }
                })
                .initiateConnection();
        });
    });

    // Nested suite for client reinitialization functionality
    suite('Client Reinitialization (reinitializeClient)', function() {
        testCase('should create a brand new internal connection object', function() {
            logTestActivity('Testing client reinitialization for new connection object...');
            const previousConnectionObject = remoteClient._activeConnectionInstance; // Renamed oldConnection
            assert.ok(previousConnectionObject, 'Initial connection object must exist.');

            remoteClient.reinitializeClient(); // Call the reset method
            const newConnectionObject = remoteClient._activeConnectionInstance;

            assert.notEqual(newConnectionObject, previousConnectionObject, 'New connection object should be different from the old one.');
            assert.ok(newConnectionObject, 'A new connection object should be created.');
            logTestActivity('Client reinitialized, new connection object created.');
        });

        testCase('should clear all pending commands from the queue', function() {
            logTestActivity('Testing command queue clearing on reinitialization...');
            remoteClient
                .executeCommand('first_cmd')
                .executeCommand('second_cmd')
                .executeCommand('third_cmd');
            assert.equal(remoteClient._queuedCommands.length, 3, 'Command queue should initially have 3 commands.');

            remoteClient.reinitializeClient(); // Call reset
            assert.equal(remoteClient._queuedCommands.length, 0, 'Command queue should be empty after reinitialization.');
            logTestActivity('Command queue cleared upon client reinitialization.');
        });

        testCase('should terminate the current connection before replacing it with a new one', function(testCompleted) {
            logTestActivity('Testing connection termination during reinitialization...');
            let initialConnectionEnded = false;
            let unexpectedCommandExecuted = false;

            remoteClient
                .executeCommand('echo "Pre-reset command"', {
                    onExit: () => {
                        logTestActivity('Pre-reset command finished. Initiating client reinitialization.');
                        initialConnectionEnded = true;
                        remoteClient.reinitializeClient(); // This should stop further commands in the old connection
                        testCompleted(); // The test completes here if the next command is correctly ignored
                    }
                })
                .executeCommand('echo "Post-reset command - should be ignored"', {
                    onExit: () => {
                        unexpectedCommandExecuted = true;
                        assert.fail('This command should have been ignored because the connection was reset.');
                    }
                })
                .initiateConnection();

            // A short delay to ensure any unexpected execution of the second command would register
            setTimeout(() => {
                if (!initialConnectionEnded) {
                    assert.fail('The initial command did not execute as expected.');
                }
                if (unexpectedCommandExecuted) {
                    assert.fail('The post-reset command was unexpectedly executed.');
                }
                // If testCompleted() was called in the onExit of the first command, this will be redundant but harmless.
                // If it wasn't called, this will eventually time out or fail if the assert.fail was triggered.
            }, 100);
        });
    });
});

// Extend String prototype for convenience, similar to existing functionality
if (!String.prototype.removeWhitespace) {
    String.prototype.removeWhitespace = function() {
        return this.trim();
    };
}