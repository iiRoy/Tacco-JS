var moduleLoaderFactory = function(moduleDefinitions) {
    // Cache for already loaded modules.
    const loadedModulesCache = {};

    /**
     * Core function to load a module by its identifier.
     * @param {number} moduleId - The unique identifier for the module.
     * @returns {object} The exports of the loaded module.
     */
    function retrieveModule(moduleId) {
        // If the module is already in cache, return its exports.
        if (loadedModulesCache[moduleId]) {
            return loadedModulesCache[moduleId].exports;
        }

        // Initialize a new module entry in the cache.
        const currentModule = loadedModulesCache[moduleId] = {
            id: moduleId,
            isInitialized: false, // Flag to indicate if the module's function has been executed
            exports: {}
        };

        // Execute the module function, passing its specific context.
        // The module function receives (module, exports, retrieveModule) as arguments.
        moduleDefinitions[moduleId].call(
            currentModule.exports,
            currentModule,
            currentModule.exports,
            retrieveModule
        );

        // Mark the module as initialized.
        currentModule.isInitialized = true;
        return currentModule.exports;
    }

    // Store the original module definitions and cache for internal use.
    retrieveModule.moduleMap = moduleDefinitions;
    retrieveModule.cache = loadedModulesCache;

    /**
     * Defines an enumerable getter property on an object.
     * @param {object} targetObj - The object on which to define the property.
     * @param {string} propName - The name of the property.
     * @param {Function} getterFunction - The function to call to get the property value.
     */
    retrieveModule.defineExport = function(targetObj, propName, getterFunction) {
        // Only define if the property doesn't already exist.
        if (!retrieveModule.hasOwnProp(targetObj, propName)) {
            Object.defineProperty(targetObj, propName, {
                enumerable: true, // Make the property enumerable
                get: getterFunction // Define a getter for the property
            });
        }
    };

    /**
     * Marks a module as an ES module and potentially sets its Symbol.toStringTag.
     * @param {object} targetObj - The module exports object.
     */
    retrieveModule.registerInterop = function(targetObj) {
        // Set Symbol.toStringTag for better debugging experience if available.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(targetObj, Symbol.toStringTag, { value: 'Module' });
        }
        // Mark the module as an ES module.
        Object.defineProperty(targetObj, '__esModule', { value: true });
    };

    /**
     * Handles various module interop scenarios based on flags.
     * @param {any} inputModule - The module or its identifier.
     * @param {number} flags - Bitmask indicating interop requirements.
     * @returns {any} The processed module or its exports.
     */
    retrieveModule.transformInterop = function(inputModule, flags) {
        // Flag 1: If bit 1 is set, load the module first.
        if (flags & 1) {
            inputModule = retrieveModule(inputModule);
        }

        // Flag 8: If bit 8 is set, return the module as is (raw).
        if (flags & 8) {
            return inputModule;
        }

        // Flag 4: If bit 4 is set and it's an ES module, return it directly.
        if ((flags & 4) && typeof inputModule === 'object' && inputModule && inputModule.__esModule) {
            return inputModule;
        }

        // Create a new object for interop transformation.
        const interopResult = Object.create(null);
        retrieveModule.registerInterop(interopResult); // Mark as ES module.

        // Define 'default' export.
        Object.defineProperty(interopResult, 'default', {
            enumerable: true,
            value: inputModule
        });

        // Flag 2: If bit 2 is set and input is not a string, copy all properties.
        if ((flags & 2) && typeof inputModule !== 'string') {
            for (const propKey in inputModule) {
                // Ensure the property is owned by the inputModule.
                if (Object.prototype.hasOwnProperty.call(inputModule, propKey)) {
                    retrieveModule.defineExport(interopResult, propKey, (function(key) {
                        return function() { return inputModule[key]; };
                    })(propKey)); // Use a closure to capture propKey.
                }
            }
        }
        return interopResult;
    };

    /**
     * Normalizes a module's exports for consumption.
     * @param {object} moduleExports - The exports object of a module.
     * @returns {Function} A function that returns the module's default export or the module itself.
     */
    retrieveModule.normalizeInterop = function(moduleExports) {
        const getterFn = moduleExports && moduleExports.__esModule
            ? function() { return moduleExports.default; }
            : function() { return moduleExports; };

        // Define a special 'a' export pointing to the getter function.
        retrieveModule.defineExport(getterFn, 'a', getterFn);
        return getterFn;
    };

    /**
     * Checks if an object has a specific property.
     * @param {object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    retrieveModule.hasOwnProp = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // The base public path is empty for this setup.
    retrieveModule.publicPath = "";

    // Set the entry module ID and load it to start execution.
    retrieveModule.entryModuleId = 0;
    return retrieveModule(retrieveModule.entryModuleId);
}([
    // --- Module 0: Entry Point and Input Handling ---
    function(currentModule, moduleExports, requireModule) {
        try {
            // Dynamically determine input source, falling back to /dev/stdin.
            const inputSourcePath = process.env.INPUT_FILE_PATH || '/dev/stdin';
            const fileSystemModule = requireModule(2); // Load the 'fs' module.
            const rawInputData = fileSystemModule.readFileSync(inputSourcePath, 'UTF-8');

            // Split input into lines and filter out any empty lines.
            const inputLinesArray = rawInputData.split('\n').filter(line => line.trim().length > 0);

            // Pass the processed input lines to the main solver module (Module 1).
            requireModule(1)(inputLinesArray);
        } catch (error) {
            console.error(`Error processing input: ${error.message}`);
            process.exit(1); // Exit with an error code.
        }
    },

    // --- Module 1: Graph Solver Logic ---
    function(currentModule, moduleExports, requireModule) {
        "use strict";

        /**
         * Parses a string of space-separated numbers into an array of numbers.
         * @param {string} inputString - The string containing numbers.
         * @returns {Array<number>} An array of parsed numbers.
         */
        const parseNumberString = (inputString) => {
            return inputString.split(' ').map(Number);
        };

        /**
         * Main function for solving the graph problem.
         * @param {Array<string>} inputLines - An array of strings, each representing a line of input.
         */
        currentModule.exports = function(inputLines) {
            // Validate input: ensure at least one line for node count.
            if (!inputLines || inputLines.length === 0) {
                console.error("Error: No input lines provided.");
                return;
            }

            // Read the total number of nodes from the first line.
            const totalNodes = Number(inputLines[0]);
            if (isNaN(totalNodes) || totalNodes <= 0) {
                console.error(`Error: Invalid number of nodes: ${inputLines[0]}`);
                return;
            }

            // Initialize an adjacency list for the graph.
            // Each element is an array to store neighbors and their edge weights.
            const graphAdjacencyList = Array.from({ length: totalNodes }, () => []);

            // Read the start and reference nodes from the line immediately after edge definitions.
            // Original code: `r[e].split(" ").map(Number)` where `e` is `nodeCount`.
            // So, `inputLines[totalNodes]` contains the start and reference nodes.
            const startAndReferenceNodes = parseNumberString(inputLines[totalNodes]);
            if (startAndReferenceNodes.length < 2) {
                console.error(`Error: Insufficient start/reference node data: ${inputLines[totalNodes]}`);
                return;
            }
            const initialNodeIndex = startAndReferenceNodes[0] - 1; // Convert to 0-based index.
            const referenceNodeIndex = startAndReferenceNodes[1] - 1; // Convert to 0-based index.

            // Build the graph from the edge definitions.
            // Edges are defined from line 1 up to `totalNodes - 1`.
            for (let edgeIndex = 0; edgeIndex < totalNodes - 1; edgeIndex++) {
                const edgeDetails = parseNumberString(inputLines[edgeIndex + 1]);
                if (edgeDetails.length < 3) {
                    console.error(`Error: Invalid edge data on line ${edgeIndex + 2}: ${inputLines[edgeIndex + 1]}`);
                    continue;
                }

                const nodeU = edgeDetails[0] - 1; // First node in the edge.
                const nodeV = edgeDetails[1] - 1; // Second node in the edge.
                const edgeWeight = edgeDetails[2]; // Weight/cost of the edge.

                // Add edges to the adjacency list.
                // An edge is added if neither node is the reference node.
                // This seems like a specific filtering rule for the problem.
                if (nodeV !== referenceNodeIndex) {
                    graphAdjacencyList[nodeU].push({ connectedNode: nodeV, cost: edgeWeight });
                }
                if (nodeU !== referenceNodeIndex) {
                    graphAdjacencyList[nodeV].push({ connectedNode: nodeU, cost: edgeWeight });
                }
            }

            // Initialize an array to store minimum distances from the reference node to all others.
            // -1 indicates unvisited or unreachable.
            const minimumDistances = new Array(totalNodes).fill(-1);

            // Use a stack-like queue for a DFS-like traversal starting from the reference node.
            // The algorithm calculates the cost of the *first path found* to each node from the reference.
            const traversalStack = [{ nodeIdx: referenceNodeIndex, currentCost: 0 }];
            minimumDistances[referenceNodeIndex] = 0; // Distance to itself is 0.

            // Perform the traversal.
            while (traversalStack.length > 0) {
                const currentPoint = traversalStack.pop(); // Pop from the end (DFS-like).

                // Iterate through all neighbors of the current node.
                for (const neighborEdge of graphAdjacencyList[currentPoint.nodeIdx]) {
                    // If the neighbor has not been visited yet (-1 distance).
                    if (minimumDistances[neighborEdge.connectedNode] === -1) {
                        const newAccumulatedCost = currentPoint.currentCost + neighborEdge.cost;
                        minimumDistances[neighborEdge.connectedNode] = newAccumulatedCost;
                        traversalStack.push({
                            nodeIdx: neighborEdge.connectedNode,
                            currentCost: newAccumulatedCost
                        });
                    }
                }
            }

            // Process queries.
            // The number of queries is read from `inputLines[queryCount + totalNodes + 1]` in original.
            // Original code reuses `i` for `initialNode` and `queryCount`. Let's use a new variable.
            // `initialNodeIndex` was `u[0]` from `lines[totalNodes]`.
            // The number of queries is `u[0]`, where `u` was `r[e].split(" ").map(...)`.
            // So, `queryCount` is `startAndReferenceNodes[0]`.
            const numberOfQueries = startAndReferenceNodes[0];

            // Queries start from line `totalNodes + 1 + 1` (after node count, edges, and start/ref nodes).
            for (let queryCounter = 0; queryCounter < numberOfQueries; queryCounter++) {
                const queryLineIndex = queryCounter + totalNodes + 1; // Adjust index based on input structure.
                if (queryLineIndex >= inputLines.length) {
                    console.warn(`Warning: Not enough query lines. Missing line ${queryLineIndex + 1}.`);
                    break;
                }

                const queryNodes = parseNumberString(inputLines[queryLineIndex]);
                if (queryNodes.length < 2) {
                    console.error(`Error: Invalid query data on line ${queryLineIndex + 1}: ${inputLines[queryLineIndex]}`);
                    continue;
                }

                const firstQueryNodeIndex = queryNodes[0] - 1;
                const secondQueryNodeIndex = queryNodes[1] - 1;

                // Retrieve distances for the queried nodes.
                const dist1 = minimumDistances[firstQueryNodeIndex];
                const dist2 = minimumDistances[secondQueryNodeIndex];

                // If either node is unreachable from the reference node, output an error or specific value.
                // The original code would just add -1, potentially leading to incorrect output.
                // For Type III, we add a check.
                if (dist1 === -1 || dist2 === -1) {
                    console.log(`-1`); // Indicate one or both nodes are unreachable
                    // Alternatively, could throw an error or log a warning.
                } else {
                    const combinedPathCost = dist1 + dist2;
                    console.log(combinedPathCost);
                }
            }
        };
    },

    // --- Module 2: File System Module Exporter ---
    function(currentModule, moduleExports) {
        // This module simply exports the Node.js 'fs' (file system) module.
        // It uses the 'node:' prefix for clarity and best practice in modern Node.js.
        currentModule.exports = require('node:fs');
    }
]));