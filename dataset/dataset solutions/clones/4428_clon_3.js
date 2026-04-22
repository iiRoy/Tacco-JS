// --- Start of Custom Module System Bootstrap ---
// This system simulates a basic module loader, similar to how Webpack bundles modules.
// It manages module definitions, caching, and export mechanisms for interoperability.

/**
 * Initializes and returns the primary module loading function.
 * @param {Array<Function>} moduleDefinitions - An ordered array where each function
 *                                             represents a module's source code.
 * @returns {Function} The module loading function, which can retrieve modules by ID.
 */
const initializeModuleEnvironment = function(moduleDefinitions) {
    // A private cache to store modules once they have been loaded and executed.
    // This prevents redundant execution and ensures singletons for modules.
    const moduleLoadCache = {};

    /**
     * Attempts to load a module identified by its unique ID.
     * If the module is already in the cache, its exports are returned immediately.
     * Otherwise, the module's definition function is executed, its exports are populated,
     * and then the module is marked as loaded and cached.
     * @param {number} uniqueModuleId - The numeric identifier for the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function obtainModule(uniqueModuleId) {
        // Check if the module has already been loaded and cached.
        if (moduleLoadCache[uniqueModuleId]) {
            return moduleLoadCache[uniqueModuleId].exports;
        }

        // If not cached, prepare a new module entry.
        // `moduleId`: Reference to its unique ID.
        // `hasCompletedLoading`: Flag to track execution status.
        // `exports`: The object where the module's public API will be attached.
        const currentModuleRecord = moduleLoadCache[uniqueModuleId] = {
            moduleId: uniqueModuleId,
            hasCompletedLoading: false,
            exports: {}
        };

        // Execute the module's definition function.
        // The function receives `module` (currentModuleRecord), `exports`, and `require` (obtainModule).
        // This execution populates `currentModuleRecord.exports`.
        if (moduleDefinitions[uniqueModuleId]) {
            moduleDefinitions[uniqueModuleId].call(
                currentModuleRecord.exports, // 'this' context for the module function
                currentModuleRecord,
                currentModuleRecord.exports,
                obtainModule // The `require` function for internal module dependencies
            );
        } else {
            // Robustness: Log an error if a module is requested but not defined.
            console.error(`Runtime Error: Attempted to load undefined module with ID: ${uniqueModuleId}`);
            // Depending on application requirements, could throw an error here.
        }

        // Mark the module as fully loaded after its definition function has executed.
        currentModuleRecord.hasCompletedLoading = true;
        // Return the populated exports object.
        return currentModuleRecord.exports;
    }

    // Attach internal properties to the loader function for potential debugging or extension.
    obtainModule.allDefinitions = moduleDefinitions;
    obtainModule.loadedModuleCache = moduleLoadCache;

    /**
     * Defines a non-writable, enumerable property on a target object with a getter.
     * This is used for defining named exports that are dynamically resolved.
     * @param {object} targetObj - The object to modify (e.g., module.exports).
     * @param {string} propName - The name of the property to define.
     * @param {Function} propertyGetter - A function that returns the value of the property when accessed.
     */
    obtainModule.exposeExportProperty = function(targetObj, propName, propertyGetter) {
        // Only define the property if it doesn't already exist to avoid conflicts.
        if (!obtainModule.checkOwnProperty(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true, // Allow property to be iterated over (e.g., with `for...in`).
                get: propertyGetter // The function to execute when the property is read.
            });
        }
    };

    /**
     * Configures an exports object to appear as an ES Module.
     * This involves setting `Symbol.toStringTag` and the `__esModule` flag.
     * @param {object} exportsObj - The exports object to configure.
     */
    obtainModule.configureEsModule = function(exportsObj) {
        // Set `Symbol.toStringTag` for better object type identification in debuggers.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportsObj, Symbol.toStringTag, { value: 'Module' });
        }
        // Set the `__esModule` flag, a common convention for indicating ES Modules.
        Object.defineProperty(exportsObj, '__esModule', { value: true });
    };

    /**
     * Creates a synthetic namespace object for a module, facilitating compatibility
     * between CommonJS and ES Module import/export patterns.
     * @param {*} sourceValue - The primary export value or module ID.
     * @param {number} processingMode - A bitmask indicating processing rules.
     * @returns {object} A namespace object with 'default' and potentially other exports.
     */
    obtainModule.createModuleNamespace = function(sourceValue, processingMode) {
        // Bit 1: If set, `sourceValue` is a module ID; load it.
        if (processingMode & 1) {
            sourceValue = obtainModule(sourceValue);
        }
        // Bit 8: If set, return `sourceValue` directly as it's already a namespace.
        if (processingMode & 8) {
            return sourceValue;
        }
        // Bit 4: If set and `sourceValue` is an object marked as an ES Module, return it.
        if (processingMode & 4 && typeof sourceValue === 'object' && sourceValue && sourceValue.__esModule) {
            return sourceValue;
        }

        // Create a new, empty object to serve as the namespace.
        const namespaceObj = Object.create(null);
        // Mark this new object as an ES Module.
        obtainModule.configureEsModule(namespaceObj);
        // Define a 'default' export pointing to the `sourceValue`.
        Object.defineProperty(namespaceObj, 'default', { enumerable: true, value: sourceValue });

        // Bit 2: If set and `sourceValue` is not a string, iterate its properties
        // and re-export them as named exports in the new namespace.
        if (processingMode & 2 && typeof sourceValue !== 'string') {
            for (const keyId in sourceValue) {
                // Use a closure to correctly capture `keyId` for each getter.
                obtainModule.exposeExportProperty(namespaceObj, keyId, (() => sourceValue[keyId]).bind(null));
            }
        }
        return namespaceObj;
    };

    /**
     * Provides a getter for a module's default export, handling both CommonJS
     * and ES Module formats.
     * @param {object} moduleContent - The exports object of a module.
     * @returns {Function} A function that returns the default export.
     */
    obtainModule.getDefaultExportGetter = function(moduleContent) {
        // Determine the default export: `moduleContent.default` for ES Modules,
        // or the entire `moduleContent` for CommonJS.
        const defaultExportResolver = moduleContent && moduleContent.__esModule ?
            () => moduleContent.default :
            () => moduleContent;

        // Additionally, define an 'a' property on the getter itself, pointing to the resolver.
        // This is a common pattern in some bundlers for shorthand access.
        obtainModule.exposeExportProperty(defaultExportResolver, 'a', defaultExportResolver);
        return defaultExportResolver;
    };

    /**
     * A utility function to check if an object has a directly owned property.
     * @param {object} targetObject - The object to inspect.
     * @param {string} propertyKey - The name of the property.
     * @returns {boolean} `true` if the object has the property directly, `false` otherwise.
     */
    obtainModule.checkOwnProperty = function(targetObject, propertyKey) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // A configurable public path for assets, though not used in this specific example.
    obtainModule.assetBaseUrl = "";

    // The entry point for the application. Module with ID 0 is designated as the startup module.
    obtainModule.entryModuleId = 0;
    return obtainModule(obtainModule.entryModuleId);
};

// The array below contains the definitions for all modules in the application.
// Each function in the array corresponds to a module, indexed by its position.
initializeModuleEnvironment([
    // Module 0: The application's main entry point.
    // This module is responsible for reading standard input and initiating the core logic.
    function(moduleRef, moduleExports, moduleRequester) {
        try {
            // Dynamically load the Node.js File System module using the custom loader.
            // Using 'node:fs' to explicitly refer to Node.js built-in modules.
            const fileSystemHandler = moduleRequester(2);

            // Read all data from standard input (`/dev/stdin`) using UTF-8 encoding.
            // The input is then split into an array of strings, one for each line.
            const rawInputStream = String(fileSystemHandler.readFileSync("/dev/stdin", "UTF-8"));
            const inputDataLines = rawInputStream.split("\n");

            // Invoke the `processGraphData` function from Module 1, passing the parsed input.
            // Module 1 contains the main algorithmic logic.
            moduleRequester(1).processGraphData(inputDataLines);
        } catch (executionError) {
            // Centralized error handling for the entry point.
            console.error("An unhandled error occurred during input processing or main logic execution:", executionError);
            // Exit the process with an error code.
            process.exit(1);
        }
    },
    // Module 1: Core application logic for graph processing and distance calculations.
    // This module expects an array of input strings to define a graph and process queries.
    function(currentModule, moduleExports, moduleRequester) {
        "use strict"; // Enable strict mode for this module for better code practices.

        /**
         * A utility function to safely extract a specific number of elements from an array.
         * It validates the input and ensures the array has at least the expected number of elements.
         * @param {Array<any>} sourceCollection - The array from which to extract elements.
         * @param {number} requiredCount - The minimum number of elements expected.
         * @returns {Array<any>} A new array containing the extracted elements up to `requiredCount`.
         * @throws {TypeError} If the input is not an array or if it lacks sufficient elements.
         */
        function extractMandatoryElements(sourceCollection, requiredCount) {
            if (!Array.isArray(sourceCollection)) {
                throw new TypeError("Input must be an array for element extraction.");
            }
            if (sourceCollection.length < requiredCount) {
                // Mimicking original behavior of throwing TypeError for insufficient elements.
                throw new TypeError(
                    `Failed to extract: array length (${sourceCollection.length}) is less than required (${requiredCount}).`
                );
            }
            // Returns a slice to ensure a new array, maintaining original array's integrity.
            return sourceCollection.slice(0, requiredCount);
        }

        /**
         * Main function to process graph input, calculate distances, and respond to queries.
         * It reads node counts, edge definitions, a starting node, and query pairs from `inputLines`.
         * @param {Array<string>} inputLines - An array of strings, where each string is a line from the input.
         */
        moduleExports.processGraphData = function(inputLines) {
            // --- Stage 1: Initial Input Validation and Parsing ---
            if (!inputLines || inputLines.length < 2) {
                console.error("Critical Error: Input data is incomplete or empty. Cannot proceed.");
                return; // Halt execution if basic input is missing.
            }

            const numberOfNodes = parseInt(inputLines[0], 10);
            if (isNaN(numberOfNodes) || numberOfNodes <= 0) {
                console.error(`Error: Invalid or non-positive node count "${inputLines[0]}". Expected a positive integer.`);
                return;
            }

            // Initialize the graph's adjacency list. Each element `graphAdjList[i]`
            // will be an array of `[neighborIndex, edgeWeight]` pairs for node `i`.
            const graphAdjList = Array.from({ length: numberOfNodes }, () => []);

            // The line containing the starting node ID and the total number of queries is at index `numberOfNodes`.
            const startNodeAndQueryInfoLine = inputLines[numberOfNodes];
            if (!startNodeAndQueryInfoLine) {
                console.error(`Error: Missing graph parameters (start node, query count) on line ${numberOfNodes}.`);
                return;
            }

            const [rawStartNodeId, rawTotalQueries] = extractMandatoryElements(
                startNodeAndQueryInfoLine.split(" ").map(Number), 2
            );

            const initialGraphNodeId = parseInt(rawStartNodeId, 10);
            const totalQueryRequests = parseInt(rawTotalQueries, 10);

            if (isNaN(initialGraphNodeId) || initialGraphNodeId <= 0 || initialGraphNodeId > numberOfNodes) {
                console.error(`Error: Invalid initial graph node ID "${initialGraphNodeId}". Must be between 1 and ${numberOfNodes}.`);
                return;
            }
            if (isNaN(totalQueryRequests) || totalQueryRequests < 0) {
                console.error(`Error: Invalid total query count "${totalQueryRequests}". Expected a non-negative integer.`);
                return;
            }

            // --- Stage 2: Graph Construction from Edge Definitions ---
            // The problem implies a tree structure, so there are `numberOfNodes - 1` edges.
            // Edge definitions start from `inputLines[1]` up to `inputLines[numberOfNodes - 1]`.
            for (let currentEdgeIndex = 0; currentEdgeIndex < numberOfNodes - 1; currentEdgeIndex++) {
                const edgeDefinitionLine = inputLines[currentEdgeIndex + 1];
                if (!edgeDefinitionLine) {
                    console.error(`Error: Missing edge definition on line ${currentEdgeIndex + 1}. Skipping remaining edges.`);
                    break; // Stop processing edges if a line is missing.
                }

                const [nodeOneId, nodeTwoId, edgeWeight] = extractMandatoryElements(
                    edgeDefinitionLine.split(" ").map(Number), 3
                );

                // Basic validation for edge data sanity.
                if (isNaN(nodeOneId) || isNaN(nodeTwoId) || isNaN(edgeWeight) ||
                    nodeOneId <= 0 || nodeTwoId <= 0 || edgeWeight < 0 ||
                    nodeOneId > numberOfNodes || nodeTwoId > numberOfNodes) {
                    console.warn(`Warning: Malformed edge data "${edgeDefinitionLine}" on line ${currentEdgeIndex + 1}. Skipping this edge.`);
                    continue; // Skip to the next edge if current one is invalid.
                }

                // Add edges to the adjacency list. The original code's logic implies
                // that edges are added if the *other* endpoint is not the `initialGraphNodeId`.
                // This builds an undirected graph, but with a nuanced handling around the root.
                // It effectively ensures that the `initialGraphNodeId` itself doesn't explicitly
                // appear as a 'neighbor' in the adjacency list entries for other nodes, though
                // connections *to* it are implicitly handled by the DFS from it.
                if (nodeTwoId !== initialGraphNodeId) {
                    graphAdjList[nodeOneId - 1].push([nodeTwoId - 1, edgeWeight]);
                }
                if (nodeOneId !== initialGraphNodeId) {
                    graphAdjList[nodeTwoId - 1].push([nodeOneId - 1, edgeWeight]);
                }
            }

            // --- Stage 3: Calculate Shortest Distances using Depth-First Search (DFS) ---
            // `shortestDistances` array stores the minimum distance from `initialGraphNodeId`
            // to every other node. Initialized to -1 to denote 'unvisited'.
            const shortestDistances = new Array(numberOfNodes).fill(-1);
            const entryNodeIndex = initialGraphNodeId - 1; // Convert 1-based ID to 0-based index.

            /**
             * Recursive Depth-First Search function to traverse the graph and compute distances.
             * @param {number} currentNodeIdx - The 0-indexed ID of the node currently being visited.
             * @param {number} currentPathDistance - The accumulated distance from the `entryNodeIndex` to `currentNodeIdx`.
             */
            function computeDistancesViaDFS(currentNodeIdx, currentPathDistance) {
                // Guard: Ensure the current node index is within valid bounds.
                if (currentNodeIdx < 0 || currentNodeIdx >= numberOfNodes) {
                    console.warn(`DFS Warning: Encountered an invalid node index (${currentNodeIdx}). Aborting path.`);
                    return;
                }

                // Record the shortest distance found so far to the current node.
                shortestDistances[currentNodeIdx] = currentPathDistance;

                // Iterate over all neighbors of the current node.
                for (const neighborEntry of graphAdjList[currentNodeIdx]) {
                    const [neighborIndex, costToNeighbor] = neighborEntry;

                    // If the neighbor has not been visited yet (distance is -1).
                    if (shortestDistances[neighborIndex] === -1) {
                        const newDistance = currentPathDistance + costToNeighbor;
                        // Recursively call DFS for the unvisited neighbor.
                        computeDistancesViaDFS(neighborIndex, newDistance);
                    }
                }
            }

            // Initiate the DFS from the designated starting node with an initial distance of 0.
            computeDistancesViaDFS(entryNodeIndex, 0);

            // --- Stage 4: Process Queries and Output Results ---
            // Queries start after the node definitions and edge definitions.
            const queryLinesStartIndex = numberOfNodes + 1;
            for (let queryIteration = 0; queryIteration < totalQueryRequests; queryIteration++) {
                const currentQueryLine = inputLines[queryLinesStartIndex + queryIteration];
                if (!currentQueryLine) {
                    console.error(`Error: Missing query definition on line ${queryLinesStartIndex + queryIteration}. Skipping this query.`);
                    continue;
                }

                const [queryNodeAId, queryNodeBId] = extractMandatoryElements(
                    currentQueryLine.split(" ").map(Number), 2
                );

                // Convert 1-based node IDs from input to 0-based array indices.
                const queryNodeAIndex = queryNodeAId - 1;
                const queryNodeBIndex = queryNodeBId - 1;

                // Retrieve the pre-calculated distances for the queried nodes.
                const distanceToA = shortestDistances[queryNodeAIndex];
                const distanceToB = shortestDistances[queryNodeBIndex];

                // Check if both queried nodes were reachable from the initial graph node.
                // If a node's distance is still -1, it means it was unreachable.
                if (distanceToA === -1 || distanceToB === -1) {
                    console.warn(
                        `Warning: One or both queried nodes (IDs: ${queryNodeAId}, ${queryNodeBId}) ` +
                        `were unreachable from the initial node (ID: ${initialGraphNodeId}). Outputting -1.`
                    );
                    console.log(-1); // Output -1 for unreachable nodes as per common problem constraints.
                } else {
                    // Sum the distances and print the result to standard output.
                    const totalCombinedDistance = distanceToA + distanceToB;
                    console.log(totalCombinedDistance);
                }
            }
        };
    },
    // Module 2: A wrapper for Node.js's built-in 'fs' (File System) module.
    // This allows the application to perform file I/O operations.
    function(moduleRef, moduleExports, moduleRequester) {
        // This module simply re-exports the native Node.js 'fs' module.
        // Using 'node:fs' for explicit reference to Node.js core modules.
        moduleRef.exports = moduleRequester("node:fs");
    }
]);
// --- End of Custom Module System Bootstrap ---