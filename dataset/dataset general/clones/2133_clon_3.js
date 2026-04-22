// This module provides a robust, historical debugging utility for web applications.
// It captures all log messages and ensures console methods are safely available.

/**
 * @namespace window.debugUtil
 * @description A global utility for logging messages and managing console safety.
 * @property {Array<Object>} eventRecords - Stores a history of all captured log events.
 */
window.debugUtil = (function createDebugUtility() {
    // Internal storage for all captured log entries.
    const historicalEntries = [];

    /**
     * Captures and logs messages to the browser console, while also storing them in a history.
     * Includes safeguards for console availability and an optional debug mode flag.
     * @function captureAndStoreLog
     * @param {...any} data - The data arguments to be logged.
     */
    function captureAndStoreLog() {
        // Determine the active console context, preferring 'this.console' if available, otherwise 'window.console'.
        const currentConsoleInstance = (this && this.console) ? this.console : window.console;

        // Convert arguments to a real array for easier manipulation and storage.
        const incomingArguments = Array.from(arguments);

        // Record the event with a timestamp and the data, marking it as potentially 'silent' initially.
        const recordEntry = {
            timestamp: new Date().toISOString(),
            data: incomingArguments,
            logType: 'silent' // Default type, updated if actually logged.
        };
        historicalEntries.push(recordEntry);

        // --- Guard clauses for logging behavior ---

        // 1. Check for a global debug mode flag. If DEBUG_MODE is defined and false, skip logging to console.
        if (typeof window.DEBUG_MODE !== 'undefined' && !window.DEBUG_MODE) {
            return;
        }

        // 2. Ensure console and its log method are available before attempting to log.
        if (!currentConsoleInstance || typeof currentConsoleInstance.log !== 'function') {
            // Even if console.log is not a function, we've still recorded the event.
            return;
        }

        // --- Attempt to log to the console ---
        try {
            // Apply the arguments to console.log. This handles multiple arguments correctly.
            currentConsoleInstance.log.apply(currentConsoleInstance, incomingArguments);
            recordEntry.logType = 'logged'; // Update type since it was successfully logged.
        } catch (consoleError) {
            // If logging itself throws an error (e.g., very old or unusual console implementations),
            // log the error to the console's error method if available, and record it in history.
            if (typeof currentConsoleInstance.error === 'function') {
                currentConsoleInstance.error("Error during debugUtil logging:", consoleError, incomingArguments);
            }
            // Record the failure in the history.
            historicalEntries.push({
                timestamp: new Date().toISOString(),
                data: ["Internal logging error", consoleError, incomingArguments],
                logType: 'logging-error'
            });
        }
    }

    // Attach the history array directly to the logging function for external access.
    captureAndStoreLog.eventRecords = historicalEntries;

    return captureAndStoreLog;
})();


// This Immediately Invoked Function Expression (IIFE) ensures that the
// global 'console' object and all its standard methods are safely available,
// preventing runtime errors in environments where the developer console might
// not be open or fully supported (e.g., older IE versions, specific embedded browsers).
(function initializeConsoleSafeguards() {
    // First, ensure 'window.console' is an object. If it's undefined, null, or a primitive,
    // replace it with an empty object to prevent property access errors.
    if (typeof window.console === 'undefined' || typeof window.console !== 'object') {
        window.console = {};
    }

    // A simple no-operation (noop) function to act as a fallback for missing console methods.
    const noopFn = function() {};

    // A comprehensive list of common console methods that should be safeguarded.
    // This list can be expanded to include less common or experimental methods if needed.
    const essentialConsoleMethods = [
        "assert", "clear", "count", "debug", "dir", "dirxml", "error",
        "exception", "group", "groupCollapsed", "groupEnd", "info", "log",
        "markTimeline", "profile", "profileEnd", "table", "time", "timeEnd",
        "timeStamp", "trace", "warn"
    ];

    // Iterate through the list of essential methods. For each method, if it's not
    // already defined on the 'console' object, assign the no-op function to it.
    for (let methodName of essentialConsoleMethods) {
        if (typeof window.console[methodName] === 'undefined') {
            window.console[methodName] = noopFn;
        }
    }

    // An additional explicit check for 'console.log' as it's the most frequently used.
    // This serves as a redundant safety measure to ensure 'log' is always a function.
    if (typeof window.console.log !== 'function') {
        window.console.log = noopFn;
    }
})();