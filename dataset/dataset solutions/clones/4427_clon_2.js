module.exports = function (moduleDefinitions) {
    /* This object serves as a cache for already loaded modules. */
    var moduleRegistry = {};

    /**
     * The main function responsible for loading modules.
     * @param {number} moduleId - The identifier of the module to load.
     * @returns {object} The exports of the requested module.
     */
    function loaderFunction(moduleId) {
        // If the module is already in the cache, return its exports.
        if (moduleRegistry[moduleId]) {
            return moduleRegistry[moduleId].exportObject;
        }

        // If not, create a new module entry in the cache.
        var currentModule = moduleRegistry[moduleId] = {
            identifier: moduleId,
            isLoaded: false,
            exportObject: {}
        };

        // Execute the module function, passing in the module object,
        // its exports, and the loader function itself.
        moduleDefinitions[moduleId].call(
            currentModule.exportObject,
            currentModule,
            currentModule.exportObject,
            loaderFunction
        );

        // Mark the module as loaded and return its exports.
        currentModule.isLoaded = true;
        return currentModule.exportObject;
    }

    // Store the array of module functions.
    loaderFunction.moduleSources = moduleDefinitions;

    // Store a reference to the module cache.
    loaderFunction.moduleCache = moduleRegistry;

    /**
     * Defines a getter function for a property on an object.
     * This is used for compatibility with ES Modules.
     * @param {object} targetObject - The object to define the property on.
     * @param {string} propertyName - The name of the property.
     * @param {Function} getterFunction - The function to call to get the property's value.
     */
    loaderFunction.defineGetter = function (targetObject, propertyName, getterFunction) {
        if (!loaderFunction.hasOwnProp(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    /**
     * Marks an object as an ES Module by setting a specific Symbol and __esModule property.
     * @param {object} exportObject - The object to mark as an ES Module.
     */
    loaderFunction.markAsESModule = function (exportObject) {
        // Check for Symbol and Symbol.toStringTag support.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Always set the __esModule flag.
        Object.defineProperty(exportObject, "__esModule", {
            value: true
        });
    };

    /**
     * Creates a namespace object for a module.
     * This handles various module export scenarios (ESM, CJS, etc.).
     * @param {any} moduleValue - The module's export value.
     * @param {number} modeFlags - Flags indicating the export type.
     * @returns {object} A namespace object.
     */
    loaderFunction.createNamespaceObject = function (moduleValue, modeFlags) {
        // If bit 1 is set, moduleValue is a module ID, so load it.
        if (modeFlags & 1) moduleValue = loaderFunction(moduleValue);

        // If bit 8 is set, return the moduleValue directly (it's already a namespace object).
        if (modeFlags & 8) return moduleValue;

        // If bit 4 is set and it's an object with __esModule, return it directly.
        if (modeFlags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new empty object for the namespace.
        var newNamespace = Object.create(null);
        loaderFunction.markAsESModule(newNamespace);

        // Define a 'default' getter for the original moduleValue.
        Object.defineProperty(newNamespace, "default", {
            enumerable: true,
            value: moduleValue
        });

        // If bit 2 is set and the moduleValue is not a string,
        // copy all enumerable properties from moduleValue to the new namespace.
        if (modeFlags & 2 && typeof moduleValue !== "string") {
            for (var propertyKey in moduleValue) {
                // Use a closure to capture the propertyKey for the getter.
                loaderFunction.defineGetter(newNamespace, propertyKey, (function (currentKey) {
                    return moduleValue[currentKey];
                }).bind(null, propertyKey));
            }
        }
        return newNamespace;
    };

    /**
     * Gets a compatible export for a module, handling default exports for ES Modules.
     * @param {object} moduleExports - The exports object of a module.
     * @returns {Function} A function that returns the module's export.
     */
    loaderFunction.getCompatExport = function (moduleExports) {
        var exportGetter = moduleExports && moduleExports.__esModule ?
            function () {
                return moduleExports.default;
            } :
            function () {
                return moduleExports;
            };
        // Define an 'a' property on the getter itself, pointing back to the getter.
        loaderFunction.defineGetter(exportGetter, "a", exportGetter);
        return exportGetter;
    };

    /**
     * Checks if an object has a specific property using Object.prototype.hasOwnProperty.
     * @param {object} targetObject - The object to check.
     * @param {string} propertyName - The name of the property.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    loaderFunction.hasOwnProp = function (targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // Public path for assets, typically an empty string in simple setups.
    loaderFunction.assetPath = "";

    // Execute the entry point module (module with ID 0).
    // The 'startupModule' property is often used to denote the main entry module.
    var zeroEntryPoint = 0;
    return loaderFunction(loaderFunction.startupModule = zeroEntryPoint);

}(
    // This array contains the actual module definitions.
    [
        /**
         * Module 0: Main application entry point.
         * It reads input, processes it, and prints results.
         */
        function (currentModuleRef, exportRef, localLoader) {
            // Load module 1 (the graph processing logic)
            // Load module 2 (the Node.js 'fs' module)
            // Read input from stdin, decode as UTF-8, and split by newline.
            // Pass the array of input lines to the main processing function from module 1.
            localLoader(1)(localLoader(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
        },

        /**
         * Module 1: Contains the graph algorithm implementation.
         * This module processes graph data and answers distance queries.
         */
        function (currentModuleRef, exportRef, localLoader) {
            "use strict";

            /**
             * Helper function to safely destructure an array or throw an error.
             * This mirrors the original's attempt sequence using the `||` operator:
             * 1. Check if the input is already an array.
             * 2. If not, try to iterate it into an array.
             * 3. If both fail, throw a TypeError.
             * @param {any} inputCandidate - The value to attempt to destructure.
             * @param {number} [expectedLength] - Optional. The expected maximum length of the array during iteration.
             * @returns {Array} The successfully destructured array.
             * @throws {TypeError} If the input is not a valid array or iterable instance.
             */
            function ensureArrayDestructure(inputCandidate, expectedLength) {
                // First part of the original's `||` chain: Check if it's already an array.
                var arrayCheckResult = (function (val) {
                    if (Array.isArray(val)) {
                        return val;
                    }
                    return undefined; // Explicitly return undefined if not an array
                })(inputCandidate);

                // If the first attempt was successful, return the result.
                if (arrayCheckResult !== undefined) {
                    return arrayCheckResult;
                }

                // Second part of the original's `||` chain: Try to iterate and collect elements from the input.
                var iterationResult;
                var iterationErrorOccurred = false;
                var iterationException = undefined;
                var iteratorObject = undefined; // Declared here for finally block access

                try {
                    var collectedElements = [];
                    var iterationStatus = true; // Tracks if the iterator has finished.
                    iteratorObject = inputCandidate[Symbol.iterator](); // This might throw if not iterable

                    for (
                        var currentIterationValue;
                        // Check if iteration is done, and if not, push value and check length limit.
                        !(iterationStatus = (currentIterationValue = iteratorObject.next()).done) &&
                        (collectedElements.push(currentIterationValue.value), !expectedLength || collectedElements.length !== expectedLength);
                        iterationStatus = true // Reset for next loop check condition
                    ) {
                        // The loop body is intentionally empty, all logic is in the condition.
                    }
                    iterationResult = collectedElements; // If iteration completes, this is the result.
                } catch (err) {
                    iterationErrorOccurred = true;
                    iterationException = err;
                } finally {
                    // Ensure the iterator's return method is called if iteration was not completed.
                    try {
                        if (!iterationStatus && iteratorObject != null && typeof iteratorObject.return === 'function') {
                            iteratorObject.return();
                        }
                    } finally {
                        if (iterationErrorOccurred) {
                            throw iterationException; // Re-throw any error caught during iteration.
                        }
                    }
                }

                // If the iteration attempt was successful (did not throw), return its result.
                // This check is necessary as a `try...catch` block itself doesn't return,
                // but `iterationResult` would be assigned if successful.
                if (iterationResult !== undefined) {
                    return iterationResult;
                }

                // Final fallback: If neither of the above returned a value,
                // this means the input was neither an array nor a valid iterable.
                // This anonymous function is the third part of the original's `||` chain.
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }

            // The main export function for this module.
            currentModuleRef.exportObject = function (inputLinesArray) {
                // Parse the first line to get the number of nodes in the graph.
                var nodeCount = Number(inputLinesArray[0]);

                // Initialize an adjacency list for the graph. Each node gets an empty array.
                var graphAdjacencyList = new Array(nodeCount);
                for (var loopIndex = 0; loopIndex < nodeCount; loopIndex++) {
                    graphAdjacencyList[loopIndex] = [];
                }

                // Process the next (nodeCount - 1) lines to build the graph edges.
                for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
                    // Parse edge data: split by space, convert to numbers, and destructure using the helper.
                    var parsedEdgeData = ensureArrayDestructure(
                        inputLinesArray[edgeIndex + 1].split(" ").map(function (strValue) {
                            return Number(strValue);
                        }), 3);

                    var nodeAIdentifier = parsedEdgeData[0];
                    var nodeBIdentifier = parsedEdgeData[1];
                    var edgeWeight = parsedEdgeData[2];

                    // Add edges to the adjacency list (graph is undirected).
                    // Node identifiers are 1-based in input, so adjust to 0-based for array indexing.
                    graphAdjacencyList[nodeAIdentifier - 1].push({
                        vertex: nodeBIdentifier - 1,
                        cost: edgeWeight
                    });
                    graphAdjacencyList[nodeBIdentifier - 1].push({
                        vertex: nodeAIdentifier - 1,
                        cost: edgeWeight
                    });
                }

                // Parse the line containing query setup: number of queries and source node for BFS.
                var parsedQuerySetup = ensureArrayDestructure(
                    inputLinesArray[nodeCount].split(" ").map(function (strValue) {
                        return Number(strValue);
                    }), 2);

                var queryCountValue = parsedQuerySetup[0]; // Number of queries to process.
                var sourceNodeIndex = parsedQuerySetup[1]; // The starting node for BFS.

                // Initialize an array to store shortest distances from the source node.
                // A value of -1 indicates the node has not yet been visited.
                var shortestDistances = new Array(nodeCount).fill(-1);

                // Initialize a queue for Breadth-First Search (BFS).
                // Each item in the queue stores the vertex and its cumulative sum distance from the source.
                var processingQueue = [{
                    vertex: sourceNodeIndex - 1,
                    cumulativeSum: 0
                }];
                var queuePointer = 0; // Manual queue pointer for array-based queue optimization.

                // Perform BFS to find shortest distances from the source node to all other nodes.
                while (processingQueue.length > queuePointer) {
                    var currentNodeInfo = processingQueue[queuePointer];
                    queuePointer++; // Dequeue operation: move pointer to the next element.

                    // If this node has already been visited and its distance recorded, skip it.
                    // This is crucial for ensuring the first path found (BFS) is the shortest.
                    if (shortestDistances[currentNodeInfo.vertex] !== -1) {
                         continue;
                    }

                    // Record the shortest distance to the current node.
                    shortestDistances[currentNodeInfo.vertex] = currentNodeInfo.cumulativeSum;

                    // Iterate over neighbors of the current node using Symbol.iterator for compatibility.
                    var iterationStatusForNeighbors = true;
                    var errorFlagForNeighbors = false;
                    var exceptionObjectForNeighbors = undefined;
                    var graphIteratorForNeighbors = undefined; // Declared for finally access

                    try {
                        graphIteratorForNeighbors = graphAdjacencyList[currentNodeInfo.vertex][Symbol.iterator]();
                        for (
                            var iteratorResultForNeighbors;
                            !(iterationStatusForNeighbors = (iteratorResultForNeighbors = graphIteratorForNeighbors.next()).done);
                            iterationStatusForNeighbors = true
                        ) {
                            var neighborInfo = iteratorResultForNeighbors.value;
                            // If the neighbor has not been visited, add it to the queue.
                            if (shortestDistances[neighborInfo.vertex] === -1) {
                                processingQueue.push({
                                    vertex: neighborInfo.vertex,
                                    cumulativeSum: currentNodeInfo.cumulativeSum + neighborInfo.cost
                                });
                            }
                        }
                    } catch (bfsError) {
                        errorFlagForNeighbors = true;
                        exceptionObjectForNeighbors = bfsError;
                    } finally {
                        try {
                            if (!iterationStatusForNeighbors && graphIteratorForNeighbors != null && typeof graphIteratorForNeighbors.return === 'function') {
                                graphIteratorForNeighbors.return();
                            }
                        } finally {
                            if (errorFlagForNeighbors) {
                                throw exceptionObjectForNeighbors;
                            }
                        }
                    }
                }

                // Process the subsequent queryCountValue lines for distance queries.
                for (var queryLoopCounter = 0; queryLoopCounter < queryCountValue; queryLoopCounter++) {
                    // Parse the two nodes for the current query.
                    var currentQueryNodes = ensureArrayDestructure(
                        inputLinesArray[queryLoopCounter + nodeCount + 1].split(" ").map(function (strValue) {
                            return Number(strValue);
                        }), 2);

                    var queryNodeOne = currentQueryNodes[0];
                    var queryNodeTwo = currentQueryNodes[1];

                    // Calculate the sum of shortest distances from the source node to each query node.
                    // Remember to adjust for 0-based indexing.
                    var totalPathLength = shortestDistances[queryNodeOne - 1] + shortestDistances[queryNodeTwo - 1];

                    // Output the result to the console.
                    console.log(totalPathLength);
                }
            };
        },

        /**
         * Module 2: Provides the Node.js file system (fs) module.
         */
        function (moduleReference, exportsObject) {
            moduleReference.exportObject = require("fs");
        }
    ]
);