/*
 *  Module: Manager Utilities
 *  Component: OperationScheduler
 *
 *  A robust scheduler for sequential asynchronous operations.
 *  It ensures tasks are processed one after another and provides
 *  hooks for completion.
 */
const manager = manager || {}; // Ensure manager namespace exists

manager.OperationScheduler = function (finalCompletionHook) {
    // Internal collection of operations awaiting execution.
    // Each element is a function that accepts a 'done' callback.
    this._workloadItems = [];

    // Callback function invoked when the workload is entirely processed.
    // If not provided, a no-op function is used as a default.
    this._finalCompletionHook = typeof finalCompletionHook === 'function' ? finalCompletionHook : () => {};

    // Flag indicating whether an operation is currently in progress.
    // Prevents multiple simultaneous executions from the queue.
    this._currentlyExecuting = false;

    // Optional: A unique identifier for this scheduler instance.
    // Useful for debugging or managing multiple schedulers.
    this.schedulerId = `scheduler-${Math.random().toString(36).substring(2, 9)}`;
};

manager.OperationScheduler.prototype = {
    /**
     * Adds a new asynchronous task to the processing queue.
     * If no other tasks are running and this is the first item,
     * it initiates the processing cycle.
     *
     * @param {function(Function): void} scheduledTask - The function to be executed.
     *   It must accept a single argument, which is a callback to signal completion.
     * @returns {number} The current number of items in the workload queue.
     */
    submitOperation: function (scheduledTask) {
        // Validate the input: only functions can be scheduled as tasks.
        if (typeof scheduledTask !== 'function') {
            console.warn(`Scheduler [${this.schedulerId}]: Attempted to submit a non-function task. Skipping.`);
            return this._workloadItems.length;
        }

        this._workloadItems.push(scheduledTask);
        const currentQueueSize = this._workloadItems.length;

        // If this is the only task and nothing is currently executing,
        // kick off the processing immediately.
        if (currentQueueSize === 1 && !this._currentlyExecuting) {
            console.log(`Scheduler [${this.schedulerId}]: Starting processing for first task.`);
            this._processNextItem();
        } else if (currentQueueSize > 1) {
            console.log(`Scheduler [${this.schedulerId}]: Task added. Queue size: ${currentQueueSize}`);
        }

        return currentQueueSize;
    },

    /**
     * Internal method to advance the queue and execute the next operation.
     * This method is called recursively (indirectly) until the queue is empty.
     * It manages the _currentlyExecuting flag.
     * @private
     */
    _processNextItem: function () {
        // Early exit: if no items are left, execute the final hook and reset the active flag.
        if (this._workloadItems.length === 0) {
            console.log(`Scheduler [${this.schedulerId}]: Workload exhausted. Calling final hook.`);
            this._finalCompletionHook();
            this._currentlyExecuting = false; // Ensure flag is reset after queue is empty
            return;
        }

        // Retrieve the next task from the front of the queue.
        const activeTask = this._workloadItems.shift();
        this._currentlyExecuting = true; // Mark the scheduler as busy.

        // Prepare the callback for the current task to signal its completion.
        // Using .bind() ensures 'this' context refers to the scheduler instance.
        const signalCompletion = this.operationFinished.bind(this);

        try {
            console.log(`Scheduler [${this.schedulerId}]: Executing a task.`);
            // Execute the task, passing it the completion callback.
            activeTask(signalCompletion);
        } catch (error) {
            console.error(`Scheduler [${this.schedulerId}]: An error occurred during task execution:`, error);
            // Even if an error occurs, we should attempt to proceed to the next item
            // to prevent the queue from stalling indefinitely.
            this.operationFinished();
        }
    },

    /**
     * Empties the entire queue of pending operations.
     * Any operations currently being executed will continue, but no new
     * operations will be processed from the cleared queue.
     */
    clearAllOperations: function () {
        if (this._workloadItems.length === 0 && !this._currentlyExecuting) {
            console.log(`Scheduler [${this.schedulerId}]: Queue is already empty and inactive. No action needed.`);
            return;
        }

        console.log(`Scheduler [${this.schedulerId}]: Clearing all ${this._workloadItems.length} pending operations.`);
        this._workloadItems = []; // Re-initialize the array to clear all contents.
        this._currentlyExecuting = false; // Reset the busy flag, as no new items will be processed.
    },

    /**
     * Callback method invoked by an executed task to indicate its completion.
     * This method then attempts to process the next item in the queue.
     */
    operationFinished: function () {
        console.log(`Scheduler [${this.schedulerId}]: A task has completed.`);
        this._currentlyExecuting = false; // Mark the scheduler as not busy.
        // Immediately attempt to process the next item in the queue.
        this._processNextItem();
    }
};