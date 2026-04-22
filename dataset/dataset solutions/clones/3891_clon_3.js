module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    // Each entry holds the module's ID, its loading status, and its exported values.
    const moduleInstanceCache = {};

    /**
     * The central function for resolving and executing modules.
     * It mimics the behavior of a `require` function in module systems.
     * @param {number} identifier The unique numeric ID of the module to load.
     * @returns {*} The `exports` object of the requested module.
     * @throws {Error} If an invalid module identifier is provided.
     */
    function resolveAndExecuteModule(identifier) {
        // --- Added Guard Clause: Validate the module identifier ---
        if (typeof identifier !== 'number' || identifier < 0 || identifier >= moduleDefinitions.length) {
            console.error(`RUNTIME ERROR: Attempted to load an invalid module identifier: ${identifier}`);
            throw new Error(`Invalid Module ID: ${identifier}. Must be a number within the defined range.`);
        }

        // If the module is already in our cache, return its exports immediately.
        if (moduleInstanceCache[identifier]) {
            return moduleInstanceCache[identifier].exports;
        }

        // If not cached, prepare a new module entry.
        // Initialize its properties: ID, loading status (false initially), and an empty exports object.
        const currentModuleRecord = moduleInstanceCache[identifier] = {
            id: identifier,
            hasFinishedLoading: false, // Renamed from `l`
            exports: {}
        };

        // --- Core Module Execution ---
        // Call the module definition function.
        // It receives `module`, `exports`, and the `resolveAndExecuteModule` function itself.
        // The `this` context for the module function is set to `currentModuleRecord.exports`.
        moduleDefinitions[identifier].call(
            currentModuleRecord.exports, // 'this' context for the module
            currentModuleRecord,         // 'module' object
            currentModuleRecord.exports, // 'exports' object
            resolveAndExecuteModule      // local 'require' function for this module
        );

        // After the module's code has run, mark it as fully loaded.
        currentModuleRecord.hasFinishedLoading = true;

        // Return the resulting exports object.
        return currentModuleRecord.exports;
    }

    // --- Exposing Internal Runtime Properties (for debugging/introspection) ---
    // The original `t.m = e` and `t.c = r` exposed these. We do similarly with new names.
    resolveAndExecuteModule.allBundledModules = moduleDefinitions;
    resolveAndExecuteModule.loadedModuleCache = moduleInstanceCache;

    /**
     * Helper function to define a getter property on an object.
     * Used internally for defining ES module exports (`__esModule`, named exports).
     * This replaces `t.d` and incorporates the logic of `t.o`.
     * @param {object} targetObj The object on which to define the property.
     * @param {string} propertyName The name of the property.
     * @param {Function} getterFn The function to execute to retrieve the property's value.
     */
    resolveAndExecuteModule.defineModuleProperty = function(targetObj, propertyName, getterFn) {
        // Only define the property if it doesn't already exist on the object.
        // This prevents accidental overwrites and matches the original's `t.o` check.
        if (!Object.prototype.hasOwnProperty.call(targetObj, propertyName)) {
            Object.defineProperty(targetObj, propertyName, {
                enumerable: true, // Make the property visible during enumeration (e.g., `for...in`).
                get: getterFn     // The function that provides the property's value.
            });
        }
    };

    /**
     * Helper to mark a module's exports as an ECMAScript Module.
     * This involves setting `__esModule: true` and optionally `Symbol.toStringTag`.
     * This replaces `t.r`.
     * @param {object} exportsTarget The exports object to mark.
     */
    resolveAndExecuteModule.signalESModule = function(exportsTarget) {
        // Set `Symbol.toStringTag` for better object identification in debugging.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsTarget, Symbol.toStringTag, {
                value: 'Module',
                configurable: true // Allow redefining this property if necessary.
            });
        }
        // Crucially, set `__esModule` to true to indicate it's an ES module.
        Object.defineProperty(exportsTarget, '__esModule', {
            value: true,
            writable: false,    // Prevent modification of this flag.
            configurable: true  // Allow deletion (though not common).
        });
    };

    /**
     * Creates an interoperability namespace object for handling different module formats.
     * This replaces `t.t`.
     * @param {*} sourceValue The original module exports or module ID.
     * @param {number} conversionFlags Flags dictating the conversion strategy.
     * @returns {object} A namespace object compatible with ES module syntax.
     */
    resolveAndExecuteModule.createModuleNamespace = function(sourceValue, conversionFlags) {
        let currentProcessedValue = sourceValue;

        // Flag 1: If set, the `sourceValue` is a module ID; require it first.
        if (conversionFlags & 1) {
            currentProcessedValue = resolveAndExecuteModule(sourceValue);
        }
        // Flag 8: If set, return the value directly (it's already a namespace or primitive).
        if (conversionFlags & 8) {
            return currentProcessedValue;
        }
        // Flag 4: If set, and it's an object already marked as an ES module, return it directly.
        if (conversionFlags & 4 && typeof currentProcessedValue === 'object' && currentProcessedValue && currentProcessedValue.__esModule) {
            return currentProcessedValue;
        }

        // If none of the above, construct a new namespace object.
        const newNamespaceObject = Object.create(null);
        resolveAndExecuteModule.signalESModule(newNamespaceObject); // Mark it as an ES module.

        // Define a 'default' export pointing to the original processed value.
        Object.defineProperty(newNamespaceObject, 'default', {
            enumerable: true,
            value: currentProcessedValue,
            writable: true // Allow reassignment of the default export.
        });

        // Flag 2: If set, and the value is not a string, iterate its properties
        // and re-export them as named exports in the new namespace.
        if (conversionFlags & 2 && typeof currentProcessedValue !== 'string') {
            for (const propKey in currentProcessedValue) {
                // Ensure the property is directly on the object, not from its prototype chain.
                if (Object.prototype.hasOwnProperty.call(currentProcessedValue, propKey)) {
                    resolveAndExecuteModule.defineModuleProperty(newNamespaceObject, propKey, (function(keyToBind) {
                        return function() {
                            return currentProcessedValue[keyToBind];
                        };
                    })(propKey)); // Use a closure to capture `propKey`.
                }
            }
        }
        return newNamespaceObject;
    };

    /**
     * Provides a getter function for a module's default export.
     * This replaces `t.n`.
     * @param {*} sourceExports The exports object of a module.
     * @returns {Function} A function that, when called, returns the default export.
     */
    resolveAndExecuteModule.retrieveDefaultExport = function(sourceExports) {
        const defaultExportAccessor = (sourceExports && sourceExports.__esModule) ?
            function() { return sourceExports.default; } :
            function() { return sourceExports; }; // If not ES module, the entire exports object is the default.

        // Define a common alias 'a' for the default export getter.
        resolveAndExecuteModule.defineModuleProperty(defaultExportAccessor, "a", defaultExportAccessor);
        return defaultExportAccessor;
    };

    // The original `t.p` (public path) was an empty string and is not used in this implementation,
    // so it has been intentionally omitted as a non-essential fragment.

    // --- Application Entry Point ---
    // Start the application by loading the module designated as the starting point (ID 0).
    // This is equivalent to `t(t.s = 0)` in the original code.
    resolveAndExecuteModule.applicationEntryPoint = 0; // Explicitly define the entry point ID.
    resolveAndExecuteModule(resolveAndExecuteModule.applicationEntryPoint);
};

// --- Array of Module Definitions ---
// Each function in this array represents a distinct module within the bundle.
([
    // Module ID 0: Main Application Logic
    // This module reads input from `/dev/stdin`, processes it, and invokes the core logic module.
    function(moduleCtx, exportsCtx, moduleRequester) {
        let rawInputLines;
        try {
            // Request the 'fs' (file system) module, which is Module ID 2.
            const fileSystemHandler = moduleRequester(2);

            // --- Added Validation and Error Handling ---
            if (typeof fileSystemHandler.readInputSynchronously !== 'function') {
                throw new Error("Required 'readInputSynchronously' function not found in filesystem handler.");
            }

            // Read the entire content from standard input, decode as UTF-8, and split into lines.
            rawInputLines = fileSystemHandler.readInputSynchronously("/dev/stdin", "UTF-8").split("\n");

        } catch (inputReadError) {
            console.error("ERROR: Failed to acquire input from /dev/stdin:", inputReadError.message);
            // In a production scenario, one might exit or provide default data.
            // For this clone, we'll ensure `rawInputLines` is an empty array to prevent further crashes.
            rawInputLines = [];
        }

        // --- Added Input Validation for the main logic ---
        if (!Array.isArray(rawInputLines) || rawInputLines.length === 0 || rawInputLines[0].trim() === '') {
            console.warn("WARNING: No valid input lines were provided or the first line was empty. Skipping core logic.");
            return; // Exit if there's no meaningful input.
        }

        // Request the core problem-solving logic module (Module ID 1).
        const problemSolver = moduleRequester(1);
        // Pass the processed input lines to the problem solver.
        problemSolver(rawInputLines);
    },

    // Module ID 1: Core Problem-Solving Algorithm
    // This module takes an array of input strings, parses the first line for numbers,
    // and applies a specific conditional check, printing "YES" or "NO".
    function(moduleCtx, exportsCtx) {
        /**
         * Custom helper to safely extract a fixed number of elements from an array.
         * This is a simplified replacement for the original's generic `_slicedToArray` Babel helper,
         * tailored for extracting exactly `count` elements.
         * @param {Array} sourceData The array from which to extract elements.
         * @param {number} requiredCount The exact number of elements expected.
         * @returns {Array} An array containing the first `requiredCount` elements.
         * @throws {TypeError} If `sourceData` is not an array or has insufficient elements.
         */
        function extractSpecificElements(sourceData, requiredCount) {
            if (!Array.isArray(sourceData)) {
                throw new TypeError("Input for element extraction must be an array.");
            }
            if (sourceData.length < requiredCount) {
                console.error(`DATA ERROR: Array has ${sourceData.length} elements, but ${requiredCount} were expected.`);
                throw new TypeError(`Insufficient elements in array. Expected ${requiredCount}, got ${sourceData.length}.`);
            }
            // Use `slice` for a clean, non-mutating extraction of the required number of elements.
            return sourceData.slice(0, requiredCount);
        }

        // The primary function exported by this module.
        // It processes the input and determines the outcome.
        moduleCtx.exports = function(incomingLines) {
            // --- Input Validation ---
            if (!Array.isArray(incomingLines) || incomingLines.length === 0) {
                console.error("LOGIC ERROR: Core solver received empty or invalid input lines.");
                return;
            }

            // Take the first line, split it by spaces, and convert each part to an integer.
            // Using `parseInt` with radix 10 for explicit base conversion, and `trim()` for robustness.
            const numericStrings = incomingLines[0].split(" ");
            const parsedNumericValues = numericStrings.map(str => parseInt(str.trim(), 10));

            // --- Enhanced Input Validation ---
            if (parsedNumericValues.length !== 3 || parsedNumericValues.some(isNaN)) {
                console.error("INPUT PARSING FAILED: Expected three valid numbers on the first line of input.");
                return; // Abort if parsing fails or numbers are missing.
            }

            // Use our custom helper to destructure the three numbers into meaningful variables.
            const [alphaVal, betaVal, gammaVal] = extractSpecificElements(parsedNumericValues, 3);

            let resultVerdict = "NO"; // Initialize with the default negative outcome.

            // --- Rewritten Core Conditional Logic ---
            // Original: `n!=u||0!=o?n<u&&n+o>=u?console.log("YES"):console.log("NO"):console.log("YES")`
            // This is equivalent to:
            // if (A === C && B === 0) { "YES" }
            // else if (A < C && A + B >= C) { "YES" }
            // else { "NO" }

            // Condition 1: Special case where alphaVal equals gammaVal and betaVal is zero.
            if (alphaVal === gammaVal && betaVal === 0) {
                resultVerdict = "YES";
            }
            // Condition 2: If alphaVal is less than gammaVal AND (alphaVal + betaVal) is greater than or equal to gammaVal.
            else if (alphaVal < gammaVal && (alphaVal + betaVal >= gammaVal)) {
                resultVerdict = "YES";
            }
            // If neither of the above conditions are met, `resultVerdict` remains "NO".

            // Output the final determined verdict.
            console.log(resultVerdict);

            // --- Added Optional Debugging Fragment ---
            /*
            if (process.env.ENABLE_DEBUG_OUTPUT === 'true') {
                console.warn(`DEBUG INFO: alpha=${alphaVal}, beta=${betaVal}, gamma=${gammaVal}, Outcome='${resultVerdict}'`);
            }
            */
        };
    },

    // Module ID 2: Node.js 'fs' (File System) Module Wrapper
    // This module provides access to the `readFileSync` function from Node.js's built-in 'fs' module.
    function(moduleObj, exportsObj) {
        // This module is designed to re-export specific functionality from Node.js's 'fs' module.
        try {
            // --- Added Environment Check and Robustness ---
            // Check if the global `require` function (typical in Node.js) is available.
            if (typeof require === 'function' && typeof require('fs') !== 'undefined') {
                const nodeFsModule = require("fs");
                // We only need `readFileSync` for this problem, so we selectively export it.
                // This is a deletion of unused `fs` functionality and an update to only export what's needed.
                exportsObj.readInputSynchronously = nodeFsModule.readFileSync;
            } else {
                // If not in a Node.js environment or 'fs' cannot be loaded.
                console.warn("WARNING: Node.js 'fs' module or global 'require' is unavailable. Providing a mock 'readInputSynchronously'.");
                exportsObj.readInputSynchronously = (path, encoding) => {
                    throw new Error(`'readInputSynchronously' is not available. This code requires a Node.js environment with the 'fs' module. Attempted to read from: ${path}`);
                };
            }
        } catch (loadFsError) {
            console.error("CRITICAL ERROR: Encountered an issue while attempting to load the Node.js 'fs' module:", loadFsError.message);
            // Provide a fallback function that throws to indicate failure.
            exportsObj.readInputSynchronously = () => {
                throw new Error(`Failed to initialize 'readInputSynchronously' due to 'fs' module load error: ${loadFsError.message}`);
            };
        }
    }
]);