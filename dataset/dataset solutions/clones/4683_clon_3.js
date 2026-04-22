module.exports = function(moduleDefinitions) {
    // A private cache to store already loaded modules and prevent re-execution.
    const loadedModulesCache = {};

    /**
     * The central function for resolving and loading modules within this custom runtime.
     * It acts as a specialized 'require' mechanism.
     * @param {number} requestedModuleId - The unique numerical identifier of the module to be loaded.
     * @returns {object} The exports object from the specified module.
     */
    function moduleResolver(requestedModuleId) {
        // First, check if the module has already been loaded and is present in the cache.
        if (loadedModulesCache[requestedModuleId]) {
            return loadedModulesCache[requestedModuleId].exports;
        }

        // If the module is not in the cache, prepare a new module object.
        const currentModuleRecord = loadedModulesCache[requestedModuleId] = {
            id: requestedModuleId, // Store the module's identifier for reference.
            isInitialized: false,  // A flag indicating whether the module's code has been run.
            exports: {}            // The empty object that will collect all exports from the module.
        };

        // Execute the module's definition function.
        // The definition function receives the 'module' object, its 'exports' object,
        // and a reference to this 'moduleResolver' function (itself, for internal 'require' calls).
        moduleDefinitions[requestedModuleId].call(
            currentModuleRecord.exports, // 'this' context for the module function.
            currentModuleRecord,         // The 'module' object.
            currentModuleRecord.exports, // The 'exports' object.
            moduleResolver               // The local 'require' function.
        );

        // After successful execution of the module's definition, mark it as initialized.
        currentModuleRecord.isInitialized = true;

        // Return the populated exports object.
        return currentModuleRecord.exports;
    }

    /**
     * Helper function to define a getter property on a target object.
     * This is commonly used for exposing module exports as getters.
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propKey - The name of the property to define.
     * @param {function} getterFunc - The function to serve as the getter for the property.
     */
    moduleResolver.setupPropertyGetter = function(targetObj, propKey, getterFunc) {
        const hasExistingProperty = Object.prototype.hasOwnProperty.call(targetObj, propKey);
        if (!hasExistingProperty) {
            Object.defineProperty(targetObj, propKey, {
                enumerable: true, // Make the property visible during enumeration.
                get: getterFunc   // Assign the provided function as the getter.
            });
        }
    };

    /**
     * Marks an exports object as an ES Module, facilitating interoperability.
     * This typically involves setting '__esModule' to true and potentially 'Symbol.toStringTag'.
     * @param {object} exportsObj - The exports object to mark.
     */
    moduleResolver.flagAsESModule = function(exportsObj) {
        // Use Symbol.toStringTag for better module identification if available.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObj, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the common '__esModule' flag.
        Object.defineProperty(exportsObj, '__esModule', { value: true });
    };

    /**
     * Provides logic for handling default exports, especially for CommonJS interop with ES Modules.
     * @param {any} moduleRef - The module reference, which could be an ID or an exports object.
     * @param {number} conversionFlags - Bitmask flags indicating conversion steps.
     * @returns {any} The processed module reference or default export.
     */
    moduleResolver.interopDefault = function(moduleRef, conversionFlags) {
        // Flag 1: If set, moduleRef is an ID, so resolve it first.
        if (conversionFlags & 1) {
            moduleRef = moduleResolver(moduleRef);
        }

        // Flag 8: If set, return moduleRef directly (it's already the desired export).
        if (conversionFlags & 8) {
            return moduleRef;
        }

        // Flag 4: If set and it's an object already marked as an ES module, return it directly.
        const isObjectAndESModule = (typeof moduleRef === 'object' && moduleRef !== null && moduleRef.__esModule);
        if (conversionFlags & 4 && isObjectAndESModule) {
            return moduleRef;
        }

        // If none of the above, create a new object to hold the default export.
        const synthesizedDefaultExport = Object.create(null);
        moduleResolver.flagAsESModule(synthesizedDefaultExport); // Mark it as an ES module.

        // Define the 'default' property to point to the original moduleRef.
        Object.defineProperty(synthesizedDefaultExport, 'default', {
            enumerable: true,
            value: moduleRef
        });

        // Flag 2: If set and moduleRef is not a string, iterate its properties
        // and expose them as getters on the synthesized default export object.
        if (conversionFlags & 2 && typeof moduleRef !== 'string') {
            for (const key in moduleRef) {
                // Avoid overwriting 'default' or '__esModule' if they exist.
                if (key === 'default' || key === '__esModule') continue;

                moduleResolver.setupPropertyGetter(synthesizedDefaultExport, key, function() {
                    return moduleRef[key];
                });
            }
        }
        return synthesizedDefaultExport;
    };

    /**
     * Creates a function that returns the default export of a module.
     * Used for lazy evaluation of default exports in some bundler setups.
     * @param {object} moduleExportsObject - The exports object of a module.
     * @returns {function} A function that returns the default export.
     */
    moduleResolver.createExportProxy = function(moduleExportsObject) {
        // Determine the actual default export logic based on the __esModule flag.
        const getDefaultValue = moduleExportsObject && moduleExportsObject.__esModule
            ? () => moduleExportsObject.default // If ES module, return its 'default' property.
            : () => moduleExportsObject;       // Otherwise, the entire object is the default.

        // Define a shorthand getter 'a' on the proxy function itself for convenience.
        moduleResolver.setupPropertyGetter(getDefaultValue, 'a', getDefaultValue);
        return getDefaultValue;
    };

    /**
     * A simple wrapper for Object.prototype.hasOwnProperty.call.
     * @param {object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the object has the specified property.
     */
    moduleResolver.objectHasProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Placeholder for a public path configuration (e.g., for loading chunks dynamically).
    moduleResolver.assetPublicPath = "";

    // Define the entry point module ID and then initiate the loading process.
    const applicationEntryId = 0;
    moduleResolver.entryModuleId = applicationEntryId; // Store the entry ID on the resolver for potential debugging.
    return moduleResolver(moduleResolver.entryModuleId); // Start execution by resolving the entry module.

}([ // Array containing all module definitions that form the application bundle.

    /**
     * Module 0: The application's main entry point.
     * This module is responsible for reading input from stdin and orchestrating
     * the processing by other modules.
     */
    function(currentModule, currentExports, localModuleRequire) {
        // Load the Node.js 'fs' (file system) module via our internal resolver.
        const fileSystemUtility = localModuleRequire(2);

        let standardInputContent;
        try {
            // Attempt to read data from standard input. This is a synchronous call.
            standardInputContent = fileSystemUtility.readFileSync("/dev/stdin", "UTF-8");

            // Basic validation for the content read from stdin.
            if (!standardInputContent || standardInputContent.trim().length === 0) {
                console.error("Warning: Standard input stream was empty or contained only whitespace.");
                // Depending on requirements, one might throw an error or exit here.
                // For now, we'll let it proceed, potentially leading to further errors.
            }
        } catch (ioError) {
            // Handle any errors that occur during the file read operation.
            console.error(`Error reading from /dev/stdin: ${ioError.message}`);
            standardInputContent = ''; // Default to an empty string to prevent downstream crashes.
        }

        // Load the primary processing logic module (Module 1).
        const processingFunction = localModuleRequire(1);

        // Execute the processing function with the collected input data.
        processingFunction(standardInputContent);
    },

    /**
     * Module 1: Contains the core algorithm to find the smallest integer 'N'
     * such that the Nth triangular number (N * (N + 1) / 2) is greater than or equal
     * to a given target number from the input.
     */
    function(moduleRef, moduleExports) {
        // Export the main logic function that takes raw input data.
        moduleRef.exports = function(incomingInputString) {
            // --- Input Validation ---
            if (typeof incomingInputString !== 'string' || incomingInputString === null) {
                console.error("Error: Processing function received invalid input type. Expected a string.");
                return; // Abort processing if input is not a string.
            }

            // Split the input string by newline characters and extract the first line.
            const inputLinesArray = incomingInputString.split('\n');
            const numericStringValue = inputLinesArray[0];

            // Attempt to convert the first line to a number.
            const candidateTargetNumber = Number(numericStringValue);

            // --- Numeric Input Validation ---
            if (isNaN(candidateTargetNumber) || candidateTargetNumber < 0) {
                console.error(`Error: Invalid or negative numeric input provided: '${numericStringValue}'. A non-negative number is required.`);
                return; // Abort if the target number is invalid.
            }

            // Ensure the target number is an integer, discarding any fractional part.
            const finalTargetValue = Math.floor(candidateTargetNumber);

            // --- Core Logic for Triangular Number Calculation ---
            let currentIterationIndex = 0; // Represents 'N' in the triangular number formula.
            let calculatedTriangularSum = 0; // Represents T_N = N * (N + 1) / 2.

            // Loop indefinitely until the condition is met.
            while (true) {
                currentIterationIndex++; // Increment the index for the next triangular number.

                // Calculate the triangular number for the current index.
                // The formula for the Nth triangular number is N * (N + 1) / 2.
                calculatedTriangularSum = (currentIterationIndex * (currentIterationIndex + 1)) / 2;

                // Check if the current triangular sum has reached or exceeded the target value.
                if (calculatedTriangularSum >= finalTargetValue) {
                    // If the condition is met, we've found the smallest such index.
                    break; // Exit the loop.
                }

                // --- Safeguard for extremely large inputs (optional, for robustness) ---
                // This prevents potential infinite loops if the input is unexpectedly huge
                // and the triangular sum never reaches it due to floating point inaccuracies or other issues.
                if (currentIterationIndex > 2_000_000) { // Arbitrary large limit, adjust as needed.
                    console.warn(`Warning: High iteration count (${currentIterationIndex}). Input value might be excessively large or problematic.`);
                    break; // Force exit to prevent resource exhaustion.
                }
            }

            // --- Output the Result ---
            // The original code only prints the numerical result.
            // A more descriptive message could be:
            // const resultSummary = `For target ${finalTargetValue}, the smallest N is ${currentIterationIndex}, with T_N = ${calculatedTriangularSum}.`;
            // console.log(resultSummary);
            console.log(currentIterationIndex); // Adhering to the original's output format.
        };
    },

    /**
     * Module 2: A simple module that exports Node.js's built-in 'fs' (file system) module.
     * This allows other modules in the bundle to access file system functionalities.
     */
    function(moduleWrapper, moduleExportsObject) {
        // Assign the Node.js 'fs' module directly to this module's exports.
        moduleWrapper.exports = require("fs");
    }
]);