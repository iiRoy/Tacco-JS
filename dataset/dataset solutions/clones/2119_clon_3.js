(function(componentDefinitions) {
    // This is a custom module loading system, inspired by common bundlers.
    // It manages and resolves JavaScript components.
    var registeredComponents = {};

    // The central function for resolving and loading components.
    function _moduleResolver_(componentId) {
        // Check if the component has already been loaded and cached.
        if (registeredComponents[componentId]) {
            return registeredComponents[componentId].exportedItems;
        }

        // If not, create a new entry for this component in the cache.
        var currentComp = registeredComponents[componentId] = {
            identifier: componentId,     // Unique ID for the component
            loadedStatus: false,         // Flag indicating if component code was executed
            exportedItems: {}            // Object to hold the component's exports
        };

        // Execute the component's definition function.
        // The context ('this') for the component function is its exports object.
        // Arguments passed: (module, module.exports, __moduleResolver__)
        componentDefinitions[componentId].call(currentComp.exportedItems, currentComp, currentComp.exportedItems, _moduleResolver_);

        // After execution, mark the component as loaded.
        currentComp.loadedStatus = true;

        // Return the collected exports from the component.
        return currentComp.exportedItems;
    }

    // Attach the raw component definitions to the resolver for inspection.
    _moduleResolver_.componentMap = componentDefinitions;

    // Attach the cache of loaded components to the resolver.
    _moduleResolver_.componentCache = registeredComponents;

    // Helper to define a getter for ES Module compatibility.
    _moduleResolver_.defineExportProperty = function(exportObjectTarget, propertyNameString, valueGetterFn) {
        // Only define if the property does not already exist on the target.
        if (!_moduleResolver_.hasDirectProperty(exportObjectTarget, propertyNameString)) {
            Object.defineProperty(exportObjectTarget, propertyNameString, {
                enumerable: true, // Make the property enumerable
                get: valueGetterFn // Use the provided function to get its value
            });
        }
    };

    // Marks an exports object as an ECMAScript Module.
    _moduleResolver_.markAsEsModule = function(exportObjectTarget) {
        // Set Symbol.toStringTag for better debugging in modern environments.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportObjectTarget, Symbol.toStringTag, { value: 'Module' });
        }
        // Explicitly set __esModule to true, a common convention.
        Object.defineProperty(exportObjectTarget, '__esModule', { value: true });
    };

    // Creates a simulated namespace object for various import scenarios.
    _moduleResolver_.createVirtualNamespace = function(importSourceValue, importOperationMode) {
        // Mode & 1: If value is a component ID, load it first.
        if (importOperationMode & 1) importSourceValue = _moduleResolver_(importSourceValue);
        // Mode & 8: If behaving like 'require', return the value directly.
        if (importOperationMode & 8) return importSourceValue;
        // Mode & 4: If value is already an ES module namespace, return it.
        if ((importOperationMode & 4) && typeof importSourceValue === 'object' && importSourceValue && importSourceValue.__esModule) return importSourceValue;

        // Otherwise, construct a new namespace object.
        var namespaceProxy = Object.create(null);
        _moduleResolver_.markAsEsModule(namespaceProxy); // Mark it as an ES module.
        Object.defineProperty(namespaceProxy, 'default', { enumerable: true, value: importSourceValue }); // Set the default export.

        // Mode & 2: Merge all properties from the original value into the namespace.
        if (importOperationMode & 2 && typeof importSourceValue != 'string') {
            for (var exportKeyName in importSourceValue) {
                _moduleResolver_.defineExportProperty(namespaceProxy, exportKeyName, (function(key) {
                    return importSourceValue[key];
                }).bind(null, exportKeyName));
            }
        }
        return namespaceProxy;
    };

    // Provides a getter for the default export, handling both ES modules and CommonJS.
    _moduleResolver_.resolveDefaultExport = function(incomingModule) {
        var defaultExportGetter = incomingModule && incomingModule.__esModule ?
            function getDefaultEsExport() { return incomingModule['default']; } :
            function getCommonJsExport() { return incomingModule; };
        // Define a property 'a' (common alias) that points to the default getter.
        _moduleResolver_.defineExportProperty(defaultExportGetter, 'a', defaultExportGetter);
        return defaultExportGetter;
    };

    // Checks if an object has a direct property, using Object.prototype.hasOwnProperty.
    _moduleResolver_.hasDirectProperty = function(targetEntity, propertyKeyIdentifier) {
        return Object.prototype.hasOwnProperty.call(targetEntity, propertyKeyIdentifier);
    };

    // The base path for public assets, often used in dynamic imports.
    _moduleResolver_.baseAssetPath = "";

    // Load the designated entry component and return its top-level exports.
    return _moduleResolver_(_moduleResolver_.entryComponent = "./project/entrypoint/solver.js");
})
({

    // Component definition for the main problem solver.
    "./project/entrypoint/solver.js":
        (function(currentComp, exportedItems, _moduleResolver_) {
            // Include a utility for file system operations, loaded via the resolver.
            const fileSystemHandler = _moduleResolver_("fs");
            // Constant to represent an invalid or unresolvable result.
            const INVALID_CALCULATION_RESULT = -1;

            /**
             * Processes the raw input string to find the smallest valid number
             * satisfying given digit constraints.
             * @param {string} rawInputString - The complete input data as a string.
             */
            const processInputData = (rawInputString) => {
                const inputLineArray = rawInputString.trim().split('\n');

                // Parse the first line for number of digits (N) and number of constraints (M).
                const configValues = inputLineArray.shift().split(' ').map(Number);
                const numDigits = configValues[0];
                const numConstraints = configValues[1];

                // --- Input validation and early exit checks ---
                if (isNaN(numDigits) || isNaN(numConstraints) ||
                    numDigits < 1 || numDigits > 7 || // Constraints on N (e.g., max 7 digits)
                    numConstraints < 0 ||
                    inputLineArray.length < numConstraints) // Ensure enough lines for constraints
                {
                    console.log(INVALID_CALCULATION_RESULT);
                    return;
                }

                // Initialize an array to hold the candidate digits for the solution.
                // Using 'null' to indicate an unset digit.
                let solutionCandidate = new Array(numDigits).fill(null);

                // --- Apply constraints from input lines ---
                for (let k = 0; k < numConstraints; k++) {
                    const currentConstraint = inputLineArray.shift().split(' ').map(Number);
                    const constraintPosition = currentConstraint[0] - 1; // Convert to 0-indexed position
                    const constraintDigit = currentConstraint[1];

                    // Validate individual constraint values.
                    if (isNaN(constraintPosition) || isNaN(constraintDigit) ||
                        constraintPosition < 0 || constraintPosition >= numDigits ||
                        constraintDigit < 0 || constraintDigit > 9)
                    {
                        console.log(INVALID_CALCULATION_RESULT);
                        return;
                    }

                    // Check for conflicting constraints on the same position.
                    if (solutionCandidate[constraintPosition] !== null && solutionCandidate[constraintPosition] !== constraintDigit) {
                        console.log(INVALID_CALCULATION_RESULT);
                        return;
                    }

                    // Apply the valid constraint.
                    solutionCandidate[constraintPosition] = constraintDigit;
                }

                // --- Handle special conditions for the first digit (no leading zeros) ---
                if (numDigits > 1) { // Only relevant for numbers with more than one digit
                    // If the first digit is explicitly set to 0, it's invalid.
                    if (solutionCandidate[0] === 0) {
                        console.log(INVALID_CALCULATION_RESULT);
                        return;
                    }
                    // If the first digit is unset (null), default it to 1 (smallest non-zero digit).
                    if (solutionCandidate[0] === null) {
                        solutionCandidate[0] = 1;
                    }
                } else if (numDigits === 1) { // Special case for a single-digit number
                    // If the single digit is unset, default it to 0 (smallest single digit).
                    if (solutionCandidate[0] === null) {
                        solutionCandidate[0] = 0;
                    }
                }

                // --- Fill in any remaining unset digits with 0 ---
                for (let idx = 0; idx < numDigits; idx++) {
                    if (solutionCandidate[idx] === null) {
                        solutionCandidate[idx] = 0;
                    }
                }

                // --- Final validation for leading zero after all filling ---
                // This is a redundant check if logic above is perfect, but adds robustness.
                if (numDigits > 1 && solutionCandidate[0] === 0) {
                    console.log(INVALID_CALCULATION_RESULT);
                    return;
                }

                // Concatenate the digits to form the final number string.
                const finalResult = solutionCandidate.join('');
                console.log(finalResult);
            };

            // Read input from standard input and execute the solver.
            processInputData(fileSystemHandler.readFileSync('/dev/stdin', 'utf8'));
        }),

    // External module definition for Node.js 'fs' (file system) module.
    "fs":
        (function(currentComp, exportedItems) {
            // For external modules like 'fs', we directly assign the Node.js 'require' result.
            currentComp.exportedItems = require("fs");
        })
});