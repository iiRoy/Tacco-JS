module.exports = (function(originatingModules) {
    // This internal object acts as a cache for modules that have already been loaded.
    const moduleCache = {};

    /**
     * The core module loading function, conceptually similar to `require` in Node.js or `__webpack_require__`.
     * It ensures modules are loaded only once and their exports are correctly managed.
     * @param {number} requestedModuleId - The unique numeric identifier of the module to load.
     * @returns {object} The exports object from the requested module.
     */
    function obtainModuleExports(requestedModuleId) {
        // If the module is already in our cache, return its exports immediately to prevent re-execution.
        if (moduleCache[requestedModuleId]) {
            return moduleCache[requestedModuleId].exports;
        }

        // Basic validation: ensure the requested ID is within the bounds of available modules.
        // This is a Type III addition for robustness.
        if (requestedModuleId === null || requestedModuleId === undefined || requestedModuleId < 0 || requestedModuleId >= originatingModules.length) {
            console.error(`Invalid module identifier provided: ${requestedModuleId}. Returning empty exports.`);
            return {}; // Return an empty object or throw an error depending on desired strictness.
        }

        // If not cached, create a new module entry.
        // Each entry holds its identifier, a 'loaded' flag, and its exports object.
        const moduleEntry = moduleCache[requestedModuleId] = {
            id: requestedModuleId,
            loaded: false,
            exports: {}
        };

        // Execute the module's factory function. This function populates `moduleEntry.exports`.
        // It's called with `module`, `exports`, and the `obtainModuleExports` function itself.
        originatingModules[requestedModuleId].call(moduleEntry.exports, moduleEntry, moduleEntry.exports, obtainModuleExports);

        // Mark the module as loaded after its factory function has completed execution.
        moduleEntry.loaded = true;

        // Return the populated exports object.
        return moduleEntry.exports;
    }

    // Attach references to the module array and cache onto the loader function itself.
    obtainModuleExports.moduleDefinitions = originatingModules;
    obtainModuleExports.resolvedModules = moduleCache;

    /**
     * A utility to define a non-writable, enumerable getter property on an object.
     * This is crucial for exposing named exports in a way that's compatible with ES modules.
     * @param {object} targetObject - The object on which the property will be defined.
     * @param {string} propertyKey - The name of the property to define.
     * @param {function} valueGetter - A function that returns the value of the property when accessed.
     */
    obtainModuleExports.defineExportGetter = function(targetObject, propertyKey, valueGetter) {
        // Only define the property if it doesn't already exist on the target object.
        if (!obtainModuleExports.checkOwnProperty(targetObject, propertyKey)) {
            Object.defineProperty(targetObject, propertyKey, {
                enumerable: true, // Make the property iterable.
                get: valueGetter // Assign the provided function as the getter.
            });
        }
    };

    /**
     * Flags an exports object as an ECMAScript module. This is done by adding `Symbol.toStringTag`
     * and a `__esModule` property, which are conventions for ES module interoperability.
     * @param {object} exportsContainer - The exports object to mark.
     */
    obtainModuleExports.flagAsEsModule = function(exportsContainer) {
        // Set Symbol.toStringTag for better debugging and module identification.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsContainer, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Set the __esModule flag, a common convention used by bundlers.
        Object.defineProperty(exportsContainer, "__esModule", {
            value: true
        });
    };

    /**
     * Creates a synthetic namespace object for module interoperability, especially between
     * CommonJS and ES modules. It handles various scenarios for how a module's exports should be presented.
     * @param {any} sourceModuleContent - The module's exports or its ID.
     * @param {number} processingFlags - A bitmask indicating how to process the source.
     *   Bit 1 (0x1): Treat sourceModuleContent as a module ID and load it first.
     *   Bit 8 (0x8): If sourceModuleContent is an object, return it directly.
     *   Bit 4 (0x4): If sourceModuleContent is an object and already an ES module, return it directly.
     *   Bit 2 (0x2): If sourceModuleContent is not a string, iterate its properties and re-export them.
     * @returns {object} The constructed namespace object.
     */
    obtainModuleExports.constructNamespace = function(sourceModuleContent, processingFlags) {
        // If flag 1 is set, interpret sourceModuleContent as a module ID and load it.
        if (processingFlags & 1) {
            sourceModuleContent = obtainModuleExports(sourceModuleContent);
        }
        // If flag 8 is set, and it's already an object, return it as is.
        if (processingFlags & 8) {
            return sourceModuleContent;
        }
        // If flag 4 is set, and it's an object and already an ES module, return it directly.
        if (processingFlags & 4 && typeof sourceModuleContent === 'object' && sourceModuleContent && sourceModuleContent.__esModule) {
            return sourceModuleContent;
        }

        // Create a new plain object to serve as the namespace.
        const namespaceObject = Object.create(null);
        // Mark this new object as an ES module.
        obtainModuleExports.flagAsEsModule(namespaceObject);
        // Define a 'default' export that points to the original module's content.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: sourceModuleContent
        });

        // If flag 2 is set and the source content is not a string, iterate over its properties
        // and re-export them as named exports in the new namespace.
        if ((processingFlags & 2) && typeof sourceModuleContent !== 'string') {
            for (const propName in sourceModuleContent) {
                // Ensure the property is directly on the source module, not inherited.
                if (obtainModuleExports.checkOwnProperty(sourceModuleContent, propName)) {
                    obtainModuleExports.defineExportGetter(namespaceObject, propName, (function(currentProp) {
                        return sourceModuleContent[currentProp];
                    }).bind(null, propName));
                }
            }
        }
        return namespaceObject;
    };

    /**
     * Provides a getter function for a module's default export.
     * This handles both explicit ES module `default` exports and implicitly treating CommonJS `module.exports` as default.
     * @param {object} targetModuleExports - The exports object of the module.
     * @returns {function} A function that, when called, returns the default export.
     */
    obtainModuleExports.retrieveDefaultExport = function(targetModuleExports) {
        // If the module is flagged as an ES module and has a 'default' property, use that.
        const defaultExportFn = targetModuleExports && targetModuleExports.__esModule ?
            function() {
                return targetModuleExports.default;
            } :
            // Otherwise, assume the entire module.exports object is the default.
            function() {
                return targetModuleExports;
            };
        // This line is a specific bundler pattern: define a getter 'a' on the function itself,
        // which returns the function, effectively making the getter directly callable.
        obtainModuleExports.defineExportGetter(defaultExportFn, "a", defaultExportFn);
        return defaultExportFn;
    };

    /**
     * Checks if an object has an own (non-inherited) property with the given key.
     * This is a safer way to check for property existence than `obj.hasOwnProperty(key)`.
     * @param {object} objToCheck - The object to inspect.
     * @param {string} keyName - The name of the property to check for.
     * @returns {boolean} True if the object has the property directly, false otherwise.
     */
    obtainModuleExports.checkOwnProperty = function(objToCheck, keyName) {
        return Object.prototype.hasOwnProperty.call(objToCheck, keyName);
    };

    // Placeholder for the public path, often used for loading assets.
    obtainModuleExports.assetPublicPath = "";

    // Set the entry module ID (module 0) and immediately load it to start the application.
    // The `obtainModuleExports.entryModuleId = 0` assignment stores the entry point.
    return obtainModuleExports(obtainModuleExports.entryModuleId = 0);

// This array contains all the module definitions for the bundled application.
})([
    // Module 0: Application Startup Logic (Entry Point)
    function(moduleRef, exportsRef, moduleRequire) {
        "use strict"; // Enable strict mode for this module.

        // Import the Node.js 'fs' module for file system operations.
        const fileSystemUtilities = moduleRequire(1);
        // Import the primary logic handler for processing input.
        const mainInputHandler = moduleRequire(2);

        // Define the standard input path. This is a Type III addition (explicit variable).
        const standardInputPath = "/dev/stdin";
        let capturedInputText; // Variable to hold the content read from stdin.

        try {
            // Synchronously read the content of standard input, interpreting it as UTF-8 text.
            capturedInputText = fileSystemUtilities.readFileSync(standardInputPath, "utf8");
        } catch (readOperationError) {
            // A Type III addition: robust error handling for file reading.
            console.error(`Error encountered while reading from ${standardInputPath}: ${readOperationError.message}`);
            // Fallback to an empty string to allow the application to proceed without crashing.
            capturedInputText = "";
        }

        // Pass the obtained input text to the main processing function.
        mainInputHandler(capturedInputText);
    },

    // Module 1: File System (FS) Wrapper
    function(currentModule, moduleExports) {
        // This module simply re-exports Node.js's built-in 'fs' module.
        currentModule.exports = require("fs");
    },

    // Module 2: Orchestrator for Input Parsing and Problem Solving
    function(currentModuleContext, moduleExportsContainer, moduleResolver) {
        "use strict";

        // Import the custom InputParser class (from module 3).
        const InputParserClass = moduleResolver(3);
        // Import the specific algorithm function for sequence analysis (from module 5).
        const SequenceAnalysisAlgorithm = moduleResolver(5);

        /**
         * This function serves as the central point for handling raw input.
         * It creates an input parser and then dispatches it to the analysis algorithm.
         * @param {string} rawTextContent - The raw string data received (e.g., from stdin).
         */
        currentModuleContext.exports = function(rawTextContent) {
            // Instantiate the InputParser to manage token extraction from the raw text.
            const dataParser = new InputParserClass(rawTextContent);

            // Pass the data parser instance to the sequence analysis algorithm.
            // The algorithm will use the parser's methods to get necessary input.
            SequenceAnalysisAlgorithm(dataParser);

            // A Type III addition: explicitly clear the parser's buffer after processing.
            // This is good practice for resource management, especially in long-running processes.
            dataParser.resetInputBuffer();
        };
    },

    // Module 3: InputParser Class for Tokenizing and Retrieving Input
    function(currentMod, exportsObj, moduleLoader) {
        "use strict";

        // Import the custom DataBuffer class (from module 4) to manage input tokens.
        const DataBufferImplementation = moduleLoader(4);

        /**
         * InputParser: A utility class designed to take a raw string input,
         * tokenize it, and provide methods to consume these tokens as strings or numbers.
         */
        currentMod.exports = class InputParser {
            /**
             * Constructs an instance of InputParser.
             * @param {string} initialInputString - The raw string to be parsed.
             */
            constructor(initialInputString) {
                // Ensure the input is treated as a string and trim whitespace.
                const cleanedInput = (initialInputString || '').trim();
                // Split the string into tokens using one or more whitespace characters as delimiters.
                // Filter out any empty strings that may result from multiple consecutive spaces.
                const parsedTokens = cleanedInput.split(/\s+/g).filter(token => token.length > 0);

                // Initialize an internal DataBuffer with the prepared tokens.
                this.tokenBuffer = new DataBufferImplementation(parsedTokens);

                // Type III addition: a guard clause to warn if no tokens were found.
                if (this.tokenBuffer.isEmpty()) {
                    console.info("InputParser initialized but no valid tokens were extracted.");
                }
            }

            /**
             * Retrieves the next available token as a string.
             * @returns {string|undefined} The next string token, or `undefined` if the buffer is empty.
             */
            readNextString() {
                return this.tokenBuffer.fetchNextItem();
            }

            /**
             * Retrieves the next token and attempts to parse it as an integer.
             * @returns {number|NaN|undefined} The parsed integer, `NaN` if parsing fails, or `undefined` if no more tokens.
             */
            readNextInteger() {
                const tokenString = this.tokenBuffer.fetchNextItem();
                if (tokenString === undefined) {
                    return undefined; // No more tokens available.
                }
                const numericValue = parseInt(tokenString, 10);
                // Type III addition: provide a warning if a token couldn't be parsed as an integer.
                if (isNaN(numericValue)) {
                    console.warn(`Attempted to parse non-numeric token "${tokenString}" into an integer.`);
                }
                return numericValue;
            }

            /**
             * Resets the internal token buffer, effectively clearing all parsed input.
             */
            resetInputBuffer() {
                this.tokenBuffer.clearAllElements();
            }

            /**
             * Checks if there are more tokens remaining in the buffer to be read.
             * @returns {boolean} `true` if tokens are available, `false` otherwise.
             */
            hasRemainingTokens() {
                return !this.tokenBuffer.isEmpty();
            }
        };
    },

    // Module 4: DataBuffer Class (Enhanced Queue Implementation)
    function(moduleContext, exportsContext, req) {
        "use strict";

        /**
         * DataBuffer: A flexible queue-like data structure for managing ordered elements.
         * It supports adding elements, retrieving them in FIFO order, and buffer management.
         * Implemented efficiently using an array and a read pointer to avoid costly `shift()` operations.
         */
        moduleContext.exports = class DataBuffer {
            /**
             * Initializes a new DataBuffer instance.
             * @param {Array<any>} [initialSet=[]] - An optional array of elements to start the buffer with.
             */
            constructor(initialSet = []) {
                // Internal array to hold the elements. Create a shallow copy to prevent external modification.
                this.elementStorage = Array.isArray(initialSet) ? [...initialSet] : [];
                this.currentReadPointer = 0; // Index of the next element to be read.
                this.validElementCount = this.elementStorage.length; // Number of elements logically in the buffer.
            }

            /**
             * Adds an element to the end of the buffer.
             * @param {any} itemToEnqueue - The element to add.
             */
            addItem(itemToEnqueue) {
                this.elementStorage.push(itemToEnqueue);
                this.validElementCount++;
            }

            /**
             * Retrieves and removes the element at the front of the buffer (FIFO).
             * @returns {any|undefined} The dequeued element, or `undefined` if the buffer is empty.
             */
            fetchNextItem() {
                // Type III addition: Guard against dequeuing from an empty buffer.
                if (this.isEmpty()) {
                    // console.debug("Attempted to fetch from an empty DataBuffer. Returning undefined.");
                    return undefined;
                }

                const retrievedValue = this.elementStorage[this.currentReadPointer];
                this.currentReadPointer++; // Advance the read pointer.
                this.validElementCount--; // Decrement the count of logically valid elements.

                // Type III addition: Proactive memory management.
                // If the read pointer has moved significantly and a large portion of the buffer
                // consists of "read" elements, compact the array to reclaim memory.
                if (this.currentReadPointer > 1000 && this.currentReadPointer > this.elementStorage.length / 2) {
                    this.elementStorage = this.elementStorage.slice(this.currentReadPointer);
                    this.currentReadPointer = 0; // Reset pointer after slicing.
                }

                return retrievedValue;
            }

            /**
             * Clears the entire buffer, making it empty and resetting all pointers.
             */
            clearAllElements() {
                this.elementStorage = [];
                this.currentReadPointer = 0;
                this.validElementCount = 0;
            }

            /**
             * Checks if the buffer currently contains no elements.
             * @returns {boolean} `true` if the buffer is empty, `false` otherwise.
             */
            isEmpty() {
                return this.validElementCount <= 0;
            }

            /**
             * Returns the current number of elements available in the buffer.
             * @returns {number} The count of valid elements.
             */
            countElements() {
                return this.validElementCount;
            }
        };
    },

    // Module 5: DNA Sequence Analysis Algorithm
    function(moduleCtx, moduleExportsObj, moduleRequester) {
        "use strict";

        /**
         * Helper function (Type III addition): Checks if a given character is a valid DNA nucleotide.
         * @param {string} character - The character to validate.
         * @returns {boolean} True if the character is 'A', 'C', 'G', or 'T'; false otherwise.
         */
        const isValidNucleotide = (character) => {
            // Using a Set for constant-time lookup, or `indexOf` for small sets.
            // `includes` is clear and efficient enough for this small set.
            return "ACGT".includes(character);
        };

        /**
         * This function processes an input DNA sequence to find the length of the longest
         * consecutive subsequence composed solely of valid nucleotide characters (A, C, G, T).
         * @param {object} inputReaderInstance - An instance of the InputParser class.
         */
        moduleCtx.exports = function(inputReaderInstance) {
            // Retrieve the primary DNA sequence string from the input parser.
            const dnaString = inputReaderInstance.readNextString();

            // Type III addition: Robust input validation.
            if (!dnaString || typeof dnaString !== 'string' || dnaString.length === 0) {
                console.log(0); // If input is empty or invalid, the longest run is 0.
                return;
            }

            let maxConsecutiveLength = 0; // Stores the maximum length found across the entire string.
            let currentRunLength = 0; // Tracks the length of the current consecutive valid nucleotide run.

            // Type III change: Rewritten the core loop for clarity and correctness.
            // Iterate through each character of the DNA sequence.
            for (let charIndex = 0; charIndex < dnaString.length; charIndex++) {
                const currentCharacter = dnaString[charIndex];

                if (isValidNucleotide(currentCharacter)) {
                    // If the character is a valid nucleotide, extend the current run.
                    currentRunLength++;
                } else {
                    // If not a valid nucleotide, the current run is broken.
                    // Update the overall maximum length if the current run was longer.
                    maxConsecutiveLength = Math.max(maxConsecutiveLength, currentRunLength);
                    // Reset the current run length for the next potential sequence.
                    currentRunLength = 0;
                }
            }

            // After the loop finishes, there might be a trailing valid sequence.
            // We need one final comparison to ensure this last run is accounted for.
            maxConsecutiveLength = Math.max(maxConsecutiveLength, currentRunLength);

            // Output the final result to the console.
            console.log(maxConsecutiveLength);
        };
    }
]);