const loadApplicationBundle = function (moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    // It prevents redundant execution and helps manage module dependencies.
    const internalModuleCache = {};

    /**
     * Core function to dynamically load and resolve a module from the bundle.
     * It mimics a `require` function within this custom runtime environment.
     * @param {number} requestedModuleId - The unique numerical identifier for the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function _loadAndResolveModule(requestedModuleId) {
        // If the module is already present in our cache, return its exports immediately.
        if (internalModuleCache[requestedModuleId]) {
            return internalModuleCache[requestedModuleId].exports;
        }

        // If the module isn't cached, create a new entry for it.
        const newModuleEntry = internalModuleCache[requestedModuleId] = {
            id: requestedModuleId,         // Store the module's identifier.
            isLoaded: false,               // Flag to indicate if the module's definition function has run.
            exports: {}                    // An empty object to be populated with the module's exports.
        };

        // Execute the module's definition function. This function is expected to populate `newModuleEntry.exports`.
        // It receives the module object, its exports object, and this `_loadAndResolveModule` function itself
        // (allowing modules to `require` other modules within the bundle).
        moduleDefinitions[requestedModuleId].call(
            newModuleEntry.exports,
            newModuleEntry,
            newModuleEntry.exports,
            _loadAndResolveModule
        );

        // Mark the module as loaded after its definition function has completed execution.
        newModuleEntry.isLoaded = true;

        // Return the exports object of the newly loaded module.
        return newModuleEntry.exports;
    }

    // --- Utility functions attached to the loader, mirroring Webpack's internal helpers ---

    // Stores a reference to the original module definitions array.
    _loadAndResolveModule.sourceModuleArray = moduleDefinitions;
    // Stores a reference to the internal module cache.
    _loadAndResolveModule.cachedModules = internalModuleCache;

    /**
     * Defines a getter property on an object, making it enumerable.
     * Used for lazy loading or computed exports.
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propName - The name of the property.
     * @param {function} getterFunc - The function to call when the property is accessed.
     */
    _loadAndResolveModule.defineGetterExport = function (targetObj, propName, getterFunc) {
        // Only define if the property doesn't already exist to avoid overwriting.
        if (!_loadAndResolveModule.checkOwnProperty(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true,
                get: getterFunc
            });
        }
    };

    /**
     * Marks an exports object as an ECMAScript module.
     * Adds `Symbol.toStringTag` and `__esModule` properties.
     * @param {object} exportsObject - The object to mark as an ES module.
     */
    _loadAndResolveModule.setESModuleFlag = function (exportsObject) {
        // Set Symbol.toStringTag for better module identification in debugging.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the __esModule flag, a common convention for ES modules in CommonJS interop.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    /**
     * Handles interoperability between different module types (CommonJS, ES modules).
     * @param {any} moduleRef - The module reference (either ID or actual module object).
     * @param {number} flags - Bitmask flags indicating how to process the module.
     * @returns {any} The processed module or a synthetic namespace object.
     */
    _loadAndResolveModule.handleModuleInterop = function (moduleRef, flags) {
        // Flag 1: If moduleRef is a module ID, resolve it first.
        if (flags & 1) moduleRef = _loadAndResolveModule(moduleRef);
        // Flag 8: If this flag is set, return the moduleRef directly without further processing.
        if (flags & 8) return moduleRef;
        // Flag 4: If moduleRef is an object and already marked as an ES module, return it as is.
        if (flags & 4 && typeof moduleRef === 'object' && moduleRef && moduleRef.__esModule) {
            return moduleRef;
        }
        // Otherwise, create a synthetic namespace object for interop.
        const syntheticNamespace = Object.create(null);
        _loadAndResolveModule.setESModuleFlag(syntheticNamespace);
        // Set the 'default' export to the original moduleRef.
        Object.defineProperty(syntheticNamespace, 'default', { enumerable: true, value: moduleRef });
        // Flag 2: If moduleRef is not a string, copy all its enumerable properties to the namespace.
        if (flags & 2 && typeof moduleRef !== 'string') {
            for (const propertyKey in moduleRef) {
                _loadAndResolveModule.defineGetterExport(syntheticNamespace, propertyKey, (function (key) {
                    return moduleRef[key];
                }).bind(null, propertyKey));
            }
        }
        return syntheticNamespace;
    };

    /**
     * Provides a getter for the default export of a module.
     * Useful for `import * as name from 'module'` or `require('module').default`.
     * @param {object} moduleReference - The module object.
     * @returns {function} A getter function for the default export.
     */
    _loadAndResolveModule.retrieveDefaultExport = function (moduleReference) {
        const defaultExportAccessor = moduleReference && moduleReference.__esModule
            ? () => moduleReference.default
            : () => moduleReference;
        // Define an 'a' property which is a common Webpack convention for the default export accessor.
        _loadAndResolveModule.defineGetterExport(defaultExportAccessor, 'a', defaultExportAccessor);
        return defaultExportAccessor;
    };

    /**
     * Checks if an object has a specific property as its own property (not inherited).
     * @param {object} obj - The object to check.
     * @param {string} property - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    _loadAndResolveModule.checkOwnProperty = function (obj, property) {
        return Object.prototype.hasOwnProperty.call(obj, property);
    };

    // Public path for assets, typically used for dynamic imports or resource loading.
    _loadAndResolveModule.assetPublicPath = "";

    // The entry point for the application. In this bundle, it's module ID 0.
    const applicationEntryPointId = 0;
    _loadAndResolveModule.entryPointId = applicationEntryPointId; // Store for reference.
    _loadAndResolveModule(applicationEntryPointId); // Execute the application's starting module.
};

// The array of module definitions that make up the application bundle.
// Each function in this array corresponds to a module.
loadApplicationBundle([
    // Module 0: This is the application's main entry point.
    // It orchestrates reading input and passing it to the core logic module.
    function (currentModule, moduleExports, getRequiredModule) {
        // Require the Node.js 'fs' module to handle file system operations.
        // This is module ID 3 in our bundle.
        const fileSystemUtilities = getRequiredModule(3);

        // Define the path for standard input. Using '/dev/stdin' is common on Unix-like systems.
        // For Windows compatibility or more general cases, Node's `process.stdin` could be used.
        // However, sticking to the original's intent, we keep the direct file path.
        const standardInputSourcePath = "/dev/stdin";
        const textEncodingFormat = "UTF-8";

        // Read the content from standard input synchronously.
        // It's crucial for competitive programming setups where input is provided via stdin.
        let rawInputStringContent;
        try {
            rawInputStringContent = fileSystemUtilities.readFileSync(standardInputSourcePath, textEncodingFormat);
        } catch (readOperationError) {
            console.error(`Error encountered while reading from standard input at '${standardInputSourcePath}':`, readOperationError.message);
            // In a robust application, you might exit, log extensively, or provide default input.
            // For this clone, we'll assume successful read or let subsequent errors propagate,
            // providing an empty string as a fallback to prevent immediate crashes.
            rawInputStringContent = "";
        }

        // Split the entire input content into an array of individual lines.
        // Each line becomes a separate element in the array.
        const inputLinesAsArray = rawInputStringContent.split("\n");

        // Pass the processed input lines to the core application logic, which is module ID 1.
        // The result of module 1's execution (if any) is typically not captured here,
        // as it usually performs side effects like printing to the console directly.
        getRequiredModule(1)(inputLinesAsArray);

        // The entry point module itself typically does not export any values.
    },

    // Module 1: Contains the primary computational logic for the application.
    // It processes numerical input to calculate a specific quotient based on divisibility and prime factors.
    function (currentModule, moduleExports, getRequiredModule) {
        // Helper function to safely extract a fixed number of elements from an iterable.
        // This utility is often generated by transpilers like Babel for array destructuring.
        const safelyExtractArrayElements = function (sourceIterable, requiredCount) {
            // If the source is already an array, and its length matches the required count, return it directly.
            if (Array.isArray(sourceIterable) && (requiredCount === undefined || sourceIterable.length === requiredCount)) {
                return sourceIterable;
            }

            const collectedElements = [];
            let isIterationCompleted = false;
            let capturedIteratorError = undefined;

            try {
                // Obtain an iterator for the source iterable.
                const iterableSourceIterator = sourceIterable[Symbol.iterator]();
                let nextIterationResult;

                // Loop through the iterator, collecting elements until iteration completes or required count is met.
                while (!(isIterationCompleted = (nextIterationResult = iterableSourceIterator.next()).done) &&
                       (collectedElements.push(nextIterationResult.value), true) && // Push the value and ensure loop continues.
                       (requiredCount === undefined || collectedElements.length !== requiredCount)) {
                    // No further actions needed inside this loop body.
                }
            } catch (iterationIssue) {
                capturedIteratorError = iterationIssue; // Store any error that occurs during iteration.
            } finally {
                // Ensure the iterator's `return` method is called if it exists and iteration wasn't completed naturally.
                if (!isIterationCompleted && sourceIterable && typeof iterableSourceIterator.return === 'function') {
                    try {
                        iterableSourceIterator.return();
                    } catch (cleanupError) {
                        // Log or handle cleanup errors, but prioritize the primary iteration error if one occurred.
                        if (!capturedIteratorError) {
                            capturedIteratorError = cleanupError;
                        }
                    }
                }
                if (capturedIteratorError) {
                    throw capturedIteratorError; // Re-throw any captured error from the iteration process.
                }
            }

            // If no elements were collected but some were expected, it's an invalid instance.
            if (collectedElements.length === 0 && requiredCount > 0) {
                 throw new TypeError("Failed to destructure: non-iterable or empty instance provided.");
            }

            return collectedElements;
        };

        // Load the prime factorization utility module (Module ID 2).
        const getPrimeFactorsForNumber = getRequiredModule(2);

        // The main function exported by this module. It expects an array of input lines (strings).
        currentModule.exports = function (applicationInputLines) {
            // --- Input Validation: Basic Checks ---
            if (!applicationInputLines || applicationInputLines.length === 0) {
                console.error("Application Error: No input lines were supplied to the processing logic.");
                return; // Terminate execution if no input.
            }
            if (typeof applicationInputLines[0] !== 'string') {
                console.error("Application Error: Expected first input line to be a string, but received a different type.");
                return;
            }

            // Process the first line of input. It's expected to contain two space-separated numerical values.
            const firstLineOfInput = applicationInputLines[0];

            // Split the line by spaces, convert each part to a number, and then safely destructure into two variables.
            const parsedNumericalInputs = safelyExtractArrayElements(
                firstLineOfInput.split(" ").map(stringValue => Number(stringValue)),
                2 // Expecting exactly two numbers.
            );

            // Extract the two numerical values from the parsed input.
            const primaryDivisorCandidate = parsedNumericalInputs[0]; // Corresponds to original `t`
            const targetDividendValue = parsedNumericalInputs[1];     // Corresponds to original `u`

            // --- Input Validation: Numerical Specifics ---
            if (isNaN(primaryDivisorCandidate) || isNaN(targetDividendValue)) {
                console.error("Input Error: One or both input values are not valid numbers.");
                return;
            }
            if (!Number.isFinite(primaryDivisorCandidate) || !Number.isFinite(targetDividendValue)) {
                console.error("Input Error: Received non-finite number (Infinity or NaN).");
                return;
            }
            if (primaryDivisorCandidate === 0) {
                console.error("Input Error: The primary divisor candidate cannot be zero due to division by zero risk.");
                return;
            }
            if (targetDividendValue === 0) {
                console.log(0); // Any non-zero divisor of 0 results in 0.
                return;
            }
            if (primaryDivisorCandidate < 0 || targetDividendValue < 0) {
                console.warn("Warning: Negative numerical inputs detected. The prime factorization logic might behave unexpectedly for negative numbers.");
                // For typical competitive programming problems, positive integers are implied.
                // We will proceed, but this is a critical point for a guard clause or problem re-evaluation.
            }

            // Calculate the remainder of the division.
            const divisionRemainder = targetDividendValue % primaryDivisorCandidate;

            let finalComputedQuotient; // This variable will store the ultimate result.

            // Conditional logic based on whether the target dividend is perfectly divisible.
            if (divisionRemainder !== 0) {
                // Scenario 1: The target dividend is NOT perfectly divisible by the primary divisor candidate.
                // We need to find a suitable factor of the target dividend.

                // Obtain a map of prime factors for the target dividend.
                // Example: { '2': 2, '3': 1 } for the number 12 (meaning 2^2 * 3^1).
                const primeFactorsMapping = getPrimeFactorsForNumber(targetDividendValue);

                // Initialize `currentBestFactor` with the target dividend itself.
                // This value will be updated if a smaller, suitable prime factor is found.
                let currentBestFactor = targetDividendValue; // Corresponds to original `f`

                // Iterate over the keys (which are prime factors as strings) in the prime factors map.
                for (const factorKeyString in primeFactorsMapping) {
                    // Ensure that `factorKeyString` is an own property of the map, not from its prototype chain.
                    if (Object.prototype.hasOwnProperty.call(primeFactorsMapping, factorKeyString)) {
                        const currentPrimeFactor = Number(factorKeyString); // Convert the string key to a number.

                        // Check if the current prime factor meets the selection criteria:
                        // 1. It must be greater than or equal to our `primaryDivisorCandidate`.
                        // 2. It must be strictly smaller than the `currentBestFactor` found so far.
                        if (currentPrimeFactor >= primaryDivisorCandidate && currentPrimeFactor < currentBestFactor) {
                            currentBestFactor = currentPrimeFactor; // Update to this new, better factor.
                        }
                    }
                }

                // The final quotient is the target dividend divided by the determined `currentBestFactor`.
                finalComputedQuotient = targetDividendValue / currentBestFactor; // Corresponds to original `a`
            } else {
                // Scenario 2: The target dividend IS perfectly divisible by the primary divisor candidate.
                // The quotient is straightforward: target dividend divided by primary divisor candidate.
                finalComputedQuotient = targetDividendValue / primaryDivisorCandidate;
            }

            // Output the final calculated quotient to the standard console.
            console.log(finalComputedQuotient);
        };
    },

    // Module 2: Provides a utility function for prime factorization.
    // It takes an integer and returns an object mapping its prime factors to their respective counts (exponents).
    function (currentModule, moduleExports) {
        currentModule.exports = function (inputNumberToFactorize) {
            // --- Input Validation and Edge Cases ---
            if (typeof inputNumberToFactorize !== 'number' || !Number.isInteger(inputNumberToFactorize)) {
                console.warn(`Factorization Warning: Input '${inputNumberToFactorize}' is not a valid integer. Returning an empty factor map.`);
                return {};
            }
            if (inputNumberToFactorize < 1) {
                // For numbers less than 1, prime factorization isn't typically defined in this context.
                // Special handling for 0 and negative numbers.
                if (inputNumberToFactorize === 0) {
                    // While 0 has infinite divisors, it doesn't have prime factors in the usual sense.
                    // Returning a specific object for 0 as a distinct case.
                    return { '0': 1 };
                }
                console.warn(`Factorization Warning: Input '${inputNumberToFactorize}' is negative. Returning an empty factor map.`);
                return {};
            }
            if (inputNumberToFactorize === 1) {
                // The number 1 has no prime factors.
                return {};
            }

            const primeFactorCountMap = {}; // Renamed `e`. This object will store prime factors and their exponents.
            let remainingNumberValue = inputNumberToFactorize; // Renamed `t`. This value decreases as factors are found.

            // Iterate through potential prime divisors starting from 2.
            // We only need to check divisors up to the square root of the `remainingNumberValue`.
            // If a factor is found, `remainingNumberValue` decreases, and its square root limit also decreases.
            for (let currentDivisorCandidate = 2; currentDivisorCandidate * currentDivisorCandidate <= remainingNumberValue; currentDivisorCandidate++) { // Renamed `o`
                // Check if the current candidate evenly divides the remaining number.
                if (remainingNumberValue % currentDivisorCandidate === 0) {
                    let countOfCurrentFactor = 0; // Renamed `u`. Counts occurrences of `currentDivisorCandidate`.
                    // Continuously divide `remainingNumberValue` by `currentDivisorCandidate` as long as it's a factor.
                    while (remainingNumberValue % currentDivisorCandidate === 0) {
                        remainingNumberValue /= currentDivisorCandidate;
                        countOfCurrentFactor++;
                    }
                    // Store the prime factor and its exponent in the map.
                    primeFactorCountMap[currentDivisorCandidate] = countOfCurrentFactor;
                }

                // Optimization: If `remainingNumberValue` has been reduced to 1, all factors have been found.
                if (remainingNumberValue === 1) {
                    break;
                }
            }

            // After the loop, if `remainingNumberValue` is still greater than 1,
            // it means the `remainingNumberValue` itself is a prime factor (it's the largest prime factor).
            if (remainingNumberValue > 1) {
                primeFactorCountMap[remainingNumberValue] = 1; // This remaining value is a prime, occurring once.
            }

            return primeFactorCountMap; // Return the map of prime factors and their counts.
        };
    },

    // Module 3: Provides access to Node.js's native 'fs' (file system) module.
    // This is a simple wrapper to make 'fs' functionality available within the bundled environment.
    function (moduleReference, exportsReference) {
        // Directly export the 'fs' module from Node.js.
        // The 'node:' prefix is a modern best practice for explicitly requiring built-in Node.js modules.
        moduleReference.exports = require('node:fs');
    }
]);