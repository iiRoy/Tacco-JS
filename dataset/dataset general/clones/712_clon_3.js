'use strict';

// This IIFE (Immediately Invoked Function Expression) encapsulates the rate limiting logic,
// ensuring a private scope for internal variables and methods, promoting modularity.
var OperationThrottle = (function() {
    // Expert-level code comments explaining the module's core purpose.
    // This module implements a robust and adaptable operation throttling mechanism.
    // Its primary function is to manage and control the rate at which asynchronous tasks
    // or function calls are executed. This is critical for preventing service overload,
    // avoiding API rate limit breaches, and judiciously managing shared computational resources.
    // The implementation features dynamic rate calculation capabilities and supports an optional
    // "burst" allowance mode for flexible traffic shaping.

    /**
     * @class OperationThrottle
     * @description A highly resilient class designed for intelligently controlling the execution rate of tasks.
     * This class effectively schedules incoming functions, automatically queuing them when predefined
     * rate limits are exceeded, and processing them efficiently as new capacity becomes available.
     * @param {number} maximumPermittedOperations - Defines the upper bound for the total number of operations
     *                                              allowed within a specified time window. Must be a positive integer.
     * @param {number} timeIntervalMillis - Specifies the duration of the monitoring time window, expressed in milliseconds.
     *                                      This parameter must also be a positive integer.
     * @param {boolean} enableBurstCapability - A flag to activate or deactivate burst mode.
     *                                          If `true`, all `maximumPermittedOperations` can occur at any point
     *                                          within the `timeIntervalMillis` window, allowing for traffic spikes.
     *                                          If `false`, a strict rate is enforced, distributing operations
     *                                          more evenly over the `timeIntervalMillis` duration.
     * @throws {Error} Throws an error during instantiation if any constructor parameters are invalid
     *                 or fail type/value validation.
     */
    var OperationThrottle = function(maximumPermittedOperations, timeIntervalMillis, enableBurstCapability) {
        // Essential input validation to ensure robust operation, prevent common programming errors,
        // and enforce the contract of the class constructor.
        if (typeof maximumPermittedOperations !== 'number' || !Number.isInteger(maximumPermittedOperations) || maximumPermittedOperations <= 0) {
            throw new Error('Initialization Error: Parameter "maximumPermittedOperations" must be a positive integer.');
        }
        if (typeof timeIntervalMillis !== 'number' || !Number.isInteger(timeIntervalMillis) || timeIntervalMillis <= 0) {
            throw new Error('Initialization Error: Parameter "timeIntervalMillis" must be a positive integer.');
        }
        if (typeof enableBurstCapability !== 'boolean') {
            throw new Error('Initialization Error: Parameter "enableBurstCapability" must be a boolean value.');
        }

        // Calculate the effective maximum rate or threshold. This value is critical for
        // determining whether an operation can be executed immediately or must be queued.
        // For burst mode, the limit is simply the total operations allowed. For strict mode,
        // it's the average operations per millisecond, ensuring a smooth, distributed rate.
        this._calculatedRateThreshold = enableBurstCapability ? maximumPermittedOperations : maximumPermittedOperations / timeIntervalMillis;
        this._windowDurationMs = timeIntervalMillis;
        this._burstingAllowed = enableBurstCapability;

        // Internal state variables used to track the current operational statistics within the active window.
        this._operationsCompletedInCurrentWindow = 0; // A counter for operations successfully executed since the last window reset.
        this._currentWindowStartTime = Date.now(); // A high-resolution timestamp marking the exact beginning of the current monitoring window.
        this._taskQueue = []; // A dynamic array (acting as a FIFO queue) holding functions that are awaiting execution.

        // Management for asynchronous retries. This mechanism is crucial for preventing
        // multiple concurrent `setTimeout` calls from accumulating, which could lead to
        // unpredictable behavior or resource exhaustion.
        this._pendingRetryTimeoutId = null; // Stores the ID returned by `setTimeout` for the currently scheduled retry, or `null` if none.
    };

    /**
     * @private
     * @method _evaluateAndResetWindow
     * @description Performs a check to determine if the current time window has expired.
     * If the window has indeed passed, this method diligently resets the operation count
     * and updates the window's starting timestamp. This ensures that rate limits are applied
     * correctly over distinct, non-overlapping time intervals.
     * @param {number} currentSystemTime - The current timestamp, typically obtained from `Date.now()`.
     * @returns {boolean} Returns `true` if the time window was reset as a result of this call,
     *                    `false` otherwise (meaning the window is still active).
     */
    OperationThrottle.prototype._evaluateAndResetWindow = function(currentSystemTime) {
        const elapsedTime = currentSystemTime - this._currentWindowStartTime;
        if (elapsedTime > this._windowDurationMs) {
            // The predefined time window has completely elapsed. It's time to reset all
            // relevant counters and mark the beginning of a new monitoring window.
            this._operationsCompletedInCurrentWindow = 0;
            this._currentWindowStartTime = currentSystemTime;
            return true; // Explicitly indicates that a window reset has occurred.
        }
        return false; // The current window is still active; no reset was performed.
    };

    /**
     * @private
     * @method _calculateCurrentExecutionRate
     * @description Computes the current rate of operations based on the activity within the active window.
     * The methodology for this calculation is significantly different depending on whether
     * burst mode is enabled for the throttle instance.
     * @param {number} currentSystemTime - The current timestamp, used to determine elapsed time within the window.
     * @returns {number} The instantaneous or cumulative rate of operations, depending on the configuration.
     */
    OperationThrottle.prototype._calculateCurrentExecutionRate = function(currentSystemTime) {
        const elapsedTime = currentSystemTime - this._currentWindowStartTime;
        // In burst mode, the "rate" effectively represents the simple count of operations,
        // as the limit is a total count within the window, not a per-time-unit rate.
        // In strict mode, it represents operations per millisecond, aiming for a smooth distribution.
        // `Math.max(1, elapsedTime)` is used to prevent potential division by zero errors
        // in scenarios where `elapsedTime` might be 0 due to very rapid execution or system clock nuances.
        const effectiveTimeForRate = this._burstingAllowed ? 1 : Math.max(1, elapsedTime);
        return this._operationsCompletedInCurrentWindow / effectiveTimeForRate;
    };

    /**
     * @private
     * @method _determineNextRetryDelay
     * @description Calculates the optimal delay (in milliseconds) before the next attempt to execute queued tasks.
     * This delay calculation is critical for maintaining efficient rate limiting and varies
     * significantly between burst and strict mode configurations.
     * @returns {number} The calculated delay in milliseconds, always a positive integer.
     */
    OperationThrottle.prototype._determineNextRetryDelay = function() {
        const currentSystemTime = Date.now();
        const elapsedTime = currentSystemTime - this._currentWindowStartTime;

        if (this._burstingAllowed) {
            // In burst mode, if the operation limit is reached, we must wait for the current
            // time window to fully expire before any more operations can proceed.
            // The delay is thus the remaining time within the current window.
            // A minimum delay of 1ms is enforced to ensure that `setTimeout` functions correctly
            // and to prevent potential tight loops that could consume excessive CPU.
            return Math.max(1, this._windowDurationMs - elapsedTime);
        } else {
            // In strict rate mode, the delay is derived from the inverse of the effective rate,
            // which conceptually represents the average time required per operation slot.
            // `Number.EPSILON` is added to the `_calculatedRateThreshold` to guard against
            // potential division by zero if the threshold somehow becomes extremely small or zero.
            const baseDelay = 1 / (this._calculatedRateThreshold + Number.EPSILON);
            // The calculated delay is rounded to the nearest millisecond and again clamped
            // to a minimum of 1ms to ensure valid `setTimeout` behavior.
            return Math.max(1, Math.round(baseDelay));
        }
    };

    /**
     * @private
     * @method _initiateDelayedRetry
     * @description Orchestrates the scheduling of a `setTimeout` call to re-attempt processing
     * tasks after a specified delay. This method intelligently manages and clears any previously
     * scheduled retries, thereby preventing the accumulation of redundant timers and ensuring
     * a single, authoritative retry mechanism.
     * @param {number} delayMilliseconds - The duration, in milliseconds, to wait before the next retry attempt.
     */
    OperationThrottle.prototype._initiateDelayedRetry = function(delayMilliseconds) {
        // Crucially, clear any existing retry timer to prevent multiple timers from running concurrently.
        if (this._pendingRetryTimeoutId !== null) {
            clearTimeout(this._pendingRetryTimeoutId);
        }

        // Schedule a new retry. The callback function will attempt to process tasks from the queue.
        this._pendingRetryTimeoutId = setTimeout(() => {
            this._pendingRetryTimeoutId = null; // Reset the timer ID as this timeout has now fired.
            // Call the main scheduling method with `null` as the task function. This signals that
            // this is an internal retry attempt aimed at draining the queue, not a new incoming task.
            this.scheduleOperation(null);
        }, delayMilliseconds);
    };

    /**
     * @method scheduleOperation
     * @description The primary public method used to submit a function for rate-limited execution.
     * This method intelligently determines whether the provided function can be executed immediately
     * (if capacity allows) or if it must be queued for later processing, adhering strictly to the
     * configured rate limits.
     * @param {Function|null} clientTaskFunction - The function that is intended to be executed.
     *                                             Can be `null` if this method is invoked internally
     *                                             for the purpose of processing tasks from the queue.
     * @returns {void} This method does not return any value; it manages side effects (function execution or queuing).
     */
    OperationThrottle.prototype.scheduleOperation = function(clientTaskFunction) {
        // Pre-check: If a `clientTaskFunction` is provided, validate that it is indeed a function.
        // Invalid tasks are logged as warnings and silently ignored to maintain stability.
        if (clientTaskFunction !== null && typeof clientTaskFunction !== 'function') {
            console.warn('OperationThrottle: Attempted to schedule a non-function task. Task ignored.');
            return;
        }

        const currentSystemTime = Date.now();

        // Always refresh the state of the time window before evaluating the current rate.
        // This ensures that all rate calculations are based on the most up-to-date window.
        this._evaluateAndResetWindow(currentSystemTime);

        const currentRate = this._calculateCurrentExecutionRate(currentSystemTime);

        // Conditional logic based on whether the current operation rate is within the defined limits.
        if (currentRate < this._calculatedRateThreshold) {
            // Capacity is currently available for executing operations.
            if (this._taskQueue.length > 0) {
                // If there are tasks already waiting in the queue, prioritize them for execution.
                // The newly arrived task (if `clientTaskFunction` is provided) is added to the end of the queue.
                if (clientTaskFunction) {
                    this._taskQueue.push(clientTaskFunction);
                }
                const taskToExecute = this._taskQueue.shift(); // Retrieve and remove the oldest pending task.
                if (taskToExecute) { // Ensure a valid task was retrieved before attempting execution.
                    this._operationsCompletedInCurrentWindow++;
                    taskToExecute(); // Execute the retrieved task.
                }

                // Optimization: If more tasks are still pending in the queue AND no retry timer is currently active,
                // immediately attempt to process the next one. This is achieved by scheduling a re-evaluation
                // with a zero-millisecond delay, effectively placing it in the event loop's microtask/next tick queue.
                // This strategy helps to drain the queue more aggressively if multiple execution slots are available
                // in rapid succession, without incurring unnecessary `setTimeout` delays.
                if (this._taskQueue.length > 0 && this._pendingRetryTimeoutId === null) {
                    this._initiateDelayedRetry(0); // Schedule an immediate re-evaluation.
                }

            } else {
                // No tasks are waiting in the queue, so the new `clientTaskFunction` can be executed directly.
                if (clientTaskFunction) { // Ensure `clientTaskFunction` is not null (e.g., if this was a retry call).
                    this._operationsCompletedInCurrentWindow++;
                    clientTaskFunction();
                }
            }
        } else {
            // The rate limit has been exceeded. The current `clientTaskFunction` (if provided) must be queued.
            if (clientTaskFunction) {
                this._taskQueue.push(clientTaskFunction);
            }
            // Crucially, only schedule a retry if one isn't already active. This prevents redundant timers
            // from being set up and ensures efficient management of asynchronous retries.
            if (this._pendingRetryTimeoutId === null) {
                this._initiateDelayedRetry(this._determineNextRetryDelay());
            }
        }
    };

    return OperationThrottle;
})();

// Standard module export for Node.js environments and CommonJS-compatible module loaders.
// This makes the `OperationThrottle` class available for use in other parts of the application.
module.exports = OperationThrottle;