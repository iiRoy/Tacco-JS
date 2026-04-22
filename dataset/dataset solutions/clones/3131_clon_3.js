/*
 * This file is an extensively modified Type III clone of an original JavaScript module bundle.
 * It retains the core functionality but introduces significant structural, naming, and logical changes.
 *
 * Key transformations include:
 * - Complete renaming of all identifiers to improve readability and obscure the original names.
 * - Extensive reformatting of whitespace, including consistent indentation and line breaks.
 * - Introduction of new helper functions and intermediate variables to break down complex logic.
 * - Replacement of some direct array/string methods with manual loops or alternative approaches.
 * - Addition of guard clauses and basic validation where appropriate.
 * - Alteration of control flow structures (e.g., changing how loops or conditions are expressed).
 * - Slight modifications to the `__awaiter` and `__generator` helpers for cosmetic purposes,
 *   while preserving their essential behavior for async/await transpilation.
 * - The overall module loading mechanism, akin to a simplified Webpack runtime, has been preserved
 *   but thoroughly refactored in its internal naming and structure.
 */

(function(moduleDefinitions) {
    // A cache for loaded modules to prevent redundant execution.
    const moduleCache = {};

    /**
     * Custom module loading function.
     * Behaves similarly to a simplified 'require' within a module bundler.
     * @param {number} moduleId The identifier for the module to load.
     * @returns {object} The exports of the loaded module.
     */
    function loadModule(moduleId) {
        // If the module is already in cache, return its exports.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // Prepare a new module object for caching.
        const currentModule = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        // Execute the module's definition function, populating its exports.
        // The 'moduleDefinitions' object holds all the module functions.
        moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

        // Mark the module as loaded.
        currentModule.loaded = true;
        return currentModule.exports;
    }

    // Store the module definitions for access by the loader.
    loadModule.definitions = moduleDefinitions;
    // Store the module cache.
    loadModule.loadedModules = moduleCache;

    /**
     * Defines an enumerable getter property on an object.
     * @param {object} targetObj The object to define the property on.
     * @param {string} propName The name of the property.
     * @param {Function} propGetter The getter function for the property.
     */
    loadModule.defineExportGetter = function(targetObj, propName, propGetter) {
        // Only define if the property doesn't already exist on the target.
        if (!Object.prototype.hasOwnProperty.call(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true,
                get: propGetter
            });
        }
    };

    /**
     * Marks an exports object as an ES module.
     * @param {object} moduleExports The exports object.
     */
    loadModule.markAsEsModule = function(moduleExports) {
        // If Symbol.toStringTag is available, set it to 'Module'.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExports, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // Always set __esModule to true.
        Object.defineProperty(moduleExports, '__esModule', {
            value: true
        });
    };

    /**
     * Retrieves an export, potentially handling default exports or module transformations.
     * @param {any} moduleVal The module value or ID.
     * @param {number} exportMode Flags indicating how to interpret the module.
     * @returns {any} The resolved export.
     */
    loadModule.resolveExport = function(moduleVal, exportMode) {
        // If bit 1 is set, moduleVal is a module ID, so load it.
        if (exportMode & 1) {
            moduleVal = loadModule(moduleVal);
        }
        // If bit 8 is set, return the module value directly.
        if (exportMode & 8) {
            return moduleVal;
        }
        // If bit 4 is set, and it's an object with __esModule, return it directly.
        if ((exportMode & 4) && typeof moduleVal === 'object' && moduleVal && moduleVal.__esModule) {
            return moduleVal;
        }

        // Create a new object for the resolved export.
        const resolvedExport = Object.create(null);
        loadModule.markAsEsModule(resolvedExport); // Mark it as an ES module.
        Object.defineProperty(resolvedExport, 'default', {
            enumerable: true,
            value: moduleVal
        }); // Set the default export.

        // If bit 2 is set and moduleVal is not a string, copy all its properties.
        if ((exportMode & 2) && typeof moduleVal !== 'string') {
            for (const propKey in moduleVal) {
                loadModule.defineExportGetter(resolvedExport, propKey, (function(key) {
                    return function() {
                        return moduleVal[key];
                    };
                })(propKey)); // Use a closure to capture propKey.
            }
        }
        return resolvedExport;
    };

    /**
     * Creates a getter function for a module's default export.
     * @param {object} moduleObj The module object.
     * @returns {Function} A function that returns the default export.
     */
    loadModule.getDefaultExportGetter = function(moduleObj) {
        // If it's an ES module, return its default property. Otherwise, return the module itself.
        const exportFn = moduleObj && moduleObj.__esModule ?
            function() {
                return moduleObj.default;
            } :
            function() {
                return moduleObj;
            };
        loadModule.defineExportGetter(exportFn, 'a', exportFn); // Define a 'a' property that is the function itself.
        return exportFn;
    };

    /**
     * Checks if an object has a property.
     * @param {object} targetObj The object to check.
     * @param {string} propertyName The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    loadModule.hasOwn = function(targetObj, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObj, propertyName);
    };

    // Placeholder for the public path (often used for dynamic imports).
    loadModule.publicPath = "";

    // Start the application by loading the entry module (module 15).
    loadModule(loadModule.startModule = 15);

})({
    /**
     * Module 0: Contains utility functions for asynchronous operations and input processing.
     */
    0: function(moduleContext, moduleExports, localRequire) {
        "use strict"; // Enforce strict mode for this module.

        // Type II/III: Renamed __awaiter and __generator helpers, slightly reordered.
        // Helper for transpiling async/await functions.
        const asyncOperationWrapper = (currentContext, args, promiseConstructor, generatorFunc) => {
            return new(promiseConstructor || (promiseConstructor = Promise))(function(resolveCallback, rejectCallback) {
                function step(nextVal) {
                    try {
                        const nextResult = generatorFunc.next(nextVal);
                        nextResult.done ? resolveCallback(nextResult.value) :
                            new Promise(innerResolve => innerResolve(nextResult.value)).then(step, rejectCallback);
                    } catch (error) {
                        rejectCallback(error);
                    }
                }
                step((generatorFunc = generatorFunc.apply(currentContext, args || [])).next());
            });
        };

        // Helper for transpiling generator functions.
        const createAsyncIterator = (currentContext, args) => {
            let state, // Holds the current generator state.
                currentYielded, // Value yielded in the current step.
                currentInstruction, // The current instruction being processed.
                generatorObject = { // The object returned by the generator function.
                    label: 0,
                    sent: function() {
                        if (currentInstruction[0] & 1) {
                            throw currentInstruction[1];
                        }
                        return currentInstruction[1];
                    },
                    trys: [],
                    ops: []
                };

            const iterator = {
                next: handleOperation(0),
                throw: handleOperation(1),
                return: handleOperation(2)
            };

            // If Symbol.iterator is available, make the generator object iterable.
            if (typeof Symbol === 'function' && Symbol.iterator) {
                iterator[Symbol.iterator] = function() {
                    return this;
                };
            }

            return iterator;

            function handleOperation(operationType) {
                return function(inputVal) {
                    return (function(currentOperation, data) {
                        if (state) {
                            throw new TypeError("Generator is already executing.");
                        }
                        while (generatorObject) {
                            try {
                                if (state = 1, currentYielded && (currentInstruction = currentOperation & 2 ? currentYielded.return : currentOperation ? currentYielded.throw || ((currentInstruction = currentYielded.return) && currentInstruction.call(currentYielded), 0) : currentYielded.next) && !(currentInstruction = currentInstruction.call(currentYielded, data[1])).done) {
                                    return currentInstruction;
                                }
                                currentYielded = 0;
                                currentInstruction && (data = [currentOperation & 2, currentInstruction.value]);

                                // Type III: Swapped case order slightly for cosmetic change.
                                switch (data[0]) {
                                    case 1:
                                    case 0:
                                        currentInstruction = data;
                                        break;
                                    case 5:
                                        generatorObject.label++;
                                        currentYielded = data[1];
                                        data = [0];
                                        continue;
                                    case 4:
                                        generatorObject.label++;
                                        return {
                                            value: data[1],
                                            done: false
                                        };
                                    case 7:
                                        generatorObject.ops.pop();
                                        generatorObject.trys.pop();
                                        continue;
                                    default:
                                        if (!(currentInstruction = generatorObject.trys.length > 0 && generatorObject.trys[generatorObject.trys.length - 1]) && (data[0] === 6 || data[0] === 2)) {
                                            generatorObject = 0;
                                            continue;
                                        }
                                        if (data[0] === 3 && (!currentInstruction || data[1] > currentInstruction[0] && data[1] < currentInstruction[3])) {
                                            generatorObject.label = data[1];
                                            break;
                                        }
                                        if (data[0] === 6 && generatorObject.label < currentInstruction[1]) {
                                            generatorObject.label = currentInstruction[1];
                                            currentYielded = currentInstruction;
                                            break;
                                        }
                                        if (currentInstruction && generatorObject.label < currentInstruction[2]) {
                                            generatorObject.label = currentInstruction[2];
                                            generatorObject.ops.push(data);
                                            break;
                                        }
                                        currentInstruction[2] && generatorObject.ops.pop();
                                        generatorObject.trys.pop();
                                        continue;
                                }
                                data = args.call(currentContext, generatorObject);
                            } catch (error) {
                                data = [6, error];
                                currentYielded = 0;
                            } finally {
                                state = currentInstruction = 0;
                            }
                            if (data[0] & 5) {
                                throw data[1];
                            }
                            return {
                                value: data[0] ? data[1] : undefined,
                                done: true
                            };
                        }
                    })([operationType, inputVal]);
                };
            }
        };

        // Type III: Renamed and slightly altered importDefaultHelper.
        const importDefaultHelper = (importedModule) => {
            // If it's an ES module, return it directly. Otherwise, wrap it in a default export.
            if (importedModule && importedModule.__esModule) {
                return importedModule;
            }
            return {
                default: importedModule
            };
        };

        const currentModuleScope = this; // Capture the current 'this' context.
        moduleExports.__esModule = true; // Mark this module as an ES module.

        // Import the 'fs' module for file system operations.
        const fileSystem = importDefaultHelper(localRequire(1));

        /**
         * Asynchronously reads content from standard input (/dev/stdin).
         * @returns {Promise<string>} A promise that resolves with the input string or rejects with an error.
         */
        moduleExports.readStandardInput = function() {
            return new Promise((resolve, reject) => {
                fileSystem.default.readFile("/dev/stdin", "utf8", (err, data) => {
                    if (err) {
                        // Type III: Added a more descriptive error message.
                        reject(new Error(`Failed to read standard input: ${err.message}`));
                    } else {
                        resolve(data);
                    }
                });
            });
        };

        /**
         * Generates an iterator for words found in a given text string.
         * Words are delimited by whitespace. Empty strings are filtered out.
         * @param {string} inputText The string to tokenize.
         * @returns {Generator<string>} A generator yielding word tokens.
         */
        function* generateWordTokens(inputText) {
            // Type III: Replaced split/filter with a manual loop for tokenization.
            // This is a more explicit and slightly different implementation.
            let startIndex = -1;
            for (let charIndex = 0; charIndex <= inputText.length; charIndex++) {
                const char = inputText[charIndex];
                const isWhitespace = char === ' ' || char === '\n' || char === '\r' || char === '\t';
                const isEndOfInput = charIndex === inputText.length;

                if (isWhitespace || isEndOfInput) {
                    if (startIndex !== -1) {
                        // Found a word, yield it.
                        yield inputText.substring(startIndex, charIndex);
                        startIndex = -1; // Reset start index.
                    }
                } else {
                    // Not whitespace, part of a word.
                    if (startIndex === -1) {
                        startIndex = charIndex; // Mark the start of a new word.
                    }
                }
            }
        }

        moduleExports.createWordIterator = generateWordTokens; // Expose the generator function.

        /**
         * Asynchronously retrieves a function that yields the next integer from standard input.
         * It reads the entire input, tokenizes it into words, and then provides a function
         * to parse and return these words as integers sequentially.
         * @returns {Promise<Function>} A promise that resolves to a function,
         *          which when called, returns the next integer.
         */
        moduleExports.retrieveNextInteger = function() {
            // Type II: Renamed variables.
            // Type III: Added an intermediate variable for clarity.
            return asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
                const rawInputString = yield asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
                    return yield moduleExports.readStandardInput();
                }));

                // Type III: Added guard clause for empty input.
                if (!rawInputString || rawInputString.trim().length === 0) {
                    console.warn("Warning: Standard input was empty or contained only whitespace.");
                    // Return a function that always throws or returns NaN.
                    return function() { return NaN; };
                }

                const wordIterator = generateWordTokens(rawInputString);

                // Return a function that, when called, fetches and parses the next word.
                return function() {
                    const nextTokenResult = wordIterator.next();
                    if (nextTokenResult.done) {
                        // Type III: Improved error message for end of input.
                        throw new Error("End of input reached, no more integers available.");
                    }
                    const parsedValue = parseInt(nextTokenResult.value, 10);
                    // Type III: Added validation for NaN.
                    if (isNaN(parsedValue)) {
                        console.warn(`Warning: Could not parse "${nextTokenResult.value}" as an integer.`);
                    }
                    return parsedValue;
                };
            }));
        };

        /**
         * Asynchronously retrieves a function that yields the next token from standard input.
         * This version uses a slightly different, more "manual" parsing approach
         * to tokenize the input, yielding each word-like sequence.
         * @returns {Promise<Function>} A promise that resolves to a function,
         *          which when called, returns the next token string.
         */
        moduleExports.scanNextToken = function() {
            // Type II: Renamed variables.
            return asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
                const fullInputText = yield asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
                    return yield moduleExports.readStandardInput();
                }));

                // Type III: Added guard clause for empty input.
                if (!fullInputText || fullInputText.trim().length === 0) {
                    console.warn("Warning: Standard input was empty or contained only whitespace for token scan.");
                    return function() { return undefined; };
                }

                // Internal generator for scanning tokens.
                const tokenScanner = (function*() {
                    let tokenStart = -1;
                    let currentPosition = 0;

                    // Type III: Changed loop condition slightly, added intermediate checks.
                    while (currentPosition <= fullInputText.length) {
                        const charAtCurrent = fullInputText[currentPosition];
                        const isDelimiter = (charAtCurrent === ' ' || charAtCurrent === '\n' || charAtCurrent === '\r' || charAtCurrent === '\t' || charAtCurrent === undefined); // undefined for end of string.

                        if (isDelimiter) {
                            if (tokenStart !== -1) {
                                // Found a complete token.
                                const extractedToken = fullInputText.substring(tokenStart, currentPosition);
                                tokenStart = -1; // Reset for the next token.
                                yield extractedToken;
                            }
                        } else {
                            // Part of a token.
                            if (tokenStart === -1) {
                                tokenStart = currentPosition; // Mark the beginning of a new token.
                            }
                        }
                        currentPosition++;
                    }
                })(); // Immediately invoke the generator function to get the iterator.

                // Return a function that, when called, fetches the next token from the iterator.
                return function() {
                    const nextItem = tokenScanner.next();
                    if (nextItem.done) {
                        // Type III: More descriptive message.
                        // console.log("End of token stream reached."); // Could be useful for debugging.
                        return undefined; // Or throw an error, depending on desired behavior.
                    }
                    return nextItem.value;
                };
            }));
        };

        /**
         * Asynchronously retrieves a function that yields the next integer from standard input,
         * using the `scanNextToken` method for tokenization.
         * @returns {Promise<Function>} A promise that resolves to a function,
         *          which when called, returns the next parsed integer.
         */
        moduleExports.fetchNextParsedInteger = function() {
            // Type II: Renamed variables.
            return asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
                const getNextTokenFunc = yield asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
                    return yield moduleExports.scanNextToken();
                }));

                // Return a function that calls getNextTokenFunc and parses the result.
                return function() {
                    const token = getNextTokenFunc();
                    if (token === undefined) {
                        // Type III: Added check for undefined token and error message.
                        throw new Error("No more tokens available to parse as integer.");
                    }
                    const parsed = parseInt(token, 10);
                    if (isNaN(parsed)) {
                        console.error(`Error: Could not parse token "${token}" into an integer.`);
                        return NaN; // Or throw an error.
                    }
                    return parsed;
                };
            }));
        };
    },

    /**
     * Module 1: Exports the Node.js 'fs' module.
     */
    1: function(moduleContext, moduleExports) {
        // Type II: Renamed module parameters.
        moduleContext.exports = require("fs");
    },

    /**
     * Module 15: Main application logic.
     * This module reads three integers from input and performs a specific
     * sequence generation and comparison logic.
     */
    15: function(moduleContext, moduleExports, localRequire) {
        "use strict"; // Enforce strict mode.

        // Type II/III: Renamed __awaiter and __generator helpers, slightly reordered.
        // Helper for transpiling async/await functions.
        const asyncOperationWrapper = (currentContext, args, promiseConstructor, generatorFunc) => {
            return new(promiseConstructor || (promiseConstructor = Promise))(function(resolveCallback, rejectCallback) {
                function step(nextVal) {
                    try {
                        const nextResult = generatorFunc.next(nextVal);
                        nextResult.done ? resolveCallback(nextResult.value) :
                            new Promise(innerResolve => innerResolve(nextResult.value)).then(step, rejectCallback);
                    } catch (error) {
                        rejectCallback(error);
                    }
                }
                step((generatorFunc = generatorFunc.apply(currentContext, args || [])).next());
            });
        };

        // Helper for transpiling generator functions.
        const createAsyncIterator = (currentContext, args) => {
            let state, // Holds the current generator state.
                currentYielded, // Value yielded in the current step.
                currentInstruction, // The current instruction being processed.
                generatorObject = { // The object returned by the generator function.
                    label: 0,
                    sent: function() {
                        if (currentInstruction[0] & 1) {
                            throw currentInstruction[1];
                        }
                        return currentInstruction[1];
                    },
                    trys: [],
                    ops: []
                };

            const iterator = {
                next: handleOperation(0),
                throw: handleOperation(1),
                return: handleOperation(2)
            };

            // If Symbol.iterator is available, make the generator object iterable.
            if (typeof Symbol === 'function' && Symbol.iterator) {
                iterator[Symbol.iterator] = function() {
                    return this;
                };
            }

            return iterator;

            function handleOperation(operationType) {
                return function(inputVal) {
                    return (function(currentOperation, data) {
                        if (state) {
                            throw new TypeError("Generator is already executing.");
                        }
                        while (generatorObject) {
                            try {
                                if (state = 1, currentYielded && (currentInstruction = currentOperation & 2 ? currentYielded.return : currentOperation ? currentYielded.throw || ((currentInstruction = currentYielded.return) && currentInstruction.call(currentYielded), 0) : currentYielded.next) && !(currentInstruction = currentInstruction.call(currentYielded, data[1])).done) {
                                    return currentInstruction;
                                }
                                currentYielded = 0;
                                currentInstruction && (data = [currentOperation & 2, currentInstruction.value]);

                                // Type III: Swapped case order slightly for cosmetic change.
                                switch (data[0]) {
                                    case 1:
                                    case 0:
                                        currentInstruction = data;
                                        break;
                                    case 5:
                                        generatorObject.label++;
                                        currentYielded = data[1];
                                        data = [0];
                                        continue;
                                    case 4:
                                        generatorObject.label++;
                                        return {
                                            value: data[1],
                                            done: false
                                        };
                                    case 7:
                                        generatorObject.ops.pop();
                                        generatorObject.trys.pop();
                                        continue;
                                    default:
                                        if (!(currentInstruction = generatorObject.trys.length > 0 && generatorObject.trys[generatorObject.trys.length - 1]) && (data[0] === 6 || data[0] === 2)) {
                                            generatorObject = 0;
                                            continue;
                                        }
                                        if (data[0] === 3 && (!currentInstruction || data[1] > currentInstruction[0] && data[1] < currentInstruction[3])) {
                                            generatorObject.label = data[1];
                                            break;
                                        }
                                        if (data[0] === 6 && generatorObject.label < currentInstruction[1]) {
                                            generatorObject.label = currentInstruction[1];
                                            currentYielded = currentInstruction;
                                            break;
                                        }
                                        if (currentInstruction && generatorObject.label < currentInstruction[2]) {
                                            generatorObject.label = currentInstruction[2];
                                            generatorObject.ops.push(data);
                                            break;
                                        }
                                        currentInstruction[2] && generatorObject.ops.pop();
                                        generatorObject.trys.pop();
                                        continue;
                                }
                                data = args.call(currentContext, generatorObject);
                            } catch (error) {
                                data = [6, error];
                                currentYielded = 0;
                            } finally {
                                state = currentInstruction = 0;
                            }
                            if (data[0] & 5) {
                                throw data[1];
                            }
                            return {
                                value: data[0] ? data[1] : undefined,
                                done: true
                            };
                        }
                    })([operationType, inputVal]);
                };
            }
        };

        const currentModuleScope = this; // Capture the current 'this' context.
        moduleExports.__esModule = true; // Mark this module as an ES module.

        // Import input utility functions from module 0.
        const inputHandlers = localRequire(0);

        // Type III: Wrapped console.log for potential future modification/redirection.
        const outputResult = (message) => console.log(message);
        const outputPath = (pathArray) => console.log(pathArray.join(" "));

        asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
            // Type II: Renamed all variables for input values.
            // Type III: Added a helper variable for the integer reader function.
            const getNextParsedInteger = yield asyncOperationWrapper(currentModuleScope, undefined, undefined, createAsyncIterator(currentModuleScope, function*() {
                return yield inputHandlers.fetchNextParsedInteger();
            }));

            // Read three integer values from input.
            const numberOfBits = getNextParsedInteger();
            const startBitmask = getNextParsedInteger();
            const endBitmask = getNextParsedInteger();

            // Type III: Added a guard clause for invalid input.
            if (isNaN(numberOfBits) || isNaN(startBitmask) || isNaN(endBitmask)) {
                outputResult("Error: Invalid integer input received.");
                return;
            }

            /**
             * Calculates the Hamming distance (number of differing bits) between two integers.
             * @param {number} num1 The first integer.
             * @param {number} num2 The second integer.
             * @returns {number} The Hamming distance.
             */
            const calculateBitDifference = (num1, num2) => {
                let diffCount = 0;
                // Type III: Changed loop from `for` to `while` for cosmetic change.
                let bitPosition = 0;
                while (bitPosition < numberOfBits) {
                    const bit1 = (num1 >> bitPosition) & 1;
                    const bit2 = (num2 >> bitPosition) & 1;
                    if (bit1 !== bit2) {
                        diffCount++;
                    }
                    bitPosition++;
                }
                return diffCount;
            };

            // If the Hamming distance between start and end bitmasks is not 1,
            // then a direct path (single bit flip) is not possible.
            // Type III: Rewrote the condition and output.
            if (calculateBitDifference(startBitmask, endBitmask) !== 1) {
                outputResult("NO");
                return; // Exit early.
            }

            /**
             * Expands a sequence by adding inverted elements with an offset.
             * This creates a cyclic structure.
             * @param {number[]} initialSequence The original sequence of numbers.
             * @param {number} bitOffset The bit position to use for modification.
             * @returns {number[]} The expanded sequence.
             */
            const generateExtendedSequence = (initialSequence, bitOffset) => {
                // Type III: Changed to use Array.from for initialization and for...of for iteration.
                const extendedArray = Array.from({
                    length: initialSequence.length * 2
                });
                let originalLength = initialSequence.length;

                for (let i = 0; i < originalLength; i++) {
                    extendedArray[i] = initialSequence[i];
                }

                let reverseIndex = originalLength - 1;
                for (let i = originalLength; i < extendedArray.length; i++) {
                    // Invert the bit at 'bitOffset' for the reversed element.
                    extendedArray[i] = initialSequence[reverseIndex] ^ (1 << bitOffset);
                    reverseIndex--;
                }
                return extendedArray;
            };

            /**
             * Finds the index of a value within an array.
             * Type III: Replaced with native Array.prototype.indexOf for simplicity,
             * but could be rewritten as a manual loop again.
             * @param {number} value The value to search for.
             * @param {number[]} array The array to search in.
             * @returns {number} The index of the value, or -1 if not found.
             */
            const findValueIndex = (value, array) => array.indexOf(value);

            /**
             * Generates the final sequence of bitmasks based on the number of bits.
             * This function constructs a complex sequence by iteratively applying
             * transformations and inversions.
             * @param {number} maxBits The total number of bits (N).
             * @returns {number[]} The final generated sequence.
             */
            const constructFinalSequence = (maxBits) => {
                // Type II: Renamed internal variables.
                // Type III: Changed initial array, added helper for modulo arithmetic.
                let currentSequence = [0, 1];
                const getModuloIndex = (idx, len) => (idx - 1 + len) % len; // Helper for previous index.

                for (let bitPosition = 1; bitPosition < maxBits; bitPosition++) {
                    // Check if the current bit differs between the start and end masks.
                    if (((startBitmask >> bitPosition) & 1) !== ((endBitmask >> bitPosition) & 1)) {
                        // If different, reverse a segment of the current sequence.
                        const currentStartBitValue = startBitmask & ((1 << bitPosition) - 1); // Extract lower bits of start mask.

                        const reversedSegment = [];
                        // Find the starting point for reversal in the sequence.
                        let seqIndex = getModuloIndex(findValueIndex(currentStartBitValue, currentSequence), currentSequence.length);

                        // Collect elements in reverse order until the start bit value is found again.
                        // Type III: Rewrote the loop for collecting segment.
                        let firstEncountered = false;
                        while (!firstEncountered || currentSequence[seqIndex] !== currentStartBitValue) {
                            reversedSegment.push(currentSequence[seqIndex]);
                            if (currentSequence[seqIndex] === currentStartBitValue) {
                                firstEncountered = true;
                            }
                            seqIndex = getModuloIndex(seqIndex, currentSequence.length);
                        }
                        reversedSegment.push(currentStartBitValue); // Add the start value itself.

                        currentSequence = reversedSegment; // Replace the sequence with the reversed segment.
                    }
                    // Expand the sequence by adding inverted elements for the current bit position.
                    currentSequence = generateExtendedSequence(currentSequence, bitPosition);
                }
                return currentSequence;
            };

            // Generate the final sequence.
            const finalBitSequence = constructFinalSequence(numberOfBits);

            // Find the index of the starting bitmask in the final sequence.
            const initialSequenceIndex = findValueIndex(startBitmask, finalBitSequence);

            // Define functions for cyclic navigation within the sequence.
            const getCyclicPrevIndex = (idx) => (idx - 1 + finalBitSequence.length) % finalBitSequence.length;
            const getCyclicNextIndex = (idx) => (idx + 1) % finalBitSequence.length;

            // Determine the neighbors of the initial index.
            const forwardNeighborIndex = getCyclicNextIndex(initialSequenceIndex);
            const backwardNeighborIndex = getCyclicPrevIndex(initialSequenceIndex);

            let pathResult = []; // Array to store the path.

            // Check if the forward path leads to the end bitmask.
            if (finalBitSequence[forwardNeighborIndex] === endBitmask) {
                // Path found by moving forward from initial index.
                pathResult = []; // Clear previous path.
                let currentPathElement = initialSequenceIndex;
                // Type III: Changed loop condition from `d !== h` to `currentPathElement !== forwardNeighborIndex`.
                // Also used `do...while` for guaranteed first push.
                do {
                    pathResult.push(finalBitSequence[currentPathElement]);
                    currentPathElement = getCyclicPrevIndex(currentPathElement);
                } while (currentPathElement !== forwardNeighborIndex && currentPathElement !== initialSequenceIndex); // Prevent infinite loop on small cycles.
                pathResult.push(endBitmask); // Add the target.
                outputResult("YES");
                outputPath(pathResult);
            }
            // Check if the backward path leads to the end bitmask.
            else if (finalBitSequence[backwardNeighborIndex] === endBitmask) {
                // Path found by moving backward from initial index.
                pathResult = []; // Clear previous path.
                let currentPathElement = initialSequenceIndex;
                // Type III: Changed loop condition from `d !== p` to `currentPathElement !== backwardNeighborIndex`.
                do {
                    pathResult.push(finalBitSequence[currentPathElement]);
                    currentPathElement = getCyclicNextIndex(currentPathElement);
                } while (currentPathElement !== backwardNeighborIndex && currentPathElement !== initialSequenceIndex);
                pathResult.push(endBitmask); // Add the target.
                outputResult("YES");
                outputPath(pathResult);
            } else {
                // No direct neighbor path found.
                outputResult("NO");
            }
        }));
    }
});