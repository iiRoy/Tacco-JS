module.exports = function(moduleDefinitionCollection) {
    // A private registry to store all modules that have been loaded and initialized.
    const initializedModuleRegistry = {};

    /**
     * Core function to load a module by its identifier.
     * It checks the cache first; if not found, it initializes the module.
     * @param {number} moduleKey - The unique numeric identifier for the module.
     * @returns {object} The exports object of the specified module.
     */
    function retrieveAndInitializeModule(moduleKey) {
        // If the module is already in our registry, return its exports immediately.
        if (initializedModuleRegistry[moduleKey]) {
            return initializedModuleRegistry[moduleKey].output;
        }

        // Create a new entry for the module in the registry.
        const currentModuleOutput = initializedModuleRegistry[moduleKey] = {
            id: moduleKey,          // The module's identifier.
            isReady: false,         // Flag indicating if the module's code has executed.
            output: {}              // The object that will hold this module's public exports.
        };

        // Execute the module's definition function. This function is responsible for populating `currentModuleOutput.output`.
        // It receives: (module object, exports object, and the loader function itself).
        // Using `Reflect.apply` for a more explicit function call context.
        Reflect.apply(moduleDefinitionCollection[moduleKey], currentModuleOutput.output, [
            currentModuleOutput,
            currentModuleOutput.output,
            retrieveAndInitializeModule
        ]);

        // Mark the module as ready after its definition function has completed.
        currentModuleOutput.isReady = true;
        return currentModuleOutput.output;
    }

    // Attach internal properties to the main loader function for broader access within the bundle.
    retrieveAndInitializeModule.definitionSources = moduleDefinitionCollection; // All raw module definitions.
    retrieveAndInitializeModule.moduleCache = initializedModuleRegistry; // The cache of processed modules.

    /**
     * Defines a new enumerable getter property on a target object.
     * This is a utility primarily used for mimicking ES Module named exports.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The string name of the property.
     * @param {function} propertyValueGetter - A function that returns the value of the property when accessed.
     */
    retrieveAndInitializeModule.defineGetterExport = function(targetObject, propertyName, propertyValueGetter) {
        // Only define if the property does not already exist on the target object.
        if (!retrieveAndInitializeModule.checkOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,    // Makes the property visible during enumeration (e.g., `for...in`).
                get: propertyValueGetter, // The function to execute to retrieve the property's value.
                configurable: true   // Allows the property to be redefined or deleted later.
            });
        }
    };

    /**
     * Marks an object as an ECMAScript Module by setting `__esModule` and `Symbol.toStringTag`.
     * This is crucial for correct interoperability between different module systems.
     * @param {object} exportTarget - The object representing the module's public interface.
     */
    retrieveAndInitializeModule.setEsModuleFlag = function(exportTarget) {
        // If `Symbol.toStringTag` is supported, set it for improved debugging experience (e.g., `[object Module]`).
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportTarget, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // Explicitly set `__esModule` to `true`. This is the primary indicator for ES Modules.
        exportTarget.__esModule = true;
    };

    /**
     * Handles interoperability for various module types (e.g., CommonJS, ES Modules).
     * It transforms raw module values into a consistent format, typically an ES Module namespace object.
     * @param {any} rawModuleData - The module's raw value, which could be an ID or an object.
     * @param {number} interopBehaviorFlags - A bitmask indicating desired interop transformations.
     * @returns {any} The interopped module value, ready for use.
     */
    retrieveAndInitializeModule.performModuleInterop = function(rawModuleData, interopBehaviorFlags) {
        // Flag 1: If rawModuleData is a module ID, load it first.
        if (interopBehaviorFlags & 1) {
            rawModuleData = retrieveAndInitializeModule(rawModuleData);
        }
        // Flag 8: If set, return the module data as-is without any further processing.
        if (interopBehaviorFlags & 8) {
            return rawModuleData;
        }
        // Flag 4: If it's an object and already an ES module, return it directly.
        if (interopBehaviorFlags & 4 && typeof rawModuleData === 'object' && rawModuleData && rawModuleData.__esModule) {
            return rawModuleData;
        }

        // For other cases, construct a new namespace object that mimics an ES module.
        const moduleNamespace = Object.create(null);
        retrieveAndInitializeModule.setEsModuleFlag(moduleNamespace); // Mark this new object as an ES module.

        // Define a 'default' export that points to the original `rawModuleData`.
        Object.defineProperty(moduleNamespace, 'default', {
            enumerable: true,
            value: rawModuleData,
            configurable: true
        });

        // Flag 2: If `rawModuleData` is not a string, copy all its enumerable properties as named exports.
        // This is important for CommonJS modules that export multiple properties.
        if (interopBehaviorFlags & 2 && typeof rawModuleData !== 'string') {
            for (const propKey in rawModuleData) {
                // Use an arrow function to create a closure for each property, ensuring `propKey` is correctly captured.
                retrieveAndInitializeModule.defineGetterExport(moduleNamespace, propKey, () => rawModuleData[propKey]);
            }
        }
        return moduleNamespace;
    };

    /**
     * Creates a getter function for a module's default export.
     * This handles cases where a module might be a direct default export or a CommonJS module.
     * @param {any} moduleRawExports - The raw exports object from a module.
     * @returns {function} A function that, when called, returns the module's default export.
     */
    retrieveAndInitializeModule.createDefaultExportAccessor = function(moduleRawExports) {
        const defaultExportGetter = moduleRawExports && moduleRawExports.__esModule ?
            () => moduleRawExports.default : // If it's an ES module, the default is `moduleRawExports.default`.
            () => moduleRawExports; // Otherwise, the entire `moduleRawExports` object is the default.

        // Define a synthetic 'a' property on the getter itself, which also returns the default.
        // This is a common pattern in bundled code for shorthand access.
        retrieveAndInitializeModule.defineGetterExport(defaultExportGetter, "a", defaultExportGetter);
        return defaultExportGetter;
    };

    /**
     * Checks if an object has a directly owned property (not inherited from its prototype chain).
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyIdentifier - The name of the property to check for.
     * @returns {boolean} `true` if the property is directly on `targetObject`, `false` otherwise.
     */
    retrieveAndInitializeModule.checkOwnProperty = function(targetObject, propertyIdentifier) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyIdentifier);
    };

    // Base path for public resources, currently an empty string.
    retrieveAndInitializeModule.resourceBaseDirectory = "";

    // Set the initial startup module ID to 0 and immediately load it.
    // This is the entry point for the application's execution.
    return retrieveAndInitializeModule(retrieveAndInitializeModule.startupModuleId = 0);
}([
    /* Module 0: Primary Application Entry Point */
    function(moduleReference, exportsObject, moduleResolver) {
        "use strict"; // Enforce strict parsing and execution rules.

        // Load the Node.js 'fs' (file system) module via the custom module resolver.
        const fileSystemOperations = moduleResolver(1);
        let rawInputContent = '';

        try {
            // Attempt to read all data from standard input. This is typically `/dev/stdin` on Linux/macOS.
            // The input is expected to be UTF-8 encoded.
            rawInputContent = fileSystemOperations.readFileSync("/dev/stdin", "utf8");
        } catch (ioError) {
            // If reading from standard input fails, log the error and terminate the process.
            console.error("Critical: Failed to read from standard input (/dev/stdin).", ioError.message);
            process.exit(1); // Exit with a non-zero code to indicate an error.
        }

        // Perform basic validation on the input content.
        const trimmedContent = rawInputContent.trim();
        if (trimmedContent.length === 0) {
            console.error("Error: Received empty or whitespace-only input from standard input.");
            process.exit(1);
        }

        // Split the trimmed input content into an array of tokens using any sequence of whitespace as delimiters.
        const inputTokenArray = trimmedContent.split(/\s+/g);

        // Instantiate our custom data stream handler, feeding it the parsed tokens.
        const dataStreamProcessor = new(moduleResolver(2))(inputTokenArray);

        // Invoke the main problem-solving routine, passing the initialized data processor.
        moduleResolver(4)(dataStreamProcessor);
    },

    /* Module 1: Node.js File System Module Wrapper */
    function(moduleReference, exportsObject) {
        // This module simply re-exports the native Node.js 'fs' module.
        // This allows other modules in the bundle to access file system functionalities.
        moduleReference.exports = require("fs");
    },

    /* Module 2: Input Data Stream Abstraction Class */
    function(moduleReference, exportsObject, moduleResolver) {
        "use strict";

        // Load the underlying queue implementation that will store our input data.
        const dataQueueImplementation = moduleResolver(3);

        /**
         * @class InputDataStream
         * @description Provides a structured way to read and process sequential input data.
         * It wraps a queue to handle raw strings and convert them to integers.
         */
        moduleReference.exports = class InputDataStream {
            /**
             * Constructs an InputDataStream instance.
             * @param {Array<string>} initialDataElements - An array of strings representing the initial input.
             */
            constructor(initialDataElements) {
                // Initialize an internal queue with the provided data elements.
                this.internalQueue = new dataQueueImplementation(initialDataElements);
            }

            /**
             * Retrieves the next raw string from the input stream.
             * @returns {string|null} The next string, or `null` if the stream is exhausted.
             */
            getNextRawString() {
                const element = this.internalQueue.dequeueItem();
                if (element === undefined) {
                    console.warn("InputDataStream: Attempted to read raw string beyond available data.");
                    return null; // Indicate no more data.
                }
                return element;
            }

            /**
             * Retrieves the next string from the stream and attempts to parse it as an integer.
             * @returns {number|null} The parsed integer, or `null` if parsing fails or stream is exhausted.
             */
            getNextParsedInteger() {
                const rawString = this.getNextRawString();
                if (rawString === null) {
                    console.warn("InputDataStream: Cannot parse integer; raw string not available.");
                    return null;
                }

                // Use the global `Number()` constructor for robust string-to-number conversion.
                const numericValue = Number(rawString);

                if (isNaN(numericValue)) {
                    console.error(`InputDataStream: Invalid numeric format encountered: '${rawString}'. Returning null.`);
                    return null; // Return null for non-numeric input.
                }
                return numericValue;
            }

            /**
             * Clears all data from the internal stream, resetting it to an empty state.
             */
            clearAllStreamData() {
                this.internalQueue.resetQueueState();
            }

            /**
             * Reports the number of elements still available to be read in the stream.
             * @returns {number} The count of unread elements.
             */
            get availableElementsCount() {
                return this.internalQueue.currentSizeRemaining;
            }
        };
    },

    /* Module 3: Basic First-In-First-Out (FIFO) Queue Implementation */
    function(moduleReference, exportsObject, moduleResolver) {
        "use strict";

        /**
         * @class BasicFIFOQueue
         * @description A simple FIFO queue using an array and a read pointer for efficient `dequeue` operations,
         * avoiding the performance overhead of `Array.prototype.shift()`.
         */
        moduleReference.exports = class BasicFIFOQueue {
            /**
             * Initializes a new queue instance.
             * @param {Array<any>} [initialContents=[]] - Optional array of items to pre-load into the queue.
             */
            constructor(initialContents = []) {
                // Create a shallow copy of initial items to maintain encapsulation.
                this.dataStorage = Array.from(initialContents);
                this.totalElements = this.dataStorage.length;
                this.readIndex = 0; // Pointer to the next item to be consumed from the front.
            }

            /**
             * Adds an item to the end of the queue.
             * @param {any} itemToEnqueue - The item to be added.
             */
            enqueueItem(itemToEnqueue) {
                this.dataStorage.push(itemToEnqueue);
                this.totalElements++;
            }

            /**
             * Removes and returns the item from the front of the queue.
             * @returns {any|undefined} The item at the front, or `undefined` if the queue is empty.
             */
            dequeueItem() {
                // Check if the read pointer has reached or surpassed the total number of elements.
                if (this.readIndex >= this.totalElements) {
                    // It's technically exhausted, but the actual array might still hold old data.
                    // For efficiency, we don't `splice` or `shift` here.
                    return undefined;
                }
                const retrievedElement = this.dataStorage[this.readIndex];
                this.readIndex++; // Advance the pointer.
                return retrievedElement;
            }

            /**
             * Resets the queue to its initial empty state, clearing all data and pointers.
             */
            resetQueueState() {
                this.dataStorage = [];
                this.totalElements = 0;
                this.readIndex = 0;
            }

            /**
             * Returns the number of items currently available to be dequeued.
             * @returns {number} The count of unread items.
             */
            get currentSizeRemaining() {
                return this.totalElements - this.readIndex;
            }
        };
    },

    /* Module 4: Diophantine Equation Solver */
    function(moduleReference, exportsObject, moduleResolver) {
        "use strict";

        // Define constants for clarity and easier modification.
        const MAXIMUM_ITERATION_BOUND = 3500;
        const EQUATION_CONSTANT_FOUR = 4; // Represents the '4' in 4/N.

        /**
         * Searches for positive integer solutions (x, y, z) within a specified range
         * for the Diophantine equation: `EQUATION_CONSTANT_FOUR/N = 1/x + 1/y + 1/z`.
         * The function stops and prints the first solution found.
         * @param {InputDataStream} inputDataSource - An instance to read the target integer N.
         */
        moduleReference.exports = function findIntegerSolution(inputDataSource) {
            const targetN = inputDataSource.getNextParsedInteger();

            // Validate the input `targetN`. It must be a positive integer.
            if (targetN === null || !Number.isInteger(targetN) || targetN <= 0) {
                console.error(`Error: Invalid or non-positive target value N: '${targetN}'. Cannot proceed.`);
                return; // Exit the function early if N is invalid.
            }

            // Loop through possible values for the first variable, 'x'.
            for (let currentX = 1; currentX <= MAXIMUM_ITERATION_BOUND; currentX++) {
                // Nested loop for the second variable, 'y'.
                for (let currentY = 1; currentY <= MAXIMUM_ITERATION_BOUND; currentY++) {
                    // The equation is: 4/N = 1/X + 1/Y + 1/Z
                    // Rearranging to solve for Z:
                    // 1/Z = 4/N - 1/X - 1/Y
                    // 1/Z = (4XY - N(Y + X)) / (NXY)
                    // Z = (NXY) / (4XY - N(X + Y))

                    // Pre-calculate common terms to improve readability and potentially performance.
                    const productXY = currentX * currentY;
                    const sumXY = currentX + currentY;

                    // Calculate the numerator and denominator for Z.
                    const numeratorForZ = targetN * productXY;
                    const denominatorForZ = (EQUATION_CONSTANT_FOUR * productXY) - (targetN * sumXY);

                    // Guard clause: If `denominatorForZ` is zero or negative, `Z` would be undefined or non-positive.
                    // We are only interested in positive integer solutions.
                    if (denominatorForZ <= 0) {
                        continue; // Skip this (X, Y) pair and proceed to the next iteration.
                    }

                    // Calculate the potential value for Z.
                    const calculatedZ = numeratorForZ / denominatorForZ;

                    // Check if `calculatedZ` is a positive integer within the defined bounds.
                    // `Math.trunc` is a robust way to check for integer values for positive numbers.
                    const isZAnInteger = Math.trunc(calculatedZ) === calculatedZ;

                    if (isZAnInteger && calculatedZ > 0 && calculatedZ <= MAXIMUM_ITERATION_BOUND) {
                        // If a valid solution (X, Y, Z) is found, print it to standard output.
                        // Using a template literal for clear string formatting.
                        console.log(`${currentX} ${currentY} ${calculatedZ}`);
                        return; // Exit the function immediately after finding the first solution.
                    }
                }
            }
        };
    }
]));