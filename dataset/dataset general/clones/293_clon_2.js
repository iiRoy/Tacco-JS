/*
* Animation Frame Scheduler Utility
* This module provides a polyfill for scheduleFrameUpdate and revokeFrameUpdate.
*
* Original concept and implementation derived from various open-source projects,
* including those focused on high-performance scrolling and animation management.
*
* Developed to ensure smooth visual updates across different browser environments.
*
* Licensed under a permissive open-source license.
*/
(function (universe) { // Encapsulate the module in a self-executing function
    if (universe.scheduleFrameUpdate) { // Check if the animation scheduler is already present
        return; // Exit if the native or a polyfilled version exists
    }

    // Helper function to obtain the current timestamp with high precision
    var captureTime = Date.now || function () {
        return (new Date()).getTime(); // Fallback for older environments
    };

    // Utility function to gather property names from an object
    // Note: The fallback implementation returns an object mapping keys to 'true',
    // which might differ from standard Object.keys behavior if it were used directly
    // where an array is expected. This replicates the original structure.
    var retrieveKeys = Object.keys || function (inputObject) {
        var propertyMap = {}; // A map to store property names
        for (var propName in inputObject) { // Iterate through enumerable properties
            propertyMap[propName] = true; // Store the property name with a true value
        }
        return propertyMap; // Return the map of properties
    };

    // Determines if an object contains any enumerable properties
    // Note: Object.empty is a non-standard method, so a custom implementation is provided.
    var checkIfEmpty = function (inputObject) { // A new function to check emptiness
        for (var propName in inputObject) { // Iterate over object properties
            return false; // If any property is found, the object is not empty
        }
        return true; // If the loop completes without finding properties, the object is empty
    };


    // Polyfill for requestAnimationFrame-like functionality
    // Based on concepts from web animation timing specifications

    // Standard suffix for animation frame methods
    var suffixString = "RequestAnimationFrame";
    // Detect the vendor-specific prefix for the animation frame methods
    var vendorPrefix = (function () { // Self-invoking function to determine the prefix
        var vendorNames = "webkit,moz,o,ms".split(","); // Common browser vendor prefixes
        for (var idx = 0; idx < 4; idx++) { // Loop through the prefixes
            if (universe[vendorNames[idx] + suffixString] != null) { // Check if the prefixed method exists
                return vendorNames[idx]; // Return the found prefix
            }
        }
        return undefined; // No vendor prefix found
    })();

    // If a vendor prefix was detected, use the native prefixed implementations
    if (vendorPrefix) {
        universe.scheduleFrameUpdate = universe[vendorPrefix + suffixString]; // Assign the vendor-prefixed request method
        universe.revokeFrameUpdate = universe[vendorPrefix + "Cancel" + suffixString]; // Assign the vendor-prefixed cancel method
        return; // Exit the module as native support is available
    }

    // Fallback custom implementation if no native support is found
    var FRAME_RATE_GOAL = 60; // Target frames per second for the custom loop
    var pendingAnimations = {}; // Stores animation callbacks awaiting execution
    var animationCounter = 1; // Unique identifier for each scheduled animation
    var timerReference = null; // Holds the reference to the setTimeout timer

    universe.scheduleFrameUpdate = function (animationCallback, containerElement) { // Defines the custom requestAnimationFrame function
        var callbackIdentifier = animationCounter++; // Generate a unique ID for this callback

        // Store the callback in the pending list
        pendingAnimations[callbackIdentifier] = animationCallback;

        // If no timer is active, start one to process animations
        if (timerReference === null) {
            timerReference = setTimeout(function () { // Set a timer to mimic frame updates
                var executionTime = captureTime(); // Get the current time for the callbacks
                var activeAnimations = pendingAnimations; // Reference current pending animations
                var identifiers = retrieveKeys(activeAnimations); // Get keys of active animations (potential bug replication here)

                // Clear animation data structures before executing to prevent re-entry issues
                pendingAnimations = {};
                timerReference = null;

                // Execute all stored animation callbacks
                // Note: If retrieveKeys fallback was used, 'identifiers.length' would be undefined,
                // causing this loop to not run. This behavior mirrors the original.
                for (var frameIdx = 0, limit = identifiers.length; frameIdx < limit; frameIdx++) {
                    activeAnimations[identifiers[frameIdx]](executionTime); // Invoke the callback with the current time
                }
            }, 1000 / FRAME_RATE_GOAL); // Schedule the next frame based on target FPS
        }

        return callbackIdentifier; // Return the ID for potential cancellation
    };

    universe.revokeFrameUpdate = function (identifierToCancel) { // Defines the custom cancelRequestAnimationFrame function
        delete pendingAnimations[identifierToCancel]; // Remove the specified animation from the pending list

        // If there are no more pending animations, stop the timer
        if (checkIfEmpty(pendingAnimations)) { // Check if the animation queue is empty
            clearTimeout(timerReference); // Halt the active timer
            timerReference = null; // Reset the timer reference
        }
    };

})(this); // Pass the global context (window in browsers, global in Node.js)