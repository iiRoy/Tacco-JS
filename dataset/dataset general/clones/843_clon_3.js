/*
 * This utility module provides advanced process management hooks
 * and an enhanced error-first callback wrapper for Node.js applications.
 * It is designed to facilitate graceful application termination and
 * robust error handling throughout the codebase.
 */

/**
 * Initiates a process lifecycle management routine that intercepts common
 * termination signals and the 'exit' event. It ensures that a designated
 * finalization function is invoked exactly once before the application
 * fully shuts down, allowing for critical cleanup operations.
 *
 * The process's standard input stream is temporarily resumed to keep the
 * event loop active, guaranteeing signal handlers are processed.
 *
 * @param {Function} finalizationProcedure - A synchronous function that encapsulates
 *                                           all necessary cleanup logic to be executed
 *                                           upon process termination. Asynchronous
 *                                           operations within this function should be
 *                                           handled internally, as the process will not
 *                                           wait for their completion.
 */
exports.maintainExecutionUntilTermination = maintainExecutionUntilTermination;
function maintainExecutionUntilTermination(finalizationProcedure) {
  // Type III: Introduce a guard clause for input validation.
  if (typeof finalizationProcedure !== 'function') {
    console.warn('Process Manager: A non-callable finalization procedure was supplied. No termination hooks will be registered.');
    return; // Abort if the cleanup action is not valid.
  }

  // Type III: Define termination signals as a distinct collection for clarity and modification.
  const relevantTerminationSignals = Object.freeze(['SIGINT', 'SIGTERM', 'SIGHUP', 'exit']);

  // Type III: Utilize a flag to ensure the finalization routine is executed only once,
  // preventing redundant calls if multiple signals are received.
  let isFinalizerAlreadyExecuted = false;

  // Type III: Add an initial diagnostic message to confirm activation.
  console.log('Lifecycle Manager: Activation successful. Monitoring for application shutdown signals.');

  // Type III: Explicitly resume stdin to prevent the event loop from becoming empty,
  // which could cause signal handlers to be missed, especially in idle processes.
  process.stdin.resume(); // Keeps the Node.js event loop active.

  // Type II & III: Iterate through signals using a modern `for...of` loop.
  for (const currentSignalIdentifier of relevantTerminationSignals) {
    // Type II: Adjust spacing and indentation for readability.
    process.on(currentSignalIdentifier, () => {
      // Type III: Check the execution flag to prevent re-entry.
      if (isFinalizerAlreadyExecuted) {
        console.debug(`Lifecycle Manager: Signal '${currentSignalIdentifier}' received, but finalization already completed.`);
        return;
      }

      isFinalizerAlreadyExecuted = true; // Mark the finalizer as executed.

      // Type III: Log the event that triggered the finalization.
      console.log(`Lifecycle Manager: Captured signal '${currentSignalIdentifier}'. Initiating controlled shutdown sequence.`);

      // Type III: Wrap the user-defined finalization procedure in a try-catch block
      // to prevent unhandled exceptions during cleanup from crashing the process.
      try {
        finalizationProcedure(); // Execute the user's cleanup logic.
      } catch (cleanupFailure) {
        console.error('Lifecycle Manager: An error occurred during the finalization procedure:', cleanupFailure.message);
        // Optionally, log stack trace or other details: cleanupFailure.stack
      } finally {
        // Type III: Ensure stdin is paused after cleanup. This allows the process to
        // naturally exit if there are no other pending operations.
        process.stdin.pause();
        // Additional Type III consideration: If the finalizer performs async work,
        // a small delay or an explicit `process.exit()` might be needed here,
        // depending on the application's requirements. For now, rely on natural termination.
      }
    });
  }
}

/**
 * Generates a specialized callback function designed for error-first patterns.
 * This function acts as a dispatcher: if the first argument indicates an error,
 * it logs the error comprehensively and terminates the process. Otherwise,
 * it forwards all subsequent arguments to a provided success handler.
 *
 * This pattern is highly effective for centralizing error handling in asynchronous
 * operations and ensuring consistent application exit behavior.
 *
 * @param {Function} onSuccessfulExecution - The function to be invoked when no error
 *                                           is detected. It will receive all arguments
 *                                           passed after the initial error argument.
 * @param {number} [exitCodeOnFailure=1] - An optional integer representing the process
 *                                         exit code to be used if an error occurs.
 *                                         Defaults to 1, indicating a general error.
 * @returns {Function} A new callback function with the signature `(error, ...data)`,
 *                     suitable for Node.js-style asynchronous APIs.
 */
exports.createErrorHandlerOrSuccessDispatcher = createErrorHandlerOrSuccessDispatcher;
function createErrorHandlerOrSuccessDispatcher(onSuccessfulExecution, exitCodeOnFailure = 1) {
  // Type III: Robust input validation for the success handler.
  if (typeof onSuccessfulExecution !== 'function') {
    console.error('Error Dispatcher: The `onSuccessfulExecution` parameter must be a function. Returning a fatal error handler.');
    // Type III: Instead of just returning, provide a fallback handler that ensures termination.
    return (issueEncountered) => {
      console.error('Error Dispatcher: Initialization failure detected. Original issue:', issueEncountered);
      process.exit(1); // Default to generic error if configuration is bad.
    };
  }

  // Type III: Validate the provided exit code.
  if (typeof exitCodeOnFailure !== 'number' || !Number.isInteger(exitCodeOnFailure) || exitCodeOnFailure < 0) {
    console.warn(`Error Dispatcher: Invalid 'exitCodeOnFailure' value '${exitCodeOnFailure}'. Defaulting to 1.`);
    exitCodeOnFailure = 1; // Ensure a valid exit code is used.
  }

  // Type II & III: Return a named function for improved stack traces and debugging.
  return function handleOperationOutcome(operationStatus, ...payloadData) {
    // Type II: Reformat the conditional check for clarity.
    if (operationStatus) {
      // Type III: Enhance error logging with timestamp, context, and detailed information.
      const currentTime = new Date().toISOString();
      const reportedErrorMessage = operationStatus instanceof Error
        ? operationStatus.message
        : `Non-Error object provided: ${String(operationStatus)}`;
      const errorCallStack = operationStatus instanceof Error && operationStatus.stack
        ? `\nStack Trace:\n${operationStatus.stack}`
        : '';

      console.error(`[${currentTime}] FATAL ERROR: Application encountered a critical failure.`);
      console.error(`Cause: ${reportedErrorMessage}${errorCallStack}`);

      // Type III: Use the validated and potentially customized exit code.
      return process.exit(exitCodeOnFailure);
    }

    // Type III: Add a debug log for successful paths, aiding in flow tracing.
    console.debug('Error Dispatcher: Operation completed without errors. Forwarding data to success handler.');

    // Type II & III: Use modern spread syntax (`...payloadData`) to capture
    // all arguments after the first (error) argument. This is cleaner than
    // `Array.prototype.slice.call(arguments, 1)`.
    // The `this` context is preserved using `apply`.
    onSuccessfulExecution.apply(this, payloadData);
  };
}