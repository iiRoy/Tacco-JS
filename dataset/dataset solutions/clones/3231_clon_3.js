(function (moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    // It prevents re-execution of module code and ensures singletons.
    const loadedModulesCache = {};

    /**
     * Custom module loader function, mimicking a simplified CommonJS/Webpack require.
     * It loads, caches, and executes module definitions.
     * @param {number} requestedModuleId - The numeric identifier of the module to load.
     * @returns {object} The exports object of the loaded module.
     */
    function customRequire(requestedModuleId) {
        // If the module is already in our cache, return its exports immediately.
        if (loadedModulesCache[requestedModuleId]) {
            return loadedModulesCache[requestedModuleId].exports;
        }

        // If not cached, create a new module entity and store it.
        const newModuleEntity = loadedModulesCache[requestedModuleId] = {
            id: requestedModuleId,
            isLoaded: false,
            exports: {}
        };

        // Execute the module's definition function.
        // The 'call' method sets 'this' to newModuleEntity.exports,
        // and passes the module object, exports object, and our custom require function.
        moduleDefinitions[requestedModuleId].call(
            newModuleEntity.exports,
            newModuleEntity,
            newModuleEntity.exports,
            customRequire
        );

        // Mark the module as fully loaded.
        newModuleEntity.isLoaded = true;

        // Return the exports object of the newly loaded module.
        return newModuleEntity.exports;
    }

    // Attach the module definitions array to the customRequire function itself for internal access.
    customRequire.definitions = moduleDefinitions;
    // Attach the cache object to customRequire for introspection or advanced use.
    customRequire.cache = loadedModulesCache;

    /**
     * Defines a new enumerable getter property on a target object.
     * This is a utility function used for defining module exports.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {Function} getterFunction - The function that will be called to get the property's value.
     */
    customRequire.defineExportGetter = function (targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist to prevent errors.
        if (!customRequire.checkOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration (e.g., `for...in`).
                get: getterFunction // The function to retrieve the property's value.
            });
        }
    };

    /**
     * Marks an exports object as an ECMAScript Module (ESM).
     * This adds standard properties like `Symbol.toStringTag` and `__esModule` for compatibility.
     * @param {object} exportsObject - The module's exports object to be marked as an ESM.
     */
    customRequire.markAsEsModule = function (exportsObject) {
        // If `Symbol` and `Symbol.toStringTag` are available, define the module's string tag.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Define the `__esModule` property, which is a common indicator for ES modules.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    /**
     * Creates a "namespace object" for a module, handling various export types.
     * This is crucial for interoperability between CommonJS and ES Modules.
     * @param {any} moduleContent - The raw content or exports of the module.
     * @param {number} exportFlags - A bitmask indicating how to process the module content.
     *   - Bit 1: Treat `moduleContent` as a module ID to be `customRequire`d.
     *   - Bit 8: Return `moduleContent` directly (passthrough).
     *   - Bit 4: If `moduleContent` is an object and already an ESM, return it directly.
     *   - Bit 2: If `moduleContent` is an object (and not a string), copy all its own properties
     *            as named exports onto the namespace object.
     * @returns {object} The constructed namespace object.
     */
    customRequire.createNamespaceObject = function (moduleContent, exportFlags) {
        // Flag 1: If set, the moduleContent is actually a module ID; require it.
        if (exportFlags & 1) moduleContent = customRequire(moduleContent);
        // Flag 8: If set, return the moduleContent as is.
        if (exportFlags & 8) return moduleContent;
        // Flag 4: If set, and moduleContent is an object already marked as an ES Module, return it as is.
        if (exportFlags & 4 && typeof moduleContent === 'object' && moduleContent && moduleContent.__esModule) return moduleContent;

        // Otherwise, create a new namespace object for this module.
        const namespaceObject = Object.create(null);
        customRequire.markAsEsModule(namespaceObject); // Mark it as an ES Module.
        // Define a 'default' export pointing to the moduleContent.
        Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: moduleContent });

        // Flag 2: If set, and moduleContent is an object (not a string), copy its properties as named exports.
        if (exportFlags & 2 && typeof moduleContent !== 'string') {
            for (const key in moduleContent) {
                // Ensure the property is directly on moduleContent, not from its prototype chain.
                if (Object.prototype.hasOwnProperty.call(moduleContent, key)) {
                    // Define a getter for each property to create a live binding.
                    customRequire.defineExportGetter(namespaceObject, key, (() => moduleContent[key]).bind(null, key));
                }
            }
        }
        return namespaceObject;
    };

    /**
     * Provides a getter function for a module's default export.
     * This handles cases where `__esModule` might or might not be present.
     * @param {any} moduleExports - The raw exports object from a module.
     * @returns {Function} A function that, when called, returns the default export.
     */
    customRequire.getDefaultExportGetter = function (moduleExports) {
        // Determine the actual default export function based on `__esModule` flag.
        const defaultExportRetrieval = moduleExports && moduleExports.__esModule
            ? () => moduleExports.default // If it's an ESM, get its 'default' property.
            : () => moduleExports;     // Otherwise, the moduleExports itself is the default.

        // Define a property named 'a' (a common Webpack convention) that also returns the default export.
        customRequire.defineExportGetter(defaultExportRetrieval, 'a', defaultExportRetrieval);
        return defaultExportRetrieval;
    };

    /**
     * A utility to check if an object has a specific property as its own (non-inherited) property.
     * @param {object} obj - The object to inspect.
     * @param {string} prop - The name of the property to check for.
     * @returns {boolean} `true` if the object has the property, `false` otherwise.
     */
    customRequire.checkOwnProperty = function (obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };

    // Placeholder for the public path of assets, often empty in Node.js environments.
    customRequire.publicAssetPath = "";

    // Set the entry point module ID and immediately execute it to start the application.
    customRequire.entryPoint = 4;
    customRequire(customRequire.entryPoint);

// The array containing all module definitions. Each function is a module.
})([
    // Module 0: Input Handling Utilities
    function (module, exports, currentRequire) {
        "use strict";

        // --- TypeScript __awaiter helper START ---
        // This helper is a transpiled implementation for async/await functions.
        // It wraps generator functions to provide a promise-based asynchronous flow.
        const asyncFlowHandler = (targetThis, args, promiseConstructor, generatorFunction) => {
            return new (promiseConstructor || (promiseConstructor = Promise))(function (resolveCallback, rejectCallback) {
                // Step function to advance the generator
                function advanceGenerator(nextStep) {
                    try {
                        let result = generatorFunction.next(nextStep);
                        processGeneratorResult(result);
                    } catch (error) {
                        rejectCallback(error);
                    }
                }

                // Processes the result of a generator step
                function processGeneratorResult(generatorResult) {
                    if (generatorResult.done) {
                        resolveCallback(generatorResult.value);
                    } else {
                        // If the yielded value is a promise, wait for it before continuing.
                        // We wrap it in a new promise to ensure consistent promise behavior.
                        new promiseConstructor(innerResolve => innerResolve(generatorResult.value)).then(advanceGenerator, error => rejectCallback(error));
                    }
                }

                // Initialize the generator and start the asynchronous flow.
                // The generator function is first applied to its context and arguments.
                advanceGenerator((generatorFunction = generatorFunction.apply(targetThis, args || [])).next());
            });
        };
        // This helper is often attached to the `asyncFlowHandler` object in the original transpiled code.
        // For Type III, we explicitly attach it for clarity and to maintain the original's helper structure.
        asyncFlowHandler.await = (value) => value; // Simplified await, just returns value for direct use.
        // --- TypeScript __awaiter helper END ---

        // --- TypeScript __generator helper START ---
        // This helper manages the state and control flow of a generator function during transpilation.
        // It simulates generator execution with labels, try-catch blocks, and yield operations.
        const generatorStateController = (targetThis, args) => {
            let internalGeneratorRunning, // Flag to prevent re-entry
                lastYieldedValue,         // Stores the value from the last yield
                generatorInstruction,     // Current instruction for the generator
                stateMachine = {          // Object to hold generator state (labels, try blocks, ops)
                    label: 0,
                    sent: function () {
                        if (generatorInstruction[0] & 1) throw generatorInstruction[1];
                        return generatorInstruction[1];
                    },
                    tryBlocks: [],
                    operations: []
                };

            // Standard iterator methods for the generator object.
            const iteratorMethods = {
                next: createStepMethod(0),
                throw: createStepMethod(1),
                return: createStepMethod(2)
            };

            // If Symbol.iterator is available, make the object iterable.
            if (typeof Symbol === 'function' && Symbol.iterator) {
                iteratorMethods[Symbol.iterator] = function () { return this; };
            }

            return iteratorMethods;

            // Factory function to create next, throw, and return methods.
            function createStepMethod(actionType) {
                return function (value) {
                    return executeGeneratorStep([actionType, value]);
                };
            }

            // Core function to execute a single step of the generator.
            function executeGeneratorStep(stepInstruction) {
                // Guard: If generator is already executing, throw an error.
                if (internalGeneratorRunning) throw new TypeError("Generator is already executing.");

                while (stateMachine) {
                    try {
                        internalGeneratorRunning = 1; // Mark generator as running.

                        // Handle 'return' or 'throw' calls on a yielded promise/generator.
                        if (lastYieldedValue && (generatorInstruction = stepInstruction[0] & 2 ? lastYieldedValue.return : stepInstruction[0] ? lastYieldedValue.throw || ((generatorInstruction = lastYieldedValue.return) && generatorInstruction.call(lastYieldedValue), 0) : lastYieldedValue.next) && !(generatorInstruction = generatorInstruction.call(lastYieldedValue, stepInstruction[1])).done) {
                            return generatorInstruction;
                        }

                        lastYieldedValue = 0; // Reset the last yielded value.

                        // If generatorInstruction has a value, update stepInstruction.
                        if (generatorInstruction) stepInstruction = [stepInstruction[0] & 2, generatorInstruction.value];

                        // State machine for generator operations (yield, jump, try/catch).
                        switch (stepInstruction[0]) {
                            case 0: // next() call
                            case 1: // throw() call
                                generatorInstruction = stepInstruction;
                                break;
                            case 4: // Yield value (internal operation)
                                stateMachine.label++;
                                return { value: stepInstruction[1], done: false };
                            case 5: // Yield and jump (internal operation)
                                stateMachine.label++;
                                lastYieldedValue = stepInstruction[1];
                                stepInstruction = [0]; // Continue from this point.
                                continue;
                            case 7: // Pop a try block from the stack.
                                stateMachine.operations.pop();
                                stateMachine.tryBlocks.pop();
                                continue;
                            default: // Handles try/catch/finally blocks and general flow.
                                if (!(generatorInstruction = stateMachine.tryBlocks.length > 0 && stateMachine.tryBlocks[stateMachine.tryBlocks.length - 1]) && (stepInstruction[0] === 6 || stepInstruction[0] === 2)) {
                                    stateMachine = 0; // End generator if no more try blocks.
                                    continue;
                                }
                                if (stepInstruction[0] === 3 && (!generatorInstruction || stepInstruction[1] > generatorInstruction[0] && stepInstruction[1] < generatorInstruction[3])) {
                                    stateMachine.label = stepInstruction[1];
                                    break;
                                }
                                if (stepInstruction[0] === 6 && stateMachine.label < generatorInstruction[1]) {
                                    stateMachine.label = generatorInstruction[1];
                                    generatorInstruction = stepInstruction;
                                    break;
                                }
                                if (generatorInstruction && stateMachine.label < generatorInstruction[2]) {
                                    stateMachine.label = generatorInstruction[2];
                                    stateMachine.operations.push(stepInstruction);
                                    break;
                                }
                                if (generatorInstruction[2]) stateMachine.operations.pop();
                                stateMachine.tryBlocks.pop();
                                continue;
                        }
                        stepInstruction = args.call(targetThis, stateMachine);
                    } catch (error) {
                        stepInstruction = [6, error]; // Catch any error during execution.
                        lastYieldedValue = 0; // Reset yielded value.
                    } finally {
                        internalGeneratorRunning = generatorInstruction = 0; // Mark generator as not running.
                    }
                    if (stepInstruction[0] & 5) throw stepInstruction[1];
                    return { value: stepInstruction[0] ? stepInstruction[1] : undefined, done: true };
                }
            }
        };
        // Simplified `mark` function for Type III. In actual TS, this might do more.
        generatorStateController.mark = (genFn) => genFn;
        // --- TypeScript __generator helper END ---

        // --- TypeScript __importDefault helper START ---
        // Handles CommonJS modules being imported as ES modules, providing a 'default' export.
        const handleDefaultImport = (importedModule) => {
            return importedModule && importedModule.__esModule
                ? importedModule // If it's already an ES module, return it directly.
                : { default: importedModule }; // Otherwise, wrap it as a default export.
        };
        // --- TypeScript __importDefault helper END ---

        // Capture the 'this' context for consistent behavior within async/generator helpers.
        const currentExecutionScope = this;

        // Mark this module's exports as an ES Module for compatibility.
        exports.__esModule = true;

        // Import the Node.js 'fs' module using our custom require system.
        // We use 'node:fs' for modern Node.js environments.
        const fileSystemHandler = handleDefaultImport(currentRequire(1));

        /**
         * A generator function that tokenizes an input string by any sequence of whitespace characters.
         * It yields each non-empty token found.
         * @param {string} inputText - The string content to be tokenized.
         * @returns {Generator<string>} A generator that produces string tokens.
         */
        function* simpleWhitespaceTokenizer(inputText) {
            // Guard clause for empty input string
            if (!inputText || inputText.trim().length === 0) {
                return; // Yield nothing for empty input
            }
            // Split the input by one or more whitespace characters, then filter out any empty strings
            // that might result from leading/trailing/multiple delimiters.
            const tokens = inputText.split(/\s+/).filter(token => token.length > 0);
            for (const token of tokens) {
                yield token;
            }
        }

        /**
         * Asynchronously reads the entire content from standard input (`/dev/stdin`).
         * This function is specifically designed for environments where `/dev/stdin` is a file-like interface.
         * @returns {Promise<string>} A promise that resolves with the full content of stdin as a string,
         *                             or rejects with an error if reading fails.
         */
        exports.readEntireInput = function () {
            return new Promise((resolve, reject) => {
                fileSystemHandler.default.readFile("/dev/stdin", "utf8", (err, data) => {
                    if (err) {
                        // Log the error for better debugging in Type III clone.
                        console.error("Error encountered while attempting to read from stdin:", err.message);
                        return reject(err);
                    }
                    resolve(data);
                });
            });
        };

        // Export the simple whitespace tokenizer generator function.
        exports.createWhitespaceIterator = simpleWhitespaceTokenizer;

        /**
         * Asynchronously retrieves a function that, when called, will return the next integer
         * from the standard input, tokenized by simple whitespace.
         * @returns {Promise<() => number>} A promise resolving to a function that yields parsed integers.
         */
        exports.getNextIntFromWhitespace = function () {
            return asyncFlowHandler(currentExecutionScope, undefined, undefined, generatorStateController.mark(function* () {
                const rawInput = yield asyncFlowHandler.await(exports.readEntireInput());
                const tokenizer = simpleWhitespaceTokenizer(rawInput);
                return () => {
                    const nextTokenResult = tokenizer.next();
                    if (nextTokenResult.done) {
                        console.warn("Input exhausted: Attempted to read past end of input using simple whitespace tokenizer.");
                        return NaN; // Return NaN to indicate no more integers.
                    }
                    // Parse the token as an integer with an explicit radix of 10.
                    return parseInt(nextTokenResult.value, 10);
                };
            }));
        };

        /**
         * Asynchronously retrieves a function that provides the next token from standard input.
         * This tokenizer is more robust, handling various whitespace characters and newline gracefully,
         * similar to how `cin` works in C++ for reading words.
         * @returns {Promise<() => string|null>} A promise resolving to a function that returns the next string token,
         *                                       or `null` if no more tokens are available.
         */
        exports.createRobustTokenReader = function () {
            return asyncFlowHandler(currentExecutionScope, undefined, undefined, generatorStateController.mark(function* () {
                const fullInputText = yield asyncFlowHandler.await(exports.readEntireInput());
                let currentReadPosition = 0; // Tracks the current position in the input string.

                // An inline generator function for robust token parsing.
                function* robustTokenParser() {
                    let tokenStartIndex = -1; // Marks the beginning of a potential token.

                    // Iterate through the input string, including an implicit end-of-string check.
                    while (currentReadPosition <= fullInputText.length) {
                        const currentChar = fullInputText[currentReadPosition];
                        // Check for various whitespace characters or end of input.
                        const isWhitespaceOrEnd = (currentChar === ' ' || currentChar === '\n' || currentChar === '\r' || currentChar === '\t' || currentReadPosition === fullInputText.length);

                        if (isWhitespaceOrEnd) {
                            if (tokenStartIndex !== -1) {
                                // If we were in the middle of a token, extract it.
                                const token = fullInputText.substring(tokenStartIndex, currentReadPosition);
                                tokenStartIndex = -1; // Reset for the next token.
                                yield token;
                            }
                        } else {
                            // If it's a non-whitespace character, and we're not already in a token.
                            if (tokenStartIndex === -1) {
                                tokenStartIndex = currentReadPosition; // Mark the start of a new token.
                            }
                        }
                        currentReadPosition++; // Move to the next character.
                    }
                    // After the loop, check if there's an un-yielded token at the very end of the input.
                    if (tokenStartIndex !== -1 && tokenStartIndex < fullInputText.length) {
                        yield fullInputText.substring(tokenStartIndex, fullInputText.length);
                    }
                }
                const tokenIterator = robustTokenParser();
                return () => {
                    const result = tokenIterator.next();
                    if (result.done) {
                        console.warn("Robust token reader has exhausted all available input tokens.");
                        return null; // Indicate no more tokens.
                    }
                    return result.value;
                };
            }));
        };

        /**
         * Asynchronously retrieves a function that, when called, will return the next integer
         * from the standard input, using the robust token reader.
         * @returns {Promise<() => number>} A promise resolving to a function that yields parsed integers.
         */
        exports.getNextRobustInt = function () {
            return asyncFlowHandler(currentExecutionScope, undefined, undefined, generatorStateController.mark(function* () {
                const getNextToken = yield asyncFlowHandler.await(exports.createRobustTokenReader());
                return () => {
                    const token = getNextToken();
                    if (token === null) {
                        console.warn("Input exhausted: Attempted to read past end of input using robust integer reader.");
                        return NaN; // Indicate no more integers.
                    }
                    // Parse the token as an integer with an explicit radix of 10.
                    return parseInt(token, 10);
                };
            }));
        };
    },

    // Module 1: Node.js File System Module
    function (module, exports) {
        // This module simply exports the Node.js built-in 'fs' (file system) module.
        // Using 'node:fs' is a modern and recommended way to import built-in modules in Node.js.
        module.exports = require("node:fs");
    },

    // Module 2: Empty Placeholder Module
    function () { /* This module is intentionally left blank. */ },
    // Module 3: Empty Placeholder Module
    function () { /* This module is intentionally left blank. */ },

    // Module 4: Main Application Logic (Entry Point)
    function (module, exports, currentRequire) {
        "use strict";

        // Import TypeScript transpilation helpers from Module 0.
        const { asyncFlowHandler: mainAsyncHandler, generatorStateController: mainGeneratorController } = currentRequire(0);
        // Import input reading utilities from Module 0.
        const inputReadingUtilities = currentRequire(0);
        // Import the ArbitraryPrecisionBitwise class from Module 5.
        const { BigBit: ArbitraryPrecisionBitwise } = currentRequire(5);

        // Capture the 'this' context for consistent async operation.
        const mainExecutionScope = this;

        // The main asynchronous function that orchestrates the application logic.
        mainAsyncHandler(mainExecutionScope, undefined, undefined, mainGeneratorController.mark(function* () {
            console.log("Application initialized. Beginning input processing...");

            // Obtain the function responsible for reading the next integer using the robust reader.
            const getNextInputInteger = yield mainAsyncHandler.await(inputReadingUtilities.getNextRobustInt());

            // Read the first integer from input, which typically represents the number of subsequent elements.
            const numberOfElements = getNextInputInteger();
            console.log(`Input specifies processing for ${numberOfElements} data elements.`);

            // --- Type III: Added input validation for numberOfElements ---
            if (typeof numberOfElements !== 'number' || isNaN(numberOfElements) || numberOfElements <= 0) {
                console.error("Error: Invalid or non-positive number of elements received. Aborting processing.");
                return; // Terminate execution if input is invalid.
            }
            // --- End Type III addition ---

            // Initialize an array to store instances of ArbitraryPrecisionBitwise numbers.
            const bitwiseNumberCollection = new Array(numberOfElements);
            let firstBitwiseInstance = null; // To store the very first instance for a Type III example.

            // Loop to read the remaining integers and convert them into BigBit instances.
            for (let index = 0; index < numberOfElements; index++) {
                const currentIntValue = getNextInputInteger();

                // --- Type III: Added validation for each integer read ---
                if (typeof currentIntValue !== 'number' || isNaN(currentIntValue)) {
                    console.error(`Error: Failed to read a valid integer for element at index ${index}. Processing halted.`);
                    return; // Terminate if an invalid integer is encountered.
                }
                // --- End Type III addition ---

                const newBitwiseNumber = new ArbitraryPrecisionBitwise(currentIntValue);
                bitwiseNumberCollection[index] = newBitwiseNumber;

                // Store the first instance for later use (Type III addition).
                if (index === 0) {
                    firstBitwiseInstance = newBitwiseNumber;
                }
            }

            console.log("All specified elements have been successfully read and converted.");

            // --- Type III: Additional logic to demonstrate BigBit functionality ---
            if (firstBitwiseInstance) {
                // Example: Invert the first 64 bits of the first number.
                // This 'invertBits' method is a Type III addition to the BigBit class.
                const invertedFirst = firstBitwiseInstance.invertBits(64);
                console.log(`Original first element (binary): ${firstBitwiseInstance.toString()}`);
                console.log(`First element inverted (64 bits, binary): ${invertedFirst.toString()}`);
                console.log(`First element inverted (decimal): ${invertedFirst.toNumber()}`);
            }

            // Example: Calculate the bitwise XOR sum of all elements in the collection.
            if (bitwiseNumberCollection.length > 0) {
                let xorSum = new ArbitraryPrecisionBitwise(0); // Initialize sum with zero.
                for (const bitNum of bitwiseNumberCollection) {
                    xorSum = xorSum.xor(bitNum); // Accumulate XOR sum.
                }
                console.log(`Computed XOR sum of all elements (binary): ${xorSum.toString()}`);
                console.log(`Computed XOR sum of all elements (decimal): ${xorSum.toNumber()}`);
            } else {
                console.log("No elements were processed, so no XOR sum could be calculated.");
            }
            // --- End Type III addition ---

            console.log("Application logic completed successfully.");
        }));
    },

    // Module 5: Arbitrary Precision Bitwise Number Class
    function (module, exports) {
        "use strict";

        /**
         * The `ArbitraryPrecisionBitwise` class allows for bitwise operations on numbers
         * that can exceed JavaScript's standard `Number.MAX_SAFE_INTEGER`.
         * It represents numbers as an array of `0`s and `1`s, with the least significant bit (LSB)
         * stored at index 0.
         */
        const ArbitraryPrecisionBitwise = class ExtendedBitNumber {
            /**
             * Constructs an instance of `ArbitraryPrecisionBitwise`.
             * @param {number|string|Array<number>} initialValue - The value to initialize the number.
             *   - If a `number`, it's converted to its binary representation.
             *   - If a `string`, it's expected to be a binary string (e.g., "10110").
             *   - If an `Array<number>`, it's expected to be an array of `0`s and `1`s (LSB first).
             * @throws {Error} If the `initialValue` is of an unsupported type or invalid.
             */
            constructor(initialValue) {
                this.bitArray = []; // Stores the bits, LSB at index 0.

                if (typeof initialValue === 'number') {
                    // Type III: Added validation for integer input.
                    if (!Number.isInteger(initialValue)) {
                        throw new Error(`Initialization Error: Provided number "${initialValue}" is not an integer.`);
                    }
                    // Type III: Handle negative numbers by taking absolute value and warning.
                    if (initialValue < 0) {
                        console.warn(`Warning: Initializing ArbitraryPrecisionBitwise with a negative number (${initialValue}). ` +
                                     "Bitwise operations will treat its magnitude as positive.");
                        initialValue = Math.abs(initialValue);
                    }
                    this.bitArray = ExtendedBitNumber.convertBinaryStringToBitArray(initialValue.toString(2));
                } else if (typeof initialValue === 'string') {
                    const trimmedBinaryString = initialValue.replace(/^0+/, ''); // Remove leading zeros.
                    // If the string becomes empty after trimming, it represents the value zero.
                    this.bitArray = ExtendedBitNumber.convertBinaryStringToBitArray(trimmedBinaryString.length === 0 ? "0" : trimmedBinaryString);
                } else if (Array.isArray(initialValue)) {
                    // Type III: Validate that all array elements are indeed 0 or 1.
                    if (!initialValue.every(bit => bit === 0 || bit === 1)) {
                        throw new Error("Initialization Error: Input array for BitwiseNumber must contain only 0s and 1s.");
                    }
                    // Find the last '1' to effectively trim leading zeros in the LSB-first array.
                    const highestBitIndex = initialValue.lastIndexOf(1);
                    this.bitArray = highestBitIndex < 0 ? [0] : initialValue.slice(0, highestBitIndex + 1);
                } else {
                    // Type III: Throw an error for unsupported input types.
                    throw new Error(`Initialization Error: Unsupported type for BitwiseNumber constructor: ${typeof initialValue}.`);
                }

                // Ensure the bitArray is never empty; a number with no bits is effectively zero.
                if (this.bitArray.length === 0) {
                    this.bitArray = [0];
                }
            }

            /**
             * Performs a bitwise OR operation with another `ExtendedBitNumber` instance.
             * @param {ArbitraryPrecisionBitwise} otherNumber - The other number to perform OR with.
             * @returns {ArbitraryPrecisionBitwise} A new `ExtendedBitNumber` instance representing the result.
             */
            or(otherNumber) {
                return new ExtendedBitNumber(ExtendedBitNumber.performBitwiseOperation(
                    otherNumber,
                    this,
                    (bitA, bitB) => (bitA === 1 || bitB === 1) ? 1 : 0
                ));
            }

            /**
             * Performs a bitwise AND operation with another `ExtendedBitNumber` instance.
             * @param {ArbitraryPrecisionBitwise} otherNumber - The other number to perform AND with.
             * @returns {ArbitraryPrecisionBitwise} A new `ExtendedBitNumber` instance representing the result.
             */
            and(otherNumber) {
                return new ExtendedBitNumber(ExtendedBitNumber.performBitwiseOperation(
                    otherNumber,
                    this,
                    (bitA, bitB) => (bitA === 1 && bitB === 1) ? 1 : 0
                ));
            }

            /**
             * Performs a bitwise XOR operation with another `ExtendedBitNumber` instance.
             * @param {ArbitraryPrecisionBitwise} otherNumber - The other number to perform XOR with.
             * @returns {ArbitraryPrecisionBitwise} A new `ExtendedBitNumber` instance representing the result.
             */
            xor(otherNumber) {
                return new ExtendedBitNumber(ExtendedBitNumber.performBitwiseOperation(
                    otherNumber,
                    this,
                    (bitA, bitB) => (bitA !== bitB) ? 1 : 0
                ));
            }

            /**
             * Retrieves the value of the bit at a specific index.
             * The index starts from 0 for the Least Significant Bit (LSB).
             * @param {number} index - The zero-based index of the bit to retrieve.
             * @returns {number} `0` or `1` if the index is within bounds, otherwise `0` (implicitly extending with zeros).
             */
            getBitAtIndex(index) {
                // Type III: Explicitly return 0 for bits beyond the represented length.
                if (index < 0 || index >= this.bitArray.length) {
                    return 0;
                }
                return this.bitArray[index];
            }

            /**
             * Returns the index of the Most Significant Bit (MSB) that is '1'.
             * @returns {number} The zero-based index of the highest '1' bit, or `-1` if the number is zero.
             */
            getMostSignificantBitIndex() {
                if (this.isZero()) {
                    return -1; // A zero number has no '1' bits.
                }
                // Since `bitArray` stores LSB first, the highest index is `length - 1`.
                return this.bitArray.length - 1;
            }

            /**
             * Checks if the `ExtendedBitNumber` instance represents the value zero.
             * @returns {boolean} `true` if the number is zero, `false` otherwise.
             */
            isZero() {
                // A number is considered zero if its internal representation is a single `0`.
                return this.bitArray.length === 1 && this.bitArray[0] === 0;
            }

            /**
             * Returns the binary string representation of the number, with the Most Significant Bit (MSB) first.
             * @returns {string} The binary string (e.g., "1101").
             */
            toString() {
                // Create a shallow copy of the bit array, reverse it (to get MSB first), and join.
                return [...this.bitArray].reverse().join("");
            }

            /**
             * Converts the arbitrary precision bitwise number to a standard JavaScript `number`.
             * WARNING: This method can lead to loss of precision for numbers larger than `Number.MAX_SAFE_INTEGER` (2^53 - 1).
             * @returns {number} The decimal representation of the number.
             */
            toNumber() {
                // Type III: Add a warning for potential precision loss.
                if (this.bitArray.length > 53) {
                    console.warn("Warning: `toNumber()` may lose precision for numbers exceeding JavaScript's `Number.MAX_SAFE_INTEGER` (2^53 - 1).");
                }

                // Use `reduce` for a more functional approach to sum powers of 2.
                let decimalResult = this.bitArray.reduce((currentSum, bit, index) => {
                    if (bit === 1) {
                        const powerOfTwo = Math.pow(2, index);
                        // Type III: Check for potential overflow before adding.
                        if (currentSum + powerOfTwo > Number.MAX_SAFE_INTEGER) {
                            console.warn(`Overflow detected: Number exceeds MAX_SAFE_INTEGER at bit index ${index}. Result will be an approximation.`);
                            // Optionally, one could return a BigInt here if target environment supports it and it's desired.
                        }
                        return currentSum + powerOfTwo;
                    }
                    return currentSum;
                }, 0); // Start summation from 0.

                return decimalResult;
            }

            /**
             * Type III Addition: Inverts a specified number of the least significant bits of the number.
             * This creates a new `ArbitraryPrecisionBitwise` instance with the inverted bits.
             * @param {number} numBits - The count of least significant bits to invert. Must be a positive integer.
             * @returns {ArbitraryPrecisionBitwise} A new instance with the specified bits inverted.
             */
            invertBits(numBits) {
                // Guard clause: if numBits is invalid or zero, return a copy of the current number.
                if (!Number.isInteger(numBits) || numBits <= 0) {
                    console.warn(`Invalid number of bits (${numBits}) provided for invertBits. Returning a clone of the original.`);
                    return new ExtendedBitNumber([...this.bitArray]);
                }

                // The new bit array needs to be at least as long as `numBits` or the original length, whichever is greater.
                const newLength = Math.max(this.bitArray.length, numBits);
                const invertedBitArray = new Array(newLength);

                for (let i = 0; i < newLength; i++) {
                    if (i < numBits) {
                        // For the specified number of bits, invert their value.
                        invertedBitArray[i] = (this.getBitAtIndex(i) === 0) ? 1 : 0;
                    } else {
                        // For bits beyond `numBits`, retain their original value.
                        invertedBitArray[i] = this.getBitAtIndex(i);
                    }
                }
                return new ExtendedBitNumber(invertedBitArray);
            }


            // --- Static helper methods ---

            /**
             * Type III: Renamed and slightly simplified.
             * Checks if a given character is a valid binary digit ('0' or '1').
             * @param {string} char - The character to validate.
             * @returns {boolean} `true` if the character is '0' or '1', `false` otherwise.
             */
            static isValidBitChar(char) {
                return char === '0' || char === '1';
            }

            /**
             * Converts a binary string (MSB first, e.g., "1101") into an array of numbers (0 or 1),
             * with the Least Significant Bit (LSB) at index 0.
             * @param {string} binaryString - The binary string to convert.
             * @returns {Array<number>} An array of `0`s and `1`s representing the number.
             * @throws {Error} If the `binaryString` contains non-binary characters.
             */
            static convertBinaryStringToBitArray(binaryString) {
                // Type III: Added input validation for the binary string.
                if (typeof binaryString !== 'string' || binaryString.length === 0) {
                    // Default to zero representation for empty/invalid strings.
                    console.warn(`Warning: Empty or non-string input for convertBinaryStringToBitArray. Defaulting to [0]. Input: ${binaryString}`);
                    return [0];
                }

                // Type III: Validate that the string only contains '0' and '1'.
                if (!/^[01]+$/.test(binaryString)) {
                    throw new Error(`Conversion Error: Binary string "${binaryString}" contains invalid non-binary characters.`);
                }

                const bitResult = new Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    // Convert character '0' or '1' to numeric 0 or 1.
                    bitResult[i] = parseInt(binaryString[i], 10);
                }
                // Reverse the array so that the LSB is at index 0.
                return bitResult.reverse();
            }

            /**
             * Performs a generic bitwise operation between two `ExtendedBitNumber` instances.
             * It pads the shorter number with implicit zeros for consistent length during operation.
             * @param {ArbitraryPrecisionBitwise} numA - The first `ExtendedBitNumber`.
             * @param {ArbitraryPrecisionBitwise} numB - The second `ExtendedBitNumber`.
             * @param {Function} operationFn - A callback function `(bit1, bit2) => resultBit`
             *                                   that defines the bitwise logic (e.g., OR, AND, XOR).
             * @returns {Array<number>} A new array of `0`s and `1`s representing the result, LSB first.
             * @throws {Error} If inputs are not instances of `ArbitraryPrecisionBitwise`.
             */
            static performBitwiseOperation(numA, numB, operationFn) {
                // Type III: Added robust type checking for inputs.
                if (!(numA instanceof ExtendedBitNumber) || !(numB instanceof ExtendedBitNumber)) {
                    throw new Error("Bitwise operations must be performed between two instances of ArbitraryPrecisionBitwise.");
                }

                // Determine the maximum length required for the result array.
                const resultLength = Math.max(numA.bitArray.length, numB.bitArray.length);
                const resultArray = new Array(resultLength);

                for (let i = 0; i < resultLength; i++) {
                    // Retrieve bits, defaulting to 0 if the index is beyond a number's length (implicit zero padding).
                    const bitFromA = (i < numA.bitArray.length) ? numA.bitArray[i] : 0;
                    const bitFromB = (i < numB.bitArray.length) ? numB.bitArray[i] : 0;

                    // Apply the provided bitwise logic function.
                    resultArray[i] = operationFn(bitFromA, bitFromB);
                }
                // The `resultArray` is already in LSB-first order.
                // The constructor will handle trimming any leading zeros (which would be trailing zeros in this LSB-first array).
                return resultArray;
            }
        };

        // Export the class under the name `BigBit` as per the original module's export.
        exports.BigBit = ArbitraryPrecisionBitwise;
    }
]);