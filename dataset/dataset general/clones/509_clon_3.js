/**
 * Chronos - Temporal manipulation core for JavaScript unit testing,
 * enabling precise control over timeouts, intervals, and Date objects.
 *
 * module version 0.1.2-beta
 *
 * Project Home: https://github.com/your-repo/chronos
 * License: MIT (refer to LICENSE.md for details)
 *
 * (c) 2023 [Your Name/Company] - Based on DeLorean by Michael Monteleone
 */
(() => {
    // Establish the primary execution context, typically 'window' in browsers or 'global' in Node.js.
    const rootContext = typeof self !== 'undefined' ? self : globalThis;

    // Core module configuration and state variables
    const moduleVersion = '0.1.2-beta'; // Current version of the temporal simulation module
    let activeGlobalOverride = false; // Flag indicating if native timing functions are currently intercepted
    const scheduledOperations = {}; // Repository for all pending timed tasks
    let totalAccumulatedDelay = 0; // Total milliseconds the simulated clock has advanced
    let currentExecutionPoint = 0; // The simulated time at which the current task is being executed
    let operationIdCounter = 0; // Unique identifier generator for scheduled tasks
    let isTimeProgressionActive = false; // Indicates if a time advancement cycle is currently in progress
    let progressionInterrupted = false; // Flag to signal an interruption during time progression

    // Cache original host timing and date handlers to allow restoration
    const nativeHostHandlers = {
        setTimeout: rootContext.setTimeout,
        setInterval: rootContext.setInterval,
        clearTimeout: rootContext.clearTimeout,
        clearInterval: rootContext.clearInterval,
        Date: rootContext.Date
    };

    /**
     * Utility function to transfer properties from a source object to a target object.
     * @param {Object} targetObj - The object to receive properties.
     * @param {Object} sourceObj - The object whose properties will be copied.
     */
    const mergeProperties = (targetObj, sourceObj) => {
        if (!targetObj || !sourceObj) return;
        for (const propName in sourceObj) {
            // Ensure property belongs to the source object itself, not its prototype chain
            if (Object.prototype.hasOwnProperty.call(sourceObj, propName)) {
                targetObj[propName] = sourceObj[propName];
            }
        }
    };

    /**
     * Custom Date object that intercepts requests for current time,
     * offsetting them by the current simulated time advancement.
     * Behaves like the native Date object for specific date constructions.
     * @param {...*} params - Arguments for Date constructor (year, month, day, etc.)
     * @returns {Date} A new Date object, potentially time-warped.
     */
    const TimeWarpedDate = function(...params) {
        let warpedInstance;
        // If no arguments, assume a request for the current simulated time.
        if (params.length === 0) {
            warpedInstance = new nativeHostHandlers.Date();
            // Adjust the time by the effective offset.
            warpedInstance.setMilliseconds(warpedInstance.getMilliseconds() + getCurrentTimeOffset());
        } else if (params.length === 1 && typeof params[0] === 'string') {
            // Handle single string argument (e.g., '2023-01-01')
            warpedInstance = new nativeHostHandlers.Date(params[0]);
        } else {
            // Use Reflect.construct for robust handling of various Date constructor signatures.
            // Replace nulls with undefined for better constructor behavior in some cases.
            const cleanedParams = params.map(p => p === null ? undefined : p);
            warpedInstance = Reflect.construct(nativeHostHandlers.Date, cleanedParams);
        }
        return warpedInstance;
    };

    // Ensure prototype methods of the native Date object are available on our TimeWarpedDate.
    // This is crucial for methods like Date.parse, Date.UTC, Date.now.
    mergeProperties(TimeWarpedDate, {
        parse: nativeHostHandlers.Date.parse,
        UTC: nativeHostHandlers.Date.UTC,
        now: nativeHostHandlers.Date.now
    });

    /**
     * Resets the temporal simulation state: clears all scheduled tasks
     * and resets all time advancement counters to zero.
     */
    const initializeModuleState = () => {
        // Efficiently clear all entries from the scheduled operations registry
        Object.keys(scheduledOperations).forEach(key => delete scheduledOperations[key]);
        operationIdCounter = 0;
        totalAccumulatedDelay = 0;
        currentExecutionPoint = 0;
        isTimeProgressionActive = false;
        progressionInterrupted = false;
        // console.debug('Chronos: Temporal simulation state reinitialized.'); // Optional debug log
    };

    /**
     * Determines if a given value is a valid number.
     * @param {*} val - The value to check.
     * @returns {boolean} True if the value is a number and not NaN, false otherwise.
     */
    const isValueNumeric = (val) => typeof val === 'number' && !Number.isNaN(val);

    /**
     * Retrieves the current effective time offset, considering whether
     * a time progression is actively running or not.
     * @returns {number} The current time offset in milliseconds.
     */
    const getCurrentTimeOffset = () => isTimeProgressionActive ? currentExecutionPoint : totalAccumulatedDelay;

    /**
     * Adds a new task to the master schedule.
     * @param {Function|string} callbackFn - The function or code string to execute.
     * @param {number} delayMs - The delay in milliseconds before the task should run.
     * @param {boolean} shouldRepeat - True if the task should repeat, false for one-time execution.
     * @returns {number} A unique identifier for the scheduled task.
     */
    const registerTimedTask = (callbackFn, delayMs, shouldRepeat) => {
        // If the callback is provided as a string, convert it to a function.
        // This is a legacy pattern but supported for compatibility.
        if (typeof callbackFn === 'string') {
            try {
                callbackFn = new Function(callbackFn);
            } catch (e) {
                // Handle cases where string is not valid JS, though native APIs might be more lenient.
                throw new Error(`Chronos: Invalid function string provided for scheduling: ${e.message}`);
            }
        } else if (typeof callbackFn !== 'function') {
            throw new Error('Chronos: Scheduled handler must be a function or a string.');
        }

        // Ensure delay is a non-negative number.
        const effectiveDelay = Math.max(0, isValueNumeric(delayMs) ? delayMs : 0);

        const registrationTime = getCurrentTimeOffset();
        const newId = operationIdCounter++;
        scheduledOperations[newId] = {
            identifier: newId,
            callback: callbackFn,
            intervalMs: effectiveDelay,
            addedAt: registrationTime,
            firstRunPoint: (registrationTime + effectiveDelay),
            lastRunPoint: undefined, // Will be set upon first execution of an interval
            repeating: shouldRepeat
        };

        // If a time progression is active, signal an interruption.
        // This ensures the newly scheduled task is considered for the current advancement cycle.
        if (isTimeProgressionActive) {
            progressionInterrupted = true;
        }

        return newId;
    };

    /**
     * Removes a scheduled task from the registry, effectively canceling it.
     * @param {number} operationIdentifier - The unique ID of the task to remove.
     */
    const removeOperation = (operationIdentifier) => {
        if (scheduledOperations[operationIdentifier]) {
            delete scheduledOperations[operationIdentifier];
        }
    };

    /**
     * Advances the simulated clock by a specified duration, executing all
     * scheduled tasks that fall within the new time range.
     * Tasks are executed in their proper chronological order.
     * @param {number} [durationMillis] - The number of milliseconds to advance the clock.
     *                                    If omitted, returns the current accumulated delay.
     * @returns {number} The new total accumulated simulated time.
     */
    const progressSimulation = (durationMillis) => {
        // If no duration is provided, simply return the current effective time.
        if (durationMillis === undefined || durationMillis === null) {
            return getCurrentTimeOffset();
        }

        // Validate the input duration.
        if (!isValueNumeric(durationMillis) || durationMillis < 0) {
            throw new Error("Chronos: Simulation duration must be a non-negative number.");
        }

        // Prepare a queue for tasks to be executed in this advancement cycle.
        const pendingExecutions = [];
        // Define the time window for this progression.
        const timeSlice = {
            start: totalAccumulatedDelay,
            end: totalAccumulatedDelay + durationMillis
        };
        totalAccumulatedDelay += durationMillis; // Update the total simulated time.

        // Helper to add a task instance to the execution queue.
        const enqueueTaskForExecution = (operation, executionTime) => {
            pendingExecutions.push({ task: operation, time: executionTime });
        };

        // Loop to collect and execute tasks. It repeats if new tasks are scheduled mid-execution,
        // which interrupts the current cycle.
        do {
            progressionInterrupted = false; // Reset interruption flag for this iteration.

            // Iterate over all currently scheduled operations to find those that should run.
            Object.values(scheduledOperations).forEach(op => {
                // Handle one-time timeouts
                if (!op.repeating && op.firstRunPoint <= timeSlice.end) {
                    enqueueTaskForExecution(op, op.firstRunPoint);
                }
                // Handle repeating intervals
                else if (op.repeating) {
                    // Schedule the first instance of an interval if it falls within the range
                    if (op.lastRunPoint === undefined && op.firstRunPoint > timeSlice.start && op.firstRunPoint <= timeSlice.end) {
                        op.lastRunPoint = op.firstRunPoint;
                        enqueueTaskForExecution(op, op.lastRunPoint);
                    }
                    // Schedule subsequent instances of an interval
                    while (op.lastRunPoint !== undefined && op.lastRunPoint + op.intervalMs <= timeSlice.end) {
                        op.lastRunPoint += op.intervalMs;
                        enqueueTaskForExecution(op, op.lastRunPoint);
                    }
                }
            });

            // Sort the collected execution tasks to ensure correct chronological order.
            // Tie-breaking rules:
            // 1. By execution time (ascending)
            // 2. By interval length (descending, shorter intervals run after longer ones if at same time)
            // 3. By original registration ID (ascending, for stable ordering)
            pendingExecutions.sort((opA, opB) => {
                let comparisonResult = opA.time - opB.time;
                if (comparisonResult === 0) {
                    comparisonResult = opB.task.intervalMs - opA.task.intervalMs; // Descending interval
                    if (comparisonResult === 0) {
                        comparisonResult = opA.task.identifier - opB.task.identifier; // Ascending ID
                    }
                }
                return comparisonResult;
            });

            // Execute the scheduled tasks.
            const executedIndices = []; // Keep track of tasks executed in this iteration.
            for (let i = 0; i < pendingExecutions.length; ++i) {
                const currentOpData = pendingExecutions[i];

                // Only execute if the task still exists in the master registry
                // (it might have been cleared by another callback).
                if (scheduledOperations[currentOpData.task.identifier]) {
                    currentExecutionPoint = currentOpData.time; // Set the current simulated time.
                    isTimeProgressionActive = true; // Mark progression as active.

                    try {
                        // Execute the task's callback in the global context.
                        currentOpData.task.callback.call(rootContext);
                    } finally {
                        isTimeProgressionActive = false; // Reset progression status.

                        executedIndices.push(i); // Record this task as executed.

                        // If it's a one-time task, remove it permanently.
                        if (!currentOpData.task.repeating) {
                            removeOperation(currentOpData.task.identifier);
                        }

                        // If a callback scheduled new tasks, the progression needs to restart.
                        if (progressionInterrupted) {
                            break; // Exit current execution loop.
                        }
                    }
                }
            }

            // Remove executed tasks from the pendingExecutions queue (in reverse order to avoid index issues).
            for (let i = executedIndices.length - 1; i >= 0; i--) {
                pendingExecutions.splice(executedIndices[i], 1);
            }
        } while (progressionInterrupted); // Continue if an interruption occurred.

        return getCurrentTimeOffset(); // Return the final simulated time.
    };

    /**
     * Manages the interception of global timing and Date functions.
     * @param {boolean} [shouldActivate] - Optional. If true, Chronos functions replace natives;
     *                                     if false, natives are restored.
     * @returns {boolean} The current state of global interception (true if active).
     */
    const controlGlobalInterception = (shouldActivate) => {
        if (shouldActivate !== undefined && typeof shouldActivate !== 'boolean') {
            throw new Error('Chronos: Activation flag must be a boolean or undefined.');
        }

        if (shouldActivate !== undefined) {
            activeGlobalOverride = shouldActivate;
            // Apply or restore the global functions.
            mergeProperties(rootContext, activeGlobalOverride ? mockedApiImplementations : nativeHostHandlers);
        }
        return activeGlobalOverride;
    };

    /**
     * Mocked implementations of standard timing and Date functions.
     * These are designed to be swapped in and out of the global scope.
     */
    const mockedApiImplementations = {
        /**
         * Mocked setTimeout function.
         * @param {Function|string} handler - Function or code string to execute.
         * @param {number} [delay] - Delay in milliseconds.
         * @param {...*} args - Additional arguments passed to the handler.
         * @returns {number} The ID of the scheduled task.
         */
        setTimeout: function(handler, delay, ...args) {
            // Specific validation from native setTimeout behavior
            if (typeof handler === 'number') {
                throw new Error("Chronos: Incorrect setTimeout usage: handler cannot be a number. Did you forget quotes?");
            }
            // If delay is omitted or invalid, default to 0.
            const effectiveDelay = Math.max(0, isValueNumeric(delay) ? delay : 0);
            return registerTimedTask(() => handler.apply(undefined, args), effectiveDelay, false);
        },

        /**
         * Mocked setInterval function.
         * @param {Function|string} handler - Function or code string to execute.
         * @param {number} [delay] - Delay in milliseconds.
         * @param {...*} args - Additional arguments passed to the handler.
         * @returns {number} The ID of the scheduled task.
         */
        setInterval: function(handler, delay, ...args) {
            if (typeof handler === 'number') {
                throw new Error("Chronos: Incorrect setInterval usage: handler cannot be a number. Did you forget quotes?");
            }
            const effectiveDelay = Math.max(0, isValueNumeric(delay) ? delay : 0);
            return registerTimedTask(() => handler.apply(undefined, args), effectiveDelay, true);
        },

        /**
         * Mocked clearTimeout function, aliases to removeOperation.
         * @param {number} id - The ID of the task to clear.
         */
        clearTimeout: removeOperation,

        /**
         * Mocked clearInterval function, aliases to removeOperation.
         * @param {number} id - The ID of the task to clear.
         */
        clearInterval: removeOperation,

        /**
         * Our custom Date constructor.
         */
        Date: TimeWarpedDate
    };

    // Expose the Chronos API to the global context.
    // Use a conditional check to ensure it's not overwritten if already defined.
    if (!rootContext.Chronos) {
        rootContext.Chronos = {
            reset: initializeModuleState,
            advance: progressSimulation,
            interceptGlobals: controlGlobalInterception,
            version: moduleVersion
        };
        // Extend the public API with the mocked timing methods.
        mergeProperties(rootContext.Chronos, mockedApiImplementations);
    } else {
        // console.warn('Chronos: Global object already exists. Skipping re-initialization.');
    }

    // Initialize the module state upon loading.
    initializeModuleState();
})();