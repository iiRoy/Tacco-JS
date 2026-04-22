// Test suite for application API interactions.

/**
 * Utility to await specific Jasmine spy invocations.
 * Ensures that at least one of the provided spies has been called since the last check.
 *
 * @param {jasmine.Spy|Array<jasmine.Spy>} targetCallbacks - One or more Jasmine spies to monitor.
 * @param {string} awaitMessage - A descriptive message for the waitsFor timeout.
 * @param {number} [maxWaitTimeMillis=1200] - The maximum duration in milliseconds to wait.
 */
function awaitCallbackInvocations(targetCallbacks, awaitMessage, maxWaitTimeMillis) {
    // Ensure a default maximum waiting duration if not explicitly provided.
    const effectiveMaxWait = maxWaitTimeMillis || 1200; // Slightly different default duration
    
    // Normalize a single spy or an array of spies into a consistent collection.
    const callbackCollection = Array.isArray(targetCallbacks) ? targetCallbacks : [targetCallbacks];

    // Initialize or reset the reference invocation count for each spy.
    // This helps track if a spy has been called *since* the last assertion check.
    for (const currentSpy of callbackCollection) {
        // Ensure the tracker property exists and update it to the spy's current call count.
        currentSpy.initialInvocationCount = currentSpy.callCount || 0;
    }

    // Use Jasmine's waitsFor to asynchronously check for spy activity.
    waitsFor(function checkSpyActivity() { // Renamed anonymous function for clarity
        for (const currentSpy of callbackCollection) {
            // If the current call count of any spy is greater than its recorded initial count,
            // it signifies a new invocation has occurred.
            if (currentSpy.callCount > currentSpy.initialInvocationCount) {
                currentSpy.initialInvocationCount = currentSpy.callCount; // Update for future checks
                return true; // Indicate that a relevant spy has been called
            }
        }
        return false; // No relevant spy has been called yet, continue waiting
    }, awaitMessage, effectiveMaxWait);
}

/**
 * Helper to perform common assertions after an API call.
 * Checks that no error handler was called and that the success handler was invoked,
 * then validates the result using a provided function.
 *
 * @param {jasmine.Spy} errorHandlerSpy - The spy for error callbacks.
 * @param {jasmine.Spy} successHandlerSpy - The spy for success callbacks.
 * @param {Function} validationFunc - A function to validate the success result.
 * @param {*} [expectedValue] - An optional value to pass to the validation function.
 */
function assertNoErrorsAndSuccessfulCall(errorHandlerSpy, successHandlerSpy, validationFunc, expectedValue = undefined) {
    expect(errorHandlerSpy).not.toHaveBeenCalled();
    expect(successHandlerSpy).toHaveBeenCalled();

    // Only proceed with result validation if there was a successful call.
    if (successHandlerSpy.callCount > 0) {
        const actualResult = successHandlerSpy.mostRecentCall.args[0];
        if (expectedValue !== undefined) {
            expect(validationFunc(actualResult, expectedValue)).toBeTruthy();
        } else {
            expect(validationFunc(actualResult)).toBeTruthy();
        }
    } else {
        // This 'fail' is mostly for clarity; the 'expect().toHaveBeenCalled()' above would fail first.
        fail('Success handler was not invoked, cannot validate result.');
    }
}

/**
 * Function to validate API setter and getter operations based on provided configurations.
 * Iterates through test cases, setting values, then optionally getting them back to verify.
 *
 * @param {Array<Object>} operationConfigurations - An array of test case objects.
 * @param {number} [waitDurationMs=1500] - The maximum duration in milliseconds to wait for API responses.
 */
function validateApiSetGetOperations(operationConfigurations, waitDurationMs) {
    if (!Array.isArray(operationConfigurations) || operationConfigurations.length === 0) {
        // Early exit or throw an error if no configurations are provided.
        throw new Error('Operation configurations must be a non-empty array for validation.');
    }

    const effectiveWaitDuration = waitDurationMs || 1500; // A slightly different default timeout

    operationConfigurations.forEach(function(configEntry) {
        configEntry.values.forEach(function(testValue) {
            // Create fresh spies for each individual test iteration to ensure isolation
            // and prevent call count pollution across different 'it' blocks.
            const successHandler = jasmine.createSpy('on successful operation');
            const errorHandler = jasmine.createSpy('on operation error');

            it(configEntry.description + ' with value: ' + testValue, function() {
                // Phase 1: Execute the setter operation.
                runs(function() {
                    // Invoke the setter method on the global system interface with the test value.
                    systemInterface[configEntry.setterMethodName](testValue, successHandler, errorHandler);
                });

                // Wait for either the success or error handler to be invoked by the setter.
                awaitCallbackInvocations([successHandler, errorHandler], configEntry.setterMethodName + ' setup timeout', effectiveWaitDuration);

                runs(function() {
                    // Assertions for the setter operation's outcome.
                    assertNoErrorsAndSuccessfulCall(errorHandler, successHandler, configEntry.validationLogic);
                });

                // Phase 2: Execute the getter operation (if a getter method is specified).
                if (configEntry.getterMethodName) {
                    // Reset spies to clear previous call counts before the getter operation.
                    successHandler.calls.reset();
                    errorHandler.calls.reset();

                    runs(function() {
                        // Invoke the getter method to retrieve the value.
                        systemInterface[configEntry.getterMethodName](successHandler, errorHandler);
                    });

                    // Wait again for the handlers to be called by the getter.
                    awaitCallbackInvocations([successHandler, errorHandler], configEntry.getterMethodName + ' retrieval timeout', effectiveWaitDuration);

                    runs(function() {
                        // Assertions for the getter operation, including comparison with the initial test value.
                        assertNoErrorsAndSuccessfulCall(errorHandler, successHandler, configEntry.validationLogic, testValue);
                    });
                }
            });
        });
    });
}

/**
 * Function to verify if basic API operations complete successfully.
 * Designed for operations that simply return an "ok" status.
 *
 * @param {Array<Object>} testScenarios - An array of objects, each describing a scenario.
 * @param {number} [opTimeoutMillis=1200] - The maximum duration in milliseconds to wait for each operation.
 */
function verifySimpleOperationStatus(testScenarios, opTimeoutMillis) {
    if (!Array.isArray(testScenarios) || testScenarios.length === 0) {
        console.warn('No test scenarios provided for simple operation status verification. Skipping.');
        return; // Early exit if no scenarios are provided
    }

    const effectiveOpTimeout = opTimeoutMillis || 1200; // Consistent default timeout

    testScenarios.forEach(function(currentScenario) {
        // Spies are created inside the loop to ensure clean state for each 'it' block.
        const completionHandler = jasmine.createSpy('operation completion');
        const failureHandler = jasmine.createSpy('operation failure');

        it(currentScenario.description, function() {
            runs(function() {
                // Invoke the specified method on the global system interface.
                systemInterface[currentScenario.methodToCall](completionHandler, failureHandler);
            });

            // Wait for the asynchronous operation to trigger one of the handlers.
            awaitCallbackInvocations([completionHandler, failureHandler], currentScenario.methodToCall + ' response timeout', effectiveOpTimeout);

            runs(function() {
                // Use the shared assertion helper to validate the outcome.
                assertNoErrorsAndSuccessfulCall(failureHandler, completionHandler, isSuccessStringResult);
            });
        });
    });
}

/**
 * Validates if an operation result represents a number, optionally matching an expected value.
 *
 * @param {*} operationResult - The result received from the operation.
 * @param {number} [expectedNumericValue] - An optional number to compare against the parsed result.
 * @returns {boolean} True if the result is a valid number (and matches if expected value is provided).
 */
function isNumericResultValid(operationResult, expectedNumericValue) {
    // Ensure the result is a non-empty string before attempting to parse.
    if (typeof operationResult !== 'string' || operationResult.trim() === '') {
        return false;
    }
    // Use a more precise regex to ensure it's a positive integer string.
    if (!/^\d+$/.test(operationResult.trim())) {
        return false;
    }

    const parsedNumber = parseInt(operationResult, 10);

    // If an expected value is provided, compare the parsed number.
    if (typeof expectedNumericValue === 'number' && !isNaN(expectedNumericValue)) {
        return parsedNumber === expectedNumericValue;
    }
    // If no specific expected value, just confirm it's a valid number.
    return !isNaN(parsedNumber);
}

/**
 * Checks if the operation outcome message is the standard "ok" string.
 *
 * @param {*} outcomeMessage - The message received as an operation outcome.
 * @returns {boolean} True if the outcome is the string "ok".
 */
function isSuccessStringResult(outcomeMessage) {
    // Add a type check for robustness, ensuring it's a string comparison.
    if (typeof outcomeMessage !== 'string') {
        return false;
    }
    return outcomeMessage === "ok";
}

// Global setup executed before each test specification.
beforeEach(function setupTestEnvironment() { // Renamed anonymous function and added descriptive name

    // Extend Jasmine's expectation capabilities with custom matchers.
    jasmine.addMatchers({
        // A custom matcher to check if a value is defined, not null, and not NaN.
        // (NaN is the only value not equal to itself, making it a useful check).
        toBeDefinedAndNotNaN: function() {
            return {
                compare: function(actualValue) {
                    const isDefined = actualValue !== undefined && actualValue !== null;
                    const isNotNaN = actualValue === actualValue; // This is true for any non-NaN value

                    const result = isDefined && isNotNaN;
                    const message = result ?
                        'Expected ' + actualValue + ' not to be undefined, null, or NaN.' :
                        'Expected ' + actualValue + ' to be defined and not NaN, but it was not.';

                    return {
                        pass: result,
                        message: message
                    };
                }
            };
        }
    });

    // Define test credentials and the main application programming interface (API) access point.
    // Grouping related configuration into a single global object for better organization.
    window.testAuthCredentials = {
        username: "nonexistentUser", // Changed username for testing
        password: "securePassword123", // Changed password
        incorrectPassword: "wrongPassword456" // Changed wrong password
    };

    // Reference to the main application's synchronization engine interface.
    // Using a more generic variable name 'systemInterface'.
    window.systemInterface = window.Rho.syncengine;

    // The previously commented-out notification setup has been entirely removed,
    // as it was not essential to the core functionality being tested.
});