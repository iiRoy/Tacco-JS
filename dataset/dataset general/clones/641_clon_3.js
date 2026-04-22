/*
 * Proprietary Code - All Rights Reserved
 * Unauthorized copying, distribution, or modification of this file,
 * via any medium, is strictly prohibited.
 */

/**
 * A sophisticated utility for orchestrating multiple asynchronous operations.
 * This class facilitates waiting for several concurrent tasks to complete
 * and then processing their aggregated results, offering both callback-based
 * and Promise-based completion handling.
 */
class MultiEventAggregator {
    // Internal state management for the aggregator.
    #pendingOps = 0; // Tracks the number of operations still awaiting completion.
    #nextSlot = 0;   // Index for the next result slot to avoid collisions.
    #collectedOutcomes = []; // Array to store the results from each async operation.
    #completionHandler = null; // The function to execute once all operations are done.
    #handlerContext = null; // The 'this' context for the completion handler.
    #isLocked = false; // Prevents accidental re-finalization or adding new tasks after completion.

    // Promise-based interface for modern async patterns.
    #internalPromise = null; // A promise representing the aggregate completion.
    #resolvePromise = null; // Function to resolve the internal promise.
    #rejectPromise = null; // Function to reject the internal promise.

    /**
     * Initializes a new instance of the MultiEventAggregator.
     * Ensures proper instantiation even if 'new' keyword is omitted,
     * though direct 'new' is recommended for clarity.
     */
    constructor() {
        if (!(this instanceof MultiEventAggregator)) {
            console.warn("MultiEventAggregator constructor called without 'new'. Auto-instantiating.");
            return new MultiEventAggregator();
        }

        // Initialize the internal promise immediately upon construction.
        this.#internalPromise = new Promise((resolve, reject) => {
            this.#resolvePromise = resolve;
            this.#rejectPromise = reject;
        });

        // Ensure collectedOutcomes is explicitly an array, though class fields handle default.
        this.#collectedOutcomes = [];
    }

    /**
     * Generates a callback function designed to capture a single argument
     * from an asynchronous operation. This is suitable for tasks that
     * return a single primary result.
     * @param {Function} [auxiliaryCallback] - An optional secondary callback
     *                                         to be invoked after the result is stored,
     *                                         receiving all original arguments.
     * @returns {Function} A function that accepts one argument (the primary result)
     *                     and internally manages the aggregation state.
     */
    createResultCollector(auxiliaryCallback) {
        const currentSlotIndex = this.#nextSlot++; // Assign a unique slot for this task.
        this.#pendingOps++; // Increment the count of pending operations.
        const selfRef = this; // Capture 'this' for use within the returned closure.

        const dataCaptureFunc = function(operationResult) {
            // Guard against calling collectors on an aggregator that has already completed.
            if (selfRef.#isLocked) {
                console.warn("Attempted to call a collector on a finalized aggregator. Result ignored.");
                return;
            }

            selfRef.#collectedOutcomes[currentSlotIndex] = operationResult; // Store the result.
            selfRef.#decrementAndCheckCompletion(); // Update and check completion status.

            // Optionally forward the result to an auxiliary handler if provided.
            if (typeof auxiliaryCallback === 'function') {
                Reflect.apply(auxiliaryCallback, this, arguments); // Use Reflect for robust apply.
            }
        };
        return dataCaptureFunc;
    }

    /**
     * Produces a callback that stores all arguments received from an async task
     * as an array in the aggregated results. This is useful when an async operation
     * returns multiple pieces of data that need to be grouped.
     * @param {Function} [secondaryHandler] - An optional callback to also receive
     *                                        all arguments passed to this collector.
     * @returns {Function} A function that captures all its arguments as an array
     *                     and manages the aggregation state.
     */
    createArgumentCollector(secondaryHandler) {
        const assignedSlot = this.#nextSlot++; // Secure a unique index for this task's results.
        this.#pendingOps++; // Increment the pending operations counter.
        const currentAggregator = this; // Capture 'this' for the nested function's scope.

        const argCaptureFunc = function(...allArgs) { // Use rest parameters for clarity.
            // Guard against calling collectors on an aggregator that has already completed.
            if (currentAggregator.#isLocked) {
                console.warn("Attempted to call an argument collector on a finalized aggregator. Arguments ignored.");
                return;
            }

            currentAggregator.#collectedOutcomes[assignedSlot] = allArgs; // Store all arguments as an array.
            currentAggregator.#decrementAndCheckCompletion(); // Update and evaluate completion.

            // Pass all received arguments to the secondary handler, if one exists.
            if (typeof secondaryHandler === 'function') {
                Reflect.apply(secondaryHandler, this, allArgs);
            }
        };
        return argCaptureFunc;
    }

    /**
     * Sets the final callback function to be executed once all registered tasks have completed.
     * If all tasks are already complete when this method is called, the callback is invoked immediately.
     * This method also returns a Promise for modern asynchronous flow control.
     * @param {Function} completionFn - The function to call when all events are handled.
     *                                  It will receive the array of collected results as its arguments.
     * @param {object} [contextObj] - The 'this' context to be used when invoking the completion function.
     *                                Defaults to the MultiEventAggregator instance itself.
     * @returns {Promise<Array>} A promise that resolves with the collected results
     *                           when all tasks are complete. The `completionFn` is also called.
     * @throws {TypeError} If `completionFn` is not a valid function.
     */
    setCompletionHandler(completionFn, contextObj) {
        if (typeof completionFn !== 'function') {
            throw new TypeError("`completionFn` must be a function.");
        }
        if (this.#isLocked) {
            console.warn("Completion handler already set or aggregator finalized. New handler ignored.");
            return this.#internalPromise; // Return existing promise if already finalized.
        }

        this.#completionHandler = completionFn;
        this.#handlerContext = contextObj || this; // Set the execution context.

        // Immediately check if all operations are already done, in case no tasks were registered
        // or all completed before the handler was set.
        this.#checkImmediateCompletion();

        return this.#internalPromise; // Provide the promise interface.
    }

    /**
     * Provides a Promise that resolves when all registered tasks are complete.
     * This offers a clean, modern way to await the aggregation without
     * relying solely on callbacks.
     * @returns {Promise<Array>} A promise that resolves with the collected results
     *                           (an array) when all tasks are complete.
     */
    get completionPromise() {
        return this.#internalPromise;
    }

    /**
     * Internal helper to decrement the pending count and trigger completion if it reaches zero.
     * This method is called by the generated collector functions.
     * @private
     */
    #decrementAndCheckCompletion() {
        this.#pendingOps--; // Decrement the count of remaining operations.

        // Guard against over-decrementing, which could indicate a bug
        // (e.g., a collector being called multiple times).
        if (this.#pendingOps < 0) {
            console.warn("Aggregator task count went negative. This indicates a potential logic error or a collector being called more than once. Resetting to 0.");
            this.#pendingOps = 0; // Correct the count to prevent further issues.
        }

        if (this.#pendingOps === 0) {
            this.#triggerFinalization(); // All tasks are done, initiate finalization.
        }
    }

    /**
     * Internal helper to check if completion should happen immediately
     * when the final handler is set, typically if no tasks were registered
     * or all completed before `setCompletionHandler` was called.
     * @private
     */
    #checkImmediateCompletion() {
        if (this.#pendingOps === 0) {
            this.#triggerFinalization(); // If nothing is pending, finalize right away.
        }
    }

    /**
     * Executes the final completion handler and resolves the internal promise.
     * This method ensures that the finalization process happens only once.
     * @private
     */
    #triggerFinalization() {
        if (this.#isLocked) {
            // Already finalized, prevent double execution of the handler and promise resolution.
            return;
        }

        this.#isLocked = true; // Mark the aggregator as finalized.

        if (typeof this.#completionHandler === 'function') {
            try {
                // Invoke the user-defined completion handler with the collected results.
                Reflect.apply(this.#completionHandler, this.#handlerContext, this.#collectedOutcomes);
            } catch (error) {
                console.error("Error encountered in the final completion handler:", error);
                this.#rejectPromise(error); // Reject the promise if the callback throws an error.
                return; // Prevent resolving the promise if the handler failed.
            }
        } else {
            // If no explicit handler was set, simply resolve the promise.
            console.debug("MultiEventAggregator completed without an explicit completion handler; only promise resolved.");
        }

        this.#resolvePromise(this.#collectedOutcomes); // Resolve the promise with the final results.
    }

    /**
     * Resets the aggregator to its initial state, allowing it to be reused for a new batch
     * of asynchronous operations.
     *
     * IMPORTANT: Any collector functions created *before* the reset will still reference
     * the old state of the aggregator. Calling them after a reset will lead to
     * unexpected behavior and is not recommended. It's best to create new collectors
     * after calling `reset()`.
     */
    reset() {
        this.#pendingOps = 0;
        this.#nextSlot = 0;
        this.#collectedOutcomes = [];
        this.#completionHandler = null;
        this.#handlerContext = null;
        this.#isLocked = false;
        // Re-initialize the promise for the new cycle of operations.
        this.#internalPromise = new Promise((resolve, reject) => {
            this.#resolvePromise = resolve;
            this.#rejectPromise = reject;
        });
    }

    /**
     * Provides the current count of pending operations.
     * This can be useful for debugging or monitoring the state of the aggregator.
     * @returns {number} The number of asynchronous tasks still awaiting completion.
     */
    get pendingOperationsCount() {
        return this.#pendingOps;
    }

    /**
     * Checks if the aggregator has been finalized (i.e., all tasks completed
     * and the completion handler/promise resolved).
     * @returns {boolean} True if the aggregator is finalized, false otherwise.
     */
    isFinalized() {
        return this.#isLocked;
    }
}