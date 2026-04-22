module.exports = function(moduleDefinitions) {
    // This object serves as a registry (cache) for all modules that have been loaded.
    // Each entry stores the module's unique identifier, its loading status, and its exported values.
    const loadedModuleCache = {};

    /**
     * Core function responsible for loading modules based on their unique identifier.
     * If a module has already been loaded and cached, its exports are returned immediately.
     * Otherwise, the module's definition function is executed, its exports are populated,
     * and it is then added to the cache before its exports are returned.
     *
     * @param {number} moduleIdKey - The numeric identifier of the module to be loaded.
     * @returns {object} The exports object provided by the loaded module.
     */
    function moduleSystemLoader(moduleIdKey) {
        // Check if the requested module is already present in our cache.
        if (loadedModuleCache[moduleIdKey]) {
            return loadedModuleCache[moduleIdKey].exports;
        }

        // If not found in cache, initialize a new module record.
        const currentModuleRecord = loadedModuleCache[moduleIdKey] = {
            uniqueId: moduleIdKey,
            isContentLoaded: false,
            exports: {} // This object will be populated by the module's definition.
        };

        // Execute the module's definition function. This function is expected to
        // populate `currentModuleRecord.exports` with the module's public interface.
        // It receives `module`, `module.exports`, and the `moduleSystemLoader` function itself.
        moduleDefinitions[moduleIdKey].call(
            currentModuleRecord.exports,
            currentModuleRecord,
            currentModuleRecord.exports,
            moduleSystemLoader
        );

        // Mark the module as fully loaded after its definition has been executed.
        currentModuleRecord.isContentLoaded = true;

        // Return the exports of the newly loaded module.
        return currentModuleRecord.exports;
    }

    // --- Utility functions for the module loader ---

    // Expose the raw module definitions for introspection or advanced use cases.
    moduleSystemLoader.definitionsMap = moduleDefinitions;
    // Expose the internal module cache.
    moduleSystemLoader.internalCache = loadedModuleCache;

    /**
     * Defines a getter property on an exports object, primarily used for named exports.
     * This ensures that when a property is accessed, its value is dynamically retrieved.
     *
     * @param {object} targetExportObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to be defined.
     * @param {Function} valueGetterFunction - A function that returns the value of the property when called.
     */
    moduleSystemLoader.defineExportProperty = function(targetExportObject, propertyName, valueGetterFunction) {
        // Only define the property if it doesn't already exist as an own property.
        if (!moduleSystemLoader.hasOwnProperty(targetExportObject, propertyName)) {
            Object.defineProperty(targetExportObject, propertyName, {
                enumerable: true, // Make this property visible during enumeration (e.g., in `for...in` loops).
                get: valueGetterFunction // The function to call when the property is accessed.
            });
        }
    };

    /**
     * Marks an exports object as an ECMAScript Module (ESM) by adding specific properties.
     * This helps with compatibility between CommonJS and ESM environments.
     *
     * @param {object} exportsObjectToMark - The exports object to be marked as an ESM.
     */
    moduleSystemLoader.markAsEsModule = function(exportsObjectToMark) {
        // If `Symbol` and `Symbol.toStringTag` are supported, set the module's string tag.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObjectToMark, Symbol.toStringTag, { value: 'Module' });
        }
        // Explicitly set `__esModule` to `true` to indicate it's an ES Module.
        Object.defineProperty(exportsObjectToMark, '__esModule', { value: true });
    };

    /**
     * Provides compatibility layers for different import styles (e.g., wildcard imports, default imports).
     * It transforms a module's value into an object that behaves correctly with various import syntaxes.
     *
     * @param {any} moduleRawValue - The raw value representing the module's exports.
     * @param {number} compatibilityModeFlags - A bitmask indicating the required compatibility adjustments.
     *   - `1`: Treat `moduleRawValue` as a module ID and load it first.
     *   - `8`: Return `moduleRawValue` directly without further modification.
     *   - `4`: If `moduleRawValue` is an object and already an ESM, return it directly.
     *   - `2`: If `moduleRawValue` is not a string, copy its named exports to the interop object.
     * @returns {any} An interop-compatible version of the module's exports.
     */
    moduleSystemLoader.createInteropModule = function(moduleRawValue, compatibilityModeFlags) {
        // If the first flag is set, load the module as it's an ID.
        if (compatibilityModeFlags & 1) {
            moduleRawValue = moduleSystemLoader(moduleRawValue);
        }
        // If the eighth flag is set, return the value as is.
        if (compatibilityModeFlags & 8) {
            return moduleRawValue;
        }
        // If the fourth flag is set, and it's an object that's already an ESM, return it directly.
        if (compatibilityModeFlags & 4 && typeof moduleRawValue === 'object' && moduleRawValue && moduleRawValue.__esModule) {
            return moduleRawValue;
        }

        // Create a new plain object to serve as the interop module.
        const interopWrapper = Object.create(null);
        // Mark this wrapper as an ES Module.
        moduleSystemLoader.markAsEsModule(interopWrapper);
        // Define a 'default' export that points to the original module's raw value.
        Object.defineProperty(interopWrapper, 'default', { enumerable: true, value: moduleRawValue });

        // If the second flag is set and the raw value is not a string,
        // iterate over its properties and define them as named exports on the wrapper.
        if (compatibilityModeFlags & 2 && typeof moduleRawValue !== 'string') {
            for (const propKey in moduleRawValue) {
                // Ensure we only copy own properties, not inherited ones.
                if (moduleSystemLoader.hasOwnProperty(moduleRawValue, propKey)) {
                    // Define a getter for each property to ensure dynamic access.
                    moduleSystemLoader.defineExportProperty(interopWrapper, propKey, (function(keyToAccess) {
                        return function() { return moduleRawValue[keyToAccess]; };
                    })(propKey));
                }
            }
        }
        return interopWrapper;
    };

    /**
     * Generates a getter function for a module's default export.
     * This is commonly used when handling `import defaultExport from 'module';`.
     *
     * @param {object} moduleReference - The module object or its exports.
     * @returns {Function} A function that, when called, returns the module's default export.
     */
    moduleSystemLoader.createDefaultExportGetter = function(moduleReference) {
        const retrieveDefaultExport = moduleReference && moduleReference.__esModule ?
            () => moduleReference.default : // If it's an ESM, get its 'default' property.
            () => moduleReference;         // Otherwise, the module itself is the default.

        // Define a dummy 'a' export pointing to this getter, potentially for compatibility with some bundlers.
        moduleSystemLoader.defineExportProperty(retrieveDefaultExport, 'a', retrieveDefaultExport);
        return retrieveDefaultExport;
    };

    /**
     * Checks if an object possesses a specified property directly (i.e., not inherited from its prototype chain).
     *
     * @param {object} targetObj - The object to inspect.
     * @param {string} propertyNameKey - The name of the property to check for.
     * @returns {boolean} `true` if the object has the property as its own; `false` otherwise.
     */
    moduleSystemLoader.hasOwnProperty = function(targetObj, propertyNameKey) {
        return Object.prototype.hasOwnProperty.call(targetObj, propertyNameKey);
    };

    // The initial module to load when the application starts.
    // In this setup, module with ID 0 is designated as the entry point.
    moduleSystemLoader.entryModuleId = 0;

    // Start the application by loading the entry module and returning its exports.
    return moduleSystemLoader(moduleSystemLoader.entryModuleId);
}([
    /**
     * Module 0: The primary entry point for the application.
     * This module is responsible for reading the application's input and
     * delegating it to the main logic module for processing.
     *
     * @param {object} currentModuleInstance - The module object for this specific module.
     * @param {object} modulePublicExports - The exports object that this module will expose.
     * @param {Function} requireLocalModule - A function to load other modules within this context.
     */
    function(currentModuleInstance, modulePublicExports, requireLocalModule) {
        // Dynamically load the Node.js 'fs' (file system) module via Module 2.
        const fileSystemAccess = requireLocalModule(2);
        // Dynamically load the main algorithm/logic module via Module 1.
        const mainAlgorithmProcessor = requireLocalModule(1);

        // Read all data from standard input synchronously.
        // It's crucial to specify UTF-8 encoding to correctly handle text input.
        const rawInputData = fileSystemAccess.readFileSync("/dev/stdin", "UTF-8");

        // Pass the collected input data to the main processing algorithm.
        mainAlgorithmProcessor(rawInputData);
    },

    /**
     * Module 1: Contains the core problem-solving logic to determine path feasibility.
     * This module processes input parameters and a path sequence to decide if a
     * specific movement scenario is possible.
     *
     * @param {object} currentModuleInstance - The module object for this specific module.
     * @param {object} modulePublicExports - The exports object that this module will expose.
     */
    function(currentModuleInstance, modulePublicExports) {

        /**
         * A robust utility function to safely extract a specified number of elements from an iterable.
         * It handles cases where the input is not iterable or has fewer elements than expected,
         * attempting to mimic array destructuring behavior with error handling.
         *
         * @param {Iterable<any>} iterableSource - The source iterable (e.g., an array) to extract elements from.
         * @param {number} minimumElementCount - The minimum number of elements expected.
         * @returns {Array<any>} An array containing the extracted elements.
         * @throws {TypeError} If the source is not iterable or if an iteration error occurs.
         */
        function extractRequiredElements(iterableSource, minimumElementCount) {
            // If the source is already an array, we can directly validate its length.
            if (Array.isArray(iterableSource)) {
                if (iterableSource.length < minimumElementCount) {
                    throw new TypeError(`Array has fewer than ${minimumElementCount} elements.`);
                }
                return iterableSource;
            }

            // For other iterables, we need to iterate and collect elements.
            const collectedItems = [];
            let iterationFinished = false;
            let wasIterationError = false;
            let caughtIterationException = undefined;

            try {
                const sourceIterator = iterableSource[Symbol.iterator]();
                let nextIterationResult;

                while (!(iterationFinished = (nextIterationResult = sourceIterator.next()).done) &&
                       collectedItems.push(nextIterationResult.value) < minimumElementCount) {
                    // Continue collecting until minimum count is met or iterator is exhausted.
                }
            } catch (error) {
                wasIterationError = true;
                caughtIterationException = error;
            } finally {
                // Ensure the iterator's `return` method is called if it exists and iteration wasn't finished.
                try {
                    if (!iterationFinished && sourceIterator && typeof sourceIterator.return === 'function') {
                        sourceIterator.return();
                    }
                } finally {
                    if (wasIterationError) {
                        throw caughtIterationException; // Re-throw any exception caught during iteration.
                    }
                }
            }

            if (collectedItems.length < minimumElementCount) {
                throw new TypeError(`Iterable provided fewer than ${minimumElementCount} elements.`);
            }
            return collectedItems;
        }

        /**
         * The main logic function that processes the input string and determines the path outcome.
         *
         * @param {string} rawInputString - The complete input string read from stdin.
         */
        modulePublicExports = function(rawInputString) {
            let finalOutcome = "Yes"; // Optimistic default assumption for the path possibility.

            const allInputLines = rawInputString.split('\n');

            // --- Input Validation: Minimum lines ---
            if (allInputLines.length < 2) {
                console.log("No"); // Not enough data to proceed.
                return;
            }

            // Parse the first line to extract numerical parameters.
            const firstLineNumericalTokens = allInputLines[0].split(' ').map(Number);

            let mainParameters;
            try {
                // Attempt to extract exactly 5 parameters from the first line.
                mainParameters = extractRequiredElements(firstLineNumericalTokens, 5);
            } catch (error) {
                console.log("No"); // Parameter parsing failed or insufficient parameters.
                // console.error("Error parsing parameters:", error.message); // For debugging
                return;
            }

            // --- Input Validation: Numeric parameters ---
            if (mainParameters.some(isNaN)) {
                console.log("No"); // One or more parameters are not valid numbers.
                return;
            }

            // Destructure and assign descriptive names to the extracted parameters.
            const totalPathSegments = mainParameters[0]; // Represents 'N' in problem statements.
            // mainParameters[1] is an unused parameter in the original logic.
            const blockAStartPosition = mainParameters[2]; // Represents 'A'.
            const blockBStartPosition = mainParameters[3]; // Represents 'B'.
            const blockCEndPosition = mainParameters[4];   // Represents 'C'.

            // The second line provides the path sequence as individual characters.
            const pathSegmentsLayout = allInputLines[1].split('');

            // --- Input Validation: Path layout length ---
            if (pathSegmentsLayout.length < totalPathSegments) {
                console.log("No"); // The provided path layout is shorter than expected.
                return;
            }

            // --- Rule 1: Check for immediate blocking conditions (consecutive '#' segments) ---
            // Iterate through the path to detect any two adjacent '#' characters.
            // If found, it's impossible to pass.
            for (let segmentIdx = 1; segmentIdx < totalPathSegments; segmentIdx++) {
                if (pathSegmentsLayout[segmentIdx - 1] === '#' && pathSegmentsLayout[segmentIdx] === '#') {
                    finalOutcome = "No";
                    console.log(finalOutcome);
                    return; // Path is blocked, exit immediately.
                }
            }

            // --- Rule 2: Direct passage for Block B if its start is beyond or at Block C's end ---
            // If Block B's starting position is already at or past Block C's ending position,
            // then Block B can simply pass without needing special maneuvers.
            if (blockBStartPosition >= blockCEndPosition) {
                finalOutcome = "Yes";
                console.log(finalOutcome);
                return; // Direct passage possible, exit.
            }

            // --- Rule 3: Search for a two-segment '..' gap for Block B to move from A to C ---
            // This rule only applies if Block B starts *before* Block C ends.
            // We need to find at least two consecutive '.' characters within a specific range.
            let currentConsecutiveDotCount = 0;
            const searchEndExclusive = blockCEndPosition - 1; // The loop range is [A, C-2].

            // Iterate from Block A's start position up to (but not including) `blockCEndPosition - 1`.
            for (let currentScanPosition = blockAStartPosition; currentScanPosition < searchEndExclusive; currentScanPosition++) {
                // Ensure the current scanning position is within the valid bounds of the path array.
                // This is a defensive check, as A and C are usually within N.
                if (currentScanPosition < 0 || currentScanPosition >= totalPathSegments) {
                    currentConsecutiveDotCount = 0; // Reset if we hit an invalid index.
                    continue;
                }

                if (pathSegmentsLayout[currentScanPosition] === '.') {
                    currentConsecutiveDotCount++;
                    // If we find two or more consecutive '.' segments, Block B can successfully move.
                    if (currentConsecutiveDotCount >= 2) {
                        finalOutcome = "Yes";
                        console.log(finalOutcome);
                        return; // Found a path, exit.
                    }
                } else {
                    // If a '#' is encountered, the sequence of consecutive dots is broken.
                    currentConsecutiveDotCount = 0;
                }
            }

            // If execution reaches this point, none of the "Yes" conditions were met.
            // This implies that no valid path for Block B could be found.
            finalOutcome = "No";
            console.log(finalOutcome);

            // Note: A redundant boolean expression present in the original code
            // (e.g., `l-2>=0&&l-2<o&&"#"==f[l-2]||l>=0&&l<o&&f[l]`)
            // which evaluated to a boolean but did not affect control flow or state,
            // has been removed as a non-essential statement in this Type III clone.
        };
    },

    /**
     * Module 2: A simple wrapper module to expose Node.js's built-in 'fs' (file system) module.
     * This allows other modules within this custom loading system to access file system functionalities.
     *
     * @param {object} currentModuleInstance - The module object for this specific module.
     * @param {object} modulePublicExports - The exports object that this module will expose.
     */
    function(currentModuleInstance, modulePublicExports) {
        // Directly assign the result of Node.js's native `require('fs')` to this module's exports.
        currentModuleInstance.exports = require("fs");
    }
]);