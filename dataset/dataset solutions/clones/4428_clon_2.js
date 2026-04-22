module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    // It stores the module's exports to prevent redundant execution.
    var moduleCache = {};

    /**
     * The central function responsible for loading modules.
     * It checks if a module is in the cache; if so, it returns its exports directly.
     * Otherwise, it initializes the module, executes its definition,
     * stores its exports in the cache, and then returns them.
     * @param {number} moduleIdentifier - The unique numerical ID of the module to retrieve.
     * @returns {object} The exports object of the specified module.
     */
    function moduleLoader(moduleIdentifier) {
        // If the module is already present in the cache, return its exports.
        if (moduleCache[moduleIdentifier]) {
            return moduleCache[moduleIdentifier].exports;
        }

        // If not cached, create a new module entry.
        // The 'currentModule' object holds metadata about the module.
        var currentModule = moduleCache[moduleIdentifier] = {
            id: moduleIdentifier, // The module's internal identifier.
            isInitialized: false, // Flag indicating if the module's definition has run.
            exports: {}           // The object that will hold the module's exported values.
        };

        // Execute the module's definition function.
        // The 'call' method sets 'this' to 'currentModule.exports' within the module function,
        // and passes 'currentModule', 'currentModule.exports', and the 'moduleLoader' itself
        // as arguments, allowing the module to access its own context and dependencies.
        moduleDefinitions[moduleIdentifier].call(
            currentModule.exports,
            currentModule,
            currentModule.exports,
            moduleLoader
        );

        // Mark the module as initialized after its definition has been executed.
        currentModule.isInitialized = true;

        // Return the module's exports.
        return currentModule.exports;
    }

    // Attach the array of all module definitions to the loader for internal use.
    moduleLoader.allModules = moduleDefinitions;

    // Attach the module cache to the loader.
    moduleLoader.moduleRegistry = moduleCache;

    /**
     * Defines a property on a given object using a getter function.
     * This is typically used for defining exports that are computed or lazy-loaded.
     * @param {object} targetObject - The object on which the property will be defined.
     * @param {string} propertyName - The name of the property to define.
     * @param {Function} propertyGetter - A function that returns the value of the property.
     */
    moduleLoader.defineGetterProperty = function(targetObject, propertyName, propertyGetter) {
        // Ensure the property does not already exist as an own property.
        if (!moduleLoader.checkOwnProperty(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property visible during enumeration.
                get: propertyGetter // Assign the getter function.
            });
        }
    };

    /**
     * Flags an object as an ECMAScript module.
     * This involves setting the `__esModule` property to true and potentially
     * setting `Symbol.toStringTag` for better debugging output.
     * @param {object} moduleExportsObject - The object to mark as an ES module.
     */
    moduleLoader.markAsEsModule = function(moduleExportsObject) {
        // If Symbol and Symbol.toStringTag are available, set it for better module identification.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(moduleExportsObject, Symbol.toStringTag, { value: "Module" });
        }
        // Explicitly mark the object as an ES module.
        Object.defineProperty(moduleExportsObject, "__esModule", { value: true });
    };

    /**
     * Provides comprehensive interoperability for modules, including handling
     * default exports and creating namespace objects.
     * @param {any} moduleReference - The module identifier or the module object itself.
     * @param {number} processingFlags - Bitmask flags indicating how to process the module.
     * @returns {any} The processed module or its namespace object.
     */
    moduleLoader.createModuleNamespace = function(moduleReference, processingFlags) {
        // Flag 1: If set, 'moduleReference' is an ID, so load the module.
        if (1 & processingFlags) moduleReference = moduleLoader(moduleReference);
        // Flag 8: If set, return the module reference directly.
        if (8 & processingFlags) return moduleReference;
        // Flag 4: If set, and it's an object already marked as an ES module, return it.
        if (4 & processingFlags && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) return moduleReference;

        // Otherwise, create a new empty object to serve as the namespace.
        var namespaceObject = Object.create(null);
        // Mark this new object as an ES module.
        moduleLoader.markAsEsModule(namespaceObject);
        // Define a 'default' property on the namespace, pointing to the original module reference.
        Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleReference });

        // Flag 2: If set, and the module reference is not a string,
        // iterate over its properties and define them on the namespace object.
        if (2 & processingFlags && typeof moduleReference !== "string") {
            for (var keyIterator in moduleReference) {
                moduleLoader.defineGetterProperty(namespaceObject, keyIterator, (function(currentPropertyKey) {
                    return moduleReference[currentPropertyKey];
                }).bind(null, keyIterator));
            }
        }
        return namespaceObject;
    };

    /**
     * Generates a getter function for a module's default export.
     * This helps in handling commonJS modules that might not explicitly have a 'default' export.
     * @param {object} inputModuleObject - The module object.
     * @returns {Function} A function that returns the default export of the module.
     */
    moduleLoader.getDefaultExportGetter = function(inputModuleObject) {
        var defaultExportAccessor = inputModuleObject && inputModuleObject.__esModule ?
            function() { return inputModuleObject.default; } : // If it's an ES module, return its 'default'.
            function() { return inputModuleObject; };            // Otherwise, the module itself is the default.
        // Define a special 'a' property on the accessor function itself, pointing to the accessor.
        moduleLoader.defineGetterProperty(defaultExportAccessor, "a", defaultExportAccessor);
        return defaultExportAccessor;
    };

    /**
     * Checks if an object possesses a specific property directly (not inherited).
     * This is a wrapper around `Object.prototype.hasOwnProperty.call`.
     * @param {object} objectToCheck - The object to inspect.
     * @param {string} keyToCheck - The property key to look for.
     * @returns {boolean} True if the object has the property as its own, false otherwise.
     */
    moduleLoader.checkOwnProperty = function(objectToCheck, keyToCheck) {
        return Object.prototype.hasOwnProperty.call(objectToCheck, keyToCheck);
    };

    // The base URL or path for loading assets, currently an empty string.
    moduleLoader.assetPublicPath = "";

    // Set the entry point module ID to 0 and immediately load it to start the application execution.
    return moduleLoader(moduleLoader.entryModuleId = 0);

}([ // This array contains the definitions of all modules in the application.

    // Module 0: The primary entry point. It orchestrates initial data loading and processing.
    function(currentModuleZero, exportsZero, moduleLoader) {
        // This module first loads Module 1 (the main logic) and Module 2 (Node.js 'fs').
        // It then reads content from '/dev/stdin', decodes it as UTF-8,
        // splits it into lines, and passes these lines to the function exported by Module 1.
        moduleLoader(1)(
            moduleLoader(2).readFileSync("/dev/stdin", "UTF-8").split("\n")
        );
    },

    // Module 1: Contains the core algorithm for graph processing and distance calculations.
    function(currentModuleOne, exportsOne, moduleLoader) {
        "use strict"; // Enforces stricter parsing and error handling in this module.

        /**
         * A helper function designed to safely destructure an iterable into an array.
         * This pattern is often generated by transpilers like Babel to handle
         * array destructuring assignments gracefully across different environments.
         * @param {Iterable<any>} iterableInput - The iterable object (e.g., array, string, Set) to destructure.
         * @param {number} desiredLength - The number of elements expected after destructuring.
         * @returns {Array<any>} An array containing the destructured elements.
         * @throws {TypeError} If the input is not iterable or if a non-iterable instance is encountered.
         */
        function safeArrayDestructure(iterableInput, desiredLength) {
            // Optimization: If the input is already an array, return it directly.
            if (Array.isArray(iterableInput)) {
                return iterableInput;
            }

            // Fallback for iterables that are not arrays.
            var collectedElements = [];
            var iterationFinished = true;
            var encounteredError = false;
            var caughtErrorValue = undefined;

            try {
                // Obtain an iterator and loop through its values.
                for (var iterationResult, currentIterator = iterableInput[Symbol.iterator](); !(iterationFinished = (iterationResult = currentIterator.next()).done) && (collectedElements.push(iterationResult.value), !desiredLength || collectedElements.length !== desiredLength); iterationFinished = true) {}
            } catch (loopError) {
                encounteredError = true;
                caughtErrorValue = loopError;
            } finally {
                try {
                    // Ensure the iterator's 'return' method is called if iteration wasn't finished naturally.
                    if (!iterationFinished && currentIterator.return != null) {
                        currentIterator.return();
                    }
                } finally {
                    // Re-throw any error encountered during the iteration process.
                    if (encounteredError) {
                        throw caughtErrorValue;
                    }
                }
            }
            // If all goes well, return the array of collected elements.
            return collectedElements;
        }

        // The main logic of Module 1. This function is exported and accepts an array of input text lines.
        currentModuleOne.exports = function(inputDataLines) {
            // The first line of input specifies the total number of nodes in the graph.
            var totalGraphNodes = Number(inputDataLines[0]);

            // Initialize an adjacency list to represent the graph.
            // Each element in 'graphConnections' will be an array of [neighborNode, edgeWeight].
            var graphConnections = new Array(totalGraphNodes);
            for (var nodeIndex = 0; nodeIndex < totalGraphNodes; nodeIndex++) {
                graphConnections[nodeIndex] = [];
            }

            // Parse the line that contains the primary starting and ending nodes for path calculations.
            // This line is located at an index equal to 'totalGraphNodes' (0-indexed).
            var initialNodePair = safeArrayDestructure(
                inputDataLines[totalGraphNodes].split(" ").map(function(stringNumber) {
                    return Number(stringNumber);
                }),
                2 // Expect exactly two numbers.
            );
            var initialStartNode = initialNodePair[0]; // The designated start node (1-indexed).
            var initialTargetNode = initialNodePair[1]; // The designated target node (1-indexed).

            // Process the lines describing the graph's edges.
            // These lines run from index 1 up to 'totalGraphNodes - 1'.
            for (var edgeIteration = 0; edgeIteration < totalGraphNodes - 1; edgeIteration++) {
                var currentEdgeData = safeArrayDestructure(
                    inputDataLines[edgeIteration + 1].split(" ").map(function(stringNumber) {
                        return Number(stringNumber);
                    }),
                    3 // Expect three numbers: node1, node2, weight.
                );
                var firstNode = currentEdgeData[0];    // First node of the edge (1-indexed).
                var secondNode = currentEdgeData[1];   // Second node of the edge (1-indexed).
                var connectionWeight = currentEdgeData[2]; // Weight of the connection.

                // Populate the adjacency list for an undirected graph.
                // Node indices are converted to 0-based for array access.
                // An edge is added only if the neighbor is not the 'initialTargetNode'.
                if (secondNode !== initialTargetNode) {
                    graphConnections[firstNode - 1].push([secondNode - 1, connectionWeight]);
                }
                if (firstNode !== initialTargetNode) {
                    graphConnections[secondNode - 1].push([firstNode - 1, connectionWeight]);
                }
            }

            // Initialize an array to store the shortest distances from the 'initialTargetNode'
            // to all other nodes. -1 indicates an unvisited or unreachable node.
            var shortestPathDistances = new Array(totalGraphNodes).fill(-1);

            /**
             * A recursive depth-first search (DFS) like function to compute
             * shortest distances from a source node (specifically, 'initialTargetNode')
             * to all reachable nodes in the graph. This is effectively a single-source
             * shortest path algorithm on an unweighted graph if all weights were 1,
             * but here it accumulates path weights.
             * @param {number} currentNodeIndex - The 0-indexed identifier of the current node being visited.
             * @param {number} accumulatedDistance - The total distance from the source to 'currentNodeIndex'.
             */
            !function computeDistances(currentNodeIndex, accumulatedDistance) {
                // Record the shortest distance found so far to the current node.
                shortestPathDistances[currentNodeIndex] = accumulatedDistance;
                // Determine how many neighbors the current node has.
                var numberOfNeighbors = graphConnections[currentNodeIndex].length;

                // Iterate through each neighbor of the current node.
                for (var neighborCounter = 0; neighborCounter < numberOfNeighbors; neighborCounter++) {
                    var neighborDetails = graphConnections[currentNodeIndex][neighborCounter];
                    // If the neighbor has not been visited yet (its distance is still -1).
                    if (-1 === shortestPathDistances[neighborDetails[0]]) {
                        // Calculate the new total distance to this neighbor.
                        var newTotalDistance = accumulatedDistance + neighborDetails[1];
                        // Recursively call the function for the neighbor.
                        computeDistances(neighborDetails[0], newTotalDistance);
                    }
                }
            }(initialTargetNode - 1, 0); // Start the distance computation from the 'initialTargetNode' (0-indexed) with 0 distance.

            // Process the query lines. The number of queries is given by 'initialStartNode'.
            // Query lines start after the graph definition and the initial node pair line.
            for (var queryCounter = 0; queryCounter < initialStartNode; queryCounter++) {
                var currentQueryNodes = safeArrayDestructure(
                    inputDataLines[queryCounter + totalGraphNodes + 1].split(" ").map(function(stringNumber) {
                        return Number(stringNumber);
                    }),
                    2 // Each query specifies two nodes.
                );
                var queryNodeA = currentQueryNodes[0]; // First node in the query (1-indexed).
                var queryNodeB = currentQueryNodes[1]; // Second node in the query (1-indexed).

                // Calculate the sum of shortest distances from the 'initialTargetNode'
                // to each of the two query nodes.
                // Node indices are adjusted to be 0-based for array lookup.
                var combinedQueryResult = shortestPathDistances[queryNodeA - 1] + shortestPathDistances[queryNodeB - 1];
                // Output the calculated result to the console.
                console.log(combinedQueryResult);
            }
        };
    },

    // Module 2: A simple module that exports the Node.js 'fs' (File System) core module.
    function(currentModuleTwo, exportsTwo) {
        // Assigns the 'fs' module obtained via Node's native 'require' to this module's exports.
        currentModuleTwo.exports = require("fs");
    }
]);