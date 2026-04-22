module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    // It prevents redundant execution of module code and ensures singletons.
    const moduleCache = {};

    /**
     * The central function for loading and resolving modules within this custom system.
     * It mimics the behavior of a CommonJS-like `require` or Webpack's `__webpack_require__`.
     *
     * @param {number} moduleId - The unique numerical identifier for the module to be loaded.
     * @returns {object} The `exports` object of the requested module.
     */
    function retrieveModule(moduleId) {
        // If the module is already in the cache, return its exports immediately.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not cached, create a new module object and store it.
        // This object holds the module's state, including its ID, load status, and exports.
        const currentModuleObject = moduleCache[moduleId] = {
            uniqueId: moduleId, // A more descriptive name for the module identifier.
            isProcessed: false, // Flag to indicate if the module's factory function has run.
            exports: {}         // The object where the module's public API will be attached.
        };

        // Execute the module's factory function.
        // This function is defined in the `moduleDefinitions` array.
        // It's called with `this` bound to `currentModuleObject.exports` (as in CommonJS),
        // and arguments: `module` (the currentModuleObject), `exports` (currentModuleObject.exports),
        // and `retrieveModule` (allowing nested module loading).
        moduleDefinitions[moduleId].call(
            currentModuleObject.exports,
            currentModuleObject,
            currentModuleObject.exports,
            retrieveModule
        );

        // After successful execution, mark the module as processed.
        currentModuleObject.isProcessed = true;
        return currentModuleObject.exports;
    }

    // --- Utility Functions for the Module System ---

    // Expose the array of all module definitions for introspection (if needed).
    retrieveModule.allDefinitions = moduleDefinitions;
    // Expose the internal module cache.
    retrieveModule.loadedModules = moduleCache;

    /**
     * Defines a non-writable, enumerable getter property on a target object.
     * This is typically used to expose module exports dynamically.
     *
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} propertyGetter - A function that returns the value of the property.
     */
    retrieveModule.setExportGetter = (targetObj, propertyName, propertyGetter) => {
        // Only define the property if it doesn't already exist on the target object.
        if (!retrieveModule.checkOwnProperty(targetObj, propertyName)) {
            Object.defineProperty(targetObj, propertyName, {
                enumerable: true,     // Make the property iterable (e.g., visible in `for...in`).
                get: propertyGetter   // The function to execute when the property is accessed.
            });
        }
    };

    /**
     * Marks an object as an ECMAScript Module (ESM) by adding special properties.
     * This helps in compatibility layers when mixing CommonJS and ESM.
     *
     * @param {object} exportObject - The module's exports object to be marked as an ESM.
     */
    retrieveModule.markAsESM = (exportObject) => {
        // Add Symbol.toStringTag for better debugging experience in environments that support it.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, { value: 'Module' });
        }
        // The __esModule property is a common convention to identify ES Modules.
        Object.defineProperty(exportObject, '__esModule', { value: true });
    };

    /**
     * Provides a getter for a module's default export, or the module itself if no default.
     * This is part of the interoperability logic for various module types.
     *
     * @param {object} moduleContent - The raw content or exports of a module.
     * @returns {function} A function that returns the effective export value.
     */
    retrieveModule.retrieveExportGetter = (moduleContent) => {
        // If the module is already marked as an ES Module and has a 'default' export, use that.
        const effectiveExport = (moduleContent && moduleContent.__esModule) ?
            () => moduleContent.default :
            () => moduleContent; // Otherwise, the module content itself is the export.

        // Define a named export 'a' (common Webpack convention) that points to the effective export.
        retrieveModule.setExportGetter(effectiveExport, 'a', effectiveExport);
        return effectiveExport;
    };

    /**
     * A polyfill-friendly check to see if an object has a specified property directly on itself,
     * not inherited from its prototype chain.
     *
     * @param {object} targetObj - The object to inspect.
     * @param {string} propertyKey - The name of the property to check for.
     * @returns {boolean} `true` if the property exists directly on `targetObj`, `false` otherwise.
     */
    retrieveModule.checkOwnProperty = (targetObj, propertyKey) => {
        return Object.prototype.hasOwnProperty.call(targetObj, propertyKey);
    };

    // An empty string for the public path, often used in web contexts for asset loading.
    // It has no functional impact in this Node.js console application.
    retrieveModule.assetPublicPath = "";

    // --- Interoperability Require Function ---
    // This advanced utility handles different module formats (CommonJS, ES Modules)
    // to ensure they can be used interchangeably within the bundled environment.
    retrieveModule.interopModule = (sourceModule, interopFlags) => {
        // Flag 1: If set, the sourceModule is an ID, so load it first.
        if (interopFlags & 1) {
            sourceModule = retrieveModule(sourceModule);
        }
        // Flag 8: If set, return the module directly without further processing.
        if (interopFlags & 8) {
            return sourceModule;
        }
        // Flag 4: If set and it's an object and already an ES Module, return it directly.
        if (interopFlags & 4 && typeof sourceModule === 'object' && sourceModule && sourceModule.__esModule) {
            return sourceModule;
        }

        // If none of the above, create a new interoperability object.
        const interopWrapper = Object.create(null);
        retrieveModule.markAsESM(interopWrapper); // Mark the wrapper as an ES Module.
        // Set the 'default' export to the original source module.
        Object.defineProperty(interopWrapper, 'default', { enumerable: true, value: sourceModule });

        // Flag 2: If set and the source module is not a string,
        // copy its own enumerable properties as named exports to the wrapper.
        if (interopFlags & 2 && typeof sourceModule !== 'string') {
            for (const propName in sourceModule) {
                if (retrieveModule.checkOwnProperty(sourceModule, propName)) {
                    retrieveModule.setExportGetter(interopWrapper, propName, () => sourceModule[propName]);
                }
            }
        }
        return interopWrapper;
    };

    // --- Application Initialization ---
    // The module system starts by loading the designated entry point module (module 0).
    return retrieveModule(retrieveModule.startupModuleId = 0);

}([
    // --- Module 0: Primary Application Entry Point ---
    // This module orchestrates input reading and delegates to the main processing logic.
    function(currentModule, moduleExports, moduleLoader) {
        try {
            // Dynamically load the 'fs' (file system) module via our loader (module 2).
            const fileSystemInterface = moduleLoader(2);
            // Read all raw input from standard input, assuming UTF-8 encoding.
            // Then split the input into individual lines.
            const rawInputStream = fileSystemInterface.readFileSync("/dev/stdin", "UTF-8");
            const processedInputLines = rawInputStream.split("\n");

            // Pass the array of input lines to Module 1 for core problem solving.
            moduleLoader(1)(processedInputLines);
        } catch (inputProcessingError) {
            // Log any errors that occur during file reading or initial processing.
            console.error("An error occurred during input acquisition or initial processing:", inputProcessingError.message);
            // In a production environment, you might want to exit the process with an error code here.
            // For example: process.exit(1);
        }
    },

    // --- Module 1: Core Algorithm for Grouping Items ---
    // This module implements the main logic to process numerical data from input lines.
    function(currentModule, moduleExports) {

        /**
         * A utility function to safely extract a specified number of elements from an array.
         * It provides basic validation and handles cases where the source array is too short.
         *
         * @param {Array<any>} sourceData - The array from which to extract elements.
         * @param {number} requiredCount - The exact number of elements expected.
         * @returns {Array<any>} An array containing the extracted elements.
         * @throws {TypeError} If the sourceData is not a valid array.
         */
        const extractSpecificElements = (sourceData, requiredCount) => {
            if (!Array.isArray(sourceData)) {
                throw new TypeError("Input must be an array for element extraction.");
            }
            if (sourceData.length < requiredCount) {
                console.warn(`Insufficient elements: Expected ${requiredCount}, but received ${sourceData.length}. Padding with nulls.`);
                // Return a new array with available elements, padded with nulls if necessary.
                return [...sourceData, ...Array(requiredCount - sourceData.length).fill(null)];
            }
            return sourceData.slice(0, requiredCount); // Return only the required number of elements.
        };

        // This is the primary function exposed by Module 1, designed to be called with input data.
        currentModule.exports = function(inputDataLines) {
            // --- Input Validation and Parsing ---
            if (!inputDataLines || inputDataLines.length === 0) {
                console.warn("No input data lines were provided. Cannot proceed with calculation.");
                return; // Exit if no input.
            }

            // The first line typically contains configuration parameters (N, K, M).
            const configurationLine = inputDataLines[0];
            if (typeof configurationLine !== 'string' || !configurationLine.trim()) {
                console.error("Configuration line is missing or empty. Expected format: 'N K M'.");
                return;
            }

            // Split the configuration line by any whitespace and parse parts into integers.
            const configTokens = configurationLine.split(/\s+/).filter(Boolean); // Filter(Boolean) removes empty strings from split.
            const numericalConfig = extractSpecificElements(
                configTokens.map(token => parseInt(token, 10)), 3
            );

            // Destructure the parsed configuration values into meaningful variable names.
            let [totalInputItems, maxAllowedSkips, groupRangeLimit] = numericalConfig;

            // Perform robust validation on the parsed configuration numbers.
            if (totalInputItems === null || maxAllowedSkips === null || groupRangeLimit === null ||
                isNaN(totalInputItems) || isNaN(maxAllowedSkips) || isNaN(groupRangeLimit)) {
                console.error("Failed to parse all required configuration parameters (N, K, M). Please check input format.");
                return;
            }

            // Check for logical constraints on input parameters.
            if (totalInputItems <= 0) {
                console.info("Total number of items (N) is zero or negative. No groups can be formed.");
                console.log(0); // If N is 0 or less, the answer is always 0 groups.
                return;
            }
            if (maxAllowedSkips < 0 || groupRangeLimit <= 0) {
                console.warn("Unusual input: Max skips (K) is negative or group range (M) is non-positive. This may lead to edge cases.");
            }

            // --- Item Value Collection ---
            const collectedItemValues = [];
            // Iterate from the second line (index 1) to collect 'N' item values.
            for (let currentLineIdx = 0; currentLineIdx < totalInputItems; currentLineIdx++) {
                const actualInputLine = currentLineIdx + 1; // Adjust for 0-indexed array vs. 1-indexed problem statement.
                if (actualInputLine >= inputDataLines.length) {
                    console.warn(`Input terminated prematurely. Expected ${totalInputItems} items, but ran out of lines at index ${currentLineIdx}.`);
                    break; // Stop if there are fewer lines than expected.
                }

                const itemValueString = inputDataLines[actualInputLine];
                const numericalItem = parseInt(itemValueString, 10);

                if (isNaN(numericalItem)) {
                    console.warn(`Skipping invalid numerical value '${itemValueString}' on input line ${actualInputLine + 1}.`);
                    continue; // Ignore non-numeric lines.
                }
                collectedItemValues.push(numericalItem);
            }

            // Adjust `totalInputItems` if some items were skipped due to invalid input.
            if (collectedItemValues.length < totalInputItems) {
                console.warn(`Actual valid items collected: ${collectedItemValues.length}. Original N was ${totalInputItems}. Adjusting total.`);
                totalInputItems = collectedItemValues.length;
            }

            // If, after parsing and filtering, no valid items remain, output 0 groups.
            if (totalInputItems === 0) {
                console.info("No valid items remaining after parsing. Number of groups: 0.");
                console.log(0);
                return;
            }

            // Sort the collected item values in ascending order. This is a critical prerequisite for the algorithm.
            collectedItemValues.sort((valueA, valueB) => valueA - valueB);

            // --- Core Grouping Algorithm Implementation ---
            // This algorithm determines the minimum number of groups required.
            // Each group starts with an item, and subsequent items can be added
            // if they are within 'groupRangeLimit' of the group's first item,
            // or if 'maxAllowedSkips' allows them to effectively be "skipped over".

            let finalGroupCount = 0;
            let currentSkipsRemaining = 0;
            let currentGroupInitialValue = null;

            // Initialize the first group.
            // If there are valid items, at least one group will always exist.
            finalGroupCount = 1;
            // The very first item starts a new group and doesn't consume a skip for itself.
            currentSkipsRemaining = maxAllowedSkips - 1;
            currentGroupInitialValue = collectedItemValues[0];

            // Iterate through the sorted items, starting from the second item.
            for (let itemIterator = 1; itemIterator < totalInputItems; itemIterator++) {
                const currentItemValue = collectedItemValues[itemIterator];
                const allowedUpperBoundary = currentGroupInitialValue + groupRangeLimit;

                // Check if the current item can be part of the active group.
                if (currentItemValue <= allowedUpperBoundary) {
                    // Item is within range. Now check if we have "skips" left to include it.
                    if (currentSkipsRemaining > 0) {
                        currentSkipsRemaining--; // Consume a skip.
                    } else {
                        // If no skips left, this item cannot be included in the current group.
                        // It must initiate a new group.
                        finalGroupCount++;
                        currentSkipsRemaining = maxAllowedSkips - 1; // Reset skips for the new group.
                        currentGroupInitialValue = currentItemValue; // This item becomes the anchor for the new group.
                    }
                } else {
                    // The current item is outside the range of the current group's anchor.
                    // It unconditionally starts a new group.
                    finalGroupCount++;
                    currentSkipsRemaining = maxAllowedSkips - 1; // Reset skips for the new group.
                    currentGroupInitialValue = currentItemValue; // This item becomes the new group's anchor.
                }
            }

            // Output the final computed number of groups.
            console.log(finalGroupCount);
        };
    },

    // --- Module 2: Node.js File System (fs) Interface ---
    // This module provides access to the native Node.js 'fs' module.
    function(currentModule, moduleExports) {
        // Check if the global 'require' function is available, which is typical in Node.js.
        if (typeof require === 'function') {
            currentModule.exports = require("fs");
        } else {
            console.error("Node.js 'require' function is not detected. Cannot load the 'fs' (file system) module.");
            // Provide a fallback or mock object for environments where 'fs' is not available.
            currentModule.exports = {
                readFileSync: (path, encoding) => {
                    throw new Error(`readFileSync is not supported in this environment (path: ${path}, encoding: ${encoding}).`);
                },
                // Other fs functions could be mocked here as well if necessary.
            };
        }
    }
]);