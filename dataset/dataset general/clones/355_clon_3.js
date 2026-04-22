(function() {
    "use strict";

    // Initial browser environment validation. This utility is specifically
    // crafted for Chromium-based browsers that expose the `chrome` object
    // and a functional `console` for developer tools interaction.
    if (!globalThis.chrome || !globalThis.console) {
        const userFriendlyMessage = 'Developer Tools detection functionality is primarily intended for Google Chrome.';
        // Use console.error for a more prominent log if available, otherwise fallback to alert.
        if (globalThis.console && console.error) {
            console.error(userFriendlyMessage);
        } else {
            alert(userFriendlyMessage);
        }
        return; // Terminate execution if the environment is not suitable.
    }

    // Establish a dedicated namespace within `globalThis.chrome` for these utilities.
    // This ensures that our tools are organized and do not conflict with other scripts.
    globalThis.chrome.devTools = globalThis.chrome.devTools || {};

    /*
     * Rationale behind console method interception:
     *
     * Activating `console.profile()` to ascertain the status of developer tools
     * often results in diagnostic messages being printed to the console log by WebKit.
     * These messages can be a nuisance, obscuring legitimate application output.
     * To manage this, we employ a strategy of encapsulating these detection-related
     * messages within a collapsed console group. This keeps the main log clean.
     *
     * However, it's crucial that regular application logging (from other parts
     * of the codebase) remains visible and is not inadvertently hidden within
     * our collapsed group. To achieve this, we instrument the standard console
     * logging methods (`log`, `info`, `warn`, `error`, `debug`) and the group
     * management methods (`group`, `groupCollapsed`, `groupEnd`).
     *
     * Our custom wrappers for these methods first check if our internal,
     * detection-specific collapsed group is currently active. If it is,
     * they will automatically close this group before proceeding with their
     * original logging or grouping operation. This ensures that any subsequent
     * console output from other sources appears outside our utility's context.
     * The `console.groupEnd` method is also modified to correctly manage
     * the internal state flag for our group.
     */

    // Declare and initialize key variables using modern `const` and `let` keywords.
    // These hold references to original console functions and manage the state of our special group.
    const standardLoggingFunctions = ['info', 'warn', 'log', 'debug', 'error'];
    let nativeGroupEndFunction = console.groupEnd; // Preserve the original `console.groupEnd`.
    let isDetectionGroupCurrentlyOpen = false; // Flag indicating if our special collapsed group is active.
    const nativeGroupCollapsedFunction = console.groupCollapsed; // Preserve the original `console.groupCollapsed`.
    const consoleGroupCreationFunctions = ['group', 'groupCollapsed']; // Methods that initiate a new console group.

    // A reusable internal helper to safely close our detection-specific group.
    const closeDetectionGroupIfActive = () => {
        if (isDetectionGroupCurrentlyOpen) {
            nativeGroupEndFunction.apply(console); // Execute the original `groupEnd`.
            isDetectionGroupCurrentlyOpen = false; // Reset the flag.
        }
    };

    // Iteratively patch standard console output methods.
    // Each method is wrapped to first close our internal group if it's open.
    for (const functionName of standardLoggingFunctions) {
        const originalConsoleMethod = console[functionName]; // Store the native method.
        console[functionName] = function(...args) { // Replace with a custom wrapper.
            closeDetectionGroupIfActive(); // Ensure our group is closed.
            return originalConsoleMethod.apply(console, args); // Call the original method.
        };
    }

    // Iteratively patch console group creation methods.
    // Similar to logging methods, they close our internal group before creating a new one.
    for (const groupMethodName of consoleGroupCreationFunctions) {
        const originalGroupMethod = console[groupMethodName]; // Store the native method.
        console[groupMethodName] = function(...args) { // Replace with a custom wrapper.
            closeDetectionGroupIfActive(); // Ensure our group is closed.
            originalGroupMethod.apply(console, args); // Call the original method (original code didn't pass args, maintaining that).
        };
    }

    // Override `console.groupEnd` to manage our internal group's state correctly.
    // This also rectifies a potential logic flaw from the original implementation.
    console.groupEnd = function(...args) {
        if (isDetectionGroupCurrentlyOpen) {
            nativeGroupEndFunction.apply(console); // Close our internal group if active.
            isDetectionGroupCurrentlyOpen = false;
        }
        nativeGroupEndFunction.apply(console, args); // Always call the native `groupEnd` for other groups.
    };

    // Core function to ascertain if the browser's developer tools panel is currently active.
    // This relies on the observable side-effect of `console.profile()` within WebKit.
    const probeForDevToolsOpen = function() {
        const initialProfileCount = console.profiles ? console.profiles.length : 0; // Get current profile count.

        // If our internal tracking group is not active, initiate a new collapsed group
        // to contain the detection-related console output.
        if (!isDetectionGroupCurrentlyOpen) {
            isDetectionGroupCurrentlyOpen = true;
            nativeGroupCollapsedFunction.apply(console, ['DevTools Activity Check']); // Label the collapsed group.
        }

        // Execute a profile start/end sequence. This action is typically recorded
        // by active developer tools, increasing the `console.profiles` array length.
        console.profile('DevTools_Availability_Probe');
        console.profileEnd();

        // Determine if a new profile was successfully registered, indicating active DevTools.
        const wasProfileAdded = (console.profiles ? console.profiles.length : 0) > initialProfileCount;

        return wasProfileAdded; // Return `true` if DevTools are detected.
    };

    // Initialize a viewport compensation value for layout calculations.
    // This value, accounting for browser UI elements, is crucial for accurate
    // docking detection. It's calculated once based on the initial DevTools state.
    if (globalThis.chrome.devTools._viewportCompensation === undefined) {
        const isCurrentlyOpen = probeForDevToolsOpen();
        // A slightly adjusted constant from the original `200`.
        const calculatedOffset = isCurrentlyOpen ? 215 : (window.outerHeight - window.innerHeight);
        globalThis.chrome.devTools._viewportCompensation = calculatedOffset;
    }

    // Function to determine if the developer tools are currently docked (attached)
    // to the main browser window, rather than being in a separate window.
    // This is inferred by comparing inner and outer window dimensions,
    // considering display scaling and UI offsets.
    const inferDockingStatus = function() {
        // Calculate a display scaling factor. The original code had a flaw
        // by adding `margin-left` twice. This version uses `clientWidth` and `scrollWidth`
        // for a more robust (though still heuristic) scaling approximation.
        const documentClientWidth = document.documentElement.clientWidth || document.body.clientWidth || 1;
        const documentScrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth || 1;
        const screenScalingFactor = (documentScrollWidth > 0) ? (documentScrollWidth / documentClientWidth) : 1;

        // Define thresholds for detecting significant size differences.
        // These thresholds are slightly modified from the original values.
        const effectiveHeightThreshold = 3 + Math.ceil((screenScalingFactor * window.innerHeight) + globalThis.chrome.devTools._viewportCompensation);
        const effectiveWidthThreshold = 3 + Math.ceil(screenScalingFactor * window.innerWidth);

        // Check if the outer window dimensions substantially exceed the inner dimensions
        // plus the calculated thresholds. This is a strong indicator of a docked DevTools panel.
        const isOuterHeightLarger = window.outerHeight > effectiveHeightThreshold;
        const isOuterWidthLarger = window.outerWidth > effectiveWidthThreshold;

        return isOuterHeightLarger || isOuterWidthLarger;
    };

    // The primary public method for retrieving the current DevTools state.
    // It returns an object detailing whether DevTools are active and their docking status.
    globalThis.chrome.devTools.getState = function() {
        const currentDevToolsState = {};
        const areToolsCurrentlyOpen = probeForDevToolsOpen(); // First, check if DevTools are active.
        currentDevToolsState.isOpen = areToolsCurrentlyOpen;
        // Docking status is only relevant if the DevTools panel is actually open.
        currentDevToolsState.isDocked = areToolsCurrentlyOpen && inferDockingStatus();
        return currentDevToolsState;
    };

    // Provides a continuous monitoring mechanism for DevTools state changes.
    // Callers receive an object with a `stopPolling` method to halt the monitoring.
    globalThis.chrome.devTools.getState.monitorChanges = function(configurationOptions) {
        const defaultPollingIntervalMs = 150; // A slightly adjusted default interval for checks.
        let pollingInterval = configurationOptions?.interval || defaultPollingIntervalMs; // Use optional chaining for safe access.

        // Robust validation for the input configuration. A callback function is essential.
        if (!configurationOptions || (typeof configurationOptions !== 'object' && typeof configurationOptions !== 'function')) {
            console.warn('DevTools state monitoring requires a configuration object or a direct callback function.');
            return null; // Invalid configuration, cannot proceed.
        }

        let stateChangeCallback;
        if (typeof configurationOptions === 'function') {
            stateChangeCallback = configurationOptions;
            // Normalize the configuration to an object for consistent internal handling.
            configurationOptions = { callback: stateChangeCallback };
        } else if (typeof configurationOptions.callback !== 'function') {
            console.warn('DevTools state monitor configuration must include a valid `callback` function.');
            return null; // Missing or invalid callback.
        } else {
            stateChangeCallback = configurationOptions.callback;
        }

        let monitoringIntervalId; // Stores the ID returned by `setInterval` for control.
        let lastKnownDetectionState = null; // Keeps track of the state from the previous check.

        // The control object returned to the caller, enabling them to stop the monitoring.
        const monitorController = {
            stopPolling: function() {
                if (monitoringIntervalId) {
                    clearInterval(monitoringIntervalId);
                    monitoringIntervalId = null;
                    console.info('DevTools state change monitoring has been halted.');
                }
            }
        };

        // A custom utility function for deep comparison of state objects.
        // This is a corrected and more robust implementation compared to the original code.
        const compareStateObjects = function(stateA, stateB) {
            // Handle edge cases where inputs are not objects or are null/undefined.
            if (typeof stateA !== 'object' || stateA === null ||
                typeof stateB !== 'object' || stateB === null) {
                return stateA === stateB; // Direct comparison for non-objects.
            }

            const keysA = Object.keys(stateA);
            const keysB = Object.keys(stateB);

            // If the number of properties differs, the objects are not equivalent.
            if (keysA.length !== keysB.length) {
                return false;
            }

            // Compare the value of each property.
            for (const key of keysA) {
                // Ensure key exists in both and values are strictly equal.
                if (!Object.prototype.hasOwnProperty.call(stateB, key) || stateA[key] !== stateB[key]) {
                    return false;
                }
            }
            return true; // Objects are identical in structure and values.
        };

        // The central function that executes periodically to check the DevTools state.
        const executeStateCheck = function() {
            const currentDetectionState = globalThis.chrome.devTools.getState(); // Fetch the latest state.

            // Invoke the callback only if a genuine change in state is detected.
            if (!compareStateObjects(lastKnownDetectionState, currentDetectionState)) {
                // Execute the user-defined callback, setting `monitorController` as its context (`this`).
                stateChangeCallback.apply(monitorController, [currentDetectionState, lastKnownDetectionState]);
            }

            // Update the `lastKnownDetectionState` for the next comparison cycle.
            lastKnownDetectionState = currentDetectionState;
        };

        // Perform an immediate initial check, then establish the recurring interval.
        executeStateCheck();
        monitoringIntervalId = setInterval(executeStateCheck, pollingInterval);

        return monitorController; // Return the controller object to allow stopping.
    };

})();