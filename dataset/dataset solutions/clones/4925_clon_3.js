module.exports = function(moduleDefinitionRegistry) {
    // A private cache to store module objects once they have been loaded.
    let moduleInstanceCache = {};

    // A simple counter to keep track of how many modules have been initialized.
    let initializedModuleCount = 0;

    /**
     * The core module resolution and loading function.
     * This function acts as the internal 'require' mechanism for the bundled modules.
     * @param {number} requestedModuleIdentifier The numerical ID of the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function retrieveModuleExports(requestedModuleIdentifier) {
        // Step 1: Check if the module is already in the cache.
        // If it exists and is marked as loaded, return its exports immediately.
        if (moduleInstanceCache[requestedModuleIdentifier]) {
            return moduleInstanceCache[requestedModuleIdentifier].exports;
        }

        // Step 2: If not in cache, create a new module entry.
        // Initialize the module object with its ID, a 'loaded' flag set to false,
        // and an empty exports object which will be populated by the module's code.
        const currentModuleRecord = moduleInstanceCache[requestedModuleIdentifier] = {
            identificationKey: requestedModuleIdentifier,
            isExecutionComplete: false,
            exports: {}
        };

        // Step 3: Execute the module's definition function.
        // The module definition is expected to be a function stored in the registry.
        const moduleProcessor = moduleDefinitionRegistry[requestedModuleIdentifier];

        // Basic validation: Ensure the module definition is actually a function.
        if (typeof moduleProcessor !== 'function') {
            console.error(`Error: Module ${requestedModuleIdentifier} definition is not a function.`);
            // In a real scenario, this might throw an error or handle it more gracefully.
            return currentModuleRecord.exports; // Return empty exports.
        }

        // Call the module's function. The 'this' context is set to the module's exports,
        // and it receives the module record, its exports, and the resolver itself as arguments.
        moduleProcessor.call(currentModuleRecord.exports, currentModuleRecord, currentModuleRecord.exports, retrieveModuleExports);

        // Step 4: Mark the module as loaded after its function has finished execution.
        currentModuleRecord.isExecutionComplete = true;
        initializedModuleCount++; // Increment the counter.

        // Step 5: Return the exports object, now populated by the module's code.
        return currentModuleRecord.exports;
    }

    /**
     * Defines a non-enumerable getter property on a target object.
     * This is primarily used for setting up getters for module exports,
     * ensuring properties are dynamically resolved when accessed.
     * @param {object} targetObj The object on which to define the property.
     * @param {string} propKey The name of the property to define.
     * @param {function} getterFunc The function that will be called to get the property's value.
     */
    retrieveModuleExports.defineModuleProperty = function(targetObj, propKey, getterFunc) {
        // Check if the property already exists to prevent accidental overwrites.
        if (!retrieveModuleExports.isOwnProperty(targetObj, propKey)) {
            Object.defineProperty(targetObj, propKey, {
                enumerable: true, // Make the property visible during enumeration (e.g., for...in).
                get: getterFunc   // The getter function for the property.
            });
        }
    };

    /**
     * Configures an object to behave like an ES Module namespace object.
     * This involves setting `Symbol.toStringTag` and `__esModule` properties.
     * @param {object} moduleNamespaceObject The object to configure as an ES Module.
     */
    retrieveModuleExports.configureEsModule = function(moduleNamespaceObject) {
        // Check for the existence of Symbol and Symbol.toStringTag for compatibility.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleNamespaceObject, Symbol.toStringTag, { value: "Module" });
        }
        // Always set __esModule to true for consistent ES module behavior.
        Object.defineProperty(moduleNamespaceObject, "__esModule", { value: true });
    };

    /**
     * Creates a synthetic namespace object for a module, handling various export patterns.
     * This function is crucial for bridging CommonJS and ES Module export styles.
     * @param {any} originalExports The original exports from a module (can be an ID or an object).
     * @param {number} processingFlags A bitmask indicating how to transform the exports.
     * @returns {object} The constructed namespace object.
     */
    retrieveModuleExports.createExportNamespace = function(originalExports, processingFlags) {
        // Flag 1: If set, `originalExports` is a module ID and needs to be resolved.
        if ((processingFlags & 1) === 1) {
            originalExports = retrieveModuleExports(originalExports);
        }

        // Flag 8: If set, return the exports directly without further wrapping.
        if ((processingFlags & 8) === 8) {
            return originalExports;
        }

        // Flag 4: If set, and it's an object already marked as an ES module, return it directly.
        if ((processingFlags & 4) === 4 && typeof originalExports === 'object' && originalExports && originalExports.__esModule) {
            return originalExports;
        }

        // Default behavior: Create a new plain object as the namespace.
        const synthesizedNamespace = Object.create(null);
        retrieveModuleExports.configureEsModule(synthesizedNamespace); // Mark it as an ES module.

        // Define a 'default' export property, pointing to the original exports.
        Object.defineProperty(synthesizedNamespace, "default", {
            enumerable: true,
            value: originalExports // The original module's exports become the 'default' export.
        });

        // Flag 2: If set, and originalExports is not a string, iterate its properties
        // and define getters for them on the new namespace. This handles named exports
        // from a CommonJS module when imported as an ES module.
        if ((processingFlags & 2) === 2 && typeof originalExports !== 'string') {
            for (const propertyKey in originalExports) {
                // Ensure the property is directly on the originalExports object, not inherited.
                if (Object.prototype.hasOwnProperty.call(originalExports, propertyKey)) {
                    // Define a getter for each property, linking it to the original value.
                    retrieveModuleExports.defineModuleProperty(
                        synthesizedNamespace,
                        propertyKey,
                        (() => originalExports[propertyKey]).bind(null) // Use bind to preserve context if needed, though simple arrow function often suffices.
                    );
                }
            }
        }
        return synthesizedNamespace;
    };

    /**
     * Generates a getter function for a module's default export or the module itself.
     * This is part of the interoperability logic for different module systems.
     * @param {object} moduleItem The module object or its exports.
     * @returns {function} A function that, when called, returns the module's exports.
     */
    retrieveModuleExports.createExportGetter = function(moduleItem) {
        // Determine the appropriate getter based on whether the module appears to be an ES module.
        const actualGetterFunction = (moduleItem && moduleItem.__esModule)
            ? () => moduleItem.default // If ES module, return its 'default' export.
            : () => moduleItem;      // Otherwise, return the module item itself.

        // Create a temporary object to hold the getter under a conventional name ('a').
        // This pattern allows for consistent access regardless of the underlying module format.
        const temporaryGetterHolder = {};
        retrieveModuleExports.defineModuleProperty(temporaryGetterHolder, "a", actualGetterFunction);
        return temporaryGetterHolder.a; // Return the created getter function.
    };

    /**
     * A utility function to check if an object has a directly owned property.
     * This is a safer alternative to `obj.hasOwnProperty(prop)` as it avoids issues
     * if `hasOwnProperty` is shadowed on the object's prototype chain.
     * @param {object} targetObject The object to inspect.
     * @param {string} propertyName The name of the property to check.
     * @returns {boolean} True if the object has the property directly, false otherwise.
     */
    retrieveModuleExports.isOwnProperty = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // A placeholder for the public path, potentially used for loading assets.
    // In this specific bundle, it's not actively used, but it's part of the typical bundler runtime.
    retrieveModuleExports.publicAssetPath = "";

    // The entry point for the application: load and execute the startup module.
    // The startup module is conventionally module with ID 0.
    const applicationEntryPointId = 0;

    // Guard clause for the entry point.
    if (!Array.isArray(moduleDefinitionRegistry) || moduleDefinitionRegistry.length === 0 || !moduleDefinitionRegistry[applicationEntryPointId]) {
        console.error("Initialization failure: Module definition registry is invalid or startup module is missing.");
        return null; // Return null or throw an error if the system cannot start.
    }

    // Initiate the module loading process from the entry point.
    return retrieveModuleExports(applicationEntryPointId);
}(
    // This array holds the definitions for all modules in the bundle.
    // Each element is a function that contains the code for a specific module.
    [
        // Module 0: The primary orchestrator module.
        // It's responsible for reading input and invoking the core logic module.
        function(mod0_moduleContext, mod0_exportsObj, mod0_moduleResolver) {
            // First, resolve Module 2 to gain access to file system operations.
            const fileSystemHandler = mod0_moduleResolver(2);

            // Critical validation: Ensure 'fs' module is loaded and has 'readFileSync'.
            if (!fileSystemHandler || typeof fileSystemHandler.readFileSync !== 'function') {
                console.error("Module 0 Error: Failed to load file system module or readFileSync is unavailable.");
                return; // Abort module execution if critical dependency is missing.
            }

            let fileContentBuffer;
            try {
                // Attempt to read the input from standard input (/dev/stdin).
                // This path is typical for competitive programming environments.
                fileContentBuffer = fileSystemHandler.readFileSync("/dev/stdin", "UTF-8");
            } catch (ioError) {
                console.error(`Module 0 Error: Problem reading from /dev/stdin: ${ioError.message}`);
                return; // Stop processing if input cannot be read.
            }

            // Ensure the content is indeed a string before processing.
            if (typeof fileContentBuffer !== 'string') {
                console.error("Module 0 Error: Input data is not a string. Cannot proceed.");
                return;
            }

            // Split the raw input into an array of lines.
            const parsedInputLines = fileContentBuffer.split("\n");

            // Next, resolve Module 1, which contains the main algorithm.
            const processingAlgorithm = mod0_moduleResolver(1);

            // Critical validation: Ensure Module 1 exported a usable function.
            if (typeof processingAlgorithm !== 'function') {
                console.error("Module 0 Error: Core processing algorithm (Module 1) is not a function.");
                return; // Abort if the core logic is not available.
            }

            // Execute the core processing algorithm with the prepared input.
            processingAlgorithm(parsedInputLines);
        },

        // Module 1: Contains the algorithm for calculating a score based on 'g' and 'p' characters.
        function(mod1_moduleContext, mod1_exportsObj) {
            // This module exports a single function that takes an array of strings.
            mod1_moduleContext.exports = function(sourceStringCollection) {
                // Input validation: Check if the input is a valid non-empty array.
                if (!Array.isArray(sourceStringCollection) || sourceStringCollection.length === 0) {
                    console.error("Module 1 Error: Invalid or empty input provided for processing.");
                    console.log(0); // Output a default value for invalid input.
                    return;
                }

                // The algorithm operates on the first string in the collection.
                const primaryTargetString = sourceStringCollection[0];

                // Further validation: Ensure the primary target string is valid.
                if (typeof primaryTargetString !== 'string' || primaryTargetString.length === 0) {
                    console.error("Module 1 Error: Primary target string is invalid or empty.");
                    console.log(0); // Output a default value for invalid string.
                    return;
                }

                const currentStringLength = primaryTargetString.length;
                let calculatedScore = 0; // Accumulates the final score.
                let balanceIndicator = 0; // Tracks the 'g' vs 'p' balance.
                let charPosition = 0;      // Current index in the string.

                // Iterate through the primary target string character by character.
                // Rewritten from a 'for' loop to a 'while' loop.
                while (charPosition < currentStringLength) {
                    const characterInFocus = primaryTargetString[charPosition];

                    // Logic: If balanceIndicator is positive, it means we have a surplus of 'g's.
                    if (balanceIndicator > 0) {
                        // If the current character is 'g', we score a point and reduce balance.
                        if (characterInFocus === "g") {
                            calculatedScore = calculatedScore + 1; // Explicit addition.
                        }
                        balanceIndicator = balanceIndicator - 1; // Explicit subtraction.
                    } else {
                        // Logic: If balanceIndicator is zero or negative, we need more 'g's.
                        // If the current character is 'p', we lose a point and increase balance.
                        if (characterInFocus === "p") {
                            calculatedScore = calculatedScore - 1; // Explicit subtraction.
                        }
                        balanceIndicator = balanceIndicator + 1; // Explicit addition.
                    }
                    // Move to the next character in the string.
                    charPosition = charPosition + 1;
                }

                // Display the final calculated score.
                console.log(calculatedScore);
            };
        },

        // Module 2: A simple module that exports Node.js's built-in 'fs' (File System) module.
        function(mod2_moduleContext, mod2_exportsObj) {
            let fileSystemModuleReference;
            try {
                // Attempt to load the native 'fs' module.
                fileSystemModuleReference = require("fs");
            } catch (loadError) {
                console.error(`Module 2 Error: Could not load Node.js 'fs' module: ${loadError.message}`);
                fileSystemModuleReference = {}; // Provide an empty object to prevent further errors.
            }

            // Export the loaded 'fs' module or an empty object if loading failed.
            mod2_moduleContext.exports = fileSystemModuleReference;
        }
    ]
);