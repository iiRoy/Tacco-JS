module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    // It prevents redundant execution and ensures modules are singletons.
    const loadedModuleCache = {};

    /**
     * The core module loading and resolution function.
     * It mimics a simplified CommonJS `require` or webpack's internal `__webpack_require__`.
     * @param {number} requestedModuleId - The unique numeric identifier of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function resolveAndLoadModule(requestedModuleId) {
        // --- Input Validation for Module ID ---
        if (typeof requestedModuleId !== 'number' || !Number.isInteger(requestedModuleId) || requestedModuleId < 0) {
            console.error(`Module Loader: Attempted to load module with an invalid ID: ${requestedModuleId}. Returning an empty object.`);
            return {}; // Return a safe, empty object to prevent runtime errors.
        }

        // Check if the module is already in the cache. If so, return its exports immediately.
        if (loadedModuleCache[requestedModuleId]) {
            return loadedModuleCache[requestedModuleId].exports;
        }

        // If the module is not cached, initialize a new module entry.
        const currentModuleContext = loadedModuleCache[requestedModuleId] = {
            uniqueId: requestedModuleId, // The identifier of this module.
            isInitialized: false,        // Flag to track if the module's definition function has run.
            exports: {}                  // The object that will hold this module's exported values.
        };

        // Execute the module's definition function. This is where the module's actual code runs.
        // The `call` method is used to set the `this` context (though not heavily used here)
        // and to pass `module`, `exports`, and `require` (our `resolveAndLoadModule` function)
        // as arguments, adhering to the CommonJS module pattern.
        moduleDefinitions[requestedModuleId].call(
            currentModuleContext.exports, // 'this' context for the module function.
            currentModuleContext,         // The 'module' object.
            currentModuleContext.exports, // The 'exports' object.
            resolveAndLoadModule          // The 'require' function for this module.
        );

        // After execution, mark the module as initialized.
        currentModuleContext.isInitialized = true;

        // Return the exports object, which now contains all values exported by the module.
        return currentModuleContext.exports;
    }

    // --- Utility Functions for Module Interoperability and Management ---

    // Store the complete array of module definition functions.
    resolveAndLoadModule.allModuleDefinitions = moduleDefinitions;

    // Store a reference to the internal cache for potential debugging or advanced scenarios.
    resolveAndLoadModule.moduleCache = loadedModuleCache;

    /**
     * Defines a non-writable, enumerable getter property on an object.
     * This is used by bundlers to create "live" bindings for ES module imports.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyKey - The name of the property to define.
     * @param {function} valueGetterFunction - A function that returns the property's value when accessed.
     */
    resolveAndLoadModule.defineExportProperty = function(targetObject, propertyKey, valueGetterFunction) {
        // Only define if the property doesn't already exist to avoid errors.
        if (!resolveAndLoadModule.hasOwnProperty(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true,         // Allows the property to be iterated over (e.g., in `for...in`).
                get: valueGetterFunction  // The function to call when the property is accessed.
            });
        }
    };

    /**
     * Marks an exports object as an ECMAScript module for better interoperability.
     * This adds the `__esModule: true` flag and potentially `Symbol.toStringTag`.
     * @param {object} exportsObject - The exports object to mark.
     */
    resolveAndLoadModule.markAsESModule = function(exportsObject) {
        // Add `Symbol.toStringTag` if available, which helps in identifying module types.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // The `__esModule` flag is a widely adopted convention for indicating ES modules.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    /**
     * Creates a standardized namespace object from a module's exports,
     * handling various export formats (CommonJS, ES Modules, raw values).
     * @param {any} sourceValue - The module's raw export value or its ID.
     * @param {number} conversionModeFlags - A bitmask indicating how to process `sourceValue`.
     *   - `1`: `sourceValue` is a module ID, so resolve it first.
     *   - `2`: Iterate over `sourceValue` properties and re-export them (for CJS-like objects).
     *   - `4`: If `sourceValue` is an object and already an ES module, return it directly.
     *   - `8`: If `sourceValue` is already a namespace object, return it directly.
     * @returns {object} A unified namespace object.
     */
    resolveAndLoadModule.createModuleNamespace = function(sourceValue, conversionModeFlags) {
        // If flag 1 is set, it means `sourceValue` is a module ID, so load it.
        if (conversionModeFlags & 1) {
            sourceValue = resolveAndLoadModule(sourceValue);
        }
        // If flag 8 is set, `sourceValue` is already a namespace object, so return it.
        if (conversionModeFlags & 8) {
            return sourceValue;
        }
        // If flag 4 is set and `sourceValue` is an object and an ES module, return it.
        if (conversionModeFlags & 4 && typeof sourceValue === 'object' && sourceValue && sourceValue.__esModule) {
            return sourceValue;
        }

        // Create a new, empty object to serve as the namespace.
        const newNamespace = Object.create(null);
        // Mark this new object as an ES module.
        resolveAndLoadModule.markAsESModule(newNamespace);
        // Define a 'default' export that points to the original `sourceValue`.
        Object.defineProperty(newNamespace, 'default', { enumerable: true, value: sourceValue });

        // If flag 2 is set and `sourceValue` is not a string, iterate its properties
        // and add them as getters to the new namespace (excluding 'default').
        if (conversionModeFlags & 2 && typeof sourceValue !== 'string') {
            for (const propIdentifier in sourceValue) {
                // Ensure it's an own property and not the 'default' key.
                if (resolveAndLoadModule.hasOwnProperty(sourceValue, propIdentifier) && propIdentifier !== 'default') {
                    // Use a closure to capture `propIdentifier` correctly for each getter.
                    resolveAndLoadModule.defineExportProperty(newNamespace, propIdentifier, (function(keyToCapture) {
                        return function() { return sourceValue[keyToCapture]; };
                    })(propIdentifier));
                }
            }
        }
        return newNamespace;
    };

    /**
     * Creates a getter function that returns the default export of a module.
     * This handles both ES Modules (where `default` is explicit) and CommonJS modules
     * (where `module.exports` is the default).
     * @param {object} moduleToWrap - The module's exports object.
     * @returns {function} A function that, when called, returns the default export.
     */
    resolveAndLoadModule.createDefaultExportAccessor = function(moduleToWrap) {
        // Determine the default export logic based on whether it's an ES module.
        const accessorFunction = moduleToWrap && moduleToWrap.__esModule ?
            function() { return moduleToWrap.default; } : // For ES Modules, access `.default`.
            function() { return moduleToWrap; };           // For CommonJS, `module.exports` is the default.

        // Define this accessor function itself as a property named 'a' on itself.
        // This pattern might be used for specific bundler optimizations or legacy reasons.
        resolveAndLoadModule.defineExportProperty(accessorFunction, 'a', accessorFunction);
        return accessorFunction;
    };

    /**
     * A utility function to check if an object has a property directly on itself
     * (not inherited from its prototype chain).
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyName - The name of the property to check.
     * @returns {boolean} True if the object has the specified own property, false otherwise.
     */
    resolveAndLoadModule.hasOwnProperty = function(targetObject, propertyName) {
        // Use `Object.prototype.hasOwnProperty.call` for maximum robustness,
        // especially when `targetObject` might be `null` or have `hasOwnProperty` overridden.
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // --- Application Entry Point ---
    // The starting module ID is 0. This line triggers the execution of the entire application.
    resolveAndLoadModule.startupModuleIdentifier = 0;
    return resolveAndLoadModule(resolveAndLoadModule.startupModuleIdentifier);
}(
    // This array contains all the module definition functions, indexed by their ID.
    [
        // Module 0: Primary Application Bootstrap
        // This module is responsible for reading input and initiating the main logic.
        function(bootstrapModule, bootstrapExports, bootstrapRequire) {
            // Helper function to safely parse a string into an integer.
            const parseStrictInteger = (stringValue) => {
                const parsedValue = parseInt(stringValue, 10);
                if (isNaN(parsedValue)) {
                    // Log a warning if parsing fails, but return a default to avoid crashing.
                    console.warn(`Data Parsing Warning: Could not convert "${stringValue}" to an integer. Defaulting to 0.`);
                    return 0;
                }
                return parsedValue;
            };

            try {
                // Load the Node.js 'fs' (file system) module via our custom loader.
                const fileSystemUtil = bootstrapRequire(2);

                // Read the entire content from standard input (`/dev/stdin`).
                // This is typically used for command-line utility input.
                const rawInputStreamContent = fileSystemUtil.readFileSync("/dev/stdin", "UTF-8");

                // --- Robust Input Pre-processing and Validation ---
                if (!rawInputStreamContent || rawInputStreamContent.trim().length === 0) {
                    console.error("Input Error: Standard input stream was empty or contained only whitespace.");
                    // Pass an empty array to the next module to handle gracefully.
                    bootstrapRequire(1)([]);
                    return;
                }

                // Split the input into individual lines. Using a regex for cross-platform newlines.
                // Filter out any lines that are empty after trimming whitespace.
                const processedInputLines = rawInputStreamContent
                    .split(/\r?\n/)
                    .map(line => line.trim())
                    .filter(line => line.length > 0);

                if (processedInputLines.length === 0) {
                    console.warn("Input Warning: No meaningful lines found in standard input after trimming and filtering.");
                    bootstrapRequire(1)([]);
                    return;
                }

                // Pass the array of cleaned input lines to the main application logic module (Module 1).
                bootstrapRequire(1)(processedInputLines);

            } catch (ioError) {
                // Catch any potential errors during file reading (e.g., file not found, permissions).
                console.error(`Input System Error: Failed to read from /dev/stdin. Details: ${ioError.message}`);
                // In an error scenario, provide an empty input to the main logic.
                bootstrapRequire(1)([]);
            }
        },

        // Module 1: Core Calculation Logic
        // This module contains the primary algorithm to process numbers.
        function(coreLogicModule, coreLogicExports) {
            /**
             * Implements a specific numerical reduction algorithm based on input parameters.
             * The algorithm involves sorting numbers and repeatedly halving them
             * under certain conditions until a total operation limit is reached.
             * @param {string[]} dataLines - An array of strings representing the input.
             *                               Expected: [ "N K", "num1 num2 ... numN" ]
             */
            coreLogicModule.exports = function(dataLines) {
                // --- Initial Input Data Validation ---
                if (!dataLines || dataLines.length < 2) {
                    console.error("Processing Error: Insufficient input data. Expected at least two lines.");
                    console.log(0); // Output a default result for error cases.
                    return;
                }

                // Parse the first line for the main parameters N (total items) and K (max operations).
                const parameterStrings = dataLines[0].split(' ').filter(s => s.trim().length > 0);
                if (parameterStrings.length < 2) {
                    console.error("Processing Error: First input line malformed. Expected two space-separated numbers (N and K).");
                    console.log(0);
                    return;
                }

                const totalNumbersToProcess = parseInt(parameterStrings[0], 10); // Represents 'N'
                const maximumHalvingOperations = parseInt(parameterStrings[1], 10); // Represents 'K'

                // Validate the parsed N and K values.
                if (isNaN(totalNumbersToProcess) || isNaN(maximumHalvingOperations) || totalNumbersToProcess <= 0 || maximumHalvingOperations < 0) {
                    console.error(`Processing Error: Invalid numeric parameters detected. N='${parameterStrings[0]}', K='${parameterStrings[1]}'.`);
                    console.log(0);
                    return;
                }

                // Parse the second line for the actual list of numbers.
                const rawNumberStrings = dataLines[1].split(' ').filter(s => s.trim().length > 0);
                if (rawNumberStrings.length !== totalNumbersToProcess) {
                    console.error(`Processing Error: Mismatch between declared N (${totalNumbersToProcess}) and actual number count in input (${rawNumberStrings.length}).`);
                    console.log(0);
                    return;
                }

                // Convert string numbers to actual numbers, handling potential non-numeric entries.
                const numberValuesArray = rawNumberStrings.map(strNum => {
                    const num = parseInt(strNum, 10);
                    if (isNaN(num)) {
                        console.warn(`Processing Warning: Non-numeric value "${strNum}" encountered. Treating as 0.`);
                        return 0;
                    }
                    return num;
                });

                // Sort the numbers in descending order. This is a critical step for the algorithm's logic.
                numberValuesArray.sort((valA, valB) => valB - valA);

                let finalCalculatedSum = 0;
                let remainingAllowedHalvings = maximumHalvingOperations;

                // Iterate through each number in the sorted array.
                for (let currentIndex = 0; currentIndex < totalNumbersToProcess; currentIndex++) {
                    let currentNumber = numberValuesArray[currentIndex];

                    // Determine the threshold below which the current number should not be halved further.
                    // This threshold is either the value of the next number in the sorted array (capped at 4),
                    // or 0 if it's the last element.
                    let halvingLowerBound = 0; // Default for the last element.
                    const isTheLastElement = (currentIndex === totalNumbersToProcess - 1);

                    if (!isTheLastElement) {
                        const nextNumberInSequence = numberValuesArray[currentIndex + 1];
                        // The original logic capped the threshold at 4.
                        halvingLowerBound = Math.min(nextNumberInSequence, 4);
                    }

                    // Perform halving operations on the current number.
                    // Continue as long as there are operations left AND the current number is
                    // still greater than or equal to its determined lower bound.
                    while (remainingAllowedHalvings > 0 && currentNumber >= halvingLowerBound) {
                        // Calculate the new value after halving (integer division).
                        const reducedValue = Math.floor(currentNumber / 2);

                        // Optimization: If halving doesn't change the value (e.g., 0/2=0, 1/2=0)
                        // and it's already at or below the boundary, stop further reduction for this number.
                        if (reducedValue === currentNumber && currentNumber <= halvingLowerBound) {
                            break;
                        }

                        currentNumber = reducedValue;
                        remainingAllowedHalvings--;
                    }

                    // Add the (potentially reduced) current number to the running total.
                    finalCalculatedSum += currentNumber;

                    // --- Early Exit Optimization ---
                    // If no halving operations are left, all subsequent numbers will be added as is.
                    // We can sum them up quickly and break out of the main loop.
                    if (remainingAllowedHalvings <= 0) {
                        for (let remainingIndex = currentIndex + 1; remainingIndex < totalNumbersToProcess; remainingIndex++) {
                            finalCalculatedSum += numberValuesArray[remainingIndex];
                        }
                        break; // Exit the main loop as all numbers are processed or added.
                    }
                }

                // Output the final computed sum to standard output.
                console.log(finalCalculatedSum);
            };
        },

        // Module 2: File System Module Wrapper
        // This module simply provides access to Node.js's built-in 'fs' module.
        function(fsModuleWrapper, fsExportsWrapper) {
            // Re-export the native 'fs' module. This indirection can be useful
            // for testing (mocking 'fs') or abstracting file system operations.
            fsModuleWrapper.exports = require("fs");
        }
    ]
);