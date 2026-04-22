module.exports = (moduleDefinitions) => {
    // Cache for loaded modules to prevent redundant loading and circular dependencies.
    const moduleCache = {};

    // The core 'require' function for our module system.
    // It loads a module by its identifier (moduleId).
    const customRequire = (moduleId) => {
        // If the module is already in the cache, return its exports immediately.
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }

        // If not cached, initialize a new module entry in the cache.
        // 'isLoaded' flag indicates if the module's code has been executed.
        const currentModule = moduleCache[moduleId] = {
            id: moduleId,
            isLoaded: false,
            exports: {} // The object that will hold the module's exports.
        };

        // Execute the module's definition function.
        // This populates `currentModule.exports`.
        // The definition function receives (module, exports, require) as arguments.
        moduleDefinitions[moduleId].call(
            currentModule.exports, // 'this' context for the module
            currentModule,
            currentModule.exports,
            customRequire // Pass our custom require function
        );

        // Mark the module as loaded.
        currentModule.isLoaded = true;

        // Return the populated exports object.
        return currentModule.exports;
    };

    // Store a reference to the module definitions for internal use.
    customRequire.allModuleDefs = moduleDefinitions;
    // Store a reference to the module cache.
    customRequire.moduleStore = moduleCache;

    /**
     * Defines a getter property on an object for module exports.
     * This is used for compatibility with how some bundlers expose modules.
     * @param {object} targetObject The object to define the property on.
     * @param {string} propertyName The name of the property to define.
     * @param {function} getterFunction The function to call to get the property's value.
     */
    customRequire.defineGetter = (targetObject, propertyName, getterFunction) => {
        // Only define if the property doesn't already exist.
        if (!customRequire.checkOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make it iterable.
                get: getterFunction // The function that retrieves the value.
            });
        }
    };

    /**
     * Marks a module's exports object as an ES Module.
     * Adds `Symbol.toStringTag` and `__esModule` properties for better interop.
     * @param {object} exportsObject The module's exports object.
     */
    customRequire.flagAsESModule = (exportsObject) => {
        // Add Symbol.toStringTag for better module identification in console/debugging.
        // This is optional but common in bundlers.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        // Mark as an ES module, crucial for interop logic.
        Object.defineProperty(exportsObject, '__esModule', {
            value: true
        });
    };

    /**
     * Handles interop for various module types (CommonJS, ES Modules).
     * @param {any} moduleValue The value of the module.
     * @param {number} modeFlags Flags indicating how to interpret the module.
     *   1: Treat as a module ID, then require it.
     *   4: If it's an ES module, return it directly.
     *   8: Return the module value directly.
     *   2: Iterate and re-export properties if not a string.
     * @returns {any} The interop-processed module value.
     */
    customRequire.interopModule = (moduleValue, modeFlags) => {
        // Flag 1: If it's a module ID, require it first.
        if (modeFlags & 1) {
            moduleValue = customRequire(moduleValue);
        }
        // Flag 8: If this flag is set, return the module value as is.
        if (modeFlags & 8) {
            return moduleValue;
        }
        // Flag 4: If it's already an ES module, return it.
        // This check is important to avoid re-wrapping ES modules.
        if (modeFlags & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // For other cases, create a new object to represent the module.
        const interopObject = Object.create(null);
        // Mark the new object as an ES module.
        customRequire.flagAsESModule(interopObject);
        // Define a 'default' getter to point to the original module value.
        Object.defineProperty(interopObject, 'default', {
            enumerable: true,
            value: moduleValue
        });

        // Flag 2: If not a string, iterate over properties and re-export them.
        // This handles cases where a CommonJS module exports multiple things.
        if (modeFlags & 2 && typeof moduleValue !== 'string') {
            for (const key in moduleValue) {
                // Ensure the property is directly on the moduleValue, not inherited.
                if (customRequire.checkOwn(moduleValue, key)) {
                    customRequire.defineGetter(interopObject, key, () => moduleValue[key]);
                }
            }
        }
        return interopObject;
    };

    /**
     * Gets a getter function for a module's default export.
     * This is useful for `import * as name from 'module'` syntax.
     * @param {any} targetModule The module to get the default export from.
     * @returns {function} A getter function for the default export.
     */
    customRequire.getDefaultExportGetter = (targetModule) => {
        // If it's an ES module and has a default export, return a getter for it.
        const defaultGetter = targetModule && targetModule.__esModule ?
            () => targetModule.default : // If ES module, 'default' is direct.
            () => targetModule; // Otherwise, the whole module is the default.

        // Define an 'a' property on the getter itself, pointing to the getter.
        // This is a common pattern in Webpack bundles for specific interop scenarios.
        customRequire.defineGetter(defaultGetter, 'a', defaultGetter);
        return defaultGetter;
    };

    /**
     * Checks if an object has a property directly (not inherited).
     * @param {object} targetObject The object to check.
     * @param {string} propertyName The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    customRequire.checkOwn = (targetObject, propertyName) => {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path for assets (not used in this simple example, but kept for structure).
    customRequire.publicPath = '';

    // Set the entry point for the application and execute it.
    // The entry module is module with ID 1.
    const entryModuleId = 1; // Assuming module 1 is the main entry.
    customRequire.entryPoint = entryModuleId; // Store for debugging/inspection.

    // Execute the main entry module.
    return customRequire(customRequire.entryPoint);
}([
/* 0 */
(moduleExports, moduleObj, localRequire) => {
    'use strict';
    // Module 0: A simple sequential data buffer (queue-like structure)
    // for processing an ordered stream of elements.
    moduleExports.exports = class SequentialDataBuffer {
        /**
         * Initializes the buffer with an optional array of starting items.
         * @param {Array<any>} initialDataSet An array of items to pre-fill the buffer.
         */
        constructor(initialDataSet = []) {
            // Guard clause: Ensure initialDataSet is an array.
            if (!Array.isArray(initialDataSet)) {
                console.warn("SequentialDataBuffer received non-array input; initializing empty buffer.");
                initialDataSet = [];
            }
            this.dataElements = [...initialDataSet]; // Store items, deep copy if needed, but shallow is fine here.
            this.currentSize = this.dataElements.length; // Current number of accessible items.
            this.readPointer = 0; // Index of the next item to be read.
        }

        /**
         * Adds an item to the end of the buffer.
         * @param {any} newItem The item to add.
         */
        appendItem(newItem) {
            this.dataElements.push(newItem);
            this.currentSize++;
        }

        /**
         * Retrieves and removes the next item from the front of the buffer.
         * @returns {any | undefined} The next item, or undefined if the buffer is empty.
         */
        retrieveNextItem() {
            if (this.readPointer >= this.dataElements.length) {
                // Buffer is logically empty.
                return undefined;
            }

            const retrievedElement = this.dataElements[this.readPointer];
            this.readPointer++;
            this.currentSize--; // Decrement current size.

            // Optimization/Memory Management: Periodically compact the array.
            // If the read pointer has moved significantly past the start,
            // it means many "dequeued" items are still in memory.
            const COMPACTION_THRESHOLD = 1000; // Compact after 1000 items read.
            const MIN_REMAINING_SIZE = 100; // Only compact if enough items are left.
            if (this.readPointer > COMPACTION_THRESHOLD && this.readPointer > this.dataElements.length / 2 && this.dataElements.length > MIN_REMAINING_SIZE) {
                this.dataElements = this.dataElements.slice(this.readPointer);
                this.readPointer = 0; // Reset pointer after slice.
            }

            return retrievedElement;
        }

        /**
         * Peeks at the next item without removing it.
         * @returns {any | undefined} The next item, or undefined if the buffer is empty.
         */
        peekNextItem = () => {
            if (this.readPointer >= this.dataElements.length) {
                return undefined;
            }
            return this.dataElements[this.readPointer];
        }

        /**
         * Resets the buffer, clearing all items and pointers.
         */
        clearAllData() {
            this.dataElements = [];
            this.currentSize = 0;
            this.readPointer = 0;
        }

        /**
         * Gets the number of items currently available in the buffer.
         * @returns {number} The current size.
         */
        get availableItemsCount() {
            return this.currentSize;
        }

        /**
         * Checks if the buffer is empty.
         * @returns {boolean} True if empty, false otherwise.
         */
        get isEmpty() {
            return this.currentSize === 0;
        }
    };
},
/* 1 */
(moduleObj, moduleExports, localRequire) => {
    'use strict';
    // Module 1: Application Entry Point
    // This module handles reading input from /dev/stdin and
    // passing it to the main processing logic.

    // Retrieve the Node.js 'fs' (File System) module.
    const fileSystemUtils = localRequire(2);

    // Retrieve the main processing function from module 3.
    const processInputData = localRequire(3);

    // Define the path for standard input.
    const standardInputPath = '/dev/stdin';
    let rawInputContent = '';

    try {
        // Attempt to read the entire content of standard input synchronously.
        // Using 'utf8' encoding for text data.
        rawInputContent = fileSystemUtils.readFileSync(standardInputPath, { encoding: 'utf8' });

        // Guard clause: Check if input was actually read.
        if (!rawInputContent || rawInputContent.trim().length === 0) {
            console.error("Warning: No content read from standard input. Exiting.");
            return;
        }

        // Pass the raw content to the main processing function.
        processInputData(rawInputContent);

    } catch (readError) {
        // Catch any errors during file reading (e.g., file not found, permissions).
        console.error(`Error reading from ${standardInputPath}:`, readError.message);
        // Provide a clearer error message or fallback.
        if (readError.code === 'ENOENT') {
            console.error("Ensure '/dev/stdin' is accessible or input is piped.");
        }
        // Re-throw or handle more gracefully depending on application requirements.
        throw readError; // Re-throwing to halt execution as input is critical.
    }
},
/* 2 */
(moduleObj, moduleExports, localRequire) => {
    'use strict';
    // Module 2: Node.js File System (fs) Module Wrapper
    // This module simply re-exports the native 'fs' module.
    moduleExports.exports = require('fs');
},
/* 3 */
(moduleObj, moduleExports, localRequire) => {
    'use strict';
    // Module 3: Input Orchestrator
    // This module takes the raw input string, parses it into tokens
    // using a specialized parser, and then passes the parsed data
    // to the main application logic for processing.

    // Import the specialized input parsing class.
    const InputTokenStream = localRequire(4);
    // Import the primary application logic handler.
    const mainApplicationLogic = localRequire(5);

    /**
     * Processes a raw input string by tokenizing it and
     * executing the main application logic.
     * @param {string} rawInputString The unparsed string input.
     */
    moduleExports.exports = (rawInputString) => {
        // Guard clause: Ensure input is a string.
        if (typeof rawInputString !== 'string') {
            console.error("Error: Input for processing must be a string.");
            return; // Abort if input is invalid.
        }

        // Create an instance of the input token stream parser.
        // This parser will break down the raw string into usable tokens.
        const parserInstance = new InputTokenStream(rawInputString);

        // Execute the main application logic, providing it with the parser instance.
        // The logic handler will then retrieve tokens as needed.
        mainApplicationLogic(parserInstance);

        // Optional: After processing, clear the parser's internal buffer.
        // This is good practice for memory management if the parser is reused,
        // though in this flow it's typically a one-shot operation.
        parserInstance.resetAndClearBuffer();
    };
},
/* 4 */
(moduleObj, moduleExports, localRequire) => {
    'use strict';
    // Module 4: Text Data Processor (Input Tokenizer)
    // This class is responsible for taking a raw text string,
    // splitting it into tokens, and providing methods to consume these tokens
    // either as raw strings or parsed integers.

    // Import the SequentialDataBuffer class (Module 0) to manage tokens.
    const TokenBuffer = localRequire(0);

    moduleExports.exports = class TextTokenProcessor {
        /**
         * Initializes the processor with a raw text string.
         * The string is trimmed and split by whitespace into tokens.
         * @param {string} sourceText The raw text string to process.
         */
        constructor(sourceText) {
            // Guard clause: Ensure sourceText is a string.
            if (typeof sourceText !== 'string') {
                console.error("TextTokenProcessor constructor expects a string.");
                this.internalTokenBuffer = new TokenBuffer([]);
                return;
            }

            // Split the input text into an array of tokens.
            // .trim() removes leading/trailing whitespace.
            // .split(/\s+/g) splits by one or more whitespace characters.
            const rawTokens = sourceText.trim().split(/\s+/g);

            // Initialize the internal buffer with the parsed tokens.
            this.internalTokenBuffer = new TokenBuffer(rawTokens);
        }

        /**
         * Retrieves the next available token as a raw string.
         * @returns {string | undefined} The next token, or undefined if no more tokens.
         */
        getNextStringToken = () => {
            const token = this.internalTokenBuffer.retrieveNextItem();
            if (token === undefined) {
                console.warn("Attempted to read string token from exhausted buffer.");
            }
            return token;
        }

        /**
         * Retrieves the next available token and attempts to parse it as an integer.
         * @returns {number | undefined} The parsed integer, or undefined if no more tokens or parsing fails.
         */
        getNextIntegerToken = () => {
            const tokenString = this.internalTokenBuffer.retrieveNextItem();
            if (tokenString === undefined) {
                console.warn("Attempted to read integer token from exhausted buffer.");
                return undefined;
            }

            const parsedValue = parseInt(tokenString, 10);

            // Guard clause: Check if parsing was successful.
            if (isNaN(parsedValue)) {
                console.error(`Error: Could not parse "${tokenString}" as an integer. Returning NaN.`);
                return NaN;
            }
            return parsedValue;
        }

        /**
         * Peeks at the next available token as a raw string without consuming it.
         * @returns {string | undefined} The next token, or undefined if no more tokens.
         */
        peekNextStringToken = () => {
            return this.internalTokenBuffer.peekNextItem();
        }

        /**
         * Clears all processed and pending data from the internal buffer.
         */
        resetAndClearBuffer = () => {
            this.internalTokenBuffer.clearAllData();
        }

        /**
         * Returns true if there are no more tokens to read.
         * @returns {boolean}
         */
        get isBufferEmpty() {
            return this.internalTokenBuffer.isEmpty;
        }
    };
},
/* 5 */
(moduleObj, moduleExports, localRequire) => {
    'use strict';
    // Module 5: Core Application Logic
    // This module implements the main algorithm, reading structured input
    // from the provided data source and computing results.

    /**
     * Executes the main algorithm using tokens provided by the input data source.
     * @param {object} inputSource An instance of a TextTokenProcessor (Module 4)
     *                             providing methods like getNextIntegerToken.
     */
    moduleExports.exports = (inputSource) => {
        // Guard clause: Basic validation of the input source.
        if (!inputSource || typeof inputSource.getNextIntegerToken !== 'function') {
            console.error("Error: Invalid input source provided to main application logic.");
            return;
        }

        // Read the total number of nodes (let's assume 'N' for node count).
        const totalNodeCount = inputSource.getNextIntegerToken();

        // Guard clause: Ensure a valid node count is obtained.
        if (typeof totalNodeCount !== 'number' || totalNodeCount <= 0 || !Number.isInteger(totalNodeCount)) {
            console.error(`Error: Invalid total node count received: ${totalNodeCount}. Must be a positive integer.`);
            return;
        }

        // Initialize arrays and variables for the algorithm.
        // 'connectionCounts': Tracks some count for each node.
        const connectionCounts = new Array(totalNodeCount).fill(0);
        // 'previousValues': Stores a "previous" value associated with each node.
        const previousValues = new Array(totalNodeCount).fill(0);
        // 'processedEdgeResults': Stores a result for each processed edge.
        // The original code uses 'e - 1' for the number of edges.
        const numberOfEdges = totalNodeCount - 1;
        const processedEdgeResults = new Array(numberOfEdges);

        // 'maxCountAchieved': Stores the maximum value found during processing.
        let maxCountAchieved = 0; // Renamed from 'o' for clarity.

        // Helper function for the core loop logic.
        const processEdge = (edgeIdx) => {
            // Read two node indices for the current edge.
            // Subtract 1 to make them 0-indexed.
            const firstNodeIndex = inputSource.getNextIntegerToken() - 1;
            const secondNodeIndex = inputSource.getNextIntegerToken() - 1;

            // Validate node indices.
            if (firstNodeIndex < 0 || firstNodeIndex >= totalNodeCount ||
                secondNodeIndex < 0 || secondNodeIndex >= totalNodeCount) {
                console.error(`Warning: Invalid node index encountered at edge ${edgeIdx + 1}. Skipping.`);
                // Assign a default or error value if invalid.
                processedEdgeResults[edgeIdx] = -1; // Indicate an error or skipped edge.
                return;
            }

            // Increment the connection count for the first node.
            connectionCounts[firstNodeIndex]++;

            // Original logic: `r[u] == n[u] && r[u]++`
            // This means: if `connectionCounts[firstNodeIndex]` *before* its increment
            // was equal to `previousValues[firstNodeIndex]`, then increment it *again*.
            // Let's rewrite this with an explicit if statement for clarity.
            // Store the value *before* the first increment.
            const preIncrementCount = connectionCounts[firstNodeIndex] - 1;
            if (preIncrementCount === previousValues[firstNodeIndex]) {
                connectionCounts[firstNodeIndex]++;
            }

            // Update the maximum count observed so far.
            maxCountAchieved = Math.max(maxCountAchieved, connectionCounts[firstNodeIndex]);

            // Assign the updated count of the first node to the second node's previous value.
            previousValues[secondNodeIndex] = connectionCounts[firstNodeIndex];

            // Store the current connection count of the first node in the results array.
            processedEdgeResults[edgeIdx] = connectionCounts[firstNodeIndex];
        };

        // Loop through each edge to process it.
        // The original code uses 'e - 1' iterations.
        for (let currentEdge = 0; currentEdge < numberOfEdges; currentEdge++) {
            processEdge(currentEdge); // Call the helper function.
        }

        // Output the maximum count found.
        console.log(`Maximum count achieved: ${maxCountAchieved}`);

        // Output each element of the processed edge results.
        console.log("Individual edge processing results:");
        // Using forEach for a more modern iteration style.
        processedEdgeResults.forEach((result, index) => {
            console.log(`Edge ${index + 1}: ${result}`);
        });

        // Optional: Clear the input source after all processing.
        // This depends on whether `inputSource` is expected to be reusable.
        if (typeof inputSource.resetAndClearBuffer === 'function') {
            inputSource.resetAndClearBuffer();
        }
    };
}
]));