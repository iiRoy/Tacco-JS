module.exports = function appBootstrap(initialModuleDefinitions) {
    // This function initializes a custom module loading system,
    // mimicking a simplified JavaScript bundler's output structure.

    // A registry to store all defined modules.
    // In a real system, this might be a more complex structure, but here it's an array.
    const moduleRegistry = initialModuleDefinitions;

    // A cache to hold modules that have already been loaded,
    // preventing redundant execution and ensuring singletons.
    const loadedModuleCache = {};

    /**
     * Custom function to load a module by its identifier.
     * If the module is already in cache, its exports are returned directly.
     * Otherwise, the module's definition function is executed, and its exports are cached.
     * @param {number} moduleIdentifier The unique ID of the module to load.
     * @returns {object} The exports object of the loaded module.
     */
    function retrieveModule(moduleIdentifier) {
        // Check if the module is already in our cache.
        if (loadedModuleCache[moduleIdentifier]) {
            return loadedModuleCache[moduleIdentifier].exports;
        }

        // If not cached, create a new module object and store it.
        const currentModuleContext = loadedModuleCache[moduleIdentifier] = {
            id: moduleIdentifier,          // The module's internal identifier.
            isInitialized: false,          // Flag to indicate if the module's definition has run.
            exports: {}                    // The object that will hold the module's exports.
        };

        // Execute the module's definition function.
        // The function receives:
        // 1. The module context object (currentModuleContext).
        // 2. The module's exports object (currentModuleContext.exports).
        // 3. The local module loader function (retrieveModule) for internal dependencies.
        moduleRegistry[moduleIdentifier].call(
            currentModuleContext.exports,
            currentModuleContext,
            currentModuleContext.exports,
            retrieveModule
        );

        // Mark the module as initialized after its definition has been executed.
        currentModuleContext.isInitialized = true;
        return currentModuleContext.exports;
    }

    // --- Utility functions attached to the module loader for internal use ---

    // Expose the module definitions for introspection (e.g., debugging).
    retrieveModule.definitions = moduleRegistry;

    // Expose the module cache.
    retrieveModule.cache = loadedModuleCache;

    /**
     * Defines a getter property on an object if it doesn't already exist.
     * This is commonly used for ES module interop to expose properties.
     * @param {object} targetObject The object on which to define the property.
     * @param {string} propertyName The name of the property.
     * @param {Function} getterCallback The function to execute when the property is accessed.
     */
    retrieveModule.definePropertyGetter = function(targetObject, propertyName, getterCallback) {
        if (!retrieveModule.hasOwnDirectProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterCallback
            });
        }
    };

    /**
     * Marks an exports object as an ES Module.
     * This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"'.
     * @param {object} exportsObject The object to mark as an ES Module.
     */
    retrieveModule.flagAsESModule = function(exportsObject) {
        // Set Symbol.toStringTag for better debugging experience in some environments.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // The __esModule flag is a common convention for indicating ES Modules.
        Object.defineProperty(exportsObject, '__esModule', {
            value: true
        });
    };

    /**
     * Handles interoperability between different module formats (e.g., CommonJS and ES Modules).
     * @param {any} sourceModule The module or module identifier to interop.
     * @param {number} interopFlags Bitmask flags indicating how to perform interop.
     *   - Bit 1 (0x1): Treat sourceModule as an ID, load it first.
     *   - Bit 2 (0x2): If not a string, copy all properties to the interop object.
     *   - Bit 4 (0x4): If sourceModule is already an ES Module, return it directly.
     *   - Bit 8 (0x8): If already interoped, return sourceModule as is.
     * @returns {object} The interoped module object.
     */
    retrieveModule.interopNamespace = function(sourceModule, interopFlags) {
        // If flag 1 is set, load the module using its identifier.
        if (interopFlags & 1) sourceModule = retrieveModule(sourceModule);

        // If flag 8 is set, assume it's already processed.
        if (interopFlags & 8) return sourceModule;

        // If flag 4 is set and it's an ES module, return it directly.
        if ((interopFlags & 4) && typeof sourceModule === 'object' && sourceModule && sourceModule.__esModule) {
            return sourceModule;
        }

        // Create a new object to represent the interoped module.
        const interopObject = Object.create(null);
        retrieveModule.flagAsESModule(interopObject); // Mark it as an ES Module.

        // Define the 'default' export.
        Object.defineProperty(interopObject, 'default', {
            enumerable: true,
            value: sourceModule
        });

        // If flag 2 is set and the source is not a string, copy all its properties.
        if ((interopFlags & 2) && (typeof sourceModule !== 'string')) {
            for (let propKey in sourceModule) {
                retrieveModule.definePropertyGetter(interopObject, propKey, (function(key) {
                    return sourceModule[key];
                }).bind(null, propKey));
            }
        }
        return interopObject;
    };

    /**
     * Creates a getter function for the 'default' export of a module.
     * This is often used to provide an alias (like 'a') for the default export.
     * @param {object} moduleReference The module object.
     * @returns {Function} A getter function for the default export.
     */
    retrieveModule.createDefaultExportGetter = function(moduleReference) {
        // Determine the actual value of the default export.
        const actualDefaultGetter = moduleReference && moduleReference.__esModule ?
            () => moduleReference.default :
            () => moduleReference;

        // Define an alias 'a' that points to the same default getter.
        retrieveModule.definePropertyGetter(actualDefaultGetter, "a", actualDefaultGetter);
        return actualDefaultGetter;
    };

    /**
     * Checks if an object has a property directly on itself (not inherited).
     * @param {object} obj The object to check.
     * @param {string} prop The property name.
     * @returns {boolean} True if the property is directly on the object, false otherwise.
     */
    retrieveModule.hasOwnDirectProperty = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // The public path for assets (often empty or a URL prefix in web contexts).
    retrieveModule.publicAssetPath = "";

    // The entry point for the application, typically module ID 0.
    const entryApplicationModuleID = 0;
    retrieveModule.entry = entryApplicationModuleID; // Store entry ID for debugging/introspection.

    // Start the application by loading the entry point module.
    return retrieveModule(entryApplicationModuleID);
}(
    // --- Array of Module Definitions ---
    // Each function in this array represents a distinct module.
    // The index of the function in the array is its module ID.

    [
        // Module 0: The main application entry point.
        // It's responsible for reading input and initiating the core logic.
        function(moduleContext, moduleExports, moduleLoader) {
            /**
             * Helper function to safely read and parse input lines from /dev/stdin.
             * Includes basic error handling for file system access.
             * @returns {string[]} An array of strings, where each string is a line of input.
             */
            const obtainApplicationInput = () => {
                try {
                    // Dynamically load the 'fs' (file system) module via the internal loader.
                    const fileSystemUtil = moduleLoader(2);

                    // Read the entire content of /dev/stdin as UTF-8.
                    const rawContent = fileSystemUtil.readFileSync("/dev/stdin", "UTF-8");

                    // Basic validation for content.
                    if (typeof rawContent !== 'string' || rawContent.trim() === '') {
                        console.error("Input Error: Received empty or invalid data from /dev/stdin.");
                        return []; // Return an empty array to signal no valid input.
                    }

                    // Split the content into lines.
                    return rawContent.split("\n");
                } catch (readOperationError) {
                    // Log any errors encountered during file reading.
                    console.error("Critical Input Error: Cannot read from /dev/stdin. Details:", readOperationError.message);
                    return []; // Return empty array on error.
                }
            };

            const applicationInputLines = obtainApplicationInput();

            // Guard clause: Ensure there are at least two lines of input.
            if (applicationInputLines.length < 2) {
                console.log("IMPOSSIBLE"); // Not enough input to proceed.
                return;
            }

            // Load and execute the core logic module (Module 1) with the obtained input.
            moduleLoader(1)(applicationInputLines);
        },

        // Module 1: Contains the primary algorithmic logic to process the input.
        function(moduleContext, moduleExports) {
            /**
             * A robust helper to extract elements from an iterable into an array.
             * Similar to Babel's _iterableToArray, but slightly simplified.
             * @param {Iterable} sourceIterable The object to destructure.
             * @param {number} [expectedCount] Optional. The maximum number of elements to extract.
             * @returns {Array} An array containing the extracted elements.
             * @throws {TypeError} If the source is not iterable or other iteration error occurs.
             */
            const extractArrayElements = (sourceIterable, expectedCount) => {
                if (Array.isArray(sourceIterable)) {
                    return sourceIterable;
                }

                const extracted = [];
                try {
                    // Use Symbol.iterator for generic iterable support.
                    for (const item of sourceIterable) {
                        extracted.push(item);
                        // Stop if expected count is reached.
                        if (expectedCount !== undefined && extracted.length === expectedCount) {
                            break;
                        }
                    }
                } catch (iterationError) {
                    throw new TypeError(
                        `Invalid attempt to destructure non-iterable instance or iteration error: ${iterationError.message}`
                    );
                }
                return extracted;
            };

            // This module exports a function that takes input lines and performs the analysis.
            moduleContext.exports = function analyzeNumericData(inputDataLines) {
                // Guard clause: Ensure valid input array.
                if (!inputDataLines || inputDataLines.length < 2) {
                    // Already checked in Module 0, but good for robustness.
                    console.log("IMPOSSIBLE");
                    return;
                }

                // Parse the first line to get problem parameters.
                const firstDataRow = inputDataLines[0].split(" ").map(Number);
                const [totalElementsExpected, targetLookupValue] = extractArrayElements(firstDataRow, 2);

                // Guard for invalid numerical input from the first line.
                if (isNaN(totalElementsExpected) || isNaN(targetLookupValue) || totalElementsExpected < 0) {
                    console.log("IMPOSSIBLE");
                    return;
                }

                // Parse the second line into an array of numbers.
                const dataPointsArray = inputDataLines[1].split(" ").map(Number);

                // Sort the array in ascending order for easier processing.
                dataPointsArray.sort((a, b) => a - b);

                // Flags to track the conditions for a "POSSIBLE" outcome.
                let condition_DivisibilityMet = false;
                let condition_LargerElementExists = false;
                let condition_TargetValueDirectlyFound = false;

                // A small helper for consistent output.
                const printOutcome = (isPossible) => {
                    console.log(isPossible ? "POSSIBLE" : "IMPOSSIBLE");
                };

                // Iterate through the sorted data array to check conditions.
                for (let i = 0; i < totalElementsExpected; i++) {
                    const currentNumericElement = dataPointsArray[i];

                    // Check for Condition 1: Divisibility by the first element's modulo.
                    // This check is skipped for the first element itself (i=0).
                    // Added check for dataPointsArray[0] to prevent division by zero.
                    if (i > 0 && dataPointsArray[0] !== 0 &&
                        (currentNumericElement % dataPointsArray[0] === targetLookupValue % dataPointsArray[0])) {
                        condition_DivisibilityMet = true;
                    }

                    // Check for Condition 2: Existence of an element greater than the target value.
                    if (currentNumericElement > targetLookupValue) {
                        condition_LargerElementExists = true;
                    }

                    // Check for Condition 3: Direct match with the target value.
                    if (currentNumericElement === targetLookupValue) {
                        condition_TargetValueDirectlyFound = true;
                        printOutcome(true); // If found directly, it's immediately POSSIBLE.
                        return;             // Exit the function early as per original logic.
                    }
                }

                // After iterating through all elements (if no direct match was found),
                // evaluate the combined conditions.
                if (condition_DivisibilityMet && condition_LargerElementExists) {
                    printOutcome(true);
                } else {
                    printOutcome(false);
                }
            };
        },

        // Module 2: Provides access to Node.js's native 'fs' (file system) module.
        function(moduleContext, moduleExports) {
            // Simply export the built-in 'fs' module.
            moduleContext.exports = require("fs");
        }
    ]
);