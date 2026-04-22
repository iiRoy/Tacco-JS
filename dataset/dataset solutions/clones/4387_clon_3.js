// This module system is designed to load and manage JavaScript modules,
// mimicking a simplified structure often found in bundled applications (e.g., Webpack).
// It exposes its core 'require' functionality globally for demonstration purposes.
global.moduleSystem = (function(applicationModuleDefinitions) {
    // A cache to store modules that have already been loaded, preventing redundant execution.
    const loadedModuleInstances = {};

    // A cached reference to `Object.defineProperty` for efficiency and readability.
    const defineObjectProperty = Object.defineProperty;

    // A cached reference to `Object.prototype.hasOwnProperty.call` for safe property checks.
    const saferHasOwnProperty = Object.prototype.hasOwnProperty;

    /**
     * The central function for resolving and loading modules by their unique identifier.
     * If a module is already cached, its exports are returned immediately.
     * Otherwise, the module's definition function is executed, its exports are
     * captured and cached, and then returned.
     *
     * @param {number} requestedModuleIdentifier - The numeric ID of the module to load.
     * @returns {object} The exports object provided by the resolved module.
     */
    const requireModuleById = function(requestedModuleIdentifier) {
        // Step 1: Check if the module is already in our cache.
        if (loadedModuleInstances[requestedModuleIdentifier]) {
            return loadedModuleInstances[requestedModuleIdentifier].exports;
        }

        // Step 2: If not cached, prepare a new module instance object.
        // This object holds the module's ID, a flag indicating its loading status,
        // and an empty 'exports' object which the module's code will populate.
        const currentModuleInstance = {
            uniqueId: requestedModuleIdentifier, // The module's internal identifier
            isCodeExecuted: false,               // Tracks if the module's definition function has run
            exports: {}                          // The object that will be exposed as the module's API
        };
        loadedModuleInstances[requestedModuleIdentifier] = currentModuleInstance;

        // Step 3: Execute the module's definition function.
        // Module definition functions typically expect parameters like `module`, `exports`, and `require`.
        // We pass our `currentModuleInstance`, its `exports` object, and this `requireModuleById` function
        // to allow the module to define its exports and resolve its own dependencies.
        applicationModuleDefinitions[requestedModuleIdentifier].call(
            currentModuleInstance.exports, // 'this' context for the module, often its exports
            currentModuleInstance,         // The 'module' object itself
            currentModuleInstance.exports, // The 'exports' object for direct modification
            requireModuleById              // The local 'require' function for internal module resolution
        );

        // Step 4: Mark the module as fully loaded after its code has been executed.
        currentModuleInstance.isCodeExecuted = true;

        // (Type III Addition: Optional logging for module load events)
        // console.debug(`[ModuleLoader] Successfully loaded module with ID: ${requestedModuleIdentifier}`);

        // Step 5: Return the exports of the newly loaded module.
        return currentModuleInstance.exports;
    };

    // Store the original list of module definitions on the `require` function itself,
    // potentially for introspection or advanced features.
    requireModuleById.definitionRegistry = applicationModuleDefinitions;

    // Store the internal cache on the `require` function.
    requireModuleById.moduleCacheStorage = loadedModuleInstances;

    /**
     * A utility function to define a non-writable, enumerable getter property on an object.
     * This is commonly used in module systems for exposing named exports from a module.
     *
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to be defined.
     * @param {function} propertyGetter - A function that returns the value of the property.
     */
    requireModuleById.setupExportProperty = function(targetObject, propertyName, propertyGetter) {
        // Only define the property if it doesn't already exist on the target object.
        if (!requireModuleById.checkOwnProperty(targetObject, propertyName)) {
            defineObjectProperty(targetObject, propertyName, {
                enumerable: true,      // Make the property visible during enumeration (e.g., `for...in`)
                get: propertyGetter    // The function to call when the property is accessed
            });
        }
    };

    /**
     * Marks a module's exports object as an ECMAScript Module (ESM) for compatibility.
     * This involves setting `__esModule: true` and, if supported, `Symbol.toStringTag: 'Module'`.
     *
     * @param {object} moduleExportsObject - The exports object of the module to mark.
     */
    requireModuleById.markAsESModule = function(moduleExportsObject) {
        // Set `Symbol.toStringTag` for better object identification in certain environments.
        // This is conditional on `Symbol` being available.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            defineObjectProperty(moduleExportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the `__esModule` flag, a common convention for identifying ES Modules.
        defineObjectProperty(moduleExportsObject, '__esModule', { value: true });
    };

    /**
     * Creates an interoperable namespace object from various module types (CommonJS, ES Module).
     * This function handles different flags to control the interop behavior, such as
     * resolving module IDs, checking for existing ES Modules, and copying properties.
     *
     * @param {any} moduleValue - The raw module value or ID.
     * @param {number} interopFlags - A bitmask controlling interop behavior.
     * @returns {object} An ES Module-compatible namespace object.
     */
    requireModuleById.createInteropNamespace = function(moduleValue, interopFlags) {
        // Flag 1: If `moduleValue` is a module ID, resolve it first.
        if (interopFlags & 1) {
            moduleValue = requireModuleById(moduleValue);
        }

        // Flag 8: If the module is already a namespace object, return it directly.
        if (interopFlags & 8) {
            return moduleValue;
        }

        // Flag 4: If it's an object and already marked as an ES Module, return it directly.
        if (interopFlags & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new, empty object to serve as the namespace.
        const newNamespaceObject = Object.create(null);
        requireModuleById.markAsESModule(newNamespaceObject); // Mark it as an ES Module.

        // Define the 'default' export, pointing to the original module value.
        defineObjectProperty(newNamespaceObject, 'default', { enumerable: true, value: moduleValue });

        // Flag 2: If the original module value is not a string, copy all its own properties
        // (excluding 'default' to prevent conflicts) as named exports onto the new namespace.
        if (interopFlags & 2 && typeof moduleValue !== 'string') {
            for (const propertyKey in moduleValue) {
                if (requireModuleById.checkOwnProperty(moduleValue, propertyKey) && propertyKey !== 'default') {
                    requireModuleById.setupExportProperty(newNamespaceObject, propertyKey, (function(key) {
                        return function() { return moduleValue[key]; };
                    }).bind(null, propertyKey)); // Use a bound function for correct scope.
                }
            }
        }
        return newNamespaceObject;
    };

    /**
     * Generates a getter function for a module's default export.
     * This handles both true ES Modules (which have a `.default` property)
     * and CommonJS modules (where the entire `exports` object is considered the default).
     *
     * @param {object} sourceModuleExports - The exports object of the source module.
     * @returns {function} A function that, when called, returns the module's default export.
     */
    requireModuleById.getDefaultExportGetter = function(sourceModuleExports) {
        // If the module is explicitly marked as an ES Module, its default export is `.default`.
        const defaultExportRetrievalFunction = sourceModuleExports && sourceModuleExports.__esModule
            ? function() { return sourceModuleExports.default; }
            : function() { return sourceModuleExports; }; // Otherwise, the entire exports object is the default.

        // A specific interop convention: define a property 'a' on the getter itself
        // that returns the getter function. This is for specific bundle scenarios.
        requireModuleById.setupExportProperty(defaultExportRetrievalFunction, 'a', defaultExportRetrievalFunction);
        return defaultExportRetrievalFunction;
    };

    /**
     * Checks if an object possesses an own (non-inherited) property with the given name.
     * This is a safer alternative to `obj.hasOwnProperty(prop)` as it avoids issues
     * if `hasOwnProperty` itself has been shadowed on `obj`.
     *
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyName - The name of the property to check for.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    requireModuleById.checkOwnProperty = function(targetObject, propertyName) {
        return saferHasOwnProperty.call(targetObject, propertyName);
    };

    // (Type III Addition/Update: Changed default value and added comment for clarity)
    // The public path for loading assets (e.g., images, other bundles).
    // This value might be configured during the build process.
    requireModuleById.baseAssetPublicPath = "/_application_assets/";

    // Define the ID of the initial module to execute when the application starts.
    const entryPointModuleId = 0;
    requireModuleById.applicationStartupModuleId = entryPointModuleId;

    // (Type III Addition: Optional logging for application startup)
    // console.log(`[ModuleLoader] Initiating application by executing module ID: ${entryPointModuleId}...`);

    // Execute the entry point module to begin the application's main logic flow.
    requireModuleById(entryPointModuleId);

    // The IIFE returns the `requireModuleById` function, making it the public interface
    // for this module system, accessible via `global.moduleSystem`.
    return requireModuleById;

// The array containing all module definition functions. Each function corresponds to a module ID.
})([
    // Module 0: Primary Application Entry Point
    // This module is responsible for initializing the application by reading
    // necessary input and delegating processing to other modules.
    function(currentModuleContext, moduleExportsObject, moduleDependencyResolver) {
        // (Type III Update: Renamed parameters for clarity)
        // (Type III Addition: Intermediate variables for path and encoding)
        const standardInputSource = "/dev/stdin";
        const textEncodingFormat = "UTF-8";

        // Resolve the Node.js native 'fs' (file system) module, which is module ID 2.
        const fileSystemUtility = moduleDependencyResolver(2);

        let rawInputData;
        try {
            // (Type III Update: Explicit variable for raw data, added error handling)
            // Synchronously read all content from the standard input stream.
            rawInputData = fileSystemUtility.readFileSync(standardInputSource, textEncodingFormat);
        } catch (ioError) {
            // (Type III Addition: Guard clause/error handling for file read failures)
            console.error(`[AppEntry] Critical Error: Unable to read from ${standardInputSource}. Details:`, ioError.message);
            process.exit(1); // Exit with an error code if input cannot be read.
            return; // Ensure no further execution in this context.
        }

        // (Type III Addition: Input validation for emptiness)
        // Check if any content was actually read.
        if (!rawInputData || rawInputData.length === 0) {
            console.warn("[AppEntry] Warning: Standard input did not provide any content. Proceeding with empty data.");
            rawInputData = ""; // Ensure `rawInputData` is always a string for subsequent processing.
        }

        // Resolve the main data processing module, which is module ID 1.
        const mainProcessingLogic = moduleDependencyResolver(1);

        // Invoke the main processing function, passing the raw input data.
        mainProcessingLogic(rawInputData);
    },

    // Module 1: Core Algorithm for Array Analysis
    // This module implements a specific counting algorithm based on the positions
    // of numbers within an array, read from a string input.
    function(currentModuleContext, moduleExportsObject) {
        /**
         * Processes raw text input containing an array's length and its elements.
         * It then calculates a specialized count based on the elements' positions.
         *
         * The algorithm counts occurrences where an element `numbers[i]` is equal to `i + 1`
         * (meaning it's in its "correct" 1-indexed position), but only if the immediately
         * preceding element was *not* in its correct position, or if this is the first such element.
         * If two consecutive elements are correct, only the first one contributes to the count.
         *
         * @param {string} rawTextInputContent - The full string content read from standard input.
         */
        currentModuleContext.exports = function processInputSequence(rawTextInputContent) {
            // (Type III Update: Renamed argument for clarity)
            // (Type III Addition: Intermediate variable for lines)
            const allInputLines = rawTextInputContent.split('\n');

            // The first line is expected to be a number representing the array's declared length.
            const declaredArrayLength = Number(allInputLines[0]);

            // (Type III Addition: Input validation for array length)
            if (isNaN(declaredArrayLength) || declaredArrayLength < 0) {
                console.error("Error: The first line must be a non-negative number representing array size.");
                return; // Halt execution if the declared length is invalid.
            }

            // The second line contains space-separated numbers; parse them into a numeric array.
            // Using `Number` directly in `map` is a concise way to convert strings to numbers.
            const numericSequence = allInputLines[1].split(' ').map(Number);

            // (Type III Addition: Warning for length mismatch)
            // Provide a warning if the declared length doesn't match the actual parsed sequence length.
            if (numericSequence.length !== declaredArrayLength) {
                console.warn(
                    `Warning: Declared array length (${declaredArrayLength}) ` +
                    `differs from actual parsed sequence length (${numericSequence.length}). ` +
                    `Proceeding with the actual length of the sequence.`
                );
            }

            // Initialize variables for the counting algorithm.
            let totalFixOperations = 0;          // This counter accumulates the result.
            let wasPreviousElementCorrect = 0;   // A flag: 0 if previous was NOT correct, 1 if it WAS correct.

            // Iterate through the numeric sequence using its actual length for safety.
            for (let currentElementIndex = 0; currentElementIndex < numericSequence.length; currentElementIndex++) {
                // (Type III Addition: Helper boolean variable for readability)
                // Check if the current element is in its "correct" 1-indexed position.
                // For a 0-indexed array, the correct value at index `i` is `i + 1`.
                const isCurrentElementInItsPlace = (numericSequence[currentElementIndex] === (currentElementIndex + 1));

                // (Type III Update: Rewrote ternary operator to explicit if-else for readability)
                // Core logic: Apply the specific counting rule.
                if (isCurrentElementInItsPlace) {
                    // If the current element is in its correct place:
                    if (wasPreviousElementCorrect === 1) {
                        // If the previous element was ALSO in its correct place,
                        // we reset the flag. This effectively means that for a block
                        // of consecutive correct elements, only the *first* one counts
                        // (or rather, it resets the state to allow the *next* non-consecutive
                        // correct element to count).
                        wasPreviousElementCorrect = 0;
                    } else {
                        // If the previous element was NOT in its correct place (or this is the very first element),
                        // increment the operations count and set the flag to indicate that the current one IS correct.
                        totalFixOperations += 1;
                        wasPreviousElementCorrect = 1;
                    }
                } else {
                    // If the current element is NOT in its correct place,
                    // reset the flag. This breaks any potential sequence of "correct" elements.
                    wasPreviousElementCorrect = 0;
                }
            }

            // (Type III Update: Changed output method for competitive programming style)
            // Output the final calculated count to standard output, followed by a newline.
            process.stdout.write(totalFixOperations.toString() + '\n');
        };
    },

    // Module 2: Node.js File System (fs) Module Wrapper
    // This module's sole purpose is to provide access to the native Node.js 'fs' module.
    function(currentModuleContext, moduleExportsObject) {
        // (Type III Update: Renamed parameters for clarity)
        // Directly export the native Node.js 'fs' module.
        // This makes the file system functionalities available to other modules
        // within this bundled application.
        currentModuleContext.exports = require('fs');
    }
]);