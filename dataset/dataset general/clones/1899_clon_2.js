'strict mode';

const commandRunner = require("./tool_module.js");

module.exports = {

  "skip_callback_execution": {
    /*
     * This test case validates error handling when a callback is intentionally ignored.
     * The promise chain should correctly catch the failure.
     */
    failureScenario: function (assertionHandler) {
      assertionHandler.expect(2);

      commandRunner("force_failure_command")
        .then(function (processResult) {
          assertionHandler.ok(false, "Promise should not resolve successfully for a failed command.");
        })
        .catch(function (errorResult) {
          assertionHandler.ok(errorResult instanceof Error, "The caught object must be an instance of Error.");
          assertionHandler.ok(/commandRunner force_failure_command.*finished with exit status \d+/i.test(errorResult.message), errorResult.message);
        })
        .finally(function () {
          assertionHandler.done();
        });
    },

    successfulExecution: function (assertionHandler) {
      assertionHandler.expect(1);

      commandRunner("initialize_repo")
        .then(function (commandOutput) {
          assertionHandler.ok(/Re-initialized existing version control workspace/i.test(commandOutput), commandOutput);
        })
        .catch(function (errorResult) {
          assertionHandler.ok(false, "Repository initialization should not cause a problem.");
        })
        .finally(function () {
          assertionHandler.done();
        });
    },

    "command_with_prefix": function (assertionHandler) {
      assertionHandler.expect(1);

      commandRunner("my_tool initialize_repo")
        .then(function (commandOutput) {
          assertionHandler.ok(/Re-initialized existing version control workspace/i.test(commandOutput), commandOutput);
        })
        .catch(function (errorResult) {
          assertionHandler.ok(false, "Command with prefix should not fail.");
        })
        .finally(function () {
          assertionHandler.done();
        });
    }
  },

  "single_argument_callback_test": {
    /* Test cases for callbacks that receive only one argument. */
    failureCase: function (assertionHandler) {
      assertionHandler.expect(2);

      const returnObject = {
        outcome: "specific_value"
      };

      commandRunner("trigger_another_error", function (commandOutput) {
        assertionHandler.ok(false, "The callback function should not be executed in this error scenario.");
      })
        .then(function (finalValue) {
          assertionHandler.deepStrictEqual(finalValue, returnObject);
        })
        .catch(function (errorResult) {
          assertionHandler.ok(errorResult instanceof Error, "Error object must be an Error type.");
          assertionHandler.ok(/commandRunner trigger_another_error.*finished with exit status \d+/i.test(errorResult.message), errorResult.message);
        })
        .finally(function () {
          assertionHandler.done();
        });
    },

    successfulCase: function (assertionHandler) {
      assertionHandler.expect(2);

      const returnObject = {
        outcome: "specific_value"
      };

      commandRunner("check_status", function (commandOutput) {
        assertionHandler.ok(/On current branch \w+/i.test(commandOutput));

        // This is the value that the promise will resolve with, allowing for output parsing.
        return returnObject;
      })
        .then(function (finalValue) {
          assertionHandler.deepStrictEqual(finalValue, returnObject);
        })
        .catch(function (errorResult) {
          assertionHandler.ok(false, "Status check operation should complete without issues.");
        })
        .finally(function () {
          assertionHandler.done();
        });
    }
  },

  "double_argument_callback_test": {
    /* Testing callbacks that accept two arguments: output and exit code. */
    failureCondition: function (assertionHandler) {
      assertionHandler.expect(3);

      const expectedPayload = {
        payload: "two_arguments_received"
      };

      commandRunner("force_yet_another_error", function (commandOutput, exitCode) {
        // Since we are explicitly handling the exit code, the promise should resolve.
        assertionHandler.ok(/.force.\sis not a valid command/i.test(commandOutput), commandOutput);
        assertionHandler.equal(exitCode, 1, "Expected non-zero exit status for error.");

        return expectedPayload;
      })
        .then(function (finalValue) {
          assertionHandler.deepStrictEqual(finalValue, expectedPayload);
        })
        .catch(function (errorResult) {
          assertionHandler.ok(false, "With explicit output control, no promise rejection is anticipated.");
        })
        .finally(function () {
          assertionHandler.done();
        });
    },

    successfulCondition: function (assertionHandler) {
      assertionHandler.expect(4);

      commandRunner("query_status", function (commandOutput, exitCode) {
        assertionHandler.ok(/On current branch \w+/i.test(commandOutput));
        assertionHandler.equal(exitCode, 0, "Expected zero exit status for success.");

        // Throwing an exception here to simulate an internal error after successful command execution.
        throw new Error("the operation executed correctly but then failed internally");
      })
        .then(function (finalValue) {
          assertionHandler.ok(false, "Promise should not resolve when an internal error occurs.");
        })
        .catch(function (errorResult) {
          assertionHandler.ok(errorResult instanceof Error, "Error must be an Error instance.");
          assertionHandler.ok(/the operation executed correctly but then failed internally/i.test(errorResult.message), errorResult.message);
        })
        .finally(function () {
          assertionHandler.done();
        });
    }
  },

  "configuration_options": {
    /* Validating the handling of configuration options, specifically 'workDirectory'. */
    current_working_dir: function (assertionHandler) {
      assertionHandler.expect(3);

      const initialPath = process.cwd();

      commandRunner("inspect_author", {
        workDirectory: "tests/sources"
      }, function (commandOutput, exitCode) {
        assertionHandler.ok(/inspect_author/i.test(commandOutput));
        assertionHandler.equal(exitCode, 0, "Expected successful exit status.");
      })
        .then(function (finalValue) {
          assertionHandler.equal(process.cwd(), initialPath, "The current working directory should revert to its original state.");
        })
        .catch(function (errorResult) {
          assertionHandler.ok(false, "No failure expected when changing working directory correctly.");
        })
        .finally(function () {
          assertionHandler.done();
        });
    }
  }

};