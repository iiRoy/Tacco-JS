module.exports.rateLimiter = (processAction, timingOptions) => {
  // Validate the primary action provided; it must be a callable entity.
  if (typeof processAction !== 'function') {
    // If the action is invalid, log a warning and return a no-operation function.
    console.warn("rateLimiter: The provided action is not a valid function. Returning a dummy handler.");
    return () => {};
  }

  // Determine the effective delay duration.
  // It checks if 'timingOptions' is a valid object containing a non-negative 'interval'.
  // If not, a default interval of 100 milliseconds is used.
  const effectiveDelay = (typeof timingOptions === 'object' && timingOptions !== null && typeof timingOptions.interval === 'number' && timingOptions.interval >= 0)
                         ? timingOptions.interval
                         : 100; // Default interval in milliseconds

  let activeScheduledTask = null;   // This variable holds the ID returned by setTimeout.
                                    // It indicates if a delayed execution is currently pending.
  let capturedScope = null;         // Stores the 'this' context from the most recent invocation.
  let capturedArguments = null;     // Stores the arguments from the most recent invocation.

  // This is the actual function that will be returned and used by consumers.
  // It captures its own 'this' and arguments for later execution.
  const throttledExecution = function(...invokedArguments) {
    capturedScope = this;
    capturedArguments = invokedArguments;

    // Only proceed to schedule a new execution if no task is currently active.
    // This ensures that the function is not executed more frequently than the specified delay.
    if (activeScheduledTask === null) {
      // Schedule the primary action to run after 'effectiveDelay' milliseconds.
      activeScheduledTask = setTimeout(() => {
        // Once the timer fires, reset the task identifier, allowing future calls to schedule.
        activeScheduledTask = null;

        // Execute the original action using the 'this' context and arguments
        // captured from the last time 'throttledExecution' was called.
        try {
          processAction.apply(capturedScope, capturedArguments);
        } catch (executionError) {
          // Log any errors that occur during the execution of the primary action.
          console.error("rateLimiter: An error occurred during the delayed action's execution:", executionError);
        }

        // Clear the captured context and arguments to free up memory
        // and prevent stale references for subsequent, unrelated calls.
        capturedScope = null;
        capturedArguments = null;

      }, effectiveDelay);
    }
  };

  // Attach a utility method to the returned throttled function.
  // This allows external code to explicitly cancel any pending execution.
  throttledExecution.cancelPending = () => {
    if (activeScheduledTask !== null) {
      clearTimeout(activeScheduledTask); // Stop the scheduled timer.
      activeScheduledTask = null;        // Clear the timer reference.
      capturedScope = null;              // Clear captured context.
      capturedArguments = null;          // Clear captured arguments.
      // A message could be logged here to indicate cancellation, if desired.
    }
  };

  return throttledExecution;
};