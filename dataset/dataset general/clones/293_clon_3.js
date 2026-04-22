/*
 * Animation Frame Polyfill Utility
 * Original source: Inspired by various open-source implementations.
 * MIT License applies.
 *
 * This utility provides a compatibility layer for requestAnimationFrame and cancelRequestAnimationFrame
 * across different browser environments, offering a robust fallback mechanism.
 */
(function (executionContext) {

    // Abort if native support is already present
    if (executionContext.requestAnimationFrame) {
        return;
    }

    // -- Internal Helper Functions --

    // Obtains the current high-resolution timestamp.
    // Falls back to standard Date methods if performance.now is unavailable.
    var acquireCurrentTime = (function () {
        // For direct compatibility with original Date.now behavior, we'll stick to Date methods.
        // Performance.now() offers higher precision but a different epoch base,
        // which might subtly alter polyfill behavior if not carefully managed.
        return function () {
            return new Date().valueOf(); // Alternative to +new Date;
        };
    })();

    // Extracts property keys from an object.
    var retrieveObjectKeys = Object.keys || function (targetObject) {
        var collectedKeys = [];
        for (var propKey in targetObject) {
            // Ensure it's an own property
            if (Object.prototype.hasOwnProperty.call(targetObject, propKey)) {
                collectedKeys.push(propKey);
            }
        }
        return collectedKeys;
    };

    // Determines if an object has no enumerable properties.
    var checkObjectEmptiness = function (candidateObject) {
        // More robust than the original's custom loop, using the polyfilled Object.keys
        return retrieveObjectKeys(candidateObject).length === 0;
    };


    // -- Vendor-Specific Prefix Handling --

    var frameMethodSuffix = "RequestAnimationFrame";
    var frameCancelSuffix = "Cancel" + frameMethodSuffix;
    var vendorPrefixIdentifier = (function () {
        var potentialPrefixes = ["webkit", "moz", "o", "ms", "khtml"]; // Added khtml for more options
        var currentPrefix = null;
        for (var pIdx = 0; pIdx < potentialPrefixes.length; pIdx++) {
            var fullMethodName = potentialPrefixes[pIdx] + frameMethodSuffix;
            if (executionContext[fullMethodName] !== undefined) { // Check for undefined instead of null
                currentPrefix = potentialPrefixes[pIdx];
                break;
            }
        }
        return currentPrefix;
    })();

    // Apply vendor-specific implementation if found
    if (vendorPrefixIdentifier) {
        executionContext.requestAnimationFrame = executionContext[vendorPrefixIdentifier + frameMethodSuffix];
        executionContext.cancelRequestAnimationFrame = executionContext[vendorPrefixIdentifier + frameCancelSuffix];
        return;
    }

    // -- Custom Polyfill Implementation --

    // Configuration for the fallback mechanism
    var animationConfig = {
        targetFrameRate: 60, // frames per second
        minimumInterval: null // calculated below
    };
    animationConfig.minimumInterval = Math.floor(1000 / animationConfig.targetFrameRate); // Use Math.floor

    var activeAnimationRequests = {}; // Stores pending animation frame callbacks
    var nextAvailableRequestId = 1;   // Unique identifier for each request
    var scheduledTimerReference = null; // Reference to the active setTimeout timer

    // Guards against invalid callback types
    function validateCallback(fn) {
        if (typeof fn !== 'function') {
            throw new TypeError("Callback for requestAnimationFrame must be a function.");
        }
    }

    executionContext.requestAnimationFrame = function (animationCallback /*, optionalElementContext parameter is unused in this polyfill */) {
        validateCallback(animationCallback); // Added validation for the callback

        var currentRequestId = nextAvailableRequestId++; // Increment after assignment

        // Store the callback function
        activeAnimationRequests[currentRequestId] = animationCallback;

        // If no timer is currently active, set one up
        if (scheduledTimerReference === null) {
            scheduledTimerReference = setTimeout(function () {
                var currentTimestamp = acquireCurrentTime();
                var pendingCallbacksSnapshot = activeAnimationRequests; // Capture current state to process

                // Extract keys from the snapshot
                var callbackIdList = retrieveObjectKeys(pendingCallbacksSnapshot);

                // Reset the internal state for the next cycle *before* executing callbacks.
                // This ensures that any new requests made *during* the execution of the current
                // batch will correctly schedule a *new* timer for the subsequent frame.
                activeAnimationRequests = {};
                scheduledTimerReference = null;

                // Process all captured callbacks from the snapshot
                var callbackCount = callbackIdList.length;
                var currentIdx = 0;
                while (currentIdx < callbackCount) { // Rewritten loop structure
                    var idToExecute = callbackIdList[currentIdx];
                    var callbackToExecute = pendingCallbacksSnapshot[idToExecute];

                    // Execute the callback if it still exists in the snapshot
                    if (callbackToExecute) {
                        try {
                            callbackToExecute(currentTimestamp);
                        } catch (e) {
                            // Optionally handle errors in callbacks, e.g., log them
                            // console.error("Error in rAF callback:", e);
                        }
                    }
                    currentIdx++;
                }
            }, animationConfig.minimumInterval); // Use the pre-calculated interval
        }

        return currentRequestId;
    };

    executionContext.cancelRequestAnimationFrame = function (requestIdToCancel) {
        // Validate the request ID: must be a number and not null/undefined
        if (requestIdToCancel === null || requestIdToCancel === undefined || typeof requestIdToCancel !== 'number') {
            // For robustness, silently return for invalid IDs rather than throwing.
            return;
        }

        // Attempt to remove the pending request from our active list
        delete activeAnimationRequests[requestIdToCancel];

        // If all requests have been cancelled, it's safe to clear the pending timeout
        if (checkObjectEmptiness(activeAnimationRequests)) { // Using the new helper for object emptiness check
            clearTimeout(scheduledTimerReference);
            scheduledTimerReference = null; // Clear the reference to prevent stale IDs
        }
    };

})(this);