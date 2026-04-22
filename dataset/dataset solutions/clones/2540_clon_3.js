module.exports = function(moduleDefinitions) {
    // A cache to store already loaded modules.
    // Keys are module IDs, values are the module's exports.
    let _moduleCache = {};

    /**
     * Resolves and loads a module by its ID.
     * If the module is already in cache, it returns its exports.
     * Otherwise, it executes the module's definition function and caches its exports.
     * @param {number} moduleId - The unique identifier for the module to load.
     * @returns {object} The exports object of the requested module.
     */
    function _moduleLoader(moduleId) {
        // Guard clause: Check for invalid or non-existent module ID.
        if (moduleId === null || moduleId === undefined || !moduleDefinitions[moduleId]) {
            throw new Error(`Module with ID '${moduleId}' not found in definitions.`);
        }

        // Check if the module is already cached.
        if (_moduleCache[moduleId]) {
            return _moduleCache[moduleId].exports;
        }

        // Create a new module object and cache it.
        // This object will hold the module's ID, a flag indicating if it's loaded,
        // and its exports.
        let currentModuleObject = _moduleCache[moduleId] = {
            id: moduleId,
            isLoaded: false,
            exports: {} // Initialize exports as an empty object.
        };

        // Execute the module's definition function.
        // The definition function receives (module, module.exports, _moduleLoader) as arguments.
        moduleDefinitions[moduleId].call(
            currentModuleObject.exports, // 'this' context for the module function
            currentModuleObject,         // The module object itself
            currentModuleObject.exports, // The exports object
            _moduleLoader                // A reference to the module loader for internal dependencies
        );

        // Mark the module as loaded after its definition has been executed.
        currentModuleObject.isLoaded = true;

        // Return the module's exports.
        return currentModuleObject.exports;
    }

    // Store the array of module definitions for internal access.
    _moduleLoader.definitions = moduleDefinitions;
    // Store the module cache for internal access.
    _moduleLoader.cachedModules = _moduleCache;

    /**
     * Defines a getter function for an export on a module's exports object.
     * This is used for lazy evaluation of exports or to hide implementation details.
     * @param {object} targetObject - The object on which to define the property.
     * @param {string} propertyName - The name of the property to define.
     * @param {function} getterFunction - The function that returns the property's value.
     */
    _moduleLoader.defineExportProperty = function(targetObject, propertyName, getterFunction) {
        // Ensure the property doesn't already exist on the target object.
        if (!_moduleLoader.objectHasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable (visible in for...in loops).
                get: getterFunction // The getter function for the property.
            });
        }
    };

    /**
     * Marks a module's exports as an ES Module, adding a Symbol.toStringTag and __esModule flag.
     * This helps in interoperability between CommonJS and ES Modules.
     * @param {object} moduleExportsObject - The module's exports object.
     */
    _moduleLoader.flagAsEsModule = function(moduleExportsObject) {
        // Add Symbol.toStringTag for better object identification.
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, { value: 'Module' });
        }
        // Add the __esModule flag, a common convention for ES Modules.
        Object.defineProperty(moduleExportsObject, '__esModule', { value: true });
    };

    /**
     * Provides interoperability logic for handling different module export formats.
     * It attempts to standardize how module exports are consumed.
     * @param {any} inputModuleRef - The raw module reference (ID or exports object).
     * @param {number} processFlags - Bitmask flags indicating how to process the reference.
     * @returns {any} The processed module exports.
     */
    _moduleLoader.ensureInterop = function(inputModuleRef, processFlags) {
        // Flag 1: If it's a module ID, resolve it first.
        if (processFlags & 1) {
            inputModuleRef = _moduleLoader(inputModuleRef);
        }
        // Flag 8: If it's already the desired format, return it directly.
        if (processFlags & 8) {
            return inputModuleRef;
        }
        // Flag 4: If it's an object and already marked as an ES Module.
        if (processFlags & 4 && typeof inputModuleRef === 'object' && inputModuleRef && inputModuleRef.__esModule) {
            return inputModuleRef;
        }

        // Create a new object to hold the interoperable exports.
        let interopWrapper = Object.create(null);
        // Mark this new object as an ES Module.
        _moduleLoader.flagAsEsModule(interopWrapper);
        // Define a 'default' export pointing to the original inputModuleRef.
        Object.defineProperty(interopWrapper, 'default', { enumerable: true, value: inputModuleRef });

        // Flag 2: If the original inputModuleRef is not a string,
        // iterate over its properties and re-export them.
        if (processFlags & 2 && typeof inputModuleRef !== 'string') {
            for (let propKey in inputModuleRef) {
                // Ensure the property belongs to the inputModuleRef itself, not its prototype chain.
                if (_moduleLoader.objectHasOwn(inputModuleRef, propKey)) {
                    // Define a getter for each property on the interopWrapper object.
                    _moduleLoader.defineExportProperty(interopWrapper, propKey, (function(keyToAccess) {
                        return function() { return inputModuleRef[keyToAccess]; };
                    })(propKey));
                }
            }
        }
        return interopWrapper;
    };

    /**
     * Creates a getter function for the 'default' export of a module.
     * This is useful for modules that might have a '__esModule' flag.
     * @param {object} moduleExports - The raw exports object of a module.
     * @returns {function} A getter function that returns the default export.
     */
    _moduleLoader.createDefaultExportAccessor = function(moduleExports) {
        // If the module is an ES Module and has a 'default' export, return a getter for it.
        let accessorFunction = moduleExports && moduleExports.__esModule ?
            function() { return moduleExports.default; } :
            function() { return moduleExports; }; // Otherwise, return a getter for the whole moduleExports.

        // Define a special 'a' export pointing to this default accessor,
        // a common Webpack convention for direct access.
        _moduleLoader.defineExportProperty(accessorFunction, 'a', accessorFunction);
        return accessorFunction;
    };

    /**
     * Checks if an object has a specific property as its own property (not inherited).
     * @param {object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    _moduleLoader.objectHasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // An empty string for the public path, often used for loading assets.
    // For this setup, it's typically not used, but included for completeness.
    _moduleLoader.publicAssetPath = "";

    // Set the entry point module ID and immediately load it to start the application.
    // The entry point is usually module 0 in the provided array.
    const applicationEntryId = 0;
    _moduleLoader.entryModule = applicationEntryId;
    return _moduleLoader(applicationEntryId);

}([
    // Module 0: Application Entry Point
    function(moduleObj, moduleExports, loadDependentModule) {
        // Load module 2 (fs module) and module 1 (main logic module).
        // Read input from standard input, decode it as UTF-8, and split into lines.
        // Then pass these lines to the main logic module (module 1) for processing.
        const fileSystemInterface = loadDependentModule(2);
        const rawInputBuffer = fileSystemInterface.readFileSync("/dev/stdin", "UTF-8");

        // Basic validation: ensure input is not empty before processing.
        if (typeof rawInputBuffer !== 'string' || rawInputBuffer.trim() === '') {
            console.error("Error: Input from /dev/stdin was empty or invalid. Exiting.");
            process.exit(1); // Terminate with an error code.
        }

        const inputDataLines = rawInputBuffer.split("\n");
        loadDependentModule(1)(inputDataLines);
    },

    // Module 1: Main Graph Processing Logic
    function(moduleObj, moduleExports, loadDependentModule) {
        "use strict";

        /**
         * Parses a string of space-separated numbers, converts them to integers,
         * and extracts a specified number of elements.
         * @param {string} inputString - The string containing numbers.
         * @param {number} numElements - The expected number of elements.
         * @returns {Array<number>} An array of parsed integers.
         */
        const parseAndExtractNumbers = (inputString, numElements) => {
            const parsedValues = inputString.split(" ").map(value => Number(value));
            // Basic check to ensure we have enough elements.
            if (parsedValues.length < numElements) {
                console.warn(`Insufficient numbers in line "${inputString}". Expected ${numElements}, got ${parsedValues.length}.`);
            }
            return parsedValues.slice(0, numElements);
        };

        moduleObj.exports = function(inputLineArray) {
            // Guard clause: Ensure input is an array and not empty.
            if (!Array.isArray(inputLineArray) || inputLineArray.length === 0) {
                console.error("Error: No input lines provided for graph processing. Exiting.");
                return;
            }

            // Parse the first line to get graph dimensions (number of nodes and edges).
            // Example: "N M" -> [N, M]
            const [nodeCount, edgeCount] = parseAndExtractNumbers(inputLineArray[0], 2);

            // Extensive validation for node and edge counts.
            if (isNaN(nodeCount) || isNaN(edgeCount) || nodeCount < 1 || edgeCount < 0) {
                console.error(`Error: Invalid graph dimensions specified. Nodes: ${nodeCount}, Edges: ${edgeCount}. Exiting.`);
                return;
            }
            if (nodeCount > 100000 || edgeCount > 1000000) { // Arbitrary large limits for robustness
                console.warn(`Warning: Very large graph dimensions. Nodes: ${nodeCount}, Edges: ${edgeCount}. Performance might be impacted.`);
            }

            // Initialize an adjacency list for the graph.
            // 'graphAdjacencyList' will be an array of arrays, where graphAdjacencyList[i]
            // contains all nodes directly reachable from node 'i'.
            let graphAdjacencyList = new Array(nodeCount);
            for (let i = 0; i < nodeCount; i++) {
                graphAdjacencyList[i] = [];
            }

            // Parse the subsequent lines to build the graph's adjacency list.
            // Each line represents an edge: "U V" means an edge from U to V.
            // Nodes are 1-indexed in input, converting to 0-indexed for internal use.
            for (let currentEdgeLine = 0; currentEdgeLine < edgeCount; currentEdgeLine++) {
                const lineIndex = currentEdgeLine + 1; // Input lines for edges start from index 1.

                // Check if there are enough input lines for all edges.
                if (lineIndex >= inputLineArray.length) {
                    console.error(`Error: Expected ${edgeCount} edge definitions, but input ended prematurely after ${currentEdgeLine} edges.`);
                    break; // Stop processing if input is insufficient.
                }

                const [sourceVertex, destinationVertex] = parseAndExtractNumbers(inputLineArray[lineIndex], 2).map(val => val - 1); // Convert to 0-indexed.

                // Add the destination node to the source node's adjacency list.
                // Basic check for valid node indices.
                if (sourceVertex >= 0 && sourceVertex < nodeCount && destinationVertex >= 0 && destinationVertex < nodeCount) {
                    graphAdjacencyList[sourceVertex].push(destinationVertex);
                } else {
                    console.warn(`Warning: Skipping invalid edge definition on line ${lineIndex + 1}: ${inputLineArray[lineIndex]} (parsed as ${sourceVertex + 1}, ${destinationVertex + 1}). Node indices out of bounds.`);
                }
            }

            // Iterate through each node as a potential starting point for cycle detection.
            for (let initialNode = 0; initialNode < nodeCount; initialNode++) {
                // 'currentPathVisited' tracks nodes visited *in the current path* to detect cycles.
                // Initialize with all false, then set current start node to true.
                let currentPathVisited = new Array(nodeCount).fill(false);
                currentPathVisited[initialNode] = true;

                // 'dfsTraversalStack' will store information about nodes to visit.
                // Each element is an object: { node: current_node_id, pathFlags: [visited_flags_for_this_path], depth: current_path_length }
                let dfsTraversalStack = [{
                    node: initialNode,
                    pathFlags: currentPathVisited,
                    depth: 1
                }];

                // Perform a Depth-First Search (DFS) using a stack.
                // The loop continues as long as there are nodes to explore.
                while (dfsTraversalStack.length > 0) {
                    let pathContext = dfsTraversalStack.pop();
                    let currentNodeId = pathContext.node;
                    let visitedFlagsForThisPath = pathContext.pathFlags;
                    let currentPathDepth = pathContext.depth;

                    // Get the list of neighbors for the current node.
                    const adjacentNodes = graphAdjacencyList[currentNodeId];

                    // Iterate over all neighbors of the current node.
                    for (let j = 0; j < adjacentNodes.length; j++) {
                        let neighborNodeId = adjacentNodes[j];

                        // Check if the neighbor is the original starting node.
                        // If so, we've found a cycle!
                        if (neighborNodeId === initialNode) {
                            console.log(currentPathDepth); // Output the length of the cycle.
                            // Output all nodes involved in the cycle (1-indexed).
                            for (let k = 0; k < nodeCount; k++) {
                                // Only print nodes that were part of this specific cycle path.
                                if (visitedFlagsForThisPath[k]) {
                                    console.log(k + 1); // Convert back to 1-indexed for output.
                                }
                            }
                            return; // Exit the function as soon as the first cycle is found.
                        }

                        // If the neighbor has not been visited *in the current path*,
                        // extend the path and add it to the stack.
                        if (!visitedFlagsForThisPath[neighborNodeId]) {
                            // Create a *new* copy of the visited flags array for the new path branch.
                            // This ensures that visited status is path-specific, crucial for cycle detection depth-first.
                            let nextPathFlags = visitedFlagsForThisPath.slice(); // Use slice() for efficient shallow copy.
                            nextPathFlags[neighborNodeId] = true; // Mark the new node as visited in this path.

                            // Push the new path information onto the stack for further exploration.
                            dfsTraversalStack.push({
                                node: neighborNodeId,
                                pathFlags: nextPathFlags,
                                depth: currentPathDepth + 1
                            });
                        }
                    } // End of neighbors loop
                } // End of dfsTraversalStack while loop
            } // End of initialNode loop

            // If no cycle was found after checking all possible starting nodes, print -1.
            console.log(-1);
        };
    },

    // Module 2: File System Utility
    function(moduleObj, exportsObj) {
        // This module simply re-exports the Node.js 'fs' (file system) module.
        // This allows other bundled modules to access file system operations.
        moduleObj.exports = require("fs");
    }
]));