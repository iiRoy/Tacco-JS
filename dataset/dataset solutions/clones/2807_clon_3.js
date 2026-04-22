module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded and initialized.
    // It prevents redundant execution of module code and ensures singletons where appropriate.
    const loadedModuleInstances = {};

    /**
     * The core module loading and resolution function.
     * It mimics a simplified 'require' mechanism found in module bundlers.
     *
     * @param {number} requestedModuleId - The unique integer identifier of the module to load.
     * @returns {object} The 'exports' object of the specified module.
     */
    function moduleLoader(requestedModuleId) {
        // First, check if the module is already present in our cache.
        // If so, return its exports immediately to save computation.
        if (loadedModuleInstances[requestedModuleId]) {
            return loadedModuleInstances[requestedModuleId].exports;
        }

        // If the module is not in the cache, prepare a new module object.
        // This object holds metadata about the module and its exports.
        const currentModuleObject = loadedModuleInstances[requestedModuleId] = {
            uniqueId: requestedModuleId,  // Storing the module's identifier.
            isInitialized: false,         // A flag indicating if the module's definition has been executed.
            exports: {}                   // The actual object that the module's code will populate with its public API.
        };

        // Execute the module's definition function.
        // Each module definition is a function that expects (module, exports, moduleLoader) as arguments.
        // 'call' is used to set the 'this' context, though it's not strictly necessary for module exports.
        moduleDefinitions[requestedModuleId].call(
            currentModuleObject.exports, // 'this' context (not commonly used for module exports)
            currentModuleObject,         // The module object itself, allowing modules to access their own metadata.
            currentModuleObject.exports, // The 'exports' object for the module to add properties to.
            moduleLoader                 // A reference to this moduleLoader function, enabling nested 'requires'.
        );

        // After successful execution of the module's definition, mark it as initialized.
        currentModuleObject.isInitialized = true;

        // Return the populated exports object of the newly loaded module.
        return currentModuleObject.exports;
    }

    // --- Auxiliary functions attached to the moduleLoader for advanced features ---

    // Store a direct reference to the array of all module definition functions.
    // This can be useful for debugging or more advanced module management (e.g., hot reloading).
    moduleLoader.allModuleSources = moduleDefinitions;

    // Provide external access to the internal cache of loaded module instances.
    moduleLoader.moduleCacheReference = loadedModuleInstances;

    /**
     * Defines a property on an object with a custom getter.
     * This is a utility for exposing module exports, often used for lazy evaluation.
     *
     * @param {object} targetObject     - The object on which to define the property (e.g., an exports object).
     * @param {string} propertyName     - The name of the property to be defined.
     * @param {Function} getterFunction - A function that will be called to retrieve the property's value when accessed.
     */
    moduleLoader.defineExportProperty = function(targetObject, propertyName, getterFunction) {
        // Ensure the target object is valid before attempting to define properties.
        if (!targetObject || typeof targetObject !== 'object') {
            console.warn(`Attempted to define property '${propertyName}' on an invalid object.`);
            return;
        }
        // Use Object.defineProperty to create a property with a getter.
        // This allows for explicit control over property attributes.
        Object.defineProperty(targetObject, propertyName, {
            enumerable: true, // Make the property visible when iterating over object keys.
            get: getterFunction // The function to execute when the property is read.
        });
    };

    /**
     * Marks a given object as an ECMAScript module (ESM).
     * This involves setting special properties (__esModule and Symbol.toStringTag) for compatibility.
     *
     * @param {object} targetExportsObject - The module exports object to be marked as an ESM.
     */
    moduleLoader.markAsEsModule = function(targetExportsObject) {
        // If Symbol.toStringTag is supported, define it for better object identification in debuggers.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetExportsObject, Symbol.toStringTag, { value: "Module" });
        }
        // Set the __esModule flag, a common convention to indicate an ES module.
        Object.defineProperty(targetExportsObject, "__esModule", { value: true });
    };

    /**
     * Generates a module namespace object, handling various export styles.
     * This function is crucial for interoperability between CommonJS and ES modules.
     *
     * @param {any} moduleExports - The original exports from a module (can be a module ID or an exports object).
     * @param {number} modeFlags   - A bitmask of flags dictating how to process the exports.
     *                                 - Bit 1: Resolve 'moduleExports' as a module ID first.
     *                                 - Bit 8: Return 'moduleExports' as-is if already an object.
     *                                 - Bit 4: If 'moduleExports' is an object and already an ES module, return it.
     *                                 - Bit 2: If 'moduleExports' is not a string, copy all its enumerable properties.
     * @returns {object} The constructed module namespace object.
     */
    moduleLoader.createNamespaceObject = function(moduleExports, modeFlags) {
        let currentProcessedExports = moduleExports;

        // Flag 1: If set, interpret `moduleExports` as a module ID and resolve it.
        if (modeFlags & 1) {
            currentProcessedExports = moduleLoader(moduleExports);
        }

        // Flag 8: If set, and after potential resolution, return the exports directly.
        if (modeFlags & 8) {
            return currentProcessedExports;
        }

        // Flag 4: If set, and it's already an object and marked as an ES module, return it.
        if (modeFlags & 4 && typeof currentProcessedExports === "object" && currentProcessedExports && currentProcessedExports.__esModule) {
            return currentProcessedExports;
        }

        // If none of the above conditions met, create a new namespace object.
        const newNamespaceObject = Object.create(null);
        moduleLoader.markAsEsModule(newNamespaceObject); // Mark the new object as an ES module.

        // Define the 'default' export for the namespace object.
        // This is crucial for default export compatibility.
        Object.defineProperty(newNamespaceObject, "default", {
            enumerable: true,
            value: currentProcessedExports
        });

        // Flag 2: If set, and the processed exports are not a string, iterate and copy all its properties.
        // This handles re-exporting named exports.
        if (modeFlags & 2 && typeof currentProcessedExports !== "string") {
            for (const propertyKey in currentProcessedExports) {
                // Ensure the property belongs to the object itself, not its prototype chain.
                if (Object.prototype.hasOwnProperty.call(currentProcessedExports, propertyKey)) {
                    // Define a getter for each property to lazily retrieve its value.
                    moduleLoader.defineExportProperty(newNamespaceObject, propertyKey, (function(keyToAccess) {
                        return function() { return currentProcessedExports[keyToAccess]; };
                    })(propertyKey));
                }
            }
        }
        return newNamespaceObject;
    };

    /**
     * Provides a standardized way to access the default export of a module.
     * It intelligently handles both traditional CommonJS exports and ES module default exports.
     *
     * @param {object} moduleExports - The exports object from a module.
     * @returns {Function} A getter function that, when called, returns the module's default export.
     */
    moduleLoader.getDefaultExport = function(moduleExports) {
        // Determine the appropriate function to retrieve the default export.
        const defaultExportGetter = moduleExports && moduleExports.__esModule ?
            function() { return moduleExports.default; } : // If it's an ES module, its default is in the '.default' property.
            function() { return moduleExports; };          // Otherwise, the entire exports object is considered the default.

        // For compatibility (e.g., with Webpack's __webpack_require__.n),
        // we attach this getter function as a property 'a' on itself.
        moduleLoader.defineExportProperty(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    /**
     * A utility wrapper for `Object.prototype.hasOwnProperty.call`.
     * This is a safer way to check for own properties, especially when dealing with objects
     * that might override the `hasOwnProperty` method.
     *
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyKey  - The name of the property to check for.
     * @returns {boolean} `true` if the `targetObject` has `propertyKey` as its own property, `false` otherwise.
     */
    moduleLoader.checkOwnProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // --- Application Entry Point ---
    // The application starts by loading a specific module, typically module ID 0.
    const mainApplicationModuleId = 0; // Defining the primary entry point module.

    // Execute the main module and return its exports.
    // For this specific problem, the entry module performs side effects (reading input, printing output)
    // rather than exporting a value.
    return moduleLoader(mainApplicationModuleId);
}(
    // --- Array of Module Definitions ---
    // Each element in this array is a function representing a distinct module.
    // The index of the function in the array serves as its unique module ID.
    [
        // Module 0: The primary entry point for the application.
        // It's responsible for reading input and invoking the main problem-solving logic.
        function(currentModule, moduleExportsObject, moduleResolver) {
            // Dynamically load the Node.js 'fs' (File System) module using our resolver.
            const fileSystemHandler = moduleResolver(2);

            let rawInputContent = "";
            try {
                // Attempt to synchronously read data from standard input.
                // The problem statement implies input from /dev/stdin, common in competitive programming environments.
                rawInputContent = fileSystemHandler.readFileSync("/dev/stdin", "UTF-8");
            } catch (fileReadError) {
                // Log an error if reading from /dev/stdin fails, which could happen in non-standard environments.
                console.error("Critical error: Unable to read from /dev/stdin.", fileReadError.message);
                // Depending on the application's robustness requirements, one might:
                // 1. Provide default input.
                // 2. Exit the process.
                // 3. Re-throw the error to halt execution.
                throw fileReadError; // Re-throwing to ensure the program terminates if input is unavailable.
            }

            // Load the module containing the main algorithm/problem solver.
            const problemSolverFunction = moduleResolver(1);

            // Execute the problem solver with the retrieved input.
            problemSolverFunction(rawInputContent);
        },

        // Module 1: Contains the algorithm for solving the specific problem (inclusion-exclusion principle).
        // It takes a string of numbers, parses them, and calculates a result.
        function(moduleReference, exportsReference) {
            /**
             * A robust helper function to safely extract a specified number of elements from an iterable.
             * This function serves as a more verbose and controlled alternative to standard array destructuring,
             * providing explicit error handling for non-iterable inputs.
             *
             * @param {Iterable<any>} sourceIterable - The object from which to extract elements. Must be iterable.
             * @param {number} [maxElementsToExtract] - An optional limit on the number of elements to retrieve.
             * @returns {Array<any>} An array containing the extracted elements.
             * @throws {TypeError} If the `sourceIterable` is not an iterable instance.
             */
            function safeExtractElements(sourceIterable, maxElementsToExtract) {
                // Optimization: If it's already an array, and no specific limit, return it directly.
                if (Array.isArray(sourceIterable) && (maxElementsToExtract === undefined || sourceIterable.length <= maxElementsToExtract)) {
                    return sourceIterable;
                }

                const collectedItems = [];
                let iterationCompleted = false;
                let encounteredError = false;
                let caughtErrorDetails = undefined;
                let iterableIterator;

                try {
                    // Attempt to get the iterator from the source.
                    // If sourceIterable is null/undefined or lacks Symbol.iterator, this will throw.
                    iterableIterator = sourceIterable[Symbol.iterator]();
                    let iterationResult;

                    // Loop through the iterator to collect elements.
                    while (!(iterationCompleted = (iterationResult = iterableIterator.next()).done)) {
                        collectedItems.push(iterationResult.value);
                        // Stop if the maximum number of elements has been collected.
                        if (maxElementsToExtract !== undefined && collectedItems.length >= maxElementsToExtract) {
                            break;
                        }
                    }
                } catch (err) {
                    encounteredError = true;
                    caughtErrorDetails = err;
                } finally {
                    // Ensure the iterator's 'return' method is called if iteration was not completed naturally.
                    // This is important for resource cleanup in some custom iterators.
                    if (!iterationCompleted && iterableIterator && typeof iterableIterator.return === 'function') {
                        try {
                            iterableIterator.return();
                        } catch (finalizationError) {
                            // If an error occurred during the primary iteration, prioritize that.
                            // Otherwise, throw the error from the 'return' method.
                            if (!encounteredError) {
                                throw finalizationError;
                            }
                        }
                    }
                }

                // If an error occurred during the main iteration, re-throw it now.
                if (encounteredError) {
                    throw caughtErrorDetails;
                }

                // If no iterator could be obtained, it means the source was not iterable.
                if (!iterableIterator && !Array.isArray(sourceIterable)) {
                    throw new TypeError("Cannot iterate over non-iterable value. Expected an iterable instance.");
                }

                return collectedItems;
            }

            // The main logic function, assigned to this module's exports.
            // It expects a single string containing the problem parameters.
            moduleReference.exports = function(rawProblemInputString) {
                // Perform initial validation on the input string.
                if (typeof rawProblemInputString !== 'string' || rawProblemInputString.trim().length === 0) {
                    console.error("Input processing error: Received an empty or non-string input. Cannot proceed.");
                    return; // Exit if input is invalid.
                }

                // Extract the first line of the input, which is expected to contain the numbers.
                const relevantInputLine = rawProblemInputString.split("\n")[0];

                // Split the line by spaces to get string representations of numbers.
                const stringNumberTokens = relevantInputLine.split(" ");

                // Validate that we have at least four tokens as expected.
                const minimumRequiredNumbers = 4;
                if (stringNumberTokens.length < minimumRequiredNumbers) {
                    console.error(`Input format error: Expected at least ${minimumRequiredNumbers} numbers, but found only ${stringNumberTokens.length}.`);
                    return;
                }

                // Convert all string tokens to actual numbers.
                // Includes validation to ensure all tokens are valid numeric representations.
                const numericParameters = stringNumberTokens.map(token => {
                    const numberValue = Number(token);
                    if (isNaN(numberValue)) {
                        throw new Error(`Data parsing error: Found non-numeric value '${token}' in input.`);
                    }
                    return numberValue;
                });

                // Use our custom safe destructuring helper to extract the four essential parameters.
                const [rangeStart, rangeEnd, firstDivisor, secondDivisor] = safeExtractElements(numericParameters, minimumRequiredNumbers);

                // Calculate the total count of integers within the inclusive range [rangeStart, rangeEnd].
                // The formula is (end - start + 1).
                const totalIntegersInRange = rangeEnd - rangeStart + 1;

                // --- Apply the Inclusion-Exclusion Principle ---
                // This principle helps count elements that satisfy certain conditions.
                // Here, we want numbers NOT divisible by 'firstDivisor' NOR 'secondDivisor'.
                // This is equivalent to: Total - (DivisibleByA + DivisibleByB - DivisibleByBoth).

                // Count numbers divisible by the first divisor within the range.
                const countDivisibleByFirst = Math.floor(totalIntegersInRange / firstDivisor);

                // Count numbers divisible by the second divisor within the range.
                const countDivisibleBySecond = Math.floor(totalIntegersInRange / secondDivisor);

                // To count numbers divisible by BOTH, we need their least common multiple (LCM).
                // If the problem implies they are coprime or simplifies to product, we use product.
                // The original code uses product (u * i), so we follow that.
                const productOfDivisors = firstDivisor * secondDivisor;
                const countDivisibleByBoth = Math.floor(totalIntegersInRange / productOfDivisors);

                // Calculate the final result using the principle.
                // This is the number of integers in the range that are NOT divisible by either divisor.
                const finalResultantCount =
                    totalIntegersInRange - (countDivisibleByFirst + countDivisibleBySecond - countDivisibleByBoth);

                // Output the computed result to standard output.
                console.log(finalResultantCount);
            };
        },

        // Module 2: A simple wrapper module to expose Node.js's built-in 'fs' (File System) module.
        // This allows other modules in our system to access file system functionalities.
        function(moduleRef, exportsRef) {
            // Directly assign the result of Node.js's native 'require("fs")' to this module's exports.
            moduleRef.exports = require("fs");
        }
    ]
);