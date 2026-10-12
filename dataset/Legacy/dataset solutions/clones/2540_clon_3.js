module.exports = function(moduleDefinitions) {
    var moduleCache = {};

    function webpackRequire(moduleId) {
        if (moduleCache[moduleId]) {
            return moduleCache[moduleId].exports;
        }
        var moduleObject = moduleCache[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };
        moduleDefinitions[moduleId].call(moduleObject.exports, moduleObject, moduleObject.exports, webpackRequire);
        moduleObject.loaded = true;
        return moduleObject.exports;
    }

    webpackRequire.modules = moduleDefinitions;
    webpackRequire.cache = moduleCache;

    webpackRequire.defineGetter = function(target, property, getterFunction) {
        webpackRequire.hasProperty(target, property) || Object.defineProperty(target, property, {
            enumerable: true,
            get: getterFunction
        });
    };

    webpackRequire.registerModule = function(targetModule) {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
            Object.defineProperty(targetModule, Symbol.toStringTag, {
                value: "Module"
            });
        }
        Object.defineProperty(targetModule, "__esModule", {
            value: true
        });
    };

    webpackRequire.interopDefault = function(moduleValue, flags) {
        if (flags & 1) moduleValue = webpackRequire(moduleValue);
        if (flags & 8) return moduleValue;
        if (flags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) return moduleValue;
        var defaultExport = Object.create(null);
        webpackRequire.registerModule(defaultExport);
        Object.defineProperty(defaultExport, "default", {
            enumerable: true,
            value: moduleValue
        });
        if (flags & 2 && typeof moduleValue !== "string") {
            for (var key in moduleValue) {
                webpackRequire.defineGetter(defaultExport, key, (function(currentKey) {
                    return moduleValue[currentKey];
                }).bind(null, key));
            }
        }
        return defaultExport;
    };

    webpackRequire.getModuleExports = function(moduleRef) {
        var getter = moduleRef && moduleRef.__esModule ?
            function() {
                return moduleRef.default;
            } :
            function() {
                return moduleRef;
            };
        webpackRequire.defineGetter(getter, "a", getter);
        return getter;
    };

    webpackRequire.hasProperty = function(object, property) {
        return Object.prototype.hasOwnProperty.call(object, property);
    };

    webpackRequire.publicPath = "";

    return webpackRequire(webpackRequire.entryModule = 0);
}([
    function(module, exports, currentRequire) {
        currentRequire(1)(currentRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },
    function(module, exports, currentRequire) {
        "use strict";

        // Helper function for safe destructuring.
        // The original 'n' function returns the input array directly if it's an array.
        // It only throws a TypeError if the input is not an iterable.
        // For the specific usage in this code (input from .split().map()),
        // the input will always be an array.
        function safeDestructure(inputArray) {
            if (!Array.isArray(inputArray)) {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
            return inputArray;
        }

        // Helper to parse a line of space-separated numbers
        const parseNumericLine = (lineString) => lineString.split(" ").map(Number);

        // Helper to parse a line of space-separated numbers and convert to 0-indexed
        const parseZeroIndexedNodes = (lineString) => lineString.split(" ").map(val => Number(val) - 1);

        // Helper to print cycle details (length and nodes)
        const printCycleDetails = (pathLength, visitedFlagsInPath, totalNodes) => {
            console.log(pathLength);
            for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
                if (visitedFlagsInPath[nodeIndex]) {
                    console.log(nodeIndex + 1);
                }
            }
        };

        module.exports = function(inputLines) {
            // Parse the first line for N (nodes) and M (edges)
            const [nodeCount, edgeCount] = safeDestructure(parseNumericLine(inputLines[0]));

            // Initialize adjacency list for the graph
            const graphAdjacencyList = Array.from({
                length: nodeCount
            }, () => []);

            // Populate the adjacency list with edges from subsequent lines
            for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
                const [fromNodeIndex, toNodeIndex] = safeDestructure(parseZeroIndexedNodes(inputLines[edgeIdx + 1]));
                graphAdjacencyList[fromNodeIndex].push(toNodeIndex);
            }

            // Iterate through each node as a potential starting point for a cycle
            for (let startNodeIndex = 0; startNodeIndex < nodeCount; startNodeIndex++) {
                // Initialize visited flags for the current path, marking the start node as visited
                const pathVisitedFlags = new Array(nodeCount).fill(false);
                pathVisitedFlags[startNodeIndex] = true;

                // Use a stack for DFS-like traversal.
                // Each element in the stack is an object: { currentNodeIndex, visitedFlags, currentPathLength }
                const traversalStack = [{
                    currentNodeIndex: startNodeIndex,
                    visitedFlags: pathVisitedFlags,
                    currentPathLength: 1
                }];

                // Perform graph traversal
                while (traversalStack.length > 0) {
                    const currentState = traversalStack.pop(); // Get the last state from the stack

                    // Iterate over neighbors of the current node
                    for (const neighborNode of graphAdjacencyList[currentState.currentNodeIndex]) {
                        if (neighborNode === startNodeIndex) {
                            // Cycle detected back to the starting node
                            printCycleDetails(currentState.currentPathLength, currentState.visitedFlags, nodeCount);
                            return; // Exit immediately after finding the first cycle
                        }

                        // If the neighbor has not been visited in the current path
                        if (!currentState.visitedFlags[neighborNode]) {
                            // Create a new set of visited flags for the next path segment
                            const nextPathVisitedFlags = currentState.visitedFlags.slice(); // Use slice() for shallow copy
                            nextPathVisitedFlags[neighborNode] = true; // Mark the neighbor as visited

                            // Add the neighbor to the stack for further exploration
                            traversalStack.push({
                                currentNodeIndex: neighborNode,
                                visitedFlags: nextPathVisitedFlags,
                                currentPathLength: currentState.currentPathLength + 1
                            });
                        }
                    }
                }
            }

            // If no cycle is found after checking all starting nodes
            console.log(-1);
        };
    },
    function(module, exports) {
        module.exports = currentRequire("fs");
    }
]);
