/* This is a custom module loader / bundler boilerplate */
!function(moduleDefinitions) {
    // Cache for loaded modules.
    let moduleCache = {};

    /**
     * Custom require function to load modules.
     * @param {number} requestedModuleId The ID of the module to load.
     * @returns {object} The exports of the loaded module.
     */
    function requireModule(requestedModuleId) {
        // If module is already in cache, return its exports.
        if (moduleCache[requestedModuleId]) {
            return moduleCache[requestedModuleId].exports;
        }

        // Initialize a new module instance and add it to cache.
        const moduleInstance = moduleCache[requestedModuleId] = {
            id: requestedModuleId,   // The module's unique identifier.
            isLoaded: false,         // Flag indicating if the module has been loaded.
            exports: {}              // The object that will hold the module's exports.
        };

        // Execute the module function with its context and exports.
        moduleDefinitions[requestedModuleId].call(
            moduleInstance.exports,
            moduleInstance,
            moduleInstance.exports,
            requireModule
        );

        // Mark the module as loaded.
        moduleInstance.isLoaded = true;
        return moduleInstance.exports;
    }

    // Store the module definitions on the require function itself.
    requireModule.modules = moduleDefinitions;
    // Store the module cache on the require function.
    requireModule.cache = moduleCache;

    /**
     * Defines a getter property on an object if it doesn't already exist.
     * @param {object} targetObject The object to define the property on.
     * @param {string} propertyName The name of the property.
     * @param {function} getterFunction The getter function for the property.
     */
    requireModule.defineGetter = (targetObject, propertyName, getterFunction) => {
        // Only define if property doesn't exist.
        if (!requireModule.hasOwnProp(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make it enumerable.
                get: getterFunction // Set the getter.
            });
        }
    };

    /**
     * Registers a module as an ES module, adding __esModule and Symbol.toStringTag properties.
     * @param {object} targetObject The module exports object.
     */
    requireModule.registerNamespace = (targetObject) => {
        // Add Symbol.toStringTag if supported by the environment.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
        }
        // Mark as an ES module.
        Object.defineProperty(targetObject, "__esModule", { value: true });
    };

    /**
     * Handles interop for different module types (CommonJS, ES Modules).
     * @param {*} importedModule The module to interop.
     * @param {number} flags Flags for interop behavior.
     * @returns {*} The interop-ed module.
     */
    requireModule.interopRequire = (importedModule, flags) => {
        // Flag 1: If it's a direct require, get the module.
        if (flags & 1) {
            importedModule = requireModule(importedModule);
        }
        // Flag 8: If it's already a module, return it directly.
        if (flags & 8) {
            return importedModule;
        }
        // Flag 4: If it's an object and already an ES module, return it.
        if ((flags & 4) && typeof importedModule === "object" && importedModule && importedModule.__esModule) {
            return importedModule;
        }

        // Create a new namespace object.
        const namespaceObject = Object.create(null);
        requireModule.registerNamespace(namespaceObject); // Register as ES module.
        // Define 'default' export.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: importedModule
        });

        // Flag 2: If it's not a string and has properties, copy them.
        if ((flags & 2) && typeof importedModule !== "string") {
            for (const propertyKey in importedModule) {
                // Define a getter for each property.
                requireModule.defineGetter(
                    namespaceObject,
                    propertyKey,
                    ((currentKey) => importedModule[currentKey]).bind(undefined, propertyKey)
                );
            }
        }
        return namespaceObject;
    };

    /**
     * Gets a function that returns the default export of a module.
     * @param {*} moduleValue The module value.
     * @returns {function} A function that returns the default export.
     */
    requireModule.getDefaultExport = (moduleValue) => {
        // If it's an ES module, return its default property, otherwise return the module itself.
        const defaultExportAccessor = moduleValue && moduleValue.__esModule
            ? () => moduleValue.default
            : () => moduleValue;

        // Define an 'a' getter for compatibility.
        requireModule.defineGetter(defaultExportAccessor, "a", defaultExportAccessor);
        return defaultExportAccessor;
    };

    /**
     * Checks if an object has its own property directly.
     * @param {object} obj The object to check.
     * @param {string} key The property key.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    requireModule.hasOwnProp = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

    // Public path for assets (empty in this case).
    requireModule.publicPath = "";

    // Start the application by requiring the entry point module (ID 15).
    requireModule(requireModule.startupModuleId = 15);
}({ /* Module Definitions Start Here */

    /* Module 0: Input Utility Functions */
    0: function(currentModule, exportsObject, localRequire) {
        "use strict";

        // Polyfill for async/await (TypeScript __awaiter helper).
        const asyncWrapper = (thisContext, argsArray, promiseConstructor, generatorFunc) => {
            return new (promiseConstructor || (promiseConstructor = Promise))(function(resolver, rejector) {
                function step(value) {
                    try {
                        // Advance the generator.
                        processResult(generatorFunc.next(value));
                    } catch (error) {
                        rejector(error);
                    }
                }
                function errorStep(error) {
                    try {
                        // Throw error into generator.
                        processResult(generatorFunc.throw(error));
                    } catch (error) {
                        rejector(error);
                    }
                }
                function processResult(iteration) {
                    // If generator is done, resolve/reject the promise.
                    iteration.done
                        ? resolver(iteration.value)
                        : new promiseConstructor(resolveValue => resolveValue(iteration.value)).then(step, errorStep);
                }
                // Start the generator.
                processResult((generatorFunc = generatorFunc.apply(thisContext, argsArray || [])).next());
            });
        };

        // Polyfill for generator functions (TypeScript __generator helper).
        const generatorImpl = (thisContext, initialArgs) => {
            let internalState,
                iterationResult,
                currentOperation,
                generatorState = {
                    label: 0,
                    sent: function() {
                        if (currentOperation[0] & 1) throw currentOperation[1];
                        return currentOperation[1];
                    },
                    trys: [],
                    ops: []
                };

            const iteratorMethods = {
                next: provideArgument(0),
                throw: provideArgument(1),
                return: provideArgument(2)
            };

            // Add Symbol.iterator if available.
            if (typeof Symbol === "function" && Symbol.iterator) {
                iteratorMethods[Symbol.iterator] = function() { return this; };
            }

            return iteratorMethods;

            function provideArgument(argType) {
                return (inputArg) => executeGenerator([argType, inputArg]);
            }

            function executeGenerator(instruction) {
                if (internalState) throw new TypeError("Generator is already executing.");
                // Main generator loop.
                for (; generatorState; ) {
                    try {
                        internalState = 1; // Mark as executing.
                        if (iterationResult && (currentOperation = instruction[0] & 2 ? iterationResult.return : instruction[0] ? iterationResult.throw || ((currentOperation = iterationResult.return) && currentOperation.call(iterationResult), 0) : iterationResult.next) && !(currentOperation = currentOperation.call(iterationResult, instruction[1])).done) {
                            return currentOperation;
                        }
                        iterationResult = 0; // Reset result.
                        currentOperation && (instruction = [instruction[0] & 2, currentOperation.value]);

                        switch (instruction[0]) {
                            case 0: // Next
                            case 1: // Throw
                                currentOperation = instruction;
                                break;
                            case 4: // Yield
                                generatorState.label++;
                                return { value: instruction[1], done: false };
                            case 5: // Yield* (start)
                                generatorState.label++;
                                iterationResult = instruction[1];
                                instruction = [0];
                                continue;
                            case 7: // Yield* (end)
                                instruction = generatorState.ops.pop();
                                generatorState.trys.pop();
                                continue;
                            default:
                                if (!(currentOperation = generatorState.trys.length > 0 && generatorState.trys[generatorState.trys.length - 1]) && (instruction[0] === 6 || instruction[0] === 2)) {
                                    generatorState = 0;
                                    continue;
                                }
                                if (instruction[0] === 3 && (!currentOperation || instruction[1] > currentOperation[0] && instruction[1] < currentOperation[3])) {
                                    generatorState.label = instruction[1];
                                    break;
                                }
                                if (instruction[0] === 6 && generatorState.label < currentOperation[1]) {
                                    generatorState.label = currentOperation[1];
                                    currentOperation = instruction;
                                    break;
                                }
                                if (currentOperation && generatorState.label < currentOperation[2]) {
                                    generatorState.label = currentOperation[2];
                                    generatorState.ops.push(instruction);
                                    break;
                                }
                                currentOperation[2] && generatorState.ops.pop();
                                generatorState.trys.pop();
                                continue;
                        }
                        instruction = initialArgs.call(thisContext, generatorState);
                    } catch (exception) {
                        instruction = [6, exception];
                        iterationResult = 0;
                    } finally {
                        internalState = currentOperation = 0; // Reset state.
                    }
                    if (instruction[0] & 5) throw instruction[1];
                    return { value: instruction[0] ? instruction[1] : undefined, done: true };
                }
            }
        };

        // Polyfill for __importDefault helper.
        const defaultImporter = (moduleToImport) => {
            return moduleToImport && moduleToImport.__esModule
                ? moduleToImport
                : { default: moduleToImport };
        };

        // Store 'this' context.
        const currentContext = this;

        // Mark this module as an ES module.
        exportsObject.__esModule = true;

        // Import the 'fs' module.
        const fileSystemUtil = defaultImporter(localRequire(1));

        /**
         * Creates a generator that yields words from a given text string.
         * Words are separated by whitespace.
         * @param {string} inputString The string to tokenize.
         * @returns {Generator<string>} A generator yielding words.
         */
        function getWordTokenizer(inputString) {
            let wordParts, currentSegmentIndex;
            return generatorImpl(this, function(generatorState) {
                switch (generatorState.label) {
                    case 0:
                        // Split the input string by whitespace and filter out empty strings.
                        wordParts = inputString.split(/\s+/).filter(segment => segment.length > 0);
                        currentSegmentIndex = 0;
                        generatorState.label = 1;
                    case 1:
                        // Loop through word parts.
                        return currentSegmentIndex < wordParts.length
                            ? [4, wordParts[currentSegmentIndex]] // Yield current word.
                            : [3, 4];                             // End if no more words.
                    case 2:
                        generatorState.sent(); // Consume the yielded value.
                        generatorState.label = 3;
                    case 3:
                        currentSegmentIndex++; // Move to the next word.
                        return [3, 1];         // Continue loop.
                    case 4:
                        return [2];            // Generator done.
                }
            });
        }

        /**
         * Reads content from standard input asynchronously.
         * @returns {Promise<string>} A promise that resolves with the input content.
         */
        exportsObject.retrieveInputContent = () => {
            return new Promise((promiseResolve, promiseReject) => {
                fileSystemUtil.default.readFile("/dev/stdin", "utf8", (errorVal, dataContent) => {
                    if (errorVal) {
                        promiseReject(errorVal); // Reject if there's an error.
                    } else {
                        promiseResolve(dataContent); // Resolve with data.
                    }
                });
            });
        };

        // Export the word tokenizer generator.
        exportsObject.retrieveWordTokenizer = getWordTokenizer;

        /**
         * Gets a function that returns the next integer from standard input.
         * It reads all input once and then provides a closure for subsequent calls.
         * @returns {Promise<function(): number>} A promise resolving to a function that returns the next integer.
         */
        exportsObject.retrieveNextInteger = () => {
            return asyncWrapper(currentContext, undefined, undefined, function*() {
                let inputContent;
                let wordTokenizer;
                switch ((yield generatorImpl(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            // Await the full input content.
                            return [4, exportsObject.retrieveInputContent()];
                        case 1:
                            inputContent = generatorState.sent();
                            // Create a word tokenizer from the input.
                            wordTokenizer = getWordTokenizer(inputContent);
                            // Return a closure that parses the next token as an integer.
                            return [2, () => parseInt(wordTokenizer.next().value)];
                    }
                }))).label) { /* no-op */ }
            });
        };

        /**
         * Gets a function that returns the next token (word) from standard input.
         * This uses a slightly different tokenization strategy, specifically for contiguous non-whitespace.
         * @returns {Promise<function(): string>} A promise resolving to a function that returns the next token.
         */
        exportsObject.retrieveNextToken = () => {
            return asyncWrapper(currentContext, undefined, undefined, function*() {
                let inputBuffer;
                let tokenExtractor;

                switch ((yield generatorImpl(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            // Await the full input content.
                            return [4, exportsObject.retrieveInputContent()];
                        case 1:
                            inputBuffer = generatorState.sent();

                            // Define an inner generator for token extraction.
                            tokenExtractor = function() {
                                let startIndex, scanIndex, extractedToken;
                                return generatorImpl(this, function(innerGeneratorState) {
                                    switch (innerGeneratorState.label) {
                                        case 0:
                                            startIndex = -1;
                                            scanIndex = 0;
                                            innerGeneratorState.label = 1;
                                        case 1:
                                            // Loop through the input buffer.
                                            return scanIndex <= inputBuffer.length
                                                // Check for non-whitespace character or end of buffer.
                                                ? (inputBuffer[scanIndex] !== " " && inputBuffer[scanIndex] !== "\n" && scanIndex !== inputBuffer.length)
                                                    ? [3, 5] // If char is part of a token, continue scanning.
                                                    : (startIndex !== -1) // If we found a token end.
                                                        ? [3, 2] // Extract the token.
                                                        : [3, 6] // No token found yet, continue scanning.
                                                : [3, 7]; // End of buffer.
                                        case 2:
                                            // Extract the token.
                                            extractedToken = inputBuffer.substring(startIndex, scanIndex);
                                            startIndex = -1; // Reset start index.
                                            return [4, extractedToken]; // Yield the token.
                                        case 3:
                                            innerGeneratorState.sent(); // Consume yield.
                                            innerGeneratorState.label = 4;
                                        case 4:
                                            return [3, 6]; // Continue scanning.
                                        case 5:
                                            // If character is part of a token and start index is not set, set it.
                                            if (startIndex === -1) {
                                                startIndex = scanIndex;
                                            }
                                            innerGeneratorState.label = 6;
                                        case 6:
                                            scanIndex++; // Move to next character.
                                            return [3, 1]; // Continue loop.
                                        case 7:
                                            return [2]; // Generator done.
                                    }
                                });
                            }(); // Immediately invoke to get the generator instance.

                            // Return a closure that provides the next token.
                            return [2, () => tokenExtractor.next().value];
                    }
                }))).label) { /* no-op */ }
            });
        };

        /**
         * Gets a function that returns the next token from standard input parsed as an integer.
         * @returns {Promise<function(): number>} A promise resolving to a function that returns the next integer.
         */
        exportsObject.retrieveNextTokenAsInteger = () => {
            return asyncWrapper(currentContext, undefined, undefined, function*() {
                let tokenSupplier;
                switch ((yield generatorImpl(this, function(generatorState) {
                    switch (generatorState.label) {
                        case 0:
                            // Await the token supplier function.
                            return [4, exportsObject.retrieveNextToken()];
                        case 1:
                            tokenSupplier = generatorState.sent();
                            // Return a closure that parses the next token as an integer.
                            return [2, () => parseInt(tokenSupplier())];
                    }
                }))).label) { /* no-op */ }
            });
        };
    },

    /* Module 1: Node.js File System Module Wrapper */
    1: function(currentModule, exportsObject) {
        currentModule.exports = require("fs"); // Expose the native 'fs' module.
    },

    /* Module 15: Main Application Logic */
    15: function(mainModule, mainExports, mainRequire) {
        "use strict";

        // Polyfill for async/await (TypeScript __awaiter helper). Duplicated for independent module compilation.
        const asyncHandler = (thisContext, argsArray, promiseConstructor, generatorFunc) => {
            return new (promiseConstructor || (promiseConstructor = Promise))(function(resolver, rejector) {
                function step(value) {
                    try {
                        processResult(generatorFunc.next(value));
                    } catch (error) {
                        rejector(error);
                    }
                }
                function errorStep(error) {
                    try {
                        processResult(generatorFunc.throw(error));
                    } catch (error) {
                        rejector(error);
                    }
                }
                function processResult(iteration) {
                    iteration.done
                        ? resolver(iteration.value)
                        : new promiseConstructor(resolveValue => resolveValue(iteration.value)).then(step, errorStep);
                }
                processResult((generatorFunc = generatorFunc.apply(thisContext, argsArray || [])).next());
            });
        };

        // Polyfill for generator functions (TypeScript __generator helper). Duplicated for independent module compilation.
        const generatorHandler = (thisContext, initialArgs) => {
            let internalState,
                iterationResult,
                currentOperation,
                generatorState = {
                    label: 0,
                    sent: function() {
                        if (currentOperation[0] & 1) throw currentOperation[1];
                        return currentOperation[1];
                    },
                    trys: [],
                    ops: []
                };

            const iteratorMethods = {
                next: provideArgument(0),
                throw: provideArgument(1),
                return: provideArgument(2)
            };

            if (typeof Symbol === "function" && Symbol.iterator) {
                iteratorMethods[Symbol.iterator] = function() { return this; };
            }

            return iteratorMethods;

            function provideArgument(argType) {
                return (inputArg) => executeGenerator([argType, inputArg]);
            }

            function executeGenerator(instruction) {
                if (internalState) throw new TypeError("Generator is already executing.");
                for (; generatorState; ) {
                    try {
                        internalState = 1;
                        if (iterationResult && (currentOperation = instruction[0] & 2 ? iterationResult.return : instruction[0] ? iterationResult.throw || ((currentOperation = iterationResult.return) && currentOperation.call(iterationResult), 0) : iterationResult.next) && !(currentOperation = currentOperation.call(iterationResult, instruction[1])).done) {
                            return currentOperation;
                        }
                        iterationResult = 0;
                        currentOperation && (instruction = [instruction[0] & 2, currentOperation.value]);

                        switch (instruction[0]) {
                            case 0:
                            case 1:
                                currentOperation = instruction;
                                break;
                            case 4:
                                generatorState.label++;
                                return { value: instruction[1], done: false };
                            case 5:
                                generatorState.label++;
                                iterationResult = instruction[1];
                                instruction = [0];
                                continue;
                            case 7:
                                instruction = generatorState.ops.pop();
                                generatorState.trys.pop();
                                continue;
                            default:
                                if (!(currentOperation = generatorState.trys.length > 0 && generatorState.trys[generatorState.trys.length - 1]) && (instruction[0] === 6 || instruction[0] === 2)) {
                                    generatorState = 0;
                                    continue;
                                }
                                if (instruction[0] === 3 && (!currentOperation || instruction[1] > currentOperation[0] && instruction[1] < currentOperation[3])) {
                                    generatorState.label = instruction[1];
                                    break;
                                }
                                if (instruction[0] === 6 && generatorState.label < currentOperation[1]) {
                                    generatorState.label = currentOperation[1];
                                    currentOperation = instruction;
                                    break;
                                }
                                if (currentOperation && generatorState.label < currentOperation[2]) {
                                    generatorState.label = currentOperation[2];
                                    generatorState.ops.push(instruction);
                                    break;
                                }
                                currentOperation[2] && generatorState.ops.pop();
                                generatorState.trys.pop();
                                continue;
                        }
                        instruction = initialArgs.call(thisContext, generatorState);
                    } catch (exception) {
                        instruction = [6, exception];
                        iterationResult = 0;
                    } finally {
                        internalState = currentOperation = 0;
                    }
                    if (instruction[0] & 5) throw instruction[1];
                    return { value: instruction[0] ? instruction[1] : undefined, done: true };
                }
            }
        };

        const mainContext = this;

        // Mark this module as an ES module.
        mainExports.__esModule = true;

        // Import input utility functions from module 0.
        const inputUtils = mainRequire(0);

        // Main asynchronous logic execution.
        asyncHandler(mainContext, undefined, undefined, function*() {
            let intSupplier;            // Function to get next integer.
            let numberOfBits;           // The first integer from input (defines bit-length).
            let startBitmask;           // The second integer from input.
            let endBitmask;             // The third integer from input.

            let expandArrayWithBitOffset; // Helper function to expand an array with bit-shifted values.
            let findValueIndex;         // Helper function to find the index of a value in an array.
            let generatedSequence;      // The main sequence generated.
            let startNodeIndex;         // Index of startBitmask in the generated sequence.

            let getPreviousIndex;       // Helper function for circular previous index.
            let getNextIndex;           // Helper function for circular next index.
            let neighborRightIndex;     // Index of the right neighbor of startNodeIndex.
            let neighborLeftIndex;      // Index of the left neighbor of startNodeIndex.

            let pathTraversed;          // Array to store the path found.
            let currentPathNode;        // Variable for iterating path.

            switch ((yield generatorHandler(this, function(generatorState) {
                switch (generatorState.label) {
                    case 0:
                        // Retrieve the function that supplies integers from input.
                        return [4, inputUtils.retrieveNextTokenAsInteger()];
                    case 1:
                        intSupplier = generatorState.sent();
                        numberOfBits = intSupplier();    // Get first int (defines bit length).
                        startBitmask = intSupplier();  // Get starting bitmask.
                        endBitmask = intSupplier();    // Get target bitmask.

                        /**
                         * Checks if two bitmasks differ by exactly one bit.
                         * @param {number} maskA The first bitmask.
                         * @param {number} maskB The second bitmask.
                         * @returns {number} The number of differing bits.
                         */
                        const checkBitDifference = (maskA, maskB) => {
                            let differentBitCount = 0;
                            // Iterate through each bit position up to 'numberOfBits'.
                            for (let bitIdx = 0; bitIdx < numberOfBits; bitIdx++) {
                                // Check if the bits at the current position are different.
                                if (((maskA & (1 << bitIdx))) !== ((maskB & (1 << bitIdx)))) {
                                    differentBitCount++;
                                }
                            }
                            return differentBitCount;
                        };

                        // If the start and end bitmasks do not differ by exactly one bit, output "NO".
                        if (checkBitDifference(startBitmask, endBitmask) !== 1) {
                            console.log("NO");
                            return [2]; // Exit the generator.
                        }

                        /**
                         * Expands an array by doubling its size and adding bit-shifted values.
                         * This operation is often used in Gray code generation or similar bit-pattern sequences.
                         * @param {number[]} originalArray The array to expand.
                         * @param {number} bitOffset The bit position for the shift.
                         * @returns {number[]} The expanded array.
                         */
                        expandArrayWithBitOffset = (originalArray, bitOffset) => {
                            const newArray = new Array(2 * originalArray.length);
                            // Copy original elements.
                            for (let loopCounter = 0; loopCounter < originalArray.length; loopCounter++) {
                                newArray[loopCounter] = originalArray[loopCounter];
                            }
                            let reverseIndex = originalArray.length - 1;
                            // Add reversed elements with bit offset.
                            for (let loopCounter = originalArray.length; loopCounter < newArray.length; loopCounter++) {
                                newArray[loopCounter] = originalArray[reverseIndex--] + (1 << bitOffset);
                            }
                            return newArray;
                        };

                        /**
                         * Finds the index of a specific value in an array.
                         * @param {number} searchValue The value to find.
                         * @param {number[]} searchArray The array to search in.
                         * @returns {number} The index of the value, or -1 if not found.
                         */
                        findValueIndex = (searchValue, searchArray) => {
                            for (let idx = 0; idx < searchArray.length; idx++) {
                                if (searchArray[idx] === searchValue) {
                                    return idx;
                                }
                            }
                            return -1;
                        };

                        /**
                         * Generates a sequence of numbers based on bit manipulations up to a certain depth.
                         * This constructs a Gray code-like sequence, potentially with reversals.
                         * @param {number} depth The number of iterations/bit positions to consider.
                         * @returns {number[]} The generated sequence.
                         */
                        generatedSequence = ((depth) => {
                            let bitSequence = [0, 1]; // Initial sequence for 0 and 1.
                            // Iterate for each bit position.
                            for (let bitPosition = 1; bitPosition < depth; bitPosition++) {
                                // If the start and end bitmasks differ at this bit position.
                                if (((startBitmask & (1 << bitPosition))) !== ((endBitmask & (1 << bitPosition)))) {
                                    // Complex rearrangement logic if bits differ: reverse a segment.
                                    const currentBitVal = startBitmask & ((1 << bitPosition) - 1); // Mask lower bits.
                                    const getPrevModulo = (idx) => (idx - 1 + bitSequence.length) % bitSequence.length;
                                    const tempPath = [];
                                    // Traverse backwards from currentBitVal's position until currentBitVal is found.
                                    for (let currIdx = getPrevModulo(findValueIndex(currentBitVal, bitSequence)); bitSequence[currIdx] !== currentBitVal; currIdx = getPrevModulo(currIdx)) {
                                        tempPath.push(bitSequence[currIdx]);
                                    }
                                    tempPath.push(currentBitVal); // Add currentBitVal.
                                    bitSequence = tempPath; // Replace sequence with rearranged path.
                                }
                                // Expand the sequence for the next bit position.
                                bitSequence = expandArrayWithBitOffset(bitSequence, bitPosition);
                            }
                            return bitSequence;
                        })(numberOfBits); // Use 'numberOfBits' as the depth parameter.

                        // Find the index of the starting bitmask in the generated sequence.
                        startNodeIndex = findValueIndex(startBitmask, generatedSequence);

                        // Helper for circular array navigation: previous index.
                        getPreviousIndex = (idx) => (idx - 1 + generatedSequence.length) % generatedSequence.length;
                        // Helper for circular array navigation: next index.
                        getNextIndex = (idx) => (idx + 1) % generatedSequence.length;

                        // Calculate indices of neighbors.
                        neighborRightIndex = getNextIndex(startNodeIndex);
                        neighborLeftIndex = getPreviousIndex(startNodeIndex);

                        // Check if the right neighbor is the target endBitmask.
                        if (generatedSequence[neighborRightIndex] === endBitmask) {
                            pathTraversed = []; // Initialize path.
                            // Traverse from startNodeIndex to neighborRightIndex (circularly backwards).
                            for (currentPathNode = startNodeIndex; currentPathNode !== neighborRightIndex; currentPathNode = getPreviousIndex(currentPathNode)) {
                                pathTraversed.push(generatedSequence[currentPathNode]);
                            }
                            pathTraversed.push(endBitmask); // Add the target.
                            console.log("YES");
                            console.log(pathTraversed.join(" ")); // Output path.
                        } else if (generatedSequence[neighborLeftIndex] === endBitmask) {
                            // Check if the left neighbor is the target endBitmask.
                            pathTraversed = []; // Initialize path.
                            // Traverse from startNodeIndex to neighborLeftIndex (circularly forwards).
                            for (currentPathNode = startNodeIndex; currentPathNode !== neighborLeftIndex; currentPathNode = getNextIndex(currentPathNode)) {
                                pathTraversed.push(generatedSequence[currentPathNode]);
                            }
                            pathTraversed.push(endBitmask); // Add the target.
                            console.log("YES");
                            console.log(pathTraversed.join(" ")); // Output path.
                        } else {
                            // If neither neighbor is the target.
                            console.log("NO");
                        }
                        return [2]; // End of main logic.
                }
            }))).label) { /* no-op */ } // This construct is from TypeScript's async generator transpilation.
        });
    }
});