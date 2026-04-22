/*
 *  Utility for development console output.
 *  Based on various community snippets and best practices.
 *  Provides a robust logging mechanism with history.
 */
window.devLog = function() {
    // Ensure a storage array for previous messages.
    window.devLog.pastRecords = window.devLog.pastRecords || [];

    // Capture the current arguments and add a timestamp.
    const currentEntry = {
        timestamp: new Date().toISOString(),
        args: Array.from(arguments)
    };
    window.devLog.pastRecords.push(currentEntry);

    // Proceed only if the browser's console object is available.
    if (this.console && typeof console.log === 'function') {
        // Prepare arguments for console.log.
        const processedArgs = Array.from(arguments);

        // Directly invoke console.log.
        // The original check for typeof console.log === 'object' was for older IE versions.
        // For modern browsers, it's typically a function, simplifying the call.
        console.log.apply(console, processedArgs);
    }
};

/*
 *  Establishes safe console methods across different browser environments.
 *  Prevents errors in browsers where console methods might be undefined or behave unexpectedly.
 *  Initializes a basic console object if none exists.
 */
(function(targetWindow) {
    // Define a no-operation function to stub out unavailable console methods.
    const noOperation = function() {};

    // Safely retrieve the console object, creating a minimal stub if it's missing or problematic.
    const getSafeConsole = function() {
        try {
            // Attempt to call a console method to ensure its existence and functionality.
            if (window.console && typeof window.console.log === 'function') {
                window.console.log(); // Ensure it doesn't throw.
                return window.console;
            }
        } catch (error) {
            // If an error occurs (e.g., console is not open in IE), return a minimal stub.
        }
        // Fallback to an empty object if no console exists or it caused an error.
        return { };
    };

    const activeConsole = getSafeConsole();

    // List of common console methods to be stubbed.
    const consoleMethods = [
        "assert", "count", "debug", "dir", "dirxml", "error", "exception",
        "group", "groupCollapsed", "groupEnd", "info", "log", "timeStamp",
        "profile", "profileEnd", "time", "timeEnd", "trace", "warn"
    ];

    // Iterate through the methods and assign a no-operation function if they are not defined.
    consoleMethods.forEach(function(methodName) {
        if (!activeConsole[methodName]) {
            activeConsole[methodName] = noOperation;
        }
    });

    // Assign the potentially modified console back to the window if it was an empty stub.
    if (!window.console) {
        window.console = activeConsole;
    }

})(window);


/*
 *  Collection of mobile device specific utility functions.
 *  Designed to address common mobile browser quirks and enhancements.
 *  Encapsulated within an anonymous function to avoid global namespace pollution.
 */
(function(docRef) {
    // Initialize the main utility object if it doesn't exist.
    window.MobileDeviceUtils = window.MobileDeviceUtils || {};
    const utils = window.MobileDeviceUtils;

    // Retrieve the viewport meta tag for dynamic adjustments.
    utils.viewportConfigElement = docRef.querySelector && docRef.querySelector('meta[name="viewport"]');
    // Store the user agent string for device detection.
    utils.deviceUserAgentString = navigator.userAgent;

    // Helper function to check if the current device is an iOS device (iPhone or iPad).
    const isIOSDevice = function() {
        return /iPhone|iPad|iPod/.test(utils.deviceUserAgentString);
    };

    /*
     *  Corrects the viewport scale bug prevalent on older iOS devices.
     *  Prevents unintentional zooming when the device is rotated or gestures are made.
     */
    utils.initializeViewportScalingCorrection = function() {
        // Apply fix only if a viewport meta tag is present and it's an iOS device (excluding Opera Mini).
        if (utils.viewportConfigElement && isIOSDevice() && !/Opera Mini/i.test(utils.deviceUserAgentString)) {
            // Set initial viewport content to prevent scaling.
            utils.viewportConfigElement.content = "width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0";

            // Attach an event listener for gesture start to temporarily allow scaling.
            docRef.addEventListener("gesturestart", utils.onViewportGestureStart, false);
        }
    };

    /*
     *  Event handler for the 'gesturestart' event.
     *  Temporarily relaxes viewport constraints to allow user zooming during gestures.
     */
    utils.onViewportGestureStart = function() {
        if (utils.viewportConfigElement) {
            utils.viewportConfigElement.content = "width=device-width, initial-scale=1.0, minimum-scale=0.25, maximum-scale=1.6";
        }
    };

    /*
     *  Attempts to hide the browser's URL bar on page load for a more "app-like" experience.
     *  Primarily targets iOS and Android devices.
     */
    utils.initiateURLBarHiding = function() {
        const currentWindow = window;
        const currentDocument = currentWindow.document;

        // Skip if a hash exists in the URL or if addEventListener is not supported.
        // The hash check might prevent issues with fragment identifiers.
        if (currentWindow.location.hash || !currentWindow.addEventListener) {
            return; // Exit if conditions are not met.
        }

        // Initial scroll to 1 pixel to attempt hiding the bar.
        currentWindow.scrollTo(0, 1);
        let currentScrollPosition = 1;

        // Periodically check if the document body is ready.
        const bodyReadyChecker = setInterval(function() {
            if (currentDocument.body) {
                clearInterval(bodyReadyChecker); // Stop checking once body is ready.

                // Determine the actual scroll position, falling back to 1.
                currentScrollPosition = "scrollTop" in currentDocument.body ? currentDocument.body.scrollTop : 1;

                // Scroll to 0 or 1 based on the determined scroll position.
                // This ensures the bar is hidden if it was at 1, or remains at 0 otherwise.
                currentWindow.scrollTo(0, currentScrollPosition === 1 ? 0 : 1);
            }
        }, 15); // Check every 15 milliseconds.

        // Attach a listener to the window's 'load' event to re-attempt hiding the bar.
        currentWindow.addEventListener("load", function() {
            // Use setTimeout to ensure all rendering is complete before scrolling.
            setTimeout(function() {
                currentWindow.scrollTo(0, currentScrollPosition === 1 ? 0 : 1);
            }, 0); // Execute immediately after other load tasks.
        }, false);
    };

    // Optionally, trigger these functions on script load or DOM ready.
    // For a Type III clone, explicit calls might be added or modified.
    // For example, instead of just defining, call them here:
    // utils.initializeViewportScalingCorrection();
    // utils.initiateURLBarHiding();

})(document);