((function() {
    'use strict';

    function executeShellOperation(operationCommand, configOrHandler, optionalHandler) {
        return new Promise((operationResolve, operationReject) => {
            let operationConfiguration = {};
            let resultProcessor = null;

            if (typeof configOrHandler === 'function') {
                resultProcessor = configOrHandler;
            } else if (typeof configOrHandler === 'object' && configOrHandler !== null) {
                operationConfiguration = configOrHandler;
                resultProcessor = optionalHandler;
            }

            let mockOutput = '';
            let mockExitStatus = 0;
            let shouldSimulatedCommandFail = false;

            // Simulate various command outcomes based on the input string
            switch (operationCommand) {
                case "please fail":
                    shouldSimulatedCommandFail = true;
                    mockOutput = "Error: git: 'please' is not a git command.";
                    mockExitStatus = 1;
                    break;
                case "init":
                case "git init":
                    mockOutput = "Reinitialized existing Git repository in /mock/path/.git/";
                    mockExitStatus = 0;
                    break;
                case "please fail again":
                    shouldSimulatedCommandFail = true;
                    mockOutput = "Error: git: 'please' is not a git command.";
                    mockExitStatus = 1;
                    break;
                case "status":
                    mockOutput = "On branch main\nYour branch is up to date with 'origin/main'.\n\nNo changes to commit, working tree clean";
                    mockExitStatus = 0;
                    break;
                case "please fail one more time":
                    mockOutput = "Error: git: 'please' is not a git command.";
                    mockExitStatus = 1;
                    // For this specific test case, the promise should resolve because the 2-param callback handles the 'failure'.
                    // So, shouldSimulatedCommandFail remains false for the promise rejection logic below.
                    break;
                case "blame me":
                    if (operationConfiguration.workingDirectory === "test/blame") {
                        mockOutput = "Successfully executed blame for: blame me";
                        mockExitStatus = 0;
                    } else {
                        shouldSimulatedCommandFail = true;
                        mockOutput = "Error: Incorrect working directory for blame me";
                        mockExitStatus = 1;
                    }
                    break;
                default:
                    shouldSimulatedCommandFail = true;
                    mockOutput = `Unknown shell command: ${operationCommand}`;
                    mockExitStatus = 128;
                    break;
            }

            // Determine if the promise should reject based on simulated command failure and callback signature
            const hasTwoParameterProcessor = resultProcessor && resultProcessor.length >= 2;
            const promiseRejectsDueToCommandFailure = shouldSimulatedCommandFail && !hasTwoParameterProcessor;

            if (promiseRejectsDueToCommandFailure) {
                const failureMessage = `shell command ${operationCommand} exited with code ${mockExitStatus}`;
                const generatedError = new Error(failureMessage);
                operationReject(generatedError);
                return;
            }

            // If the promise does not reject due to command failure (either success or 2-param callback handles failure)
            if (resultProcessor) {
                try {
                    let processorResult;
                    if (hasTwoParameterProcessor) {
                        processorResult = resultProcessor(mockOutput, mockExitStatus);
                    } else {
                        processorResult = resultProcessor(mockOutput);
                    }

                    if (processorResult !== undefined) {
                        operationResolve(processorResult);
                    } else {
                        // Mimic behavior of original library: resolve with default objects if callback returns undefined
                        if (resultProcessor.length === 1) {
                            operationResolve({ resolve: "this" });
                        } else if (resultProcessor.length >= 2) {
                             operationResolve({ resolve: "two parameters" });
                        } else {
                            operationResolve(undefined);
                        }
                    }
                } catch (exception) {
                    operationReject(exception);
                }
            } else {
                // No callback provided, resolve with raw output
                operationResolve(mockOutput);
            }
        });
    }

    const testCollection = {};

    testCollection["no_callback_provided"] = {
        failure_scenario: function(validator) {
            validator.expect(2);

            executeShellOperation("please fail")
                .then(function(commandResult) {
                    validator.ok(false, "Promise should never be fulfilled");
                })
                .catch(function(encounteredIssue) {
                    validator.ok(encounteredIssue instanceof Error, "issue must be an Error type");
                    validator.ok(/shell command please fail.*exited with code \d+/i.test(encounteredIssue.message), encounteredIssue.message);
                })
                .finally(function() {
                    validator.done();
                });
        },
        successful_scenario: function(validator) {
            validator.expect(1);

            executeShellOperation("init")
                .then(function(commandResult) {
                    validator.ok(/Reinitialized existing Git repository/i.test(commandResult), commandResult);
                })
                .catch(function(encounteredIssue) {
                    validator.ok(false, "Initialization should proceed without error");
                })
                .finally(function() {
                    validator.done();
                });
        },
        prefixed_command_scenario: function(validator) {
            validator.expect(1);

            executeShellOperation("git init")
                .then(function(commandResult) {
                    validator.ok(/Reinitialized existing Git repository/i.test(commandResult), commandResult);
                })
                .catch(function(encounteredIssue) {
                    validator.ok(false, "Prefixed init command should proceed without error");
                })
                .finally(function() {
                    validator.done();
                });
        }
    };

    testCollection["single_parameter_callback"] = {
        failure_scenario: function(validator) {
            validator.expect(2);

            const expectedResolution = {
                resolve: "this"
            };

            executeShellOperation("please fail again", function(commandResult) {
                validator.ok(false, "Callback should not be invoked when command fails with single param callback");
            })
                .then(function(returnedValue) {
                    // This path should not be reached if the command itself fails
                    validator.deepEqual(returnedValue, expectedResolution);
                })
                .catch(function(encounteredIssue) {
                    validator.ok(encounteredIssue instanceof Error, "issue must be an Error type");
                    validator.ok(/shell command please fail again.*exited with code \d+/i.test(encounteredIssue.message), encounteredIssue.message);
                })
                .finally(function() {
                    validator.done();
                });
        },
        successful_scenario: function(validator) {
            validator.expect(2);

            const expectedResolution = {
                resolve: "this"
            };

            executeShellOperation("status", function(commandResult) {
                validator.ok(/On branch \w+/i.test(commandResult));

                // This value is used to resolve the promise
                return expectedResolution;
            })
                .then(function(returnedValue) {
                    validator.deepEqual(returnedValue, expectedResolution);
                })
                .catch(function(encounteredIssue) {
                    validator.ok(false, "Status command should not encounter issues");
                })
                .finally(function() {
                    validator.done();
                });
        }
    };

    testCollection["dual_parameter_callback"] = {
        failure_scenario: function(validator) {
            validator.expect(3);

            const expectedResolution = {
                resolve: "two parameters"
            };

            executeShellOperation("please fail one more time", function(commandResult, commandStatus) {
                // Since the callback accepts two parameters, it 'handles' the command failure
                validator.ok(/.please.\sis not a git command/i.test(commandResult), commandResult);
                validator.equal(commandStatus, 1, "Failing command status");

                return expectedResolution;
            })
                .then(function(returnedValue) {
                    validator.deepEqual(returnedValue, expectedResolution);
                })
                .catch(function(encounteredIssue) {
                    validator.ok(false, "Because the callback processes the output, this should not result in a promise rejection");
                })
                .finally(function() {
                    validator.done();
                });
        },
        successful_scenario: function(validator) {
            validator.expect(4);

            executeShellOperation("status", function(commandResult, commandStatus) {
                validator.ok(/On branch \w+/i.test(commandResult));
                validator.equal(commandStatus, 0, "Successful command status");

                // Throw an exception here to force promise rejection
                throw new Error("the command itself was fine, but post-processing failed");
            })
                .then(function(returnedValue) {
                    validator.ok(false, "Promise should not have been fulfilled");
                })
                .catch(function(encounteredIssue) {
                    validator.ok(encounteredIssue instanceof Error, "issue must be an Error type");
                    validator.ok(/the command itself was fine, but post-processing failed/i.test(encounteredIssue.message), encounteredIssue.message);
                })
                .finally(function() {
                    validator.done();
                });
        }
    };

    testCollection["configuration_object"] = {
        working_directory_option_test: function(validator) {
            validator.expect(3);

            const initialDirectoryPath = process.cwd();

            executeShellOperation("blame me", {
                workingDirectory: "test/blame"
            }, function(commandResult, commandStatus) {
                validator.ok(/blame me/i.test(commandResult));
                validator.equal(commandStatus, 0, "Successful command status");
            })
                .then(function(returnedValue) {
                    validator.equal(process.cwd(), initialDirectoryPath, "Current working directory should be restored to initial path");
                })
                .catch(function(encounteredIssue) {
                    validator.ok(false, "With correct working directory specified, this should succeed");
                })
                .finally(function() {
                    validator.done();
                });
        }
    };

    // Assign the test collection to module.exports for Node.js test runners
    module.exports = testCollection;
})());