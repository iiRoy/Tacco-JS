module.exports = function(moduleDefinitions) {
    // This object acts as a cache for loaded modules, preventing redundant execution.
    // Key: Module ID, Value: Module object { identifier, isLoaded, exports }.
    const moduleCache = {};

    /**
     * Internal utility to define properties on objects with a consistent configuration.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string|symbol} propertyKey - The name or symbol of the property.
     * @param {PropertyDescriptor} config - The descriptor for the property.
     */
    const defineObjectProperty = (targetObject, propertyKey, config) => {
        Object.defineProperty(targetObject, propertyKey, config);
    };

    /**
     * Executes and retrieves a module from the bundled definitions.
     * If a module with the given ID is already in the cache, its exports are returned immediately.
     * Otherwise, the module's definition function is called, its exports are stored, and then returned.
     * @param {number} requestedModuleId - The unique identifier for the module to load.
     * @returns {object} The exports object of the requested module.
     * @throws {Error} If an invalid module ID is requested.
     */
    function retrieveAndExecuteModule(requestedModuleId) {
        // Guard clause: Validate the module ID.
        if (typeof requestedModuleId !== 'number' || requestedModuleId < 0 || requestedModuleId >= moduleDefinitions.length) {
            console.error(`Runtime Error: Invalid module identifier '${requestedModuleId}' requested.`);
            throw new Error(`ModuleResolutionError: Module with ID ${requestedModuleId} not found.`);
        }

        // Check if the module has already been loaded and cached.
        if (moduleCache[requestedModuleId]) {
            return moduleCache[requestedModuleId].exports;
        }

        // Create a new module object and add it to the cache before execution.
        const currentModuleObject = moduleCache[requestedModuleId] = {
            identifier: requestedModuleId, // The module's unique ID.
            isLoaded: false,               // Flag to indicate if the module's code has run.
            exports: {}                    // The object where the module's exports will reside.
        };

        // Execute the module's definition function.
        // It receives `module`, `exports`, and a local `require` function.
        moduleDefinitions[requestedModuleId].call(
            currentModuleObject.exports, // 'this' context for module function, often unused.
            currentModuleObject,         // The 'module' object.
            currentModuleObject.exports, // The 'exports' object.
            retrieveAndExecuteModule     // The 'require' function for internal module dependencies.
        );

        // Mark the module as loaded after its definition has been executed.
        currentModuleObject.isLoaded = true;
        return currentModuleObject.exports;
    }

    // --- Core Bundler Utilities ---

    // Store the original module definitions array for introspection or advanced features.
    retrieveAndExecuteModule.moduleMappings = moduleDefinitions;
    // Expose the internal module cache for debugging or further runtime manipulation.
    retrieveAndExecuteModule.moduleStorage = moduleCache;

    /**
     * Defines an enumerable getter property on a given target object.
     * This is a standardized way to expose named exports from modules.
     * @param {object} target - The object to modify.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} valueGetter - A function that returns the property's value.
     */
    retrieveAndExecuteModule.defineModuleExport = function(target, propertyName, valueGetter) {
        // Only define the property if it doesn't already exist on the target object.
        if (!retrieveAndExecuteModule.hasOwnProp(target, propertyName)) {
            defineObjectProperty(target, propertyName, {
                enumerable: true, // Make the property visible during enumeration (e.g., in `for...in` loops).
                get: valueGetter  // The getter function to retrieve the property's value.
            });
        }
    };

    /**
     * Configures an object to be recognized as an ECMAScript Module (ESM).
     * This involves setting the `__esModule` property to `true` and potentially
     * `Symbol.toStringTag` for better `Object.prototype.toString` output.
     * @param {object} targetObject - The object to mark as an ES Module.
     */
    retrieveAndExecuteModule.registerEsModule = function(targetObject) {
        const supportsSymbolTag = typeof Symbol !== "undefined" && Symbol.toStringTag;

        if (supportsSymbolTag) {
            defineObjectProperty(targetObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        defineObjectProperty(targetObject, "__esModule", {
            value: true
        });
    };

    /**
     * Provides interoperability between different module formats (e.g., CommonJS and ES Modules).
     * It transforms a module's exports into a consistent ES Module-like namespace object
     * based on specified `interopFlags`.
     * @param {any} rawModuleInput - The module's ID or its raw exports.
     * @param {number} interopFlags - A bitmask indicating how to process the module:
     *   - Bit 1 (0x1): If set, `rawModuleInput` is a module ID and should be resolved via `retrieveAndExecuteModule`.
     *   - Bit 2 (0x2): If set, copy all enumerable properties from the processed module to the new namespace.
     *   - Bit 4 (0x4): If set, and `rawModuleInput` is already an ES Module object, return it as is.
     *   - Bit 8 (0x8): If set, return the `rawModuleInput` directly without any transformation.
     * @returns {object} An ES Module-like namespace object.
     */
    retrieveAndExecuteModule.interopNamespace = function(rawModuleInput, interopFlags) {
        let processedModuleContent = rawModuleInput;

        // Flag 1: If the first bit is set, resolve 'rawModuleInput' as a module ID.
        if (interopFlags & 1) {
            processedModuleContent = retrieveAndExecuteModule(rawModuleInput);
        }

        // Flag 8: If the eighth bit is set, return the module content as is.
        if (interopFlags & 8) {
            return processedModuleContent;
        }

        // Flag 4: If the fourth bit is set, check if it's already an ES module and return it.
        const isAlreadyEsModule = typeof processedModuleContent === "object" && processedModuleContent && processedModuleContent.__esModule;
        if (interopFlags & 4 && isAlreadyEsModule) {
            return processedModuleContent;
        }

        // Create a new empty object to serve as the ES Module namespace.
        const newEsNamespace = Object.create(null);
        retrieveAndExecuteModule.registerEsModule(newEsNamespace); // Mark it as an ES Module.

        // Define the 'default' export, which typically points to the original module's exports.
        defineObjectProperty(newEsNamespace, "default", {
            enumerable: true,
            value: processedModuleContent
        });

        // Flag 2: If the second bit is set and the module content is not a primitive string,
        // copy all its enumerable properties to the new namespace.
        const shouldCopyProperties = interopFlags & 2;
        const isNotPrimitiveType = typeof processedModuleContent !== "string";

        if (shouldCopyProperties && isNotPrimitiveType) {
            for (const propKey in processedModuleContent) {
                // Ensure we only copy own properties to avoid inheriting from prototype chain.
                if (retrieveAndExecuteModule.hasOwnProp(processedModuleContent, propKey)) {
                    retrieveAndExecuteModule.defineModuleExport(newEsNamespace, propKey, function(capturedKey) {
                        return processedModuleContent[capturedKey];
                    }.bind(null, propKey));
                }
            }
        }
        return newEsNamespace;
    };

    /**
     * Generates a getter function for module exports, primarily for ES Modules.
     * If the module is an ES Module, the getter returns its `default` export; otherwise, it returns the module itself.
     * A property named 'a' is also defined on the getter function itself, pointing back to the getter.
     * @param {object} moduleReference - The module object to create a getter for.
     * @returns {function} A getter function for the module's main export.
     */
    retrieveAndExecuteModule.getModuleExportsGetter = function(moduleReference) {
        const exportValueGetter = moduleReference && moduleReference.__esModule ?
            () => moduleReference.default :
            () => moduleReference;
        // Define a property 'a' on the getter function itself, which returns the getter.
        retrieveAndExecuteModule.defineModuleExport(exportValueGetter, "a", exportValueGetter);
        return exportValueGetter;
    };

    /**
     * Checks if an object possesses a specific property directly (i.e., not inherited from its prototype chain).
     * @param {object} targetObject - The object to inspect.
     * @param {string|symbol} propertyKey - The key of the property to check for.
     * @returns {boolean} True if the property is directly owned by the object, false otherwise.
     */
    retrieveAndExecuteModule.hasOwnProp = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Placeholder for the public path of assets, often used for dynamic imports or resource loading.
    retrieveAndExecuteModule.assetPublicPath = "";

    // Set the initial module to be executed upon bundle load.
    // In this setup, module 0 is designated as the primary entry point.
    retrieveAndExecuteModule.startModuleId = 0;
    return retrieveAndExecuteModule(retrieveAndExecuteModule.startModuleId);
}(
    // --- Array of Module Definitions ---
    [
        // Module 0: The primary application entry point.
        function(currentModule, currentExports, localRequire) {
            try {
                // Load the Node.js 'fs' (file system) module, which is module 2 in this bundle.
                const fileSystemUtility = localRequire(2);

                // Ensure the 'fs' module was loaded successfully and has the expected function.
                if (!fileSystemUtility || typeof fileSystemUtility.readFileSync !== 'function') {
                    throw new Error("Filesystem utility module (fs) is unavailable or malformed.");
                }

                // Read all data from standard input (/dev/stdin) using UTF-8 encoding.
                const rawInputBuffer = fileSystemUtility.readFileSync("/dev/stdin", "UTF-8");
                // Split the input buffer into an array of lines.
                const inputLineArray = rawInputBuffer.split("\n");

                // Load and execute the main data processing logic, which is module 1.
                const processInputLogic = localRequire(1);

                // Validate that the processing logic is indeed a callable function.
                if (typeof processInputLogic !== 'function') {
                    throw new Error("Main processing logic module (ID 1) is not a valid function.");
                }

                // Pass the parsed input lines to the main processing logic.
                processInputLogic(inputLineArray);

            } catch (executionError) {
                // Log any errors encountered during input reading or module execution.
                console.error("An unhandled error occurred in the main application entry point:", executionError.message);
                // In a production environment, one might choose to `process.exit(1)` here.
            }
        },

        // Module 1: Contains the core business logic for processing numerical data.
        function(currentModule, currentExports) {

            /**
             * A simplified helper to safely extract a specified number of elements from an array.
             * This version assumes the input is an array and does not handle general iterables,
             * optimizing for the specific use case of `split().map()`.
             * @param {Array<any>} sourceArray - The array from which to extract elements.
             * @param {number} desiredCount - The number of elements to retrieve.
             * @returns {Array<any>} A new array containing the first `desiredCount` elements.
             * @throws {TypeError} If the `sourceArray` is not an array.
             */
            const getLimitedArrayElements = (sourceArray, desiredCount) => {
                if (!Array.isArray(sourceArray)) {
                    throw new TypeError("Input for array element extraction must be an array.");
                }
                // Use slice to get a new array with the specified number of elements.
                return sourceArray.slice(0, desiredCount);
            };

            /**
             * Helper function to convert a string to a number.
             * This provides a single point for number parsing and potential future error handling.
             * @param {string} inputString - The string to convert.
             * @returns {number} The numeric representation of the string, or `NaN` if parsing fails.
             */
            const convertToNumber = (inputString) => {
                return Number(inputString);
            };

            /**
             * The main function exported by this module. It processes an array of input lines
             * to calculate a total adjustment based on specific capacity rules.
             * @param {Array<string>} rawInputLines - An array of strings, where each string is a line of input.
             */
            currentModule.exports = function(rawInputLines) {
                // --- Input validation: Ensure basic structure of input lines ---
                if (!Array.isArray(rawInputLines) || rawInputLines.length < 2) {
                    console.error("Data Processing Error: Insufficient input lines. Expected at least two lines.");
                    return; // Abort processing for invalid input.
                }

                // Parse the first line to extract the count of entities (N) and the maximum capacity (M).
                // Example: "5 10" -> N=5, M=10
                const firstLineTokens = rawInputLines[0].split(" ");
                const initialParameters = getLimitedArrayElements(
                    firstLineTokens.map(convertToNumber), 2
                );

                const entityCount = initialParameters[0];
                const maximumCapacity = initialParameters[1];

                // --- Parameter validation: Check for valid numeric range and values ---
                if (isNaN(entityCount) || isNaN(maximumCapacity) || entityCount <= 0 || maximumCapacity < 0) {
                    console.error(`Data Processing Error: Invalid numeric parameters. Entity count (N) must be > 0, Max capacity (M) must be >= 0. Got N=${entityCount}, M=${maximumCapacity}.`);
                    return; // Abort processing.
                }

                // Parse the second line to obtain the array of data values (A).
                // Example: "12 8 15 5 11"
                const dataValuesArray = rawInputLines[1].split(" ").map(convertToNumber);

                // --- Data array length validation ---
                if (dataValuesArray.length !== entityCount) {
                    console.warn(`Data Processing Warning: Input data array length mismatch. Expected ${entityCount} values based on N, but received ${dataValuesArray.length}. Processing available data up to N.`);
                    // The loop below will correctly handle this by iterating only up to 'entityCount'.
                }

                let cumulativeAdjustment = 0; // Accumulator for the total adjustments made.
                let processingIndex = 0;      // Current index in the `dataValuesArray`.

                // --- Structural change: Rewriting a `for` loop to a `while` loop ---
                while (processingIndex < entityCount) {
                    const currentEntityValue = dataValuesArray[processingIndex];

                    // Rule 1: Adjust if the current entity's value exceeds the maximum capacity.
                    if (currentEntityValue > maximumCapacity) {
                        const excessOverCapacity = currentEntityValue - maximumCapacity;
                        cumulativeAdjustment += excessOverCapacity;
                        dataValuesArray[processingIndex] = maximumCapacity; // Cap the current entity's value.
                    }

                    // Rule 2: Adjust if the sum of the current and next entity's values exceeds capacity.
                    // This check only applies if there is a next element.
                    const hasNextElement = (processingIndex < entityCount - 1);
                    if (hasNextElement) {
                        const valueAfterFirstAdjustment = dataValuesArray[processingIndex]; // Use the potentially capped value.
                        const nextEntityValue = dataValuesArray[processingIndex + 1];
                        const combinedCurrentAndNext = valueAfterFirstAdjustment + nextEntityValue;

                        if (combinedCurrentAndNext > maximumCapacity) {
                            const jointOverflowAmount = combinedCurrentAndNext - maximumCapacity;
                            dataValuesArray[processingIndex + 1] -= jointOverflowAmount; // Deduct from the next entity.
                            cumulativeAdjustment += jointOverflowAmount; // Add to total adjustment.
                        }
                    }

                    processingIndex++; // Move to the next entity for processing.
                }

                // Output the final calculated cumulative adjustment.
                console.log(cumulativeAdjustment);
            };
        },

        // Module 2: Provides access to Node.js's built-in 'fs' (file system) module.
        function(currentModule, currentExports) {
            try {
                currentModule.exports = require("fs");
            } catch (fsLoadingError) {
                // Log an error if the 'fs' module cannot be loaded (e.g., if not running in Node.js).
                console.error("Module Loading Error: Failed to load Node.js 'fs' module.", fsLoadingError.message);
                // Export an empty object to prevent further errors from undefined properties.
                currentModule.exports = {};
            }
        }
    ]
);