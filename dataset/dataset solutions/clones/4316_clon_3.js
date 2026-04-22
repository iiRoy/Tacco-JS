(function(moduleDefinitions) {
    // A mapping of module IDs to their exports, acting as a cache for loaded components
    var loadedComponentCache = {};

    // Custom module resolution function, designed to mimic Node.js 'require' but for bundled modules
    function fetchComponent(componentId) {
        // If the component is already in our cache, return its pre-computed exports
        if (loadedComponentCache[componentId]) {
            return loadedComponentCache[componentId].exportedData;
        }

        // Initialize a new component entry in the cache
        var currentComponentContext = loadedComponentCache[componentId] = {
            componentIdentifier: componentId, // The unique identifier for this component
            hasBeenProcessed: false,          // Flag indicating if the component's code has run
            exportedData: {}                  // The object that will hold the component's exports
        };

        // Execute the component's defining function, passing necessary context:
        // 'this' context, the component's exports object, the component's context, and this resolver function
        moduleDefinitions[componentId].call(currentComponentContext.exportedData, currentComponentContext, currentComponentContext.exportedData, fetchComponent);

        // Mark the component as processed after its execution
        currentComponentContext.hasBeenProcessed = true;

        // Return the populated exports object
        return currentComponentContext.exportedData;
    }


    // Expose the raw component definitions map for advanced introspection or debugging
    fetchComponent.componentDefinitionMap = moduleDefinitions;

    // Expose the internal component cache, useful for debugging the module graph
    fetchComponent.componentCache = loadedComponentCache;

    // Helper to define a getter function for ECMAScript module (Harmony) exports
    fetchComponent.establishExportGetter = function(targetExportObject, propertyKey, getterFn) {
        // Only define the property if it doesn't already exist on the target object
        if (!fetchComponent.checkOwnProperty(targetExportObject, propertyKey)) {
            Object.defineProperty(targetExportObject, propertyKey, {
                enumerable: true, // Make the property visible during enumeration
                get: getterFn     // The function to call when the property is accessed
            });
        }
    };

    // Mark an exports object as an ECMAScript Module
    fetchComponent.designateAsESModule = function(targetExportObject) {
        // Utilize Symbol.toStringTag for improved module identification in capable environments
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetExportObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Standard Webpack convention to mark as an ES Module
        Object.defineProperty(targetExportObject, '__esModule', { value: true });
    };

    // Construct a synthetic namespace object for compatibility with various module types
    // Configuration flags for 'processingMode':
    // & 1: Treat 'inputValue' as a component ID; resolve it first.
    // & 2: Merge all enumerable properties from 'inputValue' into the new namespace.
    // & 4: If 'inputValue' is already an ES module namespace, return it directly.
    // & 8: Behave like a standard 'require' call, returning 'inputValue' as-is.
    fetchComponent.createSyntheticNamespace = function(inputValue, processingMode) {
        if (processingMode & 1) inputValue = fetchComponent(inputValue); // Resolve component ID if flag is set
        if (processingMode & 8) return inputValue; // Direct return if 'require' behavior is requested
        if ((processingMode & 4) && typeof inputValue === 'object' && inputValue && inputValue.__esModule) return inputValue; // Return if already an ES module

        // Create a new, blank object to serve as the namespace
        var newNamespace = Object.create(null);
        fetchComponent.designateAsESModule(newNamespace); // Mark this new object as an ES module

        // Set the 'default' export property
        Object.defineProperty(newNamespace, 'default', { enumerable: true, value: inputValue });

        // Merge properties from 'inputValue' if 'processingMode' includes the merge flag and 'inputValue' is an object
        if (processingMode & 2 && typeof inputValue === 'object' && inputValue !== null) {
            for (var propName in inputValue) {
                // Ensure property is directly on the object and not from prototype chain
                if (Object.prototype.hasOwnProperty.call(inputValue, propName)) {
                    fetchComponent.establishExportGetter(newNamespace, propName, (function(currentProp) {
                        return inputValue[currentProp];
                    }).bind(null, propName));
                }
            }
        }
        return newNamespace;
    };

    // Retrieve the default export from a module for compatibility with non-ES modules
    fetchComponent.obtainDefaultExport = function(targetModule) {
        var defaultGetterFunc = targetModule && targetModule.__esModule ?
            function retrieveDefaultValue() { return targetModule['default']; } : // If it's an ES module, access 'default'
            function retrieveModuleBase() { return targetModule; };             // Otherwise, the module itself is the default
        fetchComponent.establishExportGetter(defaultGetterFunc, 'a', defaultGetterFunc); // Expose as 'a' for common usage patterns
        return defaultGetterFunc;
    };

    // Utility function to check if an object has its own property (not inherited)
    fetchComponent.checkOwnProperty = function(subjectObject, keyName) {
        return Object.prototype.hasOwnProperty.call(subjectObject, keyName);
    };

    // Configurable public path for bundled assets (currently set to an empty string)
    fetchComponent.bundlePublicPath = "";


    // Initiate the application by loading the designated entry component and returning its exports
    return fetchComponent(fetchComponent.entryPointComponentID = "./src/contest/atcoder/tenka1-2017/c.ts");
})
/************************************************************************/
({

    /***/ "./node_modules/webpack/buildin/module.js":
    /*!***********************************!*\
      !*** (webpack)/buildin/module.js ***!
      \***********************************/
    // This component provides a polyfill for the Node.js 'module' object,
    // ensuring compatibility within the Webpack environment.
    /***/ (function(activeComponent, componentExports) {

        componentExports = function(componentReference) {
            // Check if the polyfill has already been applied to prevent redundant execution
            if (!componentReference.webpackPolyfill) {
                // Placeholder for a deprecation function
                componentReference.deprecate = function() {};
                // Initialize paths as an empty array, standard for module objects
                componentReference.paths = [];
                // 'module.parent' is generally undefined in Webpack's isolated module contexts
                // Ensure 'children' array exists for consistency
                if (!componentReference.children) componentReference.children = [];

                // Define a dynamic 'loaded' property using a getter, reflecting 'hasBeenProcessed'
                Object.defineProperty(componentReference, "loaded", {
                    enumerable: true,
                    get: function() {
                        return componentReference.hasBeenProcessed; // Using our renamed flag
                    }
                });

                // Define a dynamic 'id' property with a getter, returning the component's unique identifier
                Object.defineProperty(componentReference, "id", {
                    enumerable: true,
                    get: function() {
                        return componentReference.componentIdentifier; // Using our renamed ID
                    }
                });
                // Set the polyfill flag to indicate completion
                componentReference.webpackPolyfill = 1;
            }
            return componentReference;
        };


    /***/ }),

    /***/ "./src/contest/atcoder/tenka1-2017/c.ts":
    /*!**********************************************!*\
      !*** ./src/contest/atcoder/tenka1-2017/c.ts ***!
      \**********************************************/
    // This file contains the primary algorithm and application entry point for the contest problem.
    /***/ (function(moduleCtx, currentOutput, componentResolver) {

        "use strict";
        /* WEBPACK VAR INJECTION */(function(modulePolyfillContext) {
        // Custom utility to handle default imports, mimicking TypeScript's __importDefault helper
        var defaultImportResolver = (this && this.__importDefault) || function (sourceModule) {
            return (sourceModule && sourceModule.__esModule) ? sourceModule : { "default": sourceModule };
        };

        Object.defineProperty(currentOutput, "__esModule", { value: true });
        currentOutput.applicationMain = void 0; // Renamed 'main' to 'applicationMain' and 'exports.main' to 'currentOutput.applicationMain'

        // Import file system functionalities from Node.js 'fs' module
        const nodeFileSystem = defaultImportResolver(componentResolver("fs"));
        // Import custom input parsing utilities
        const inputParsingUtilities = componentResolver("./src/contest/common/io.ts");

        /**
         * Solves the Diophantine equation 4/K = 1/x + 1/y + 1/z for positive integers x, y, z.
         * This function employs a specific strategy: it sets x=K and y=c*K, then iteratively
         * searches for an integer 'c' such that z = (c*K) / (3*c - 1) is also a positive integer.
         *
         * @param {object} params - An object containing the primary input value.
         * @param {number} params.problemK - The integer 'K' (N in original problem) from the problem description.
         * @returns {number[]} An array containing the three found positive integers [x, y, z].
         * @throws {Error} If 'problemK' is not a positive integer or if a solution isn't found within practical bounds.
         */
        function findSolutionTriplet({ problemK }) {
            // Input validation: Ensure K is a positive whole number
            if (!Number.isInteger(problemK) || problemK <= 0) {
                throw new Error("The input value 'problemK' must be a positive integer.");
            }

            // Define an upper limit for the iteration variable 'c'.
            // This is a safeguard against infinite loops for unexpected inputs, though
            // for valid problem constraints (K up to 3500), a solution is guaranteed.
            const maximumCValue = problemK * 5000; // An empirically chosen upper bound, slightly more than 3500*3500 for safety.
            let currentCValue = 1; // Start searching 'c' from 1

            // Loop indefinitely until a valid triplet is found
            while (true) {
                // If 'c' exceeds our safety limit, something is wrong or input is out of bounds
                if (currentCValue > maximumCValue) {
                    throw new Error(`Solution not found for K=${problemK} after ${maximumCValue} iterations. Consider expanding search range.`);
                }
                
                const cTimesK = currentCValue * problemK; // Calculate the product c * K
                const threeCMiun1 = (3 * currentCValue) - 1; // Calculate the term (3c - 1)

                // Check if (3c - 1) is a divisor of (c*K). If it is, 'z' will be an integer.
                if (cTimesK % threeCMiun1 === 0) {
                    const firstVal = problemK;             // x = K
                    const secondVal = cTimesK;             // y = c * K
                    const thirdVal = cTimesK / threeCMiun1; // z = (c * K) / (3c - 1)

                    // Final verification: ensure all components are positive integers.
                    // This should generally be true if problemK >= 1 and currentCValue >= 1.
                    if (firstVal > 0 && secondVal > 0 && thirdVal > 0) {
                        return [firstVal, secondVal, thirdVal];
                    }
                }
                currentCValue++; // Increment 'c' to try the next possible value
            }
        }

        /**
         * The primary entry point for the application.
         * It reads the input line, parses the integer K, invokes the solver, and outputs the result.
         *
         * @param {string} rawInputLine - The raw string input, typically from standard input.
         */
        function applicationMain(rawInputLine) {
            // Preliminary input validation
            if (typeof rawInputLine !== 'string' || rawInputLine.trim().length === 0) {
                console.error("Error: Received an empty or invalid input string for processing.");
                return; // Abort if input is unusable
            }

            try {
                // Obtain a function that can sequentially extract tokens from the input line
                const tokenSequenceGetter = inputParsingUtilities.createNextTokenGetter(rawInputLine);
                // Parse the main integer K from the input stream
                const problemInputKValue = inputParsingUtilities.readInteger(tokenSequenceGetter);

                // Execute the core logic to find the triplet
                const [x_component, y_component, z_component] = findSolutionTriplet({ problemK: problemInputKValue });

                // Output the computed triplet values, space-separated
                console.log(`${x_component} ${y_component} ${z_component}`);
            } catch (executionError) {
                // Catch and log any errors that occur during parsing or solving
                console.error(`An error prevented successful execution: ${executionError.message}`);
                // In a production system, more sophisticated error handling might be implemented here.
            }
        }
        currentOutput.applicationMain = applicationMain; // Export the main function under its new name

        // This conditional block determines if the current module is the main entry point
        // of the Webpack bundle. If so, it proceeds to read input and execute the application.
        if (componentResolver.componentCache[componentResolver.entryPointComponentID] === modulePolyfillContext) {
            // Read all data from standard input (e.g., from a pipe or redirected file)
            const inputContent = nodeFileSystem.default.readFileSync("/dev/stdin", "utf8");
            // Call the main application function with the retrieved input
            applicationMain(inputContent);
        }

        /* WEBPACK VAR INJECTION */}.call(this, fetchComponent("./../../../../node_modules/webpack/buildin/module.js")(moduleCtx)))

    /***/ }),

    /***/ "./src/contest/common/io.ts":
    /*!**********************************!*\
      !*** ./src/contest/common/io.ts ***!
      \**********************************/
    // This module provides a set of utility functions for parsing various types of input.
    /***/ (function(moduleContext_io, exportsObject_io, componentResolver_io) {

        "use strict";

        Object.defineProperty(exportsObject_io, "__esModule", { value: true });
        // Exported functions with renamed identifiers
        exportsObject_io.getIntegerArray = exportsObject_io.parseInteger = exportsObject_io.createBigIntReader = exportsObject_io.createIntegerReader = exportsObject_io.createStringTokenReader = exportsObject_io.createParsedIterator = exportsObject_io.createTokenIterator = void 0;

        /**
         * Generates an iterator that yields string tokens from a given input line.
         * Tokens are separated by one or more whitespace characters, and empty tokens are filtered out.
         *
         * @param {string} sourceLine - The string line to be tokenized.
         * @returns {Generator<string>} An iterator that produces string tokens.
         */
        function* createTokenIterator(sourceLine) {
            // Trim leading/trailing whitespace, split by any sequence of whitespace, then remove empty strings
            const parsedStringTokens = sourceLine.trim().split(/\s+/).filter(token => token.length > 0);
            for (const currentStringToken of parsedStringTokens) {
                yield currentStringToken;
            }
        }
        exportsObject_io.createTokenIterator = createTokenIterator;

        /**
         * Generates an iterator that yields tokens from a line after applying a specified parser function.
         * This is useful for converting string tokens into numbers, BigInts, etc.
         *
         * @param {string} sourceLine - The input string line to process.
         * @param {Function} tokenParserFn - The function to apply to each string token (e.g., `Number.parseInt`, `BigInt`).
         * @returns {Generator<any>} An iterator yielding parsed values.
         */
        function* createParsedIterator(sourceLine, tokenParserFn) {
            const rawStringTokens = sourceLine.trim().split(/\s+/).filter(token => token.length > 0);
            for (const rawToken of rawStringTokens) {
                // Ensure the token is not empty before attempting to parse
                if (rawToken && rawToken.length > 0) {
                    yield tokenParserFn(rawToken);
                } else {
                    // Log a warning or handle cases of unexpected empty tokens
                    console.warn(`Encountered an empty token during parsing: '${rawToken}'. It was skipped.`);
                }
            }
        }
        exportsObject_io.createParsedIterator = createParsedIterator;

        /**
         * Returns a closure function that, when called, retrieves the next string token from the input.
         *
         * @param {string} fullInputLine - The complete input string.
         * @returns {Function<string>} A function that returns the next string token.
         * @throws {Error} If no more tokens are available.
         */
        function createStringTokenReader(fullInputLine) {
            const tokenStream = createTokenIterator(fullInputLine);
            return () => {
                const nextItem = tokenStream.next();
                if (nextItem.done) {
                    throw new Error("End of input stream: No more string tokens available.");
                }
                return nextItem.value;
            };
        }
        exportsObject_io.createStringTokenReader = createStringTokenReader;

        /**
         * Returns a closure function that, when invoked, retrieves the next integer from the input line.
         *
         * @param {string} fullInputLine - The complete input string.
         * @returns {Function<number>} A function that returns the next parsed integer.
         * @throws {Error} If no more integers are available or parsing fails.
         */
        function createIntegerReader(fullInputLine) {
            const integerStream = createParsedIterator(fullInputLine, Number.parseInt);
            return () => {
                const nextIntegerResult = integerStream.next();
                if (nextIntegerResult.done) {
                    throw new Error("End of input stream: No more integers available.");
                }
                const parsedNumericValue = nextIntegerResult.value;
                if (!Number.isInteger(parsedNumericValue)) {
                    // Log a warning if the parsed value isn't a whole number, but return it anyway
                    console.warn(`Value '${parsedNumericValue}' was parsed but is not a strict integer.`);
                }
                return parsedNumericValue;
            };
        }
        exportsObject_io.createIntegerReader = createIntegerReader;

        /**
         * Returns a closure function that, when called, retrieves the next BigInt from the input line.
         *
         * @param {string} fullInputLine - The complete input string.
         * @returns {Function<BigInt>} A function that returns the next parsed BigInt.
         * @throws {Error} If no more BigInts are available or parsing fails.
         */
        function createBigIntReader(fullInputLine) {
            const bigIntStream = createParsedIterator(fullInputLine, BigInt);
            return () => {
                const nextBigIntResult = bigIntStream.next();
                if (nextBigIntResult.done) {
                    throw new Error("End of input stream: No more BigInts available.");
                }
                return nextBigIntResult.value;
            };
        }
        exportsObject_io.createBigIntReader = createBigIntReader;

        /**
         * Parses and returns a single integer using a provided token extraction function.
         *
         * @param {Function<string>} getNextTokenFn - A function that returns the next string token.
         * @returns {number} The parsed integer value.
         * @throws {Error} If parsing the token to an integer fails (e.g., results in NaN).
         */
        function parseInteger(getNextTokenFn) {
            const currentRawToken = getNextTokenFn();
            const parsedNumeric = Number.parseInt(currentRawToken, 10); // Always use base 10 for consistency
            if (Number.isNaN(parsedNumeric)) {
                throw new Error(`Failed to convert token '${currentRawToken}' into an integer.`);
            }
            return parsedNumeric;
        }
        exportsObject_io.parseInteger = parseInteger;

        /**
         * Parses and returns an array of integers using a provided token extraction function.
         *
         * @param {Function<string>} getNextTokenFn - A function that returns the next string token.
         * @param {number} desiredCount - The number of integers expected to be read.
         * @returns {number[]} An array containing the parsed integer values.
         * @throws {Error} If `desiredCount` is not a valid non-negative integer or if parsing fails.
         */
        function getIntegerArray(getNextTokenFn, desiredCount) {
            if (!Number.isInteger(desiredCount) || desiredCount < 0) {
                throw new Error("Desired count for integer array must be a non-negative integer.");
            }
            const numericValueArray = [];
            for (let index = 0; index < desiredCount; index++) {
                numericValueArray[index] = parseInteger(getNextTokenFn); // Reusing the single integer parser
            }
            return numericValueArray;
        }
        exportsObject_io.getIntegerArray = getIntegerArray;


    /***/ }),

    /***/ "fs":
    /*!*********************!*\
      !*** external "fs" ***!
      \*********************/
    // This component acts as a bridge to the external Node.js 'fs' (file system) module.
    /***/ (function(fsModuleContext, fsExports) {

        fsModuleContext.exportedData = require("fs");

    /***/ })

});