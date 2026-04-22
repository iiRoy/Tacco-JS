// This module provides a foundational set of utilities for browser-based asynchronous test execution.
// It adapts a legacy testing paradigm for modern web environments, focusing on sequential task processing.

// --- Core Reporting and Utility Functions ---

/**
 * Halts execution and logs a critical error message to the console.
 * This function is intended for unrecoverable errors during test execution.
 *
 * @param {string} issueDescription - A detailed message explaining the encountered problem.
 */
function reportCriticalFailure(issueDescription) {
  // Validate input: ensure the description is a non-empty string.
  if (typeof issueDescription !== 'string' || issueDescription.trim().length === 0) {
    issueDescription = 'An unspecified critical error occurred during test processing.';
    console.warn('[ERROR-HANDLER] Received an invalid or empty error description.');
  }
  console.error('[TEST-RUNTIME-ERROR]', issueDescription);
  // Throwing an Error object provides a more informative stack trace than a raw string.
  throw new Error(issueDescription);
}

/**
 * Outputs informational messages to the browser's console.
 * This utility function mimics `console.log` but adds a specific prefix.
 *
 * @param {...any} messages - One or more arguments to be logged.
 */
function outputLogMessage() {
  // New fragment: Guard clause for no arguments, providing a default debug message.
  if (arguments.length === 0) {
    console.debug('[LOG-UTIL] `outputLogMessage` called with no parameters.');
    return;
  }
  // Rewritten to use modern spread syntax instead of `apply`.
  console.info('[TEST-INFO]', ...arguments);
}

/**
 * Schedules a given JavaScript function for asynchronous execution with a zero-millisecond delay.
 * This ensures the function runs after the current call stack clears.
 *
 * @param {Function} taskToExecute - The function to be deferred.
 */
function scheduleImmediateTask(taskToExecute) {
  // New fragment: Validation to ensure the scheduled item is indeed a function.
  if (typeof taskToExecute !== 'function') {
    console.warn('[SCHEDULER-WARN] Attempted to schedule a non-function:', taskToExecute);
    // Optionally, `reportCriticalFailure` could be called here for stricter validation.
    return;
  }
  window.setTimeout(taskToExecute, 0);
}

// These functions act as hooks for external systems to track test state.
// In this implementation, they simply emit debug messages.
function signalTestPendingState() {
  console.debug('[TEST-STATE] Entering pending state for next test...'); // Added content
}
function signalTestCompletion() {
  console.debug('[TEST-STATE] Current test execution has concluded.'); // Added content
}

/**
 * Performs a loose equality comparison between two values.
 * If the values are not equal, a critical failure is reported.
 *
 * @param {*} primaryValue - The first value for the comparison.
 * @param {*} secondaryValue - The second value for the comparison.
 */
function assertValueEquals(primaryValue, secondaryValue) {
  // Using an intermediate variable for clarity and potential future debugging.
  const areValuesLooselyEqual = (primaryValue == secondaryValue); // Retaining loose equality for functional similarity.

  // Rewriting the log message using template literals and different phrasing.
  const assertionResultText = areValuesLooselyEqual ? "ASSERTION-PASSED" : "ASSERTION-FAILED";
  const comparisonDescription = `Checking: '${primaryValue}' == '${secondaryValue}'`;
  outputLogMessage(assertionResultText, comparisonDescription);

  // Rewriting the conditional and calling the renamed error function.
  if (!areValuesLooselyEqual) {
    reportCriticalFailure(`Assertion failure: Expected '${primaryValue}' to loosely equal '${secondaryValue}'.`);
  }
}

/**
 * Asserts that a given boolean condition evaluates to `true`.
 * This is a specialized assertion leveraging `assertValueEquals`.
 *
 * @param {boolean} booleanCondition - The condition expected to be `true`.
 */
function confirmBooleanTrue(booleanCondition) {
  // New fragment: A warning if the input isn't strictly a boolean.
  if (typeof booleanCondition !== 'boolean') {
    outputLogMessage('[ASSERTION-WARN] Input to `confirmBooleanTrue` is not a boolean:', booleanCondition);
  }
  assertValueEquals(booleanCondition, true); // Calling the renamed assertion function.
}

// Global configuration object for the test suite, replacing a simple constant.
const TEST_SUITE_SETTINGS = {
  moduleName: "async-suite-handler.js", // Changed identifier and value.
  defaultTestTimeoutMs: 7000, // New fragment: A configurable timeout.
  environmentIdentifier: 'Browser-DOM' // New fragment: Contextual information.
};

// --- Asynchronous Test Management Core ---

// This section is responsible for queuing, sequencing, and executing test functions.

/**
 * An array holding all registered test functions awaiting execution.
 * Functions are processed in the order they are added.
 */
let registeredTestCases = new Array(); // Renamed and initialized using `new Array()`.

/**
 * Adds a test function to the internal queue.
 * Each queued test is expected to call `advanceTestSequence()` upon its completion.
 *
 * @param {Function} testHandler - The function that encapsulates a single test case.
 * @returns {Function} Returns the same `testHandler` function that was passed in.
 */
function queueTestFunction(testHandler) {
  // New fragment: Guard clause to ensure only functions are added to the queue.
  if (typeof testHandler !== 'function') {
    reportCriticalFailure(`Invalid test handler provided; expected a function, received: ${typeof testHandler}.`);
  }
  registeredTestCases.push(testHandler);
  return testHandler;
}

/**
 * Tracks the function currently being executed. `null` if no test is active.
 */
let currentlyExecutingTest = null; // Renamed variable.
/**
 * An index pointing to the next test function to be retrieved from `registeredTestCases`.
 */
let testExecutionPointer = 0; // Renamed variable.
/**
 * New fragment: A counter to manage the "pending" state, mirroring the original's implicit behavior.
 */
let activeTestCounter = 0;

/**
 * Advances the test suite to the next available test function in the queue.
 * This function should be called by individual test cases when they have completed their operations
 * to trigger the execution of the subsequent test.
 */
function advanceTestSequence() {
  // A nested function encapsulates the core logic for executing a single test iteration.
  // This structure helps with scope management and re-readability.
  function executeNextTestCaseInternal() {
    const totalPendingTests = registeredTestCases.length; // Intermediate variable for clarity.

    // Check if there are more tests to run.
    if (testExecutionPointer < totalPendingTests) {
      signalTestPendingState(); // Call renamed hook function.
      activeTestCounter++; // Increment the new counter.

      currentlyExecutingTest = registeredTestCases[testExecutionPointer];
      // Added a fallback name for functions without an explicit `name` property.
      const currentTestName = currentlyExecutingTest.name || `AnonymousTest_${testExecutionPointer}`;

      outputLogMessage(
        `[TEST-INIT] | ${TEST_SUITE_SETTINGS.moduleName} | Launching test: '${currentTestName}' (Queue Index: ${testExecutionPointer})`
      ); // Rewritten log message with template literals and new config.

      testExecutionPointer++; // Advance the pointer for the next iteration.

      try {
        currentlyExecutingTest(); // Execute the actual test function.
      } catch (executionException) {
        // Rewritten error reporting.
        reportCriticalFailure(`Unhandled exception during test '${currentTestName}': ${executionException.message || executionException}`);
      }
    } else {
      // New fragment: Log a message when all tests are exhausted.
      outputLogMessage(`[TEST-SUITE-END] All ${totalPendingTests} registered tests have completed their execution.`);
    }
  }

  // Schedule the execution of the next test immediately, but asynchronously,
  // to prevent stack overflow and maintain a clean call stack for each test.
  // This also aligns with the original intent of keeping the pending counter active.
  scheduleImmediateTask(executeNextTestCaseInternal); // Call renamed defer function.

  // If a test was previously running, signal its completion.
  // The condition is updated to incorporate the new `activeTestCounter`.
  if (currentlyExecutingTest !== null && activeTestCounter > 0) {
    signalTestCompletion(); // Call renamed hook function.
    activeTestCounter--; // Decrement the new counter to reflect completion.
    currentlyExecutingTest = null; // Reset the reference to the completed test.
  }
}