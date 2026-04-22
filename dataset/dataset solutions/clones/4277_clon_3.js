// A custom module provisioning system, designed for internal component management.
module.exports = function(componentRegistry) {
    // Cache for already loaded components, preventing redundant execution.
    const componentCache = {};

    /**
     * Retrieves or loads a component by its unique identifier.
     * @param {number} componentId - The unique ID of the component to retrieve.
     * @returns {object} The exports of the requested component.
     */
    function obtainExportedComponent(componentId) {
        // If the component is already in our cache, return its exports immediately.
        if (componentCache[componentId]) {
            return componentCache[componentId].exports;
        }

        // Validate that the component definition exists before proceeding.
        if (!componentRegistry[componentId]) {
            console.error(`Error: Component with ID ${componentId} not found in registry.`);
            throw new Error(`Missing component definition for ID: ${componentId}`);
        }

        // Prepare a new context for the component, mark it as not yet fully loaded.
        const currentModuleContext = componentCache[componentId] = {
            componentIdentifier: componentId,
            loadingInProgress: true, // Flag to indicate loading state
            exports: {}
        };

        // Execute the component's factory function, passing the module context,
        // its exports object, and our custom require function.
        const componentFactory = componentRegistry[componentId];
        componentFactory.call(
            currentModuleContext.exports,
            currentModuleContext,
            currentModuleContext.exports,
            obtainExportedComponent
        );

        // Mark the component as fully loaded after execution.
        currentModuleContext.loadingInProgress = false;
        return currentModuleContext.exports;
    }

    // Store the component registry and cache for internal use by helper functions.
    obtainExportedComponent.registry = componentRegistry;
    obtainExportedComponent.cache = componentCache;

    /**
     * Defines a getter property on an object, ensuring it's enumerable.
     * @param {object} targetObj - The object to define the property on.
     * @param {string} propName - The name of the property.
     * @param {function} propGetter - The getter function for the property.
     */
    obtainExportedComponent.defineLazyProperty = function(targetObj, propName, propGetter) {
        // Perform a quick check for valid inputs before proceeding.
        if (!targetObj || typeof propName !== 'string' || typeof propGetter !== 'function') {
            console.warn("Invalid arguments for defineLazyProperty.");
            return;
        }
        // Only define if the property doesn't already exist to prevent overwrites.
        if (!Object.prototype.hasOwnProperty.call(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true,
                get: propGetter
            });
        }
    };

    /**
     * Marks an object as an ES Module, adding __esModule and Symbol.toStringTag properties.
     * @param {object} targetExportObject - The object to mark as an ES Module.
     */
    obtainExportedComponent.markAsESModule = function(targetExportObject) {
        if (typeof targetExportObject !== 'object' || targetExportObject === null) {
            console.warn("Attempted to mark a non-object as an ES module.");
            return;
        }
        // If Symbol is available and toStringTag is supported, set it.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetExportObject, Symbol.toStringTag, { value: "Module" });
        }
        // Always set __esModule for module identification.
        Object.defineProperty(targetExportObject, "__esModule", { value: true });
    };

    /**
     * Generates an interop default export for a module, based on provided flags.
     * This handles various module types (commonjs, esm, etc.).
     * @param {any} originalModuleExports - The raw exports of the module.
     * @param {number} conversionFlags - Flags indicating how to process the exports.
     * @returns {object} An object with a default export, conforming to ES Module spec.
     */
    obtainExportedComponent.createInteropObject = function(originalModuleExports, conversionFlags) {
        let processedExports = originalModuleExports;

        // Flag 1 (0b0001): If set, the originalModuleExports is a module ID, so resolve it.
        if ((conversionFlags & 1) === 1) {
            processedExports = obtainExportedComponent(originalModuleExports);
        }

        // Flag 8 (0b1000): If set, return the processed exports directly (no further wrapping).
        if ((conversionFlags & 8) === 8) {
            return processedExports;
        }

        // Flag 4 (0b0100): If set and it's an object and already an ES module, return it directly.
        if (((conversionFlags & 4) === 4) && typeof processedExports === 'object' && processedExports !== null && processedExports.__esModule) {
            return processedExports;
        }

        // Create a new namespace object for the interop, starting as an empty object.
        const interoperableNamespace = Object.create(null);
        // Mark this new object as an ES Module.
        obtainExportedComponent.markAsESModule(interoperableNamespace);

        // Define the 'default' export which points to the processed module exports.
        obtainExportedComponent.defineLazyProperty(interoperableNamespace, "default", () => processedExports);

        // Flag 2 (0b0010): If set and the processed exports are not a string, copy all enumerable properties.
        if (((conversionFlags & 2) === 2) && typeof processedExports !== 'string') {
            for (const exportKey in processedExports) {
                // Ensure it's an own property and not the 'default' key which is already handled.
                if (Object.prototype.hasOwnProperty.call(processedExports, exportKey) && exportKey !== 'default') {
                    obtainExportedComponent.defineLazyProperty(interoperableNamespace, exportKey, () => processedExports[exportKey]);
                }
            }
        }
        return interoperableNamespace;
    };

    /**
     * Creates a getter function for a module's default export, often used for `__esModule` checks.
     * This function is primarily used by bundlers to provide a consistent way to access defaults.
     * @param {object} moduleContent - The raw module content.
     * @returns {function} A getter that returns the default export.
     */
    obtainExportedComponent.getDefaultExportGetter = function(moduleContent) {
        // Determine the appropriate getter based on whether the module is already an ES module.
        const defaultGetter = (moduleContent && typeof moduleContent === 'object' && moduleContent.__esModule) ?
            function() { return moduleContent.default; } :
            function() { return moduleContent; };

        // Define an alias 'a' for the default getter, common in bundlers for shorthand access.
        obtainExportedComponent.defineLazyProperty(defaultGetter, "a", defaultGetter);
        return defaultGetter;
    };

    // The entry point for the application, initiating the loading of the main module (ID 0).
    // This is equivalent to setting a startup module ID and then calling the loader with it.
    const startupModuleIdentifier = 0;
    return obtainExportedComponent(startupModuleIdentifier);
}([
    // --- Component 0: Main Application Loader ---
    // This component is responsible for reading input and passing it to the core processing logic.
    function(moduleContext, exportsContext, localComponentResolver) {
        // Obtain the file system utility component.
        const fileSystemUtility = localComponentResolver(2);

        // Obtain the main string processing component.
        const stringProcessor = localComponentResolver(1);

        // Read the input from standard input, ensuring UTF-8 encoding.
        // Using process.stdin.fd for more robust Node.js compatibility across environments.
        const rawInputData = fileSystemUtility.readFileSync(process.stdin.fd, { encoding: 'utf8' });

        // Pass the raw input data to the string processing component for processing.
        stringProcessor(rawInputData);
    },

    // --- Component 1: Wildcard String Restoration Logic ---
    // This component attempts to restore a string by replacing '?' wildcards with a pattern.
    function(inputDataPayload) {
        // Basic input validation: ensure we have a string to work with and it's not empty.
        if (typeof inputDataPayload !== 'string' || inputDataPayload.trim().length === 0) {
            console.error("Input data for string restoration is invalid or empty. Processing halted.");
            return; // Exit if input is bad.
        }

        // Split the input into lines. The first line is the main text, the second is the pattern.
        const contentLines = inputDataPayload.split('\n');
        // A minimum of two lines are required: one for the primary text and one for the search pattern.
        if (contentLines.length < 2) {
            console.log("UNRESTORABLE"); // Not enough lines for main and pattern.
            return;
        }

        const primaryText = contentLines[0];
        const searchPattern = contentLines[1];

        const primaryTextLength = primaryText.length;
        const patternLength = searchPattern.length;

        let foundMatchIndex = -1; // Initialize to -1, indicating no match found yet.

        // Early exit: If the pattern is longer than the text, it's impossible to find.
        if (patternLength > primaryTextLength) {
            console.log("UNRESTORABLE");
            return;
        }

        /**
         * Helper function to check if a substring of the main text matches the pattern
         * at a given starting position, considering '?' as a wildcard.
         * @param {string} text - The main text to search within.
         * @param {string} pattern - The pattern to match.
         * @param {number} startIndex - The starting index in the text to compare.
         * @returns {boolean} True if a match is found, false otherwise.
         */
        const checkWildcardMatch = (text, pattern, startIndex) => {
            // Ensure the potential match does not go out of bounds.
            if (startIndex < 0 || startIndex + pattern.length > text.length) {
                return false;
            }

            let isCurrentSegmentMatching = true;
            let charPos = 0;
            // Iterate through the pattern to compare characters.
            while (charPos < pattern.length) {
                const textChar = text[startIndex + charPos];
                const patternChar = pattern[charPos];

                // If characters don't match and the text character is not a wildcard '?',
                // then this segment is not a match.
                if (textChar !== patternChar && textChar !== '?') {
                    isCurrentSegmentMatching = false;
                    break;
                }
                charPos++;
            }
            return isCurrentSegmentMatching;
        };

        // Iterate backwards from the last possible starting position to the first.
        // This ensures finding the rightmost match as per the original problem specification.
        let currentScanPosition = primaryTextLength - patternLength;
        while (currentScanPosition >= 0) {
            if (checkWildcardMatch(primaryText, searchPattern, currentScanPosition)) {
                foundMatchIndex = currentScanPosition;
                break; // Found the rightmost valid match, exit loop early.
            }
            currentScanPosition--;
        }

        // After the scan, evaluate the result.
        // If no match was found or if the pattern itself was empty (which is usually unmatchable meaningfully).
        if (foundMatchIndex === -1 || patternLength === 0) {
            console.log("UNRESTORABLE");
        } else {
            // Construct the restored string by splicing the pattern into the primary text.
            // This replaces the wildcard-matched segment with the exact search pattern.
            const prefix = primaryText.substring(0, foundMatchIndex);
            const suffix = primaryText.substring(foundMatchIndex + patternLength);
            let restoredString = prefix + searchPattern + suffix;

            // Finally, replace any remaining '?' wildcards in the *entire* restored string with 'a'.
            // This ensures all ambiguities are resolved to a concrete character.
            // Using a loop for character-by-character replacement for variety, instead of regex.
            let finalOutput = '';
            for (let k = 0; k < restoredString.length; k++) {
                finalOutput += (restoredString[k] === '?') ? 'a' : restoredString[k];
            }

            console.log(finalOutput);
        }
    },

    // --- Component 2: Node.js File System Module ---
    // This component simply exports the Node.js 'fs' module to make it available within the custom module system.
    function(moduleContext, exportsContext) {
        // Directly assign the 'fs' module from the Node.js global environment to this component's exports.
        // Using `global.require` for explicit access to the Node.js built-in require.
        moduleContext.exports = global.require('fs');
    }
]);