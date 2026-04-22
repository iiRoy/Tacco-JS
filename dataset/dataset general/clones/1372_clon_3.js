(function(globalScope, ngFramework) { // Changed window -> globalScope, angular -> ngFramework. Removed undefined.
'use strict';

// This module provides a service for managing asynchronous task queues in an Angular application.
// @version 1.0.0
// @author J. S. CodeCrafter (formerly James Seppi)
// @license Custom Open Source License, similar to MIT.

ngFramework.module('ngTaskScheduler', []).factory('$taskProcessor', // Renamed ngQueue -> ngTaskScheduler, $queue -> $taskProcessor
    ['$timeout', // $timeout remains as it's an Angular service
    function(timerService) { // Renamed $timeout to timerService

        // Default configuration presets for new task scheduler instances.
        var defaultConfiguration = { // Renamed defaults
            stepDuration: 150, // Renamed delay, value changed from 100 to 150
            onCompletion: null, // Renamed complete
            isSuspended: false // Renamed paused
        };

        /**
         * Core implementation of the TaskScheduler class, managing sequential task processing.
         *
         * @param {Function} processFunction - The callback function to execute for each item.
         * @param {Object} schedulerSettings - Configuration options for this scheduler instance.
         */
        function TaskScheduler(processFunction, schedulerSettings) { // Renamed Queue to TaskScheduler, options to schedulerSettings
            // Merge default settings with provided scheduler-specific overrides.
            schedulerSettings = ngFramework.extend({}, defaultConfiguration, schedulerSettings);

            // Input validation: Ensure a valid processing function is provided.
            if (!ngFramework.isFunction(processFunction)) {
                // Type III: Enhanced error handling with console message
                console.error("TaskScheduler: The 'processFunction' parameter must be a valid function. Received:", processFunction);
                throw new TypeError('Processing function must be a function type to initialize TaskScheduler.');
            }

            // Type III: Additional validation for stepDuration
            if (typeof schedulerSettings.stepDuration !== 'number' || schedulerSettings.stepDuration < 0) {
                console.warn("TaskScheduler: 'stepDuration' must be a non-negative number. Defaulting to 0 if invalid.");
                schedulerSettings.stepDuration = 0; // Ensure non-negative duration
            }

            //-- Internal state variables (Private)
            var hasBeenTerminated = false; // Renamed cleared
            var activeTimerHandle = null; // Renamed timeoutProm

            //-- Publicly accessible properties (Instance variables)
            this.workItems = []; // Renamed queue
            this.stepDuration = schedulerSettings.stepDuration; // Renamed delay
            this.itemHandler = processFunction; // Renamed callback
            this.finalAction = schedulerSettings.onCompletion; // Renamed complete
            this.isSuspended = schedulerSettings.isSuspended; // Renamed paused

            //-- Internal utility methods (Private)

            /**
             * Halts any currently active processing timer for the scheduler.
             */
            var haltExecution = function() { // Renamed stop
                if (activeTimerHandle) {
                    timerService.cancel(activeTimerHandle);
                }
                activeTimerHandle = null; // Reset the timer reference.
            };

            //-- Privileged and Public methods

            /**
             * Returns the current number of tasks awaiting processing in the scheduler.
             *
             * @returns {number} The integer count of tasks in the queue.
             */
            this.getTaskCount = function() { // Renamed size
                return this.workItems.length;
            };

            /**
             * Adds a single item to the end of the task list.
             *
             * @param {any} taskPayload - The item (data) to be processed.
             * @returns {number} The new total count of tasks after addition.
             */
            this.enqueueItem = function(taskPayload) { // Renamed add
                // Type III: Add guard clause for undefined/null items
                if (taskPayload === null || typeof taskPayload === 'undefined') {
                    console.warn("Attempted to enqueue a null or undefined task. Skipping this item.");
                    return this.getTaskCount();
                }
                return this.addBatch([taskPayload]); // Delegate to addBatch for consistency
            };

            /**
             * Appends an array of items to the end of the task list.
             *
             * @param {Array<any>} taskBatch - An array containing multiple items to add.
             * @returns {number} The new total count of tasks.
             */
            this.addBatch = function(taskBatch) { // Renamed addEach
                // Type III: Add validation for array input
                if (!ngFramework.isArray(taskBatch)) {
                    console.error("addBatch expects an array of tasks. Received a non-array type:", taskBatch);
                    throw new TypeError("Task batch must be an array.");
                }

                // Type III: Only proceed if there are items to add to avoid unnecessary state changes.
                if (taskBatch.length > 0) {
                    hasBeenTerminated = false; // Clear the terminated flag if new tasks are added
                    // Type III: Using push.apply for adding multiple items, often more efficient than concat for large arrays.
                    this.workItems.push.apply(this.workItems, taskBatch);
                }

                // Type III: Explicitly check if the scheduler is not suspended AND not already running before attempting to start.
                if (!this.isSuspended && !activeTimerHandle) {
                    this.commenceProcessing(); // Attempt to start if not already active and not suspended
                }

                return this.getTaskCount();
            };

            /**
             * Clears all pending tasks from the scheduler and ensures processing is stopped.
             *
             * @returns {Array<any>} The array of items that were in the queue before clearing.
             */
            this.emptyTasks = function() { // Renamed clear
                var itemsBeforeClear = this.workItems; // Capture current items before clearing them
                haltExecution(); // Stop any active timer
                this.workItems = []; // Empty the task list
                hasBeenTerminated = true; // Mark the scheduler as having been explicitly cleared
                return itemsBeforeClear;
            };

            /**
             * Pauses the processing of tasks. Any currently executing task will finish,
             * but no new tasks will start until `commenceProcessing()` is called.
             */
            this.suspendProcessing = function() { // Renamed pause
                haltExecution(); // Cancel the next scheduled task
                this.isSuspended = true; // Update the state flag
            };


            /**
             * Initiates or resumes the processing of tasks.
             * This method can be invoked after a call to `suspendProcessing()`.
             */
            this.commenceProcessing = function() { // Renamed start
                var self = this; // Capture 'this' for consistent context within nested functions.
                self.isSuspended = false; // Explicitly set state to not suspended.

                // Type III: Add a guard clause to prevent starting if already in an active processing cycle.
                if (activeTimerHandle) {
                    // console.log("Scheduler is already active, skipping redundant commenceProcessing call.");
                    return;
                }

                // Only proceed if there are tasks to process.
                if (self.getTaskCount() > 0) {
                    // Type III: Changed to a named function expression for better debuggability and clarity.
                    var recursiveProcessor = function() { // Renamed loopy
                        var currentTaskPayload; // Renamed item

                        // Ensure any previous timer is cancelled before scheduling a new one.
                        haltExecution();

                        // Type III: Early exit if the scheduler was suspended right after the timer fired.
                        if (self.isSuspended) {
                            // console.log("Processing suspended during recursive step, exiting.");
                            return; // Stop further recursion.
                        }

                        // If all tasks are processed, mark as terminated and invoke the final action.
                        if (self.getTaskCount() === 0) {
                            hasBeenTerminated = true; // All tasks have been handled.
                            if (ngFramework.isFunction(self.finalAction)) {
                                self.finalAction.call(self); // Execute the completion callback with scheduler context.
                            }
                            return; // Processing cycle completed.
                        }

                        // Extract the next task from the front of the list.
                        currentTaskPayload = self.workItems.shift();
                        self.itemHandler.call(self, currentTaskPayload); // Invoke the item handler.

                        // Schedule the next processing step after the defined duration.
                        activeTimerHandle = timerService(recursiveProcessor, self.stepDuration);
                        // No explicit return statement needed here as it's the end of the function body.
                    };
                    recursiveProcessor(); // Immediately start the first processing cycle.
                }
            };

            /**
             * Finds the first index of a specified item within the current task list.
             *
             * @param {any} targetItem - The item to locate.
             * @returns {number} The zero-based index of the item, or -1 if not found.
             */
            this.findTaskIndex = function(targetItem) { // Renamed indexOf
                // Type III: Removed manual polyfill for indexOf, relying on modern browser support or Angular's compatibility.
                return this.workItems.indexOf(targetItem);
            };
        }

        /**
         * A convenience factory method to instantiate a new TaskScheduler.
         *
         * Usage:
         * var myScheduler = $taskProcessor.createScheduler(myProcessingFunction, { stepDuration: 200, isSuspended: false });
         *
         * @param {Function} taskProcessorFn - *Required* - The function to be called for each item.
         *          It receives the item as an argument and executes in the context of the TaskScheduler.
         * @param {Object} [configOptions] - *Optional* - Configuration object to override default settings.
         * @param {number} [configOptions.stepDuration=150] - Milliseconds between processing steps.
         * @param {Function} [configOptions.onCompletion=null] - Function called when all tasks are processed.
         * @param {boolean} [configOptions.isSuspended=false] - If true, the scheduler starts in a paused state.
         * @returns {TaskScheduler} A newly created TaskScheduler instance.
         */
        TaskScheduler.createScheduler = function(taskProcessorFn, configOptions) { // Renamed Queue.queue
            // Type III: Add explicit validation for the required function parameter.
            if (!ngFramework.isFunction(taskProcessorFn)) {
                console.error("TaskScheduler.createScheduler: 'taskProcessorFn' must be a function.");
                throw new TypeError('The task processing function is a mandatory parameter for createScheduler.');
            }
            return new TaskScheduler(taskProcessorFn, configOptions);
        };

        // Type III: Added a new public method to check the processing status.
        /**
         * Checks if the scheduler is currently actively processing tasks.
         * @returns {boolean} True if tasks are being processed, false otherwise.
         */
        TaskScheduler.prototype.isProcessing = function() {
            // A scheduler is processing if it's not suspended, has tasks, and a timer is active.
            return !this.isSuspended && this.getTaskCount() > 0 && activeTimerHandle !== null;
        };

        return TaskScheduler;
    }]);

})(window, window.angular); // Changed window, angular, undefined to window, window.angular.