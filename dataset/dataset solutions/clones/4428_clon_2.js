module.exports = function(moduleDefinitions) {
    // This object serves as a cache for modules that have already been loaded.
    var moduleCache = {};

    // The core function responsible for loading and caching modules.
    function loadModule(modId) {
        // If the module is already in the cache, return its exported value immediately.
        if (moduleCache[modId]) {
            return moduleCache[modId].exports;
        }

        // If not cached, create a new module entry in the cache.
        // Each module entry includes its ID, a 'loaded' flag, and an 'exports' object.
        var currentModule = moduleCache[modId] = {
            id: modId,
            loaded: false,
            exports: {}
        };

        // Execute the module's function, passing the module object, its exports,
        // and the 'loadModule' function itself (for internal requires).
        moduleDefinitions[modId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

        // Mark the module as loaded after its execution.
        currentModule.loaded = true;

        // Return the exports of the newly loaded module.
        return currentModule.exports;
    }

    // Attach the module definitions to the loader for internal access.
    loadModule.definitions = moduleDefinitions;

    // Attach the module cache to the loader.
    loadModule.cache = moduleCache;

    // Helper function to define a getter property on an object.
    // This is used for creating "live" bindings for ES modules.
    loadModule.defineGetter = function(targetObject, propertyName, getterFunction) {
        // Only define the property if it doesn't already exist on the target object.
        if (!loadModule.hasOwn(targetObject, propertyName)) {
            Object.defineProperty(targetObject, propertyName, {
                enumerable: true, // Make the property enumerable.
                get: getterFunction // Assign the provided function as its getter.
            });
        }
    };

    // Helper function to mark an exports object as an ES module.
    loadModule.registerNamespace = function(exportsObject) {
        // Set Symbol.toStringTag for better debugging of module objects.
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(exportsObject, Symbol.toStringTag, {
                value: "Module"
            });
        }
        // Set __esModule to true to indicate it's an ES module.
        Object.defineProperty(exportsObject, "__esModule", {
            value: true
        });
    };

    // Helper function to create a "fake" namespace object for compatibility
    // between CommonJS and ES modules.
    loadModule.createNamespace = function(moduleValue, modeFlags) {
        // Bitwise flags determine how to handle the moduleValue:
        // 1: If moduleValue is a module ID, load it.
        if (1 & modeFlags) {
            moduleValue = loadModule(moduleValue);
        }
        // 8: Return the raw moduleValue directly.
        if (8 & modeFlags) {
            return moduleValue;
        }
        // 4: If it's already an ES module, return it.
        if (4 & modeFlags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new plain object to serve as the namespace.
        var namespaceObject = Object.create(null);
        // Register it as an ES module.
        loadModule.registerNamespace(namespaceObject);
        // Define a 'default' export pointing to the moduleValue.
        Object.defineProperty(namespaceObject, "default", {
            enumerable: true,
            value: moduleValue
        });
        // 2: If moduleValue is not a string, copy all its properties to the namespace.
        if (2 & modeFlags && typeof moduleValue !== "string") {
            for (var propName in moduleValue) {
                loadModule.defineGetter(namespaceObject, propName, (function(key) {
                    return moduleValue[key];
                }).bind(null, propName));
            }
        }
        return namespaceObject;
    };

    // Helper function to get the default export of a module.
    loadModule.getExport = function(moduleValue) {
        // If it's an ES module, return a getter for its 'default' property.
        // Otherwise, return a getter for the moduleValue itself.
        var getter = moduleValue && moduleValue.__esModule ?
            function() {
                return moduleValue.default;
            } :
            function() {
                return moduleValue;
            };
        // Attach the getter to itself under property 'a' for some internal webpack logic.
        loadModule.defineGetter(getter, "a", getter);
        return getter;
    };

    // Utility function to check if an object has a specific own property.
    loadModule.hasOwn = function(targetObject, propertyName) {
        return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
    };

    // The public path for assets (empty in this specific bundle).
    loadModule.publicPath = "";

    // Set the startup module ID and immediately load it to begin execution.
    return loadModule(loadModule.startupModule = 0);
}([
    // Module 0: The entry point of the application.
    function(moduleObj, moduleExports, requireFunc) {
        // This module reads input from standard input, splits it by newlines,
        // and then passes the resulting array of lines to Module 1 for processing.
        requireFunc(1)(requireFunc(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    // Module 1: Contains the main graph processing logic.
    function(moduleObj, moduleExports, requireFunc) {
        "use strict";

        // A utility function to safely destructure an iterable into an array.
        // It handles non-array iterables and ensures the array has a specific length if required.
        function extractArrayElements(inputIterable, expectedLength) {
            if (Array.isArray(inputIterable)) {
                return inputIterable;
            }
            var temporaryArray = [];
            var iterationComplete = false;
            var encounteredError = false;
            var caughtError = undefined;
            try {
                // Iterate through the input iterable, pushing values to temporaryArray.
                // Stop if iteration is done or if expectedLength is reached.
                for (var iterableIterator, currentIteration = inputIterable[Symbol.iterator](); !(iterationComplete = (iterableIterator = currentIteration.next()).done) && (temporaryArray.push(iterableIterator.value), !expectedLength || temporaryArray.length !== expectedLength); iterationComplete = true) {}
            } catch (err) {
                encounteredError = true;
                caughtError = err;
            } finally {
                try {
                    // Ensure the iterator's 'return' method is called if iteration wasn't completed naturally.
                    if (!iterationComplete && currentIteration.return != null) {
                        currentIteration.return();
                    }
                } finally {
                    // Re-throw any error caught during iteration.
                    if (encounteredError) {
                        throw caughtError;
                    }
                }
            }
            return temporaryArray;
        }

        // The main logic function exported by this module.
        moduleObj.exports = function(inputLines) {
            // The first line of input specifies the total number of nodes in the graph.
            var nodeCount = Number(inputLines[0]);

            // Initialize an adjacency list to represent the graph.
            // Each element in the list will be an array of [neighborNodeIndex, edgeWeight] pairs.
            var adjacencyList = new Array(nodeCount);
            for (var idx = 0; idx < nodeCount; idx++) {
                adjacencyList[idx] = [];
            }

            // The line at index 'nodeCount' contains two numbers:
            // 1. The number of queries to process.
            // 2. The 1-indexed starting node for distance calculations.
            var initialConfig = extractArrayElements(inputLines[nodeCount].split(" ").map(function(str) {
                return Number(str);
            }), 2);
            var queryCount = initialConfig[0];
            var sourceNodeIdx = initialConfig[1]; // This is 1-indexed.

            // Process the edge definitions. There are (nodeCount - 1) edges.
            // Each edge is defined on lines from 1 to (nodeCount - 1).
            for (var edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
                var edgeDetails = extractArrayElements(inputLines[edgeIdx + 1].split(" ").map(function(str) {
                    return Number(str);
                }), 3);
                var nodeOne = edgeDetails[0]; // 1-indexed
                var nodeTwo = edgeDetails[1]; // 1-indexed
                var edgeWeight = edgeDetails[2];

                // Add edges to the adjacency list.
                // The problem statement implies a specific graph structure or traversal.
                // Edges are added such that the sourceNodeIdx is not directly connected to itself.
                // This creates a tree-like structure rooted at sourceNodeIdx.
                if (nodeTwo !== sourceNodeIdx) {
                    adjacencyList[nodeOne - 1].push([nodeTwo - 1, edgeWeight]);
                }
                if (nodeOne !== sourceNodeIdx) {
                    adjacencyList[nodeTwo - 1].push([nodeOne - 1, edgeWeight]);
                }
            }

            // Initialize an array to store the shortest distances from the source node to all other nodes.
            // -1 indicates an unvisited node.
            var nodeDistances = new Array(nodeCount).fill(-1);

            // A recursive Depth-First Search (DFS) function to calculate distances from the source.
            (function calculatePathDistances(currNode, distFromSource) {
                nodeDistances[currNode] = distFromSource; // Set the distance for the current node.
                var neighborCount = adjacencyList[currNode].length;

                // Iterate through all neighbors of the current node.
                for (var neighborIdx = 0; neighborIdx < neighborCount; neighborIdx++) {
                    var neighborData = adjacencyList[currNode][neighborIdx]; // [neighbor_index, weight_to_neighbor]

                    // If the neighbor has not been visited yet (distance is -1).
                    if (nodeDistances[neighborData[0]] === -1) {
                        var newCalculatedDist = distFromSource + neighborData[1]; // Calculate distance to neighbor.
                        calculatePathDistances(neighborData[0], newCalculatedDist); // Recursively call DFS for the neighbor.
                    }
                }
            })(sourceNodeIdx - 1, 0); // Start the DFS from the source node (converted to 0-indexed) with initial distance 0.

            // Process the queries.
            // Queries start from line (nodeCount + 1 + 1) up to (nodeCount + 1 + queryCount).
            for (var queryIdx = 0; queryIdx < queryCount; queryIdx++) {
                // Each query line contains two 1-indexed node numbers.
                var queryNodes = extractArrayElements(inputLines[queryIdx + nodeCount + 1].split(" ").map(function(str) {
                    return Number(str);
                }), 2);
                var firstQueryNode = queryNodes[0];
                var secondQueryNode = queryNodes[1];

                // Calculate the total distance by summing the distances from the source node
                // to each of the two query nodes.
                var totalQueryDistance = nodeDistances[firstQueryNode - 1] + nodeDistances[secondQueryNode - 1];
                console.log(totalQueryDistance); // Output the calculated total distance.
            }
        };
    },
    // Module 2: Provides access to the Node.js 'fs' (File System) module.
    function(moduleObj, moduleExports) {
        moduleObj.exports = require("fs");
    }
]);
