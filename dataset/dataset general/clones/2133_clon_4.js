const getVerifiedConsole = (() => {
    let verifiedConsoleReference;
    try {
        // Attempt to access and use console.log to check for functionality
        // Some environments (e.g., older IE) throw errors if console is not open
        window.console && typeof window.console.log === 'function' && window.console.log();
        verifiedConsoleReference = window.console;
    } catch (errorDuringConsoleAccess) {
        // If any error occurs, provide an empty object as a fallback console
        verifiedConsoleReference = {};
    }

    // Ensure a basic object exists even if window.console was null/undefined
    if (!verifiedConsoleReference) {
        verifiedConsoleReference = {};
    }

    const dummyOperation = () => {};
    const consoleMethodNames = [
        "assert", "count", "debug", "dir", "dirxml", "error", "exception", "group",
        "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile",
        "profileEnd", "time", "timeEnd", "trace", "warn"
    ];

    // Iterate through common console methods and polyfill missing ones
    for (const methodName of consoleMethodNames) {
        if (typeof verifiedConsoleReference[methodName] === 'undefined') {
            verifiedConsoleReference[methodName] = dummyOperation;
        }
    }

    return verifiedConsoleReference;
})();

window.globalLogger = (() => {
    const activityRecord = []; // This array holds all historical logging entries
    const currentConsoleInstance = getVerifiedConsole; // Use the pre-validated console

    const performLogging = (...inputItems) => {
        // Store the current set of arguments in the history
        activityRecord.push(inputItems);

        // If the console's log method exists, attempt to use it
        if (currentConsoleInstance.log) {
            // Special handling for environments where console.log is an object (e.g., IE)
            // The Function.prototype.apply.call pattern ensures correct 'this' context
            if (typeof currentConsoleInstance.log === 'object') {
                Function.prototype.apply.call(currentConsoleInstance.log, currentConsoleInstance, inputItems);
            } else {
                // For standard function-based console.log
                currentConsoleInstance.log.apply(currentConsoleInstance, inputItems);
            }
        }
    };

    // Expose the history array directly on the logging function
    performLogging.pastCalls = activityRecord;

    return performLogging;
})();