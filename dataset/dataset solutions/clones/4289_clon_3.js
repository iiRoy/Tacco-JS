// This module defines a custom module loading and execution system,
// inspired by bundler runtimes like Webpack. It takes a collection of
// module definitions and provides an environment for them to interact.
module.exports = function(moduleDefinitionMap) {
    // A private cache to store module instances once they have been loaded
    // and initialized. This prevents redundant execution of module code.
    const loadedModuleCache = {};

    /**
     * Resolves and loads a module by its unique numeric identifier.
     * This function acts as the core 'require' mechanism within the custom module system.
     *
     * @param {number} targetModuleId - The numeric ID of the module to be loaded.
     * @returns {object} The exports object of the specified module.
     * @throws {Error} If the module definition is invalid or execution fails.
     */
    function resolveAndLoadModule(targetModuleId) {
        // Step 1: Check if the module is already present in the cache.
        // If so, return its exports immediately to ensure single instance per module.
        if (loadedModuleCache[targetModuleId]) {
            // console.debug(`[ModuleLoader] Returning cached module for ID: ${targetModuleId}`);
            return loadedModuleCache[targetModuleId].moduleExports;
        }

        // Step 2: If the module is not cached, prepare a new module state object.
        // This object will hold the module's metadata and its exports.
        const currentModuleState = loadedModuleCache[targetModuleId] = {
            idReference: targetModuleId,       // The internal identifier for this module.
            hasBeenInitialized: false,   // Flag to track if the module's factory function has run.
            moduleExports: {}            // The object where the module's public interface will be attached.
        };

        // Step 3: Validate the module definition before attempting execution.
        // Each module definition is expected to be a function.
        const moduleFactoryFunction = moduleDefinitionMap[targetModuleId];
        if (typeof moduleFactoryFunction !== 'function') {
            console.error(`[ModuleLoader] Critical Error: Module definition for ID ${targetModuleId} is missing or not a function.`);
            throw new Error(`Invalid or missing module factory for ID: ${targetModuleId}`);
        }

        // console.debug(`[ModuleLoader] Initializing module for ID: ${targetModuleId}`);
        try {
            // Step 4: Execute the module's factory function.
            // It receives the module state, its exports object, and the
            // `resolveAndLoadModule` function itself for internal dependencies.
            // Using `apply` allows for explicit argument passing.
            moduleFactoryFunction.apply(null, [
                currentModuleState,           // The module object (e.g., `module` in CommonJS).
                currentModuleState.moduleExports, // The exports object (e.g., `exports` in CommonJS).
                resolveAndLoadModule          // The local resolver for dependencies (e.g., `require`).
            ]);
        } catch (executionError) {
            console.error(`[ModuleLoader] Failed to execute module ID ${targetModuleId}:`, executionError.message);
            // Depending on the context, one might want to rethrow, log more, or provide fallback.
            throw executionError;
        }

        // Step 5: Mark the module as fully initialized.
        currentModuleState.hasBeenInitialized = true;
        // console.debug(`[ModuleLoader] Module ID ${targetModuleId} loaded successfully.`);

        // Step 6: Return the module's exports.
        return currentModuleState.moduleExports;
    }

    // --- Utility functions attached to the main resolver, mimicking bundler internals ---

    // Store references to the module map and cache for potential debugging or external access.
    resolveAndLoadModule.moduleRegistry = moduleDefinitionMap;
    resolveAndLoadModule.cacheReference = loadedModuleCache;

    /**
     * Defines an enumerable getter property on a target object.
     * This is commonly used for lazy-loading exports or dynamic property access.
     *
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propName - The name of the property to define.
     * @param {Function} propertyGetter - A function that returns the value of the property.
     */
    resolveAndLoadModule.defineExportGetter = function(targetObj, propName, propertyGetter) {
        // Only define if the property doesn't already exist to avoid errors or unintended overwrites.
        if (!resolveAndLoadModule.checkOwnProperty(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true, // Make the property discoverable during enumeration.
                get: propertyGetter // The function to call when the property is accessed.
            });
            // console.debug(`[ModuleLoader] Defined getter for ${propName} on an export object.`);
        }
    };

    /**
     * Marks an exports object as an ECMAScript Module (ESM).
     * This adds standard properties like `__esModule: true` and `Symbol.toStringTag`.
     *
     * @param {object} exportsObj - The module's exports object to mark.
     */
    resolveAndLoadModule.setupESModuleFlag = function(exportsObj) {
        // Set Symbol.toStringTag for better console inspection and type checking.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObj, Symbol.toStringTag, { value: 'Module' });
        }
        // Set __esModule flag, a common convention for indicating ES module exports.
        Object.defineProperty(exportsObj, '__esModule', { value: true });
        // console.debug(`[ModuleLoader] Marked an object as an ES Module.`);
    };

    /**
     * Creates an interoperability namespace object for a module.
     * This function helps bridge the gap between CommonJS and ES module import/export styles.
     *
     * @param {any} moduleValue - The raw value of the module's exports.
     * @param {number} interopFlags - A bitmask of flags dictating interop behavior.
     * @returns {object} An ES module-compatible namespace object.
     */
    resolveAndLoadModule.interopNamespaceObject = function(moduleValue, interopFlags) {
        // If the first bit is set, it means `moduleValue` is a module ID, so resolve it.
        if (interopFlags & 1) { // Equivalent to webpack's `__webpack_require__` flag
            moduleValue = resolveAndLoadModule(moduleValue);
        }

        // If the eighth bit is set, the module value is already a namespace object.
        if (interopFlags & 8) { // Equivalent to webpack's `__webpack_exports__` flag
            return moduleValue;
        }

        // If the fourth bit is set AND it's an object already marked as an ES module, return it directly.
        if ((interopFlags & 4) && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new, plain object to serve as the ES module namespace.
        const newNamespace = Object.create(null);
        // Mark this new object as an ES module.
        resolveAndLoadModule.setupESModuleFlag(newNamespace);

        // Define the 'default' export, which is the raw moduleValue.
        Object.defineProperty(newNamespace, 'default', { enumerable: true, value: moduleValue });

        // If the second bit is set AND the moduleValue is an object (not a string),
        // re-export all its properties as named exports on the new namespace.
        if ((interopFlags & 2) && typeof moduleValue !== 'string') { // Equivalent to `__webpack_reexport_all__`
            for (const propertyKey in moduleValue) {
                if (resolveAndLoadModule.checkOwnProperty(moduleValue, propertyKey)) {
                    resolveAndLoadModule.defineExportGetter(newNamespace, propertyKey,
                        ((key) => () => moduleValue[key]).bind(null, propertyKey)
                    );
                }
            }
        }
        return newNamespace;
    };

    /**
     * Creates a thunk (a function) that returns the 'default' export of a module.
     * This is crucial for compatibility when importing CommonJS modules as ES modules.
     *
     * @param {object} moduleToWrap - The module's exports object.
     * @returns {Function} A function that, when called, returns the module's default export.
     */
    resolveAndLoadModule.createDefaultExportThunk = function(moduleToWrap) {
        // Determine the actual default export: if it's an ES module, use its .default; otherwise, use the module itself.
        const defaultExportGetter = moduleToWrap && moduleToWrap.__esModule
            ? () => moduleToWrap.default
            : () => moduleToWrap;

        // For compatibility (e.g., webpack's `n.n`), also define a getter for 'a' that returns the default.
        resolveAndLoadModule.defineExportGetter(defaultExportGetter, 'a', defaultExportGetter);
        // console.debug(`[ModuleLoader] Created default export thunk.`);
        return defaultExportGetter;
    };

    /**
     * A utility function to check if an object has a property directly on itself (not inherited).
     * This is a safer alternative to `obj.hasOwnProperty()` in some contexts.
     *
     * @param {object} targetObj - The object to inspect.
     * @param {string} propertyKey - The name of the property to check for.
     * @returns {boolean} True if the property exists directly on the object, false otherwise.
     */
    resolveAndLoadModule.checkOwnProperty = function(targetObj, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObj, propertyKey);
    };

    // Placeholder for the public path of assets, often used for dynamic imports or asset URLs.
    // In this simplified setup, it remains an empty string.
    resolveAndLoadModule.assetPublicPath = "";

    // --- Application Entry Point Execution ---
    // This is where the application truly starts. It sets the entry module ID
    // and immediately triggers its loading and execution.
    resolveAndLoadModule.entryPointModuleIdentifier = 0;
    console.log("[ModuleSystem] Starting application initialization via entry module...");
    const finalApplicationOutput = resolveAndLoadModule(resolveAndLoadModule.entryPointModuleIdentifier);
    console.log("[ModuleSystem] Application initialization complete.");

    // The result of the entry module (if it returns anything) could be further processed here.
    return finalApplicationOutput;

// The array of module definitions that constitutes our application.
// Each element in this array corresponds to a module ID.
}([
    // --- Module 0: Primary Application Entry Point ---
    // This module is responsible for reading input, orchestrating other modules,
    // and presenting the final result.
    function(entryModuleState, entryModuleExports, localModuleResolver) {
        // console.debug("[AppEntry] Entry module (ID 0) started.");

        let fileSystemAccess;
        try {
            // Dynamically load the filesystem utility module (Module ID 2).
            fileSystemAccess = localModuleResolver(2);
            if (!fileSystemAccess || typeof fileSystemAccess.readFileSync !== 'function') {
                throw new Error("Filesystem module (ID 2) not found or invalid (missing readFileSync).");
            }
        } catch (fsLoadError) {
            console.error("Fatal Error: Cannot load filesystem services. Aborting.", fsLoadError.message);
            // In a production environment, this might trigger a graceful shutdown or error page.
            return; // Stop execution of this module.
        }

        let palindromeTransformationProcessor;
        try {
            // Load the core logic module for palindrome processing (Module ID 1).
            palindromeTransformationProcessor = localModuleResolver(1);
            if (typeof palindromeTransformationProcessor !== 'function') {
                throw new Error("Palindrome processor module (ID 1) not found or invalid.");
            }
        } catch (processorLoadError) {
            console.error("Fatal Error: Cannot load palindrome processing logic. Aborting.", processorLoadError.message);
            return; // Stop execution.
        }

        let rawInputContent;
        try {
            // Attempt to read the raw input from standard input (/dev/stdin).
            // This is a synchronous operation, suitable for simple command-line tools.
            rawInputContent = fileSystemAccess.readFileSync("/dev/stdin", "UTF-8");
        } catch (inputReadError) {
            console.error("Input Error: Failed to read from /dev/stdin.", inputReadError.message);
            console.log("-1"); // Indicate an error state, as no input was processed.
            return;
        }

        // Prepare the input for the palindrome processor.
        // - Split by common newline characters (\n for Unix, \r\n for Windows).
        // - Trim whitespace from each line.
        // - Filter out any lines that become empty after trimming.
        const processedInputLines = rawInputContent
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (processedInputLines.length === 0) {
            console.log("No meaningful input lines were provided after cleaning. Exiting.");
            console.log("0"); // Or -1, depending on problem spec for empty input. Let's assume 0 for "already a palindrome".
            return;
        }

        // The palindrome processor expects an array of strings, with the primary target
        // being the first element.
        const outputResult = palindromeTransformationProcessor(processedInputLines);

        // Display the final computed result to the console.
        console.log(outputResult);
        // console.debug("[AppEntry] Entry module (ID 0) finished execution.");
    },

    // --- Module 1: Palindrome Wildcard Matching Logic ---
    // This module exports a function that calculates the minimum 'x' replacements
    // needed to make a string a palindrome, or indicates impossibility.
    function(palindromeModuleState, palindromeModuleExports) {
        // console.debug("[PalindromeProcessor] Module (ID 1) initialized.");

        /**
         * A small helper function to check if a character is our designated wildcard.
         * @param {string} charToEvaluate - The character to test.
         * @returns {boolean} True if the character is 'x', false otherwise.
         */
        const isWildcardSymbol = (charToEvaluate) => charToEvaluate === 'x';

        /**
         * Processes an array of strings to determine the minimum wildcard substitutions
         * required to make the first string a palindrome.
         *
         * @param {string[]} incomingStringArray - An array where the first element is the string to analyze.
         * @returns {number} The count of 'x' substitutions, or -1 if a palindrome is not achievable.
         */
        palindromeModuleExports.calculateMinWildcardSubstitutions = function(incomingStringArray) {
            // Input validation: Ensure we have a valid array with at least one string.
            if (!Array.isArray(incomingStringArray) || incomingStringArray.length === 0) {
                console.warn("[PalindromeProcessor] Received empty or invalid input array.");
                return -1; // Indicate error for invalid input.
            }

            const targetStringSequence = incomingStringArray[0];

            // Edge case: Empty or single-character strings are inherently palindromes, requiring 0 substitutions.
            if (targetStringSequence.length <= 1) {
                return 0;
            }

            let substitutionCounter = 0;
            let leftCursor = 0;
            let rightCursor = targetStringSequence.length - 1;
            let canFormPalindrome = true; // Flag to track if a palindrome is still feasible.

            // Iterate using two pointers, moving inwards from both ends of the string.
            while (leftCursor < rightCursor) {
                const charAtLeft = targetStringSequence[leftCursor];
                const charAtRight = targetStringSequence[rightCursor];

                if (charAtLeft === charAtRight) {
                    // Characters match, no substitution needed. Move both pointers inwards.
                    leftCursor++;
                    rightCursor--;
                } else if (isWildcardSymbol(charAtLeft)) {
                    // Left character is 'x'. It can be replaced by the right character.
                    substitutionCounter++;
                    leftCursor++; // Move left pointer.
                } else if (isWildcardSymbol(charAtRight)) {
                    // Right character is 'x'. It can be replaced by the left character.
                    substitutionCounter++;
                    rightCursor--; // Move right pointer.
                } else {
                    // Characters do not match, and neither is an 'x' wildcard.
                    // It's impossible to form a palindrome.
                    canFormPalindrome = false;
                    break; // Terminate the loop early.
                }
            }

            // Return the substitution count if a palindrome was possible, otherwise -1.
            return canFormPalindrome ? substitutionCounter : -1;
        };

        // For direct compatibility with CommonJS `require`, assign the main function
        // directly to `module.exports`.
        palindromeModuleState.exports = palindromeModuleExports.calculateMinWildcardSubstitutions;
    },

    // --- Module 2: Filesystem API Bridge ---
    // This module serves as a wrapper to expose Node.js's native 'fs' module
    // within our custom module loading system.
    function(fsModuleState, fsModuleExports) {
        // console.debug("[FilesystemBridge] Module (ID 2) initialized.");
        try {
            // Attempt to load the native Node.js 'fs' module.
            // This 'require' is the native Node.js require, not our custom one.
            const nativeFsModule = require("fs");
            // Assign the loaded native module to our module's exports.
            fsModuleExports = nativeFsModule;
            // Also assign to the module's state exports for full compatibility.
            fsModuleState.exports = nativeFsModule;
            // console.debug("[FilesystemBridge] Native 'fs' module loaded successfully.");
        } catch (error) {
            console.error("[FilesystemBridge] Error: Could not load native 'fs' module.", error.message);
            console.warn("[FilesystemBridge] This environment may not support Node.js 'fs' module operations.");
            // In case of failure, export an empty object to prevent downstream errors.
            fsModuleState.exports = {};
        }
    }
]);