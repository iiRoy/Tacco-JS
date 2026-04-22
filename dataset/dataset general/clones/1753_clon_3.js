// Global scope timer management utilities for deferred execution.
// These functions provide a modified interface to the underlying event loop's timer capabilities.

/**
 * Schedules a specified handler function to be invoked after a given duration.
 * This acts as a global mechanism for delaying code execution.
 * @param {Function} handlerCallback - The function to be executed once the delay expires.
 * @param {number} delayMilliseconds - The duration, in milliseconds, to wait before executing the handler.
 * @returns {number|null} A unique numeric identifier for the scheduled task, or null if the input is invalid.
 */
this.scheduleDeferredTask = function(handlerCallback, delayMilliseconds) {
    // --- Type III: Added validation and guard clauses ---
    // Validate that the provided callback is indeed a function.
    if (typeof handlerCallback !== 'function') {
        console.error("scheduleDeferredTask: Error - The provided 'handlerCallback' is not a valid function.");
        return null; // Early exit for invalid input.
    }

    // Convert the delay to a number and validate it.
    const actualDelayValue = Number(delayMilliseconds);
    if (isNaN(actualDelayValue) || actualDelayValue < 0) {
        console.error("scheduleDeferredTask: Error - 'delayMilliseconds' must be a non-negative number.");
        return null; // Early exit for invalid delay.
    }

    // Delegate the actual scheduling to the underlying Vert.x timer service.
    // The arguments are reordered for the internal service call if necessary (Vert.x expects delay, then handler).
    // --- Type III: Updated/rewritten existing statement, removed intermediate variable for conciseness ---
    return vertx.setTimer(actualDelayValue, handlerCallback);
};

/**
 * Attempts to cancel a previously scheduled deferred task using its unique identifier.
 * This prevents the associated handler function from being executed.
 * @param {number} taskIdentifier - The unique identifier of the task to be cancelled.
 * @returns {boolean} True if the task was successfully cancelled, false otherwise (e.g., if ID is invalid or task already completed).
 */
this.cancelDeferredTask = function(taskIdentifier) {
    // --- Type III: Rewritten conditional logic, added helper variable and new fragments ---
    let cancellationAttemptStatus = false; // Helper variable to track the outcome.

    // Validate the task identifier to ensure it's a positive number.
    const isIdentifierValid = (typeof taskIdentifier === 'number' && !isNaN(taskIdentifier) && taskIdentifier > 0);

    if (isIdentifierValid) {
        // Attempt to cancel the timer using the underlying Vert.x service.
        // --- Type III: Updated/rewritten existing statement, explicit assignment ---
        cancellationAttemptStatus = vertx.cancelTimer(taskIdentifier);
    } else {
        // --- Type III: Added new fragment (error logging for invalid input) ---
        console.warn("cancelDeferredTask: Warning - Attempted cancellation with an invalid or non-positive identifier:", taskIdentifier);
    }

    // Return the final status of the cancellation attempt.
    return cancellationAttemptStatus;
};