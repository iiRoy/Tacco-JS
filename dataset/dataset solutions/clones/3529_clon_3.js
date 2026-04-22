module.exports = (externalModules) => {
    // A cache for already loaded modules.
    const moduleRegistry = {};

    /**
     * Custom module loading function, mimicking a simplified CommonJS/Webpack loader.
     * @param {number} requestedModuleId - The ID of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function internalModuleLoader(requestedModuleId) {
        // If the module is already in the cache, return its exports.
        if (moduleRegistry[requestedModuleId]) {
            return moduleRegistry[requestedModuleId].exports;
        }

        // Otherwise, create a new module entry in the cache.
        const currentModule = moduleRegistry[requestedModuleId] = {
            id: requestedModuleId, // The module's unique identifier.
            isLoaded: false,      // Flag to track if the module has been fully loaded.
            exports: {}           // The object that will hold the module's exported values.
        };

        // Execute the module function, passing in its context (module, exports, and loader).
        externalModules[requestedModuleId].call(currentModule.exports, currentModule, currentModule.exports, internalModuleLoader);

        // Mark the module as loaded.
        currentModule.isLoaded = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // Attach external modules to the loader for debugging/inspection (optional).
    internalModuleLoader.allModules = externalModules;
    // Attach the module cache to the loader (optional).
    internalModuleLoader.cache = moduleRegistry;

    // Utility function to define a getter on an exports object for named exports.
    internalModuleLoader.defineGetter = (exportsObject, propertyName, getterFunction) => {
        // Only define if the property doesn't already exist.
        if (!internalModuleLoader.hasProperty(exportsObject, propertyName)) {
            Object.defineProperty(exportsObject, propertyName, {
                enumerable: true, // Make it enumerable so it shows up in `for...in`.
                get: getterFunction
            });
        }
    };

    // Utility function to mark an exports object as an ES module.
    internalModuleLoader.markAsEsModule = (exportsObject) => {
        // Check for Symbol existence for toStringTag, then define it.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Define __esModule property to indicate ES module status.
        Object.defineProperty(exportsObject, '__esModule', { value: true });
    };

    // Utility function to create a namespace object for a module.
    internalModuleLoader.createNamespaceObject = (value, mode) => {
        // If mode indicates it's already a module, just return it.
        if (mode & 1) value = internalModuleLoader(value);
        if (mode & 8) return value;
        if (mode & 4 && typeof value === 'object' && value != null && value.__esModule) return value;

        // Create a new empty object for the namespace.
        const namespace = Object.create(null);
        internalModuleLoader.markAsEsModule(namespace); // Mark as ES module.
        // Set the default export to the original value.
        Object.defineProperty(namespace, 'default', { enumerable: true, value: value });

        // If mode indicates it's not a string, copy all properties from the original value.
        if (mode & 2 && typeof value !== 'string') {
            for (const key in value) {
                // Ensure the property is owned by the value object directly.
                if (internalModuleLoader.hasProperty(value, key)) {
                    // Define a getter for each property in the namespace object.
                    internalModuleLoader.defineGetter(namespace, key, ((k) => value[k]).bind(null, key));
                }
            }
        }
        return namespace;
    };

    // Utility function to get the default export or the module itself.
    internalModuleLoader.getModuleExports = (moduleObject) => {
        // If it's an ES module with a default export, return the default.
        const getter = moduleObject && moduleObject.__esModule ? () => moduleObject.default : () => moduleObject;
        // Define a 'a' getter for compatibility (webpack specific).
        internalModuleLoader.defineGetter(getter, 'a', getter);
        return getter;
    };

    // Utility function to check if an object has a specific property.
    internalModuleLoader.hasProperty = (targetObject, propertyKey) => {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Public path for assets (not used in this specific application, but part of boilerplate).
    internalModuleLoader.publicPath = "";

    // Set the entry point module (module with ID 0) and load it.
    return internalModuleLoader(internalModuleLoader.entryModuleId = 0);
})([
    /* Module 0: Main application entry point */
    (module, exports, currentRequire) => {
        "use strict"; // Enforce strict mode for better code quality.
        // Import the file system module.
        const fileSystem = currentRequire(1);
        // Import the primary processing logic module and execute it with stdin content.
        currentRequire(2)(fileSystem.readFileSync("/dev/stdin", "utf8"));
    },

    /* Module 1: Node.js 'fs' module wrapper */
    (module, exports) => {
        // Simply re-export the native 'fs' module.
        module.exports = require("fs");
    },

    /* Module 2: Orchestrates input processing and problem solving */
    (module, exports, currentRequire) => {
        "use strict";
        // Import the custom input handler class.
        const InputDataProcessor = currentRequire(3);
        // Import the core problem-solving function.
        const SolveTheChallenge = currentRequire(5);

        /**
         * Main function to handle the input and trigger the solution.
         * @param {string} rawInputString - The raw string input from stdin.
         */
        module.exports = (rawInputString) => {
            // Create an instance of the input data processor with the raw string.
            const processorInstance = new InputDataProcessor(rawInputString);
            // Pass the processor instance to the solver function.
            SolveTheChallenge(processorInstance);
        };
    },

    /* Module 3: Input Handler Class Definition */
    (module, exports, currentRequire) => {
        "use strict";
        // Import the custom queue data structure.
        const TokenQueue = currentRequire(4);

        /**
         * InputHandler: A class responsible for parsing raw string input
         * into tokens and providing methods to extract data.
         */
        module.exports = class InputHandler {
            /**
             * Constructs an InputHandler instance.
             * @param {string} incomingRawData - The raw string input.
             */
            constructor(incomingRawData) {
                // Ensure data is a string before processing.
                if (typeof incomingRawData !== 'string') {
                    throw new Error("InputHandler expects a string as raw data.");
                }
                // Trim whitespace and split the input string into tokens using one or more spaces as delimiter.
                const dataTokens = incomingRawData.trim().split(/\s+/g);
                // Initialize an internal queue with these tokens.
                this.processedDataQueue = new TokenQueue(dataTokens);
            }

            /**
             * Reads and returns the next string token from the input.
             * @returns {string} The next string token.
             */
            readStringToken() {
                return this.processedDataQueue.retrieveNext();
            }

            /**
             * Reads the next token and attempts to parse it as an integer.
             * @returns {number} The parsed integer.
             */
            readIntegerToken() {
                const token = this.processedDataQueue.retrieveNext();
                const parsedInt = parseInt(token, 10);
                // Basic validation for integer parsing.
                if (isNaN(parsedInt)) {
                    console.warn(`Warning: Could not parse "${token}" as an integer.`);
                }
                return parsedInt;
            }

            /**
             * Clears the internal queue, effectively resetting the input handler.
             */
            clearInputBuffer() {
                this.processedDataQueue.clearAll();
            }
        };
    },

    /* Module 4: Custom Queue Class Definition */
    (module, exports, currentRequire) => {
        "use strict";

        /**
         * FlexibleTokenQueue: A simple queue implementation for managing tokens.
         * It supports enqueue, dequeue, and clearing operations.
         */
        module.exports = class FlexibleTokenQueue {
            /**
             * Constructs a FlexibleTokenQueue instance.
             * @param {Array<any>} [initialElements=[]] - Optional array of initial elements to populate the queue.
             */
            constructor(initialElements = []) {
                // Store the items in an internal array.
                this.storageArray = [...initialElements]; // Use spread to create a new array instance.
                // Keep track of the current read position for dequeueing.
                this.currentReadIndex = 0;
            }

            /**
             * Adds an element to the end of the queue.
             * @param {any} element - The element to add.
             */
            enqueueElement(element) {
                this.storageArray.push(element);
            }

            /**
             * Removes and returns the element at the front of the queue.
             * @returns {any} The element from the front of the queue.
             * @throws {Error} If attempting to dequeue from an empty queue.
             */
            retrieveNext() {
                // Guard clause: Check if the queue is empty or exhausted.
                if (this.currentReadIndex >= this.storageArray.length) {
                    throw new Error("Attempted to retrieve from an empty or exhausted queue.");
                }
                // Get the element at the current read index.
                const item = this.storageArray[this.currentReadIndex];
                // Increment the read index to point to the next element.
                this.currentReadIndex++;
                return item;
            }

            /**
             * Resets the queue to an empty state.
             */
            clearAll() {
                this.storageArray = [];
                this.currentReadIndex = 0;
            }

            /**
             * Checks if the queue is currently empty.
             * @returns {boolean} True if the queue is empty, false otherwise.
             */
            isQueueEmpty() {
                return this.currentReadIndex >= this.storageArray.length;
            }
        };
    },

    /* Module 5: Core Problem Solver Logic */
    (module, exports, currentRequire) => {
        "use strict";

        /**
         * Solves the specific problem: determining if two sequences (strings)
         * can be mapped bijectively to each other, such that each character
         * in the first sequence maps to a corresponding character in the second,
         * and vice-versa, with no conflicts.
         *
         * @param {object} inputReader - An instance of the InputHandler class.
         */
        module.exports = (inputReader) => {
            // Read the two sequences as arrays of characters (tokens).
            const sequenceAlpha = inputReader.readStringToken();
            const sequenceBeta = inputReader.readStringToken();

            // --- Input Validation ---
            // If the sequences have different lengths, a bijective mapping is impossible.
            if (sequenceAlpha.length !== sequenceBeta.length) {
                console.log("No");
                return; // Exit early.
            }

            const commonLength = sequenceAlpha.length;

            // Use Maps to store the character mappings for efficient lookups.
            // mapAlphaToBeta: stores mapping from characters in sequenceAlpha to sequenceBeta.
            const mapAlphaToBeta = new Map();
            // mapBetaToAlpha: stores mapping from characters in sequenceBeta to sequenceAlpha.
            const mapBetaToAlpha = new Map();

            // Iterate through both sequences simultaneously to build and validate mappings.
            for (let position = 0; position < commonLength; position++) {
                const charA = sequenceAlpha[position];
                const charB = sequenceBeta[position];

                // --- Validate mapping from Alpha to Beta ---
                if (mapAlphaToBeta.has(charA)) {
                    // If charA already has a mapping, ensure it's consistent with charB.
                    if (mapAlphaToBeta.get(charA) !== charB) {
                        console.log("No");
                        return; // Conflict found, exit.
                    }
                } else {
                    // If charA doesn't have a mapping, establish it.
                    mapAlphaToBeta.set(charA, charB);
                }

                // --- Validate mapping from Beta to Alpha ---
                if (mapBetaToAlpha.has(charB)) {
                    // If charB already has a mapping, ensure it's consistent with charA.
                    if (mapBetaToAlpha.get(charB) !== charA) {
                        console.log("No");
                        return; // Conflict found, exit.
                    }
                } else {
                    // If charB doesn't have a mapping, establish it.
                    mapBetaToAlpha.set(charB, charA);
                }
            }

            // If the loop completes without finding any inconsistencies,
            // it means a valid bijective mapping exists.
            console.log("Yes");
        };
    }
]);