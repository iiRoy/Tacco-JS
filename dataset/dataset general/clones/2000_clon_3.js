(function (globalScope, moduleInitializer) {
    // Check if running in a Node.js or CommonJS-compatible environment
    if (typeof module === 'object' && module.exports) {
        module.exports = moduleInitializer();

    // Check for an Asynchronous Module Definition (AMD) environment, like RequireJS
    } else if (typeof define === 'function' && define.amd) {
        define(moduleInitializer);

    // If neither, assume a browser environment and attach to the global scope
    } else {
        globalScope.devLogger = moduleInitializer();
    }
}(this, function moduleInitializerFunction() {
    "use strict"; // Enforce strict mode for cleaner, safer code

    // Declare core internal variables for the logging utility
    let currentLoggerFunction; // Holds the actual logging method (console.log wrapper)
    let verboseOutputEnabled = true; // Flag to control whether messages are actually logged (default: true)
    const ie8PolyfillPrefix = [null]; // A small array used for `Function.prototype.call.apply` workaround in older IE
    let environmentSupportsApply = false; // Flag indicating if `console.log.apply` is natively supported

    // --- Environment Capability Detection and Logger Initialization ---
    // This block determines the appropriate logging strategy based on browser/Node.js features.
    // Modern environments (Node.js, modern browsers like Chrome, Firefox, Edge, IE9+)
    // typically support `console.log.apply` directly.
    if (typeof console !== 'undefined' && console.log && typeof console.log.apply === "function") {
        environmentSupportsApply = true;
        currentLoggerFunction = function devLoggerProxy() {
            // Only execute the log if verbose output is enabled.
            if (verboseOutputEnabled) {
                console.log.apply(console, arguments); // Use native apply for efficiency
            }
        };
    } else {
        // Fallback for older browsers (e.g., Internet Explorer 8 and below)
        // where `console.log` might be a host object and not a true function with an `apply` method.
        environmentSupportsApply = false; // Explicitly set to false, though initialized as such
        currentLoggerFunction = function devLoggerLegacy() {
            if (verboseOutputEnabled) {
                // This clever trick uses `Function.prototype.call.apply` to correctly invoke
                // `console.log` with dynamic arguments, even if `console.log` itself lacks `apply`.
                // The `ie8PolyfillPrefix` (which is `[null]`) provides the `this` context for `console.log`.
                Function.prototype.call.apply(
                    console.log,
                    ie8PolyfillPrefix.concat(Array.prototype.slice.call(arguments, 0))
                );
            }
        };
    }

    // --- Public API: Traditional Getter/Setter Methods ---
    // These functions provide a programmatic way to control the logger's state.

    /**
     * Retrieves the current status of verbose logging.
     * @returns {boolean} True if verbose logging is enabled, false otherwise.
     */
    currentLoggerFunction.getVerboseStatus = function() {
        return verboseOutputEnabled;
    };

    /**
     * Sets the verbose logging status.
     * @param {boolean} newValue - True to enable verbose logging, false to disable.
     */
    currentLoggerFunction.setVerboseStatus = function(newValue) {
        // Validate input to ensure it's a boolean.
        if (typeof newValue === "boolean") {
            verboseOutputEnabled = newValue;
        } else {
            // Warn if an invalid type is provided, but don't change state.
            if (typeof console !== 'undefined' && console.warn) {
                console.warn("devLogger.setVerboseStatus expects a boolean value. Received:", typeof newValue);
            }
        }
    };

    /**
     * Retrieves the "production mode" status (inverse of verbose logging).
     * @returns {boolean} True if in production mode (verbose logging disabled), false otherwise.
     */
    currentLoggerFunction.getProductionStatus = function() {
        return !verboseOutputEnabled; // Returns true if verbose is OFF
    };

    /**
     * Sets the "production mode" status.
     * Setting this to true disables verbose logging. Setting to false enables it.
     * @param {boolean} newValue - True to enable production mode (disable verbose logging), false otherwise.
     */
    currentLoggerFunction.setProductionStatus = function(newValue) {
        if (typeof newValue === "boolean") {
            verboseOutputEnabled = !newValue; // If newValue is true (production), verbose becomes false.
        } else {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn("devLogger.setProductionStatus expects a boolean value. Received:", typeof newValue);
            }
        }
    };

    // --- Modern API: Property-based Getters/Setters via Object.defineProperties ---
    // This feature is only enabled for environments that fully support `Object.defineProperties`.
    // It provides a more idiomatic JavaScript way to interact with the logger's state using properties.
    if (environmentSupportsApply) { // Check if the environment is modern enough for `Object.defineProperties`
        // Define the property descriptors for `Object.defineProperties`
        const propertyDescriptors = {
            // 'enabled' property: direct control over verbose logging
            enabled: {
                get: currentLoggerFunction.getVerboseStatus,
                set: currentLoggerFunction.setVerboseStatus,
                enumerable: true, // Make this property visible when iterating over keys
                configurable: false // Prevent this property from being redefined or deleted
            },
            // 'verbose' property: an alias for 'enabled', common in logging libraries
            verbose: {
                get: currentLoggerFunction.getVerboseStatus,
                set: currentLoggerFunction.setVerboseStatus,
                enumerable: true,
                configurable: false
            },
            // 'disabled' property: provides an inverted view of the logging state
            disabled: {
                get: currentLoggerFunction.getProductionStatus,
                set: currentLoggerFunction.setProductionStatus,
                enumerable: true,
                configurable: false
            },
            // 'productionMode' property: an alias for 'disabled'
            productionMode: {
                get: currentLoggerFunction.getProductionStatus,
                set: currentLoggerFunction.setProductionStatus,
                enumerable: true,
                configurable: false
            }
        };

        // Apply the defined properties to the main logger function object
        try {
            Object.defineProperties(currentLoggerFunction, propertyDescriptors);
        } catch (propError) {
            // Log any potential errors during property definition (e.g., if environment check was imperfect)
            if (typeof console !== 'undefined' && console.error) {
                console.error("devLogger: Failed to define properties for logger instance.", propError);
            }
        }
    }

    // Return the configured logger function, which is the public interface of this module
    return currentLoggerFunction;
}));