(function(sourceMapOfModules) {
    // A registry to hold all instantiated module contexts.
    let moduleCacheRegistry = {};

    /**
     * Core module loading and resolution function.
     * @param {string} requestedModuleIdentifier - The unique identifier for the module to load.
     * @returns {object} The exports object of the resolved module.
     */
    function moduleResolverFunction(requestedModuleIdentifier) {
        // Check if the module is already in our cache.
        if (moduleCacheRegistry[requestedModuleIdentifier]) {
            return moduleCacheRegistry[requestedModuleIdentifier].exportBundle;
        }

        // If not, create a fresh module context and add it to the cache.
        let currentModuleContext = moduleCacheRegistry[requestedModuleIdentifier] = {
            internalIdentifier: requestedModuleIdentifier,
            loadStatusFlag: false, // Indicates if the module's code has been executed.
            exportBundle: {}
        };

        // Execute the module's code, passing in its context and the resolver itself.
        // This populates `currentModuleContext.exportBundle`.
        sourceMapOfModules[requestedModuleIdentifier].call(
            currentModuleContext.exportBundle,
            currentModuleContext,
            currentModuleContext.exportBundle,
            moduleResolverFunction
        );

        // Mark the module as loaded.
        currentModuleContext.loadStatusFlag = true;

        // Return the populated exports.
        return currentModuleContext.exportBundle;
    }

    // Expose the raw module definitions for introspection (optional, can be removed).
    moduleResolverFunction.moduleSourceMap = sourceMapOfModules;

    // Expose the module cache for debugging or advanced scenarios.
    moduleResolverFunction.cacheReference = moduleCacheRegistry;

    /**
     * Defines a getter property on an exports object.
     * Used for compatibility with ES module exports.
     * @param {object} exportTarget - The object to define the property on.
     * @param {string} accessorName - The name of the property to define.
     * @param {function} valueRetriever - The function to call to get the property's value.
     */
    moduleResolverFunction.defineExportAccessors = function(exportTarget, accessorName, valueRetriever) {
        if (!moduleResolverFunction.objectHasOwnProperty(exportTarget, accessorName)) {
            Object.defineProperty(exportTarget, accessorName, {
                enumerable: true,
                get: valueRetriever
            });
        }
    };

    /**
     * Registers an exports object as an ES Module.
     * This adds the `__esModule` flag and `Symbol.toStringTag` property.
     * @param {object} exportTarget - The exports object to mark as an ES module.
     */
    moduleResolverFunction.registerESModuleExports = function(exportTarget) {
        // Check for Symbol API existence before using Symbol.toStringTag.
        if (typeof Symbol === 'function' && Symbol.toStringTag) {
            Object.defineProperty(exportTarget, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exportTarget, '__esModule', { value: true });
    };

    /**
     * Creates a fake namespace object from a module's exports.
     * This handles various import modes (e.g., `import * as foo from 'bar'`).
     * @param {*} moduleInput - The module's exports or ID.
     * @param {number} transformationMode - Bitmask indicating how to process the input.
     * @returns {object} A namespace object.
     */
    moduleResolverFunction.createNamespaceProxy = function(moduleInput, transformationMode) {
        // Mode 1: Value is a module ID, resolve it first.
        if (transformationMode & 1) moduleInput = moduleResolverFunction(moduleInput);
        // Mode 8: Return value directly if it's already a namespace object.
        if (transformationMode & 8) return moduleInput;
        // Mode 4: Return value directly if it's already an ES module namespace object.
        if ((transformationMode & 4) && typeof moduleInput === 'object' && moduleInput && moduleInput.__esModule) return moduleInput;

        // Create a new namespace object.
        let namespaceObjectProxy = Object.create(null);
        moduleResolverFunction.registerESModuleExports(namespaceObjectProxy);
        Object.defineProperty(namespaceObjectProxy, 'default', { enumerable: true, value: moduleInput });

        // Mode 2: Merge all properties of the input into the namespace object.
        if (transformationMode & 2 && typeof moduleInput != 'string') {
            for (let propertyKey in moduleInput) {
                moduleResolverFunction.defineExportAccessors(namespaceObjectProxy, propertyKey, (function(prop) {
                    return moduleInput[prop];
                }).bind(null, propertyKey));
            }
        }
        return namespaceObjectProxy;
    };

    /**
     * Provides a getter for the default export of a module.
     * Handles both ES modules and CommonJS modules.
     * @param {object} moduleRef - The module's exports object.
     * @returns {function} A function that returns the default export.
     */
    moduleResolverFunction.getModuleDefaultExport = function(moduleRef) {
        let defaultExportRetriever = moduleRef && moduleRef.__esModule ?
            function getDefault() { return moduleRef['default']; } :
            function getCommonJSExports() { return moduleRef; };
        moduleResolverFunction.defineExportAccessors(defaultExportRetriever, 'a', defaultExportRetriever);
        return defaultExportRetriever;
    };

    /**
     * Checks if an object has a specific property directly (not inherited).
     * @param {object} targetObjectRef - The object to check.
     * @param {string} checkedPropertyName - The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    moduleResolverFunction.objectHasOwnProperty = function(targetObjectRef, checkedPropertyName) {
        return Object.prototype.hasOwnProperty.call(targetObjectRef, checkedPropertyName);
    };

    // The base public path for loading resources (empty string by default).
    moduleResolverFunction.basePublicPath = "";

    // The identifier for the main entry module.
    moduleResolverFunction.mainEntryModuleId = "./src/contest/atcoder/sumitrust2019/d.ts";

    // Load the entry module and return its exports.
    return moduleResolverFunction(moduleResolverFunction.mainEntryModuleId);
})
/************************************************************************/
({

    /***/
    "./node_modules/webpack/buildin/module.js":
    /*!***********************************!*\
      !*** (webpack)/buildin/module.js ***!
      \***********************************/
    /*! no static exports found */
    /***/
    (function(moduleRef, exports) {

        // This function polyfills Node.js-like `module` objects for webpack.
        (function(targetModule) {
            // If the module hasn't been polyfilled yet.
            if (!targetModule.isPolyfilled) {
                // Initialize child dependencies array.
                targetModule.childModules = [];
                // Define 'loaded' property as a getter for 'isLoaded' flag.
                Object.defineProperty(targetModule, "loaded", {
                    enumerable: true,
                    get: () => targetModule.isLoaded
                });
                // Define 'id' property as a getter for 'internalId'.
                Object.defineProperty(targetModule, "id", {
                    enumerable: true,
                    get: () => targetModule.internalId
                });
                // Set the polyfill flag to true.
                targetModule.isPolyfilled = true;
            }
            return targetModule;
        })(moduleRef);


        /***/
    }),

    /***/
    "./src/contest/atcoder/sumitrust2019/d.ts":
    /*!************************************************!*\
      !*** ./src/contest/atcoder/sumitrust2019/d.ts ***!
      \************************************************/
    /*! no static exports found */
    /***/
    (function(currentModuleContext, exportBundle, moduleResolverFunction) {

        "use strict";
        /* WEBPACK VAR INJECTION */
        (function(moduleRef) {
            /**
             * Resolves CommonJS modules that might have an ES module default export.
             * @param {object} inputModule - The module object.
             * @returns {object} The module itself, or a wrapper with a default property.
             */
            let performDefaultImportResolution = (this && this.__importDefault) || function(inputModule) {
                return (inputModule && inputModule.__esModule) ? inputModule : {
                    "default": inputModule
                };
            };
            Object.defineProperty(exportBundle, "__esModule", {
                value: true
            });
            exportBundle.entryPoint = void 0; // Initialize the main entry point export.

            // Import necessary utilities.
            const fileSystemAccess = performDefaultImportResolution(moduleResolverFunction(/*! fs */ "fs"));
            const inputHandlingUtilities = moduleResolverFunction(/*! ../../common/io */ "./src/contest/common/io.ts");

            // --- Constants for the password problem ---
            const NUM_DIGITS = 10;
            const PASSWORD_LENGTH = 3;
            const MIN_POSSIBLE_PASSWORD_VALUE = 0;
            const MAX_POSSIBLE_PASSWORD_VALUE = 999;
            const INVALID_INDEX_MARKER = -1;
            const STD_IN_FILE_PATH = "/dev/stdin";

            /**
             * Calculates the number of unique 3-digit passwords that can be formed
             * as subsequences from a given digit string.
             *
             * This uses dynamic programming to pre-calculate the next occurrence of each digit.
             *
             * @param {object} problemData - Input parameters.
             * @param {number} problemData.strLength - The total length of the input digit string.
             * @param {string} problemData.sourceString - The input string consisting of digits.
             * @returns {number} The total count of such valid passwords.
             */
            function determineSubsequenceCount({
                strLength,
                sourceString
            }) {
                // A quick check: if the string is too short, no 3-digit password can be formed.
                if (strLength < PASSWORD_LENGTH) {
                    return 0;
                }

                // `nextDigitPosition[i]` will store an array. `nextDigitPosition[i][d]`
                // represents the index of the *next* occurrence of digit `d` starting from `i+1`.
                // If no such occurrence, it's `INVALID_INDEX_MARKER`.
                const nextDigitPosition = new Array(strLength);

                // `lastSeenDigitIndex[d]` keeps track of the most recent index where digit `d` was encountered
                // during the right-to-left scan.
                const lastSeenDigitIndex = new Array(NUM_DIGITS).fill(INVALID_INDEX_MARKER);

                // Populate `nextDigitPosition` and `lastSeenDigitIndex` by iterating from the end of the string.
                for (let scanIndex = strLength - 1; scanIndex >= 0; --scanIndex) {
                    const currentCharacter = sourceString.charAt(scanIndex);
                    const digitValue = Number(currentCharacter);

                    // `nextDigitPosition[scanIndex]` stores the state of `lastSeenDigitIndex`
                    // *before* `currentCharacter` at `scanIndex` updates `lastSeenDigitIndex`.
                    // This means `nextDigitPosition[scanIndex][d]` contains the index of the next `d`
                    // *after* `scanIndex`.
                    nextDigitPosition[scanIndex] = Array.from(lastSeenDigitIndex);

                    // Update `lastSeenDigitIndex` for the current digit.
                    lastSeenDigitIndex[digitValue] = scanIndex;
                }

                let finalResultCount = 0;

                // Iterate through all possible 3-digit passwords (000 to 999).
                passwordSearchLoop: for (let potentialPasswordNum = MIN_POSSIBLE_PASSWORD_VALUE; potentialPasswordNum <= MAX_POSSIBLE_PASSWORD_VALUE; ++potentialPasswordNum) {
                    // Format the number into a 3-digit string (e.g., 5 -> "005").
                    const formattedPasswordStr = String(potentialPasswordNum).padStart(PASSWORD_LENGTH, '0');

                    // Extract the three individual digits of the target password.
                    const firstTargetDigit = Number(formattedPasswordStr.charAt(0));
                    const secondTargetDigit = Number(formattedPasswordStr.charAt(1));
                    const thirdTargetDigit = Number(formattedPasswordStr.charAt(2));

                    // Find the first occurrence of the `firstTargetDigit` in the entire string.
                    // `lastSeenDigitIndex` (after the initial loop) holds the *leftmost* index of each digit.
                    let currentMatchPosition = lastSeenDigitIndex[firstTargetDigit];

                    // If the first digit isn't found anywhere, this password can't be formed.
                    if (currentMatchPosition === INVALID_INDEX_MARKER) {
                        continue passwordSearchLoop;
                    }

                    // Now, find the `secondTargetDigit` *after* `currentMatchPosition`.
                    // `nextDigitPosition[currentMatchPosition]` gives us the indices of digits
                    // occurring after `currentMatchPosition`.
                    currentMatchPosition = nextDigitPosition[currentMatchPosition][secondTargetDigit];

                    // If the second digit isn't found after the first, skip.
                    if (currentMatchPosition === INVALID_INDEX_MARKER) {
                        continue passwordSearchLoop;
                    }

                    // Finally, find the `thirdTargetDigit` *after* the new `currentMatchPosition`.
                    currentMatchPosition = nextDigitPosition[currentMatchPosition][thirdTargetDigit];

                    // If the third digit isn't found after the second, skip.
                    if (currentMatchPosition === INVALID_INDEX_MARKER) {
                        continue passwordSearchLoop;
                    }

                    // If all three digits were found in sequence, increment the count.
                    finalResultCount++;
                }

                return finalResultCount;
            }

            /**
             * Main entry point for the problem solution.
             * Reads input, calls the solver, and prints the result.
             * @param {string} inputDataLine - The raw input string containing N and S.
             */
            function executeProblemSolver(inputDataLine) {
                // Create a function to read the next token from the input line.
                const readNextInputToken = inputHandlingUtilities.buildNextTokenReader(inputDataLine);

                // Parse the length N and the digit string S.
                const inputLengthValue = Number.parseInt(readNextInputToken(), 10);
                const digitSequenceString = readNextInputToken();

                // Solve the problem.
                const finalResultCount = determineSubsequenceCount({
                    strLength: inputLengthValue,
                    sourceString: digitSequenceString
                });

                // Output the result.
                console.log(finalResultCount);
            }
            exportBundle.entryPoint = executeProblemSolver; // Export the main function.

            // Check if this module is being run as the main entry point.
            if (moduleResolverFunction.cacheReference[moduleResolverFunction.mainEntryModuleId] === currentModuleContext) {
                // Read input from stdin and execute the solver.
                const rawInput = fileSystemAccess.default.readFileSync(STD_IN_FILE_PATH, "utf8");
                executeProblemSolver(rawInput);
            }

            /* WEBPACK VAR INJECTION */
        }.call(this, moduleResolverFunction(/*! ./../../../../node_modules/webpack/buildin/module.js */ "./node_modules/webpack/buildin/module.js")(currentModuleContext)))

        /***/
    }),

    /***/
    "./src/contest/common/io.ts":
    /*!**********************************!*\
      !*** ./src/contest/common/io.ts ***!
      \**********************************/
    /*! no static exports found */
    /***/
    (function(currentModuleContext, ioExports, moduleResolverFunction) {

        "use strict";
        Object.defineProperty(ioExports, "__esModule", {
            value: true
        });
        ioExports.retrieveNextBigInt = ioExports.retrieveNextInt = ioExports.buildNextTokenReader = ioExports.createTypedTokenIterator = ioExports.createInputTokenIterator = void 0;

        /**
         * Creates an iterator that yields tokens from a given string.
         * Tokens are split by one or more whitespace characters. Empty tokens are filtered out.
         * @param {string} sourceLineText - The input string to tokenize.
         * @yields {string} A single token.
         */
        function* createInputTokenIterator(sourceLineText) {
            const parsedTokensArray = sourceLineText.trim().split(/\s+/).filter(Boolean);
            for (const currentToken of parsedTokensArray) {
                yield currentToken;
            }
        }
        ioExports.createInputTokenIterator = createInputTokenIterator;

        /**
         * Creates an iterator that yields parsed tokens from a given string.
         * @param {string} sourceLineText - The input string to tokenize and parse.
         * @param {function(string): *} parsingFunction - A function to parse each token.
         * @yields {*} A parsed token.
         */
        function* createTypedTokenIterator(sourceLineText, parsingFunction) {
            const parsedTokensArray = sourceLineText.trim().split(/\s+/).filter(Boolean);
            for (const currentToken of parsedTokensArray) {
                yield parsingFunction(currentToken);
            }
        }
        ioExports.createTypedTokenIterator = createTypedTokenIterator;

        /**
         * Returns a function that, when called, yields the next token from the input line.
         * @param {string} sourceLineText - The input string.
         * @returns {function(): string} A function to get the next string token.
         */
        function buildNextTokenReader(sourceLineText) {
            const tokenIteratorInstance = createInputTokenIterator(sourceLineText);
            return () => tokenIteratorInstance.next().value;
        }
        ioExports.buildNextTokenReader = buildNextTokenReader;

        /**
         * Returns a function that, when called, yields the next integer token from the input line.
         * @param {string} sourceLineText - The input string.
         * @returns {function(): number} A function to get the next integer token.
         */
        function retrieveNextInt(sourceLineText) {
            const tokenIteratorInstance = createInputTokenIterator(sourceLineText);
            return () => Number.parseInt(tokenIteratorInstance.next().value, 10);
        }
        ioExports.retrieveNextInt = retrieveNextInt;

        /**
         * Returns a function that, when called, yields the next BigInt token from the input line.
         * @param {string} sourceLineText - The input string.
         * @returns {function(): bigint} A function to get the next BigInt token.
         */
        function retrieveNextBigInt(sourceLineText) {
            const tokenIteratorInstance = createInputTokenIterator(sourceLineText);
            return () => globalThis.BigInt(tokenIteratorInstance.next().value);
        }
        ioExports.retrieveNextBigInt = retrieveNextBigInt;


        /***/
    }),

    /***/
    "fs":
    /*!*********************!*\
      !*** external "fs" ***!
      \*********************/
    /*! no static exports found */
    /***/
    (function(currentModuleContext, exports) {

        // This module is an external dependency, directly mapping to Node.js's 'fs' module.
        currentModuleContext.exportBundle = require("fs");

        /***/
    })

});
//# sourceMappingURL=submit.js.map