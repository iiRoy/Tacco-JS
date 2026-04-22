module.exports = function(moduleDefinitions) {
    // A cache to store modules that have already been loaded, preventing redundant execution.
    // Keys are module identifiers, values are module objects containing exports and loading status.
    const moduleInstancesCache = {};

    /**
     * The central module loading mechanism, akin to a custom 'require' function.
     * It handles module resolution, caching, and execution.
     * @param {number} requestedModuleId - The unique numeric identifier of the module to load.
     * @returns {object} The 'exports' object of the loaded module.
     */
    function retrieveModule(requestedModuleId) {
        // If the module is already in our cache, we can return its exports immediately.
        if (moduleInstancesCache[requestedModuleId]) {
            return moduleInstancesCache[requestedModuleId].exports;
        }

        // If not in cache, create a new module entry.
        // This object will hold the module's state and its exports.
        const newModuleEntry = moduleInstancesCache[requestedModuleId] = {
            uniqueId: requestedModuleId,
            isFullyLoaded: false,
            exports: {} // This object will be populated by the module's code.
        };

        // Retrieve the module's definition function from the provided array.
        const moduleCodeExecutor = moduleDefinitions[requestedModuleId];

        // Execute the module's code. The definition function typically takes
        // (module, module.exports, retrieveModule) as arguments.
        // 'this' context is set to newModuleEntry.exports for convenience in some patterns.
        if (typeof moduleCodeExecutor === 'function') {
            moduleCodeExecutor.call(newModuleEntry.exports, newModuleEntry, newModuleEntry.exports, retrieveModule);
        } else {
            // Log a warning if a module ID points to an invalid definition.
            console.warn(`Module definition for ID ${requestedModuleId} is missing or not a function.`);
        }

        // Mark the module as fully loaded after its code has been executed.
        newModuleEntry.isFullyLoaded = true;

        // Return the exports object, which now contains everything the module exposed.
        return newModuleEntry.exports;
    }

    // --- Auxiliary properties and methods attached to the main module loader function ---

    // Store the original array of module definitions for introspection if needed.
    retrieveModule.definitionsArray = moduleDefinitions;
    // Expose the internal module cache.
    retrieveModule.loadedModules = moduleInstancesCache;

    /**
     * Defines a getter property on a target object. This is typically used for
     * setting up ES module-like named exports on a CommonJS exports object.
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propertyKey - The name of the property.
     * @param {function} valueGetter - A function that returns the property's value.
     */
    retrieveModule.defineExportProperty = function(targetObj, propertyKey, valueGetter) {
        // Only define if the property doesn't already exist to avoid conflicts.
        if (Object.prototype.hasOwnProperty.call(targetObj, propertyKey)) {
            // Optional: log a warning if attempting to redefine an existing property.
            // console.warn(`Attempted to redefine existing property '${propertyKey}' on module export.`);
            return;
        }
        Object.defineProperty(targetObj, propertyKey, {
            enumerable: true, // Make the property visible during enumeration.
            get: valueGetter  // The function to call when the property is accessed.
        });
    };

    /**
     * Configures a module's exports object to behave like an ES module.
     * This involves setting the '__esModule' flag and 'Symbol.toStringTag'.
     * @param {object} exportsObject - The module's exports object.
     */
    retrieveModule.setupEsModuleInterop = function(exportsObject) {
        if (typeof exportsObject === 'object' && exportsObject !== null) {
            // Set Symbol.toStringTag for better debugging and type identification.
            if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
            }
            // Mark this object as an ES module for compatibility.
            Object.defineProperty(exportsObject, '__esModule', { value: true });
        }
    };

    /**
     * Creates a synthetic namespace object for a module, handling different
     * CommonJS/ESM interop scenarios based on flags.
     * @param {any} inputModuleValue - The module's raw export value or its ID.
     * @param {number} interopFlags - A bitmask controlling the interop behavior:
     *                                1: `inputModuleValue` is a module ID, load it.
     *                                2: Copy all properties from `inputModuleValue` (if object) to namespace.
     *                                4: If `inputModuleValue` is already an ES module, return it directly.
     *                                8: Return `inputModuleValue` as-is.
     * @returns {object} The constructed namespace object.
     */
    retrieveModule.createModuleNamespace = function(inputModuleValue, interopFlags) {
        // Flag 1: If set, the input is a module ID, so load the actual module.
        if (interopFlags & 1) {
            inputModuleValue = retrieveModule(inputModuleValue);
        }
        // Flag 8: If set, just return the input value directly without further processing.
        if (interopFlags & 8) {
            return inputModuleValue;
        }
        // Flag 4: If set and the input is an object already marked as an ES module, return it.
        if ((interopFlags & 4) && typeof inputModuleValue === 'object' && inputModuleValue !== null && inputModuleValue.__esModule) {
            return inputModuleValue;
        }

        // Create a new plain object to serve as the namespace.
        const namespaceObj = Object.create(null);
        // Apply ES module interop properties to this new object.
        retrieveModule.setupEsModuleInterop(namespaceObj);
        // Define a 'default' export that points to the original module value.
        Object.defineProperty(namespaceObj, 'default', { enumerable: true, value: inputModuleValue });

        // Flag 2: If set and the input module value is an object,
        // iterate over its properties and define getters on the namespace object.
        if ((interopFlags & 2) && typeof inputModuleValue === 'object' && inputModuleValue !== null) {
            for (const propName in inputModuleValue) {
                // Ensure we only copy own properties, not inherited ones.
                if (Object.prototype.hasOwnProperty.call(inputModuleValue, propName)) {
                    retrieveModule.defineExportProperty(namespaceObj, propName, () => inputModuleValue[propName]);
                }
            }
        }
        return namespaceObj;
    };

    /**
     * Provides a getter function for a module's default export, considering
     * both ES module and CommonJS export patterns.
     * @param {object} moduleToInspect - The module's exports object.
     * @returns {function} A function that, when called, returns the default export.
     */
    retrieveModule.obtainDefaultExport = function(moduleToInspect) {
        const defaultExportFn = moduleToInspect && moduleToInspect.__esModule
            ? () => moduleToInspect.default // If it's an ES module, get its 'default' property.
            : () => moduleToInspect;     // Otherwise, the entire export object is the default.

        // Attach an 'a' property to the getter function itself, pointing back to itself.
        // This is a common pattern in bundlers for named export interop.
        retrieveModule.defineExportProperty(defaultExportFn, 'a', defaultExportFn);
        return defaultExportFn;
    };

    /**
     * A utility to check if an object has an own property.
     * This is a robust way to call Object.prototype.hasOwnProperty.
     * @param {object} target - The object to check.
     * @param {string} property - The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    retrieveModule.checkOwnProperty = function(target, property) {
        // Add a guard for null/undefined objects.
        if (target === null || typeof target !== 'object') {
            return false;
        }
        return Object.prototype.hasOwnProperty.call(target, property);
    };

    // Placeholder for the public path of assets, often used by bundlers.
    retrieveModule.assetPublicPath = "";

    // Define the initial entry point module ID.
    // The original code sets `e.s=0` and then calls `e(e.s)`. We'll set the property
    // on the loader function and then use it for the final execution call.
    retrieveModule.applicationEntryPoint = 0;

    // Finally, execute the application's entry point module and return its exports.
    return retrieveModule(retrieveModule.applicationEntryPoint);
}([
    // --- Application-Specific Modules Begin Here ---

    // Module 0: The main entry point for the application logic.
    // It orchestrates reading input and invoking the core processing algorithm.
    function(currentModule, moduleExports, moduleLoader) {
        'use strict'; // Enforce strict JavaScript parsing and execution.

        // Load the graph algorithm module.
        const graphAlgorithmExecutor = moduleLoader(1);
        // Load the Node.js file system module for I/O operations.
        const nodeFileSystem = moduleLoader(2);

        try {
            // Validate that the required 'readFileSync' function exists on the fs module.
            if (typeof nodeFileSystem.readFileSync !== 'function') {
                throw new Error("File system module is missing the 'readFileSync' method.");
            }

            // Read the entire content from standard input synchronously.
            // Using UTF-8 encoding for text data.
            const rawStdinContent = nodeFileSystem.readFileSync("/dev/stdin", "UTF-8");

            // Split the input string into an array of lines.
            // Using a regex to handle both Windows (CRLF) and Unix (LF) line endings robustly.
            const inputDataLines = rawStdinContent.split(/\r?\n/);

            // Pass the array of input lines to the graph processing algorithm.
            graphAlgorithmExecutor(inputDataLines);

        } catch (ioError) {
            // Catch and report any errors that occur during file reading or processing.
            console.error("An error occurred during input processing:", ioError.message);
            // In a production environment, one might choose to exit the process here:
            // process.exit(1);
        }
    },

    // Module 1: Contains the core graph traversal and distance calculation algorithm.
    // This module processes graph data from input lines and performs a BFS-like search.
    function(algorithmModule, algorithmExports, moduleLoader) {
        'use strict'; // Ensure strict mode for this algorithm.

        /**
         * A helper to safely extract a specific number of elements from an array.
         * This function provides a more controlled way to get values than direct destructuring
         * when the array length might be uncertain, and provides a clear error message.
         * @param {Array<any>} sourceArr - The array from which to extract elements.
         * @param {number} numElements - The exact number of elements expected.
         * @returns {Array<any>} An array containing the extracted elements.
         * @throws {TypeError} If the input is not an array or does not contain enough elements.
         */
        const retrieveArraySlice = (sourceArr, numElements) => {
            // Basic input validation for robustness.
            if (!Array.isArray(sourceArr)) {
                throw new TypeError("Source for element extraction must be an array.");
            }
            if (numElements < 0) {
                throw new TypeError("Number of elements to extract cannot be negative.");
            }
            if (sourceArr.length < numElements) {
                throw new TypeError(`Expected ${numElements} elements, but array only contains ${sourceArr.length}.`);
            }
            // Use slice to get the first 'numElements' items.
            return sourceArr.slice(0, numElements);
        };

        /**
         * Parses a string, splits it by spaces, and converts parts to numbers.
         * Includes basic error checking for the conversion.
         * @param {string} inputString - The string to parse.
         * @returns {number[]} An array of numbers.
         * @throws {Error} If any part cannot be converted to a number.
         */
        const parseLineToNumbers = (inputString) => {
            const parts = inputString.split(" ");
            const numbers = parts.map(Number);
            if (numbers.some(isNaN)) {
                throw new Error(`Failed to parse all parts of line "${inputString}" into numbers.`);
            }
            return numbers;
        };

        /**
         * Main function to process the graph input and compute distances.
         * @param {string[]} inputLines - An array of strings, each representing a line of input data.
         */
        algorithmExports.executeGraphAlgorithm = function(inputLines) {
            // Validate the initial input array.
            if (!Array.isArray(inputLines) || inputLines.length === 0) {
                console.error("Algorithm Error: Input data lines are empty or invalid.");
                return;
            }

            // Parse the total number of nodes from the first line.
            const totalGraphNodes = Number(inputLines[0]);
            if (isNaN(totalGraphNodes) || totalGraphNodes <= 0) {
                console.error(`Algorithm Error: Invalid number of nodes specified: "${inputLines[0]}". Must be a positive integer.`);
                return;
            }

            // Initialize the adjacency list for the graph. Each node will have a list
            // of its neighbors, storing both the neighbor's index and the edge weight.
            const graphConnections = Array.from({ length: totalGraphNodes }, () => []);

            // Process the lines defining graph edges. There are (totalGraphNodes - 1) such lines.
            const numberOfEdges = totalGraphNodes - 1;
            for (let edgeIdx = 0; edgeIdx < numberOfEdges; edgeIdx++) {
                const currentInputLine = edgeIdx + 1; // Input lines are 1-indexed for edges.
                if (currentInputLine >= inputLines.length) {
                    console.error(`Algorithm Error: Missing edge definition on line ${currentInputLine}. Expected ${numberOfEdges} edges.`);
                    return;
                }

                let edgeDetails;
                try {
                    edgeDetails = parseLineToNumbers(inputLines[currentInputLine]);
                } catch (e) {
                    console.error(`Algorithm Error: ${e.message} on line ${currentInputLine}.`);
                    return;
                }

                // Extract source, destination, and weight using the helper.
                const [nodeA, nodeB, edgeWeight] = retrieveArraySlice(edgeDetails, 3);

                // Node IDs are 1-indexed in input; convert to 0-indexed for array access.
                const zeroIndexedNodeA = nodeA - 1;
                const zeroIndexedNodeB = nodeB - 1;

                // Add connections to the adjacency list for an undirected graph.
                graphConnections[zeroIndexedNodeA].push({ neighbor: zeroIndexedNodeB, cost: edgeWeight });
                graphConnections[zeroIndexedNodeB].push({ neighbor: zeroIndexedNodeA, cost: edgeWeight });
            }

            // Parse the line containing the start node for queries and the target node for BFS.
            const queryAndTargetLineIndex = totalGraphNodes;
            if (queryAndTargetLineIndex >= inputLines.length) {
                console.error(`Algorithm Error: Missing query/target nodes definition on line ${queryAndTargetLineIndex}.`);
                return;
            }

            let queryTargetDetails;
            try {
                queryTargetDetails = parseLineToNumbers(inputLines[queryAndTargetLineIndex]);
            } catch (e) {
                console.error(`Algorithm Error: ${e.message} on line ${queryAndTargetLineIndex}.`);
                return;
            }

            const [numQueriesToProcess, bfsTargetNodeId] = retrieveArraySlice(queryTargetDetails, 2);

            // Initialize an array to store the shortest distance from the 'bfsTargetNodeId'
            // to every other node in the graph. -1 signifies unvisited/unreachable.
            const distancesFromBfsTarget = new Array(totalGraphNodes).fill(-1);

            // Setup a queue for a Breadth-First Search (BFS) traversal.
            // Each item in the queue will contain a node index and the accumulated distance to it.
            const bfsQueue = [{ nodeIndex: bfsTargetNodeId - 1, currentPathCost: 0 }];
            let queueReadPointer = 0; // Acts as the head of the queue for efficient processing.

            // Perform the BFS traversal.
            while (queueReadPointer < bfsQueue.length) {
                const currentQueueItem = bfsQueue[queueReadPointer];
                queueReadPointer++; // Advance the pointer to the next item.

                const currentNode = currentQueueItem.nodeIndex;
                const currentDistance = currentQueueItem.currentPathCost;

                // If this node has already been visited with a valid distance, skip it.
                // This check is crucial for BFS to ensure we record the shortest path first.
                if (distancesFromBfsTarget[currentNode] !== -1) {
                    continue;
                }

                // Record the shortest distance found to the current node.
                distancesFromBfsTarget[currentNode] = currentDistance;

                // Explore all neighbors of the current node.
                for (const connection of graphConnections[currentNode]) {
                    const neighborNode = connection.neighbor;
                    const edgeCost = connection.cost;

                    // If the neighbor hasn't been visited yet, add it to the queue.
                    if (distancesFromBfsTarget[neighborNode] === -1) {
                        bfsQueue.push({
                            nodeIndex: neighborNode,
                            currentPathCost: currentDistance + edgeCost
                        });
                    }
                }
            }

            // Process the subsequent query lines.
            const firstQueryLine = totalGraphNodes + 1;
            for (let queryIdx = 0; queryIdx < numQueriesToProcess; queryIdx++) {
                const currentQueryLine = firstQueryLine + queryIdx;
                if (currentQueryLine >= inputLines.length) {
                    console.error(`Algorithm Error: Missing query definition on line ${currentQueryLine}. Expected ${numQueriesToProcess} queries.`);
                    return;
                }

                let queryNodePair;
                try {
                    queryNodePair = parseLineToNumbers(inputLines[currentQueryLine]);
                } catch (e) {
                    console.error(`Algorithm Error: ${e.message} on line ${currentQueryLine}.`);
                    return;
                }

                const [nodeQuery1, nodeQuery2] = retrieveArraySlice(queryNodePair, 2);

                // Convert query node IDs to 0-indexed.
                const zeroIndexedQuery1 = nodeQuery1 - 1;
                const zeroIndexedQuery2 = nodeQuery2 - 1;

                // Validate that the queried node indices are within bounds.
                if (zeroIndexedQuery1 < 0 || zeroIndexedQuery1 >= totalGraphNodes ||
                    zeroIndexedQuery2 < 0 || zeroIndexedQuery2 >= totalGraphNodes) {
                    console.error(`Algorithm Error: Query node index out of bounds (${nodeQuery1}, ${nodeQuery2}) on line ${currentQueryLine}.`);
                    return;
                }

                // Retrieve the pre-calculated distances and sum them up.
                const totalDistanceSum = distancesFromBfsTarget[zeroIndexedQuery1] + distancesFromBfsTarget[zeroIndexedQuery2];

                // Output the result of the query.
                console.log(totalDistanceSum);
            }
        };

        // Assign the main algorithm function to the module's exports.
        algorithmModule.exports = algorithmExports.executeGraphAlgorithm;
    },

    // Module 2: A simple wrapper for the Node.js 'fs' (file system) module.
    function(fsModuleInstance, fsExports) {
        'use strict'; // Enforce strict mode.
        // Attempt to load and re-export the native Node.js 'fs' module.
        // Include a check to ensure `require` is available, as this code might run in environments
        // where it's not (e.g., a browser, though unlikely for '/dev/stdin').
        if (typeof require === 'function') {
            fsModuleInstance.exports = require("fs");
        } else {
            console.error("FS Module Error: 'require' function is not available to load the 'fs' module.");
            // In a non-Node environment, provide a minimal or empty object to prevent crashes.
            fsModuleInstance.exports = {};
        }
    }
]);