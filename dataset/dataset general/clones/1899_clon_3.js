'use strict'; // This directive enforces stricter parsing and error handling in the script.

// Importing the core module responsible for handling Source Code Management (SCM) operations.
// The relative path has been adjusted to reflect a potential refactoring or different module structure.
const versionControlHandler = require('./core_scm_interface.js');

/**
 * A utility function to ensure the test framework's completion method is called reliably.
 * This abstracts away the direct call to `test.done()` and can include additional logic if needed.
 * @param {object} testFramework - The test harness object provided by the testing environment.
 */
function signalTestCompletion(testFramework) {
    if (testFramework && typeof testFramework.done === 'function') {
        testFramework.done();
    } else {
        // Log a warning if the test framework's done method is unavailable or invalid.
        console.warn("Warning: Test completion signal could not be sent. 'done' method missing or invalid.");
    }
}

// Exporting a collection of test suites, each focusing on different aspects of SCM command execution.
module.exports = {

    /**
     * Test suite for scenarios where the primary interest is in the Promise chain's resolution/rejection,
     * with no explicit callback function provided to the SCM handler.
     */
    "promise_chain_only_execution_tests": {

        // Test case: Verifying proper error handling when a command fails and no callback is used.
        "command_failure_no_callback": function(testHarness) {
            // Setting the expected number of assertions for this test case.
            testHarness.expect(2);

            const invalidScmCommand = "unrecognized_scm_action --non-existent-flag"; // An intentionally malformed command.

            versionControlHandler(invalidScmCommand)
                .then(function(successfulResult) {
                    // This block should never be reached if the command fails as expected.
                    testHarness.ok(false, "The promise should have been rejected, not resolved, for a failing command.");
                })
                .catch(function(errorDetails) { // Using standard .catch for promise rejection.
                    // Assert that the received error object is indeed an instance of Error.
                    testHarness.ok(errorDetails instanceof Error, "The caught object must be an instance of JavaScript Error.");
                    // Validate the error message content for expected patterns, dynamically checking the command name.
                    const expectedErrorMessagePattern = new RegExp(`^${invalidScmCommand.split(' ')[0]}.*exited with error code \\d+`, 'i');
                    testHarness.ok(expectedErrorMessagePattern.test(errorDetails.message), `Error message mismatch: ${errorDetails.message}`);
                })
                .finally(function() { // Using standard .finally for guaranteed cleanup/completion.
                    // Ensuring the test runner is informed that this test has finished.
                    signalTestCompletion(testHarness);
                });
        },

        // Test case: Verifying successful command execution without a callback.
        "command_success_no_callback": function(testHarness) {
            testHarness.expect(1); // One assertion expected.

            const initializationAction = "init"; // A standard SCM initialization command.

            versionControlHandler(initializationAction)
                .then(function(operationOutcome) {
                    // Confirming that the output contains the expected success message for repository reinitialization.
                    testHarness.ok(/Reinitialized existing Git repository/i.test(operationOutcome), `Unexpected output for successful initialization: ${operationOutcome}`);
                })
                .catch(function(failureEvent) {
                    // This path indicates an unexpected failure, which should not happen for 'init'.
                    testHarness.ok(false, `SCM initialization should not have resulted in an error. Details: ${failureEvent.message}`);
                })
                .finally(function() {
                    signalTestCompletion(testHarness);
                });
        },

        // Test case: Handling commands that include the SCM tool's name as a prefix.
        "prefixed_scm_command_handling": function(testHarness) {
            testHarness.expect(1); // Expecting a single assertion.

            const explicitInitCommand = "git init"; // Command explicitly prefixed with 'git'.

            versionControlHandler(explicitInitCommand)
                .then(function(commandResult) {
                    // Verifying the success message for reinitializing the repository.
                    testHarness.ok(/Reinitialized existing Git repository/i.test(commandResult), `Output for prefixed command was not as expected: ${commandResult}`);
                })
                .catch(function(unexpectedProblem) {
                    // This error path should not be taken if the command is valid.
                    testHarness.ok(false, `Execution of prefixed command '${explicitInitCommand}' unexpectedly failed. Error: ${unexpectedProblem.message}`);
                })
                .finally(function() {
                    signalTestCompletion(testHarness);
                });
        }
    },

    /**
     * Test suite focusing on scenarios where the SCM handler is invoked with a single-parameter callback.
     * The callback's return value will dictate the promise's resolution.
     */
    "single_parameter_callback_behavior": {

        // Test case: Command fails, and a single-parameter callback is provided.
        "command_failure_with_single_callback": function(testHarness) {
            testHarness.expect(3); // Three assertions expected.

            // A predefined value that the callback would return if executed.
            const designatedCallbackReturn = {
                callback_data: "processed_error_output"
            };
            const commandWithError = "attempt_invalid_operation"; // A command designed to fail.

            versionControlHandler(commandWithError, function(rawOutputString) {
                    // If the command truly fails externally, this callback might not be invoked.
                    testHarness.ok(false, "The single-parameter callback should not be invoked if the SCM command fails externally.");
                    return designatedCallbackReturn; // This return value would determine promise resolution if callback was called.
                })
                .then(function(successfulResolution) {
                    // This block should not be reached if the command fails and the callback is bypassed.
                    testHarness.ok(false, "Promise should not resolve successfully when the underlying command fails.");
                })
                .catch(function(rejectionInfo) {
                    // Verifying the error type and message for the command failure.
                    testHarness.ok(rejectionInfo instanceof Error, "The error object must be an Error instance.");
                    const errorPattern = new RegExp(`^${commandWithError.split(' ')[0]}.*exited with error code \\d+`, 'i');
                    testHarness.ok(errorPattern.test(rejectionInfo.message), `Mismatch in failure message: ${rejectionInfo.message}`);
                    testHarness.ok(true, "Successfully caught the expected command execution error."); // Affirmative assertion.
                })
                .finally(function() {
                    signalTestCompletion(testHarness);
                });
        },

        // Test case: Command succeeds, and a single-parameter callback transforms the output.
        "command_success_with_single_callback": function(testHarness) {
            testHarness.expect(2); // Two assertions expected.

            // The specific object that the callback will return, thereby resolving the promise.
            const customTransformedResult = {
                status_summary: "current_branch_state"
            };
            const statusQueryCommand = "status"; // A command that typically succeeds.

            versionControlHandler(statusQueryCommand, function(commandOutputText) {
                    // Asserting that the initial command output matches expectations.
                    testHarness.ok(/On branch \w+/i.test(commandOutputText), `Unexpected output for status command: ${commandOutputText}`);
                    // The value returned by this callback determines the promise's final resolution.
                    return customTransformedResult;
                })
                .then(function(finalResolvedValue) {
                    // Asserting that the promise resolved with the exact object returned by the callback.
                    testHarness.deepEqual(finalResolvedValue, customTransformedResult, "Promise did not resolve with the expected custom object from the callback.");
                })
                .catch(function(unexpectedProblem) {
                    // This block should not be reached for a successful SCM status command.
                    testHarness.ok(false, `SCM status command unexpectedly failed. Error: ${unexpectedProblem.message}`);
                })
                .finally(function() {
                    signalTestCompletion(testHarness);
                });
        }
    },

    /**
     * Test suite for scenarios where the SCM handler is invoked with a two-parameter callback.
     * The second parameter typically provides the exit code, allowing the callback to handle command failures.
     */
    "two_parameter_callback_evaluation": {

        // Test case: Command fails, but the two-parameter callback processes the error output and exit code.
        "command_failure_with_dual_callback": function(testHarness) {
            testHarness.expect(3); // Three assertions.

            // A specific object that the callback will return, resolving the promise despite command failure.
            const processedCallbackOutcome = {
                error_parsed: "command_not_found_handled"
            };
            const nonExistentCommand = "this_command_does_not_exist_in_scm"; // An command guaranteed to fail.

            versionControlHandler(nonExistentCommand, function(stdErrorOutput, exitStatusCode) {
                    // Since a two-parameter callback is provided, it's invoked even if the command fails.
                    testHarness.ok(/is not a git command/i.test(stdErrorOutput), `Error output mismatch: ${stdErrorOutput}`);
                    // Asserting the expected non-zero exit code for a failed command.
                    testHarness.equal(exitStatusCode, 1, `Expected exit code 1 for failure, but received ${exitStatusCode}`);
                    return processedCallbackOutcome; // This value will resolve the promise.
                })
                .then(function(finalResolvedData) {
                    // The promise should resolve with the value returned by the callback, as the callback handled the error.
                    testHarness.deepEqual(finalResolvedData, processedCallbackOutcome, "Promise did not resolve with the expected processed callback outcome.");
                })
                .catch(function(unexpectedRejection) {
                    // This block should not be reached because the callback successfully processed the error.
                    testHarness.ok(false, `Promise should not have been rejected, as the callback handled the command's error. Error: ${unexpectedRejection.message}`);
                })
                .finally(function() {
                    signalTestCompletion(testHarness);
                });
        },

        // Test case: Command succeeds, but the two-parameter callback intentionally throws an error, causing promise rejection.
        "command_success_dual_callback_then_throw": function(testHarness) {
            testHarness.expect(3); // Three assertions.

            const successfulScmCommand = "status"; // A command expected to execute successfully.
            const deliberateCallbackError = new Error("intentional error originating from callback processing");

            versionControlHandler(successfulScmCommand, function(standardOutput, statusValue) {
                    // Verify the successful execution output and zero exit code.
                    testHarness.ok(/On branch \w+/i.test(standardOutput), `Unexpected output for successful command: ${standardOutput}`);
                    testHarness.equal(statusValue, 0, `Expected exit code 0 for success, got ${statusValue}`);
                    // Intentionally throwing an error from within the callback to test promise rejection.
                    throw deliberateCallbackError;
                })
                .then(function(unintendedResolution) {
                    // This block should not be reached because the callback threw an error.
                    testHarness.ok(false, "Promise should not have resolved successfully after an error was thrown from the callback.");
                })
                .catch(function(rejectionReason) {
                    // Verify that the promise rejected with the specific error thrown by the callback.
                    testHarness.ok(rejectionReason instanceof Error, "The rejection reason must be an Error instance.");
                    testHarness.ok(/intentional error originating from callback processing/i.test(rejectionReason.message), `Rejection message mismatch: ${rejectionReason.message}`);
                })
                .finally(function() {
                    signalTestCompletion(testHarness);
                });
        }
    },

    /**
     * Test suite for validating various execution options passed to the SCM handler.
     */
    "execution_options_verification": {

        // Test case: Overriding the current working directory (CWD) for a specific command execution.
        "custom_working_directory_execution": function(testHarness) {
            testHarness.expect(3); // Three assertions.

            const initialExecutionDirectory = process.cwd(); // Storing the current directory before the test.
            const targetSubPath = "test/resources"; // A predefined subdirectory to change into.
            const commandForCwdTest = "log --max-count=1"; // A command to run within the changed directory.

            // Optional: Basic validation to ensure the target subdirectory exists.
            try {
                require('fs').accessSync(targetSubPath, require('fs').constants.F_OK);
                // console.log(`Debug: Target directory '${targetSubPath}' exists.`);
            } catch (e) {
                console.error(`Error: Target directory '${targetSubPath}' does not exist. This test may fail.`, e.message);
                // In a real scenario, one might skip the test or create the directory.
            }

            versionControlHandler(commandForCwdTest, {
                    cwd: targetSubPath // Specifying a custom current working directory for this command.
                },
                function(commandResultOutput, finalStatusCode) {
                    // Asserting the expected output and status code for the command run in the custom CWD.
                    testHarness.ok(/log --max-count=1/i.test(commandResultOutput), `Expected command output, got: ${commandResultOutput}`);
                    testHarness.equal(finalStatusCode, 0, `Expected status code 0, got ${finalStatusCode}`);
                })
                .then(function(resolvedValue) {
                    // Crucially, verify that the process's CWD has reverted to its original state after the command.
                    testHarness.equal(process.cwd(), initialExecutionDirectory, "Process's CWD should revert to its original path after the command completes.");
                })
                .catch(function(executionError) {
                    // This block signifies an unexpected failure during command execution with CWD override.
                    testHarness.ok(false, `Command execution with custom CWD failed unexpectedly: ${executionError.message}`);
                })
                .finally(function() {
                    signalTestCompletion(testHarness);
                });
        }
    }
};