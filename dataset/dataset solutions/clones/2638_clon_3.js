module.exports = function(moduleDefinitions) {
    // Cache for already loaded modules
    var installedModuleCache = {};

    // Core module loading function
    function executeModule(moduleId) {
        // If module is already in cache, return its exports
        if (installedModuleCache[moduleId]) {
            return installedModuleCache[moduleId].exports;
        }

        // Create a new module instance and add it to cache
        var moduleInstance = installedModuleCache[moduleId] = {
            id: moduleId, // Renamed 'i' to 'id'
            loaded: false, // Renamed 'l' to 'loaded'
            exports: {}
        };

        // Execute the module function
        moduleDefinitions[moduleId].call(
            moduleInstance.exports,
            moduleInstance,
            moduleInstance.exports,
            executeModule // Pass the loader itself for internal `require` calls
        );

        // Mark module as loaded
        moduleInstance.loaded = true;

        return moduleInstance.exports;
    }

    // Store module definitions and cache on the loader for internal use
    executeModule.modules = moduleDefinitions; // Renamed 'm'
    executeModule.cache = installedModuleCache; // Renamed 'c'

    // Utility to define a getter function for an export
    executeModule.defineExport = function(exportObject, propertyName, getterFunction) { // Renamed 'd', 'e', 't', 'n'
        if (!executeModule.hasOwnProp(exportObject, propertyName)) { // Using the renamed hasOwnProp
            Object.defineProperty(exportObject, propertyName, {
                enumerable: true,
                get: getterFunction
            });
        }
    };

    // Utility to mark an object as an ES module
    executeModule.markAsEsModule = function(exportObject) { // Renamed 'r', 'e'
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exportObject, Symbol.toStringTag, {
                value: 'Module'
            });
        }
        Object.defineProperty(exportObject, '__esModule', {
            value: true
        });
    };

    // Utility to create a namespace object for a module
    executeModule.createNamespaceObject = function(moduleValue, flags) { // Renamed 't', 'e', 't'
        // Flag 1: moduleValue is already processed by executeModule
        // Flag 8: Return moduleValue directly
        if (flags & 1) {
            moduleValue = executeModule(moduleValue);
        }
        if (flags & 8) {
            return moduleValue;
        }

        // Flag 4: moduleValue is an object and already an ES module
        if (flags & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
            return moduleValue;
        }

        // Create a new namespace object
        var namespaceObject = Object.create(null); // Renamed 'n'
        executeModule.markAsEsModule(namespaceObject);
        Object.defineProperty(namespaceObject, 'default', {
            enumerable: true,
            value: moduleValue
        });

        // Flag 2: if moduleValue is not a string, copy all properties from it
        if (flags & 2 && typeof moduleValue !== 'string') {
            for (var propName in moduleValue) { // Renamed 'i'
                executeModule.defineExport(namespaceObject, propName, ((key) => moduleValue[key]).bind(null, propName));
            }
        }
        return namespaceObject;
    };

    // Utility to create a getter for the default export
    executeModule.createDefaultExportGetter = function(moduleExports) { // Renamed 'n', 'e'
        var getterFn = moduleExports && moduleExports.__esModule ?
            function() {
                return moduleExports.default;
            } :
            function() {
                return moduleExports;
            };
        executeModule.defineExport(getterFn, 'a', getterFn); // Renamed 't', 'a', 't'
        return getterFn;
    };

    // Utility to check if an object has a property
    executeModule.hasOwnProp = function(targetObject, propertyKey) { // Renamed 'o', 'e', 't'
        return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
    };

    // Public path for assets (empty in this case)
    executeModule.publicPath = ""; // Renamed 'p'

    // Set the entry module and execute it
    executeModule.entryModuleId = 0; // Renamed 's'
    return executeModule(executeModule.entryModuleId);
}([
    /* Module 0: Entry point */
    function(currentModule, moduleExports, loaderReference) { // Renamed 'e', 't', 'r'
        const fileSystemModule = loaderReference(2); // Get fs module
        const inputContent = fileSystemModule.readFileSync("/dev/stdin", "UTF-8"); // Read input
        loaderReference(1)(inputContent); // Pass input to the main logic module
    },
    /* Module 1: Main logic */
    function(currentModule, moduleExports, moduleLoader) { // Renamed 'e', 't', 'r'
        "use strict";

        // Helper function to safely destructure an iterable or array
        function safeDestructure(inputCollection, expectedLength) { // Renamed 'n', 'e', 't'
            if (Array.isArray(inputCollection)) {
                // If it's already an array, just return it (or slice if expectedLength is present)
                return expectedLength ? inputCollection.slice(0, expectedLength) : inputCollection;
            }

            const extractedParts = []; // Renamed 'r'
            let iterationContinues = true; // Renamed 'n'
            let encounteredError = false; // Renamed 'i'
            let iterationError = undefined; // Renamed 'o'

            try {
                // Manually iterate using Symbol.iterator to match original transpiled behavior
                for (
                    var itemIterator = inputCollection[Symbol.iterator](); // Renamed 'a'
                    iterationContinues = !(iteratorResult = itemIterator.next()).done; // Renamed 'u'
                ) {
                    extractedParts.push(iteratorResult.value);
                    if (expectedLength && extractedParts.length === expectedLength) {
                        iterationContinues = false; // Stop if we have enough parts
                    }
                }
            } catch (err) {
                encounteredError = true;
                iterationError = err;
            } finally {
                try {
                    // Ensure iterator is closed if iteration stopped early or had an error
                    if (!iterationContinues && itemIterator.return != null) { // Changed null==u.return to itemIterator.return != null
                        itemIterator.return();
                    }
                } finally {
                    if (encounteredError) {
                        throw iterationError;
                    }
                }
            }
            // If we reach here, and it's not an array nor a successful iteration, it's an invalid attempt
            // The original throws TypeError if none of the above succeed.
            if (extractedParts.length === 0 && !Array.isArray(inputCollection) && !inputCollection[Symbol.iterator]) {
                throw new TypeError("Invalid attempt to destructure non-iterable instance");
            }
            return extractedParts;
        }

        // Custom Doubly Linked List based Queue implementation
        class WorkQueue { // Renamed 'i'
            constructor() {
                this.elementCount = 0; // Renamed 'size'
                // Using sentinel nodes to simplify enqueue/dequeue logic
                this.frontSentinel = {
                    value: undefined,
                    prev: undefined,
                    next: undefined
                }; // Renamed 'head'
                this.backSentinel = {
                    value: undefined,
                    prev: undefined,
                    next: undefined
                }; // Renamed 'tail'

                // Link sentinels to each other initially
                this.frontSentinel.next = this.backSentinel;
                this.backSentinel.prev = this.frontSentinel;
            }

            // Adds an item to the end of the queue
            enqueueValue(itemData) { // Renamed 'enq', 'e'
                this.elementCount++;
                const newNode = {
                    value: itemData,
                    prev: undefined,
                    next: undefined
                }; // Renamed 't'

                // Insert newNode before the back sentinel
                const previousLastNode = this.backSentinel.prev;
                previousLastNode.next = newNode;
                newNode.prev = previousLastNode;
                newNode.next = this.backSentinel;
                this.backSentinel.prev = newNode;
            }

            // Removes and returns the item from the front of the queue
            dequeueValue() { // Renamed 'deq'
                if (this.elementCount === 0) {
                    // Queue is empty, return undefined or throw an error
                    return undefined;
                }

                this.elementCount--;
                const firstActualNode = this.frontSentinel.next; // Renamed 'e'
                const valueToReturn = firstActualNode.value;

                // Update links to bypass the dequeued node
                this.frontSentinel.next = firstActualNode.next;
                firstActualNode.next.prev = this.frontSentinel;

                // Optional: clear references of the dequeued node for garbage collection
                firstActualNode.prev = undefined;
                firstActualNode.next = undefined;

                return valueToReturn;
            }

            // Returns all values in the queue as an array
            getAllContainedValues() { // Renamed 'getValuesArray'
                const collectedData = []; // Renamed 'e'
                let currentNode = this.frontSentinel.next; // Renamed 't'

                while (currentNode !== this.backSentinel) {
                    collectedData.push(currentNode.value);
                    currentNode = currentNode.next;
                }
                return collectedData;
            }
        }

        // Main exported function to process the input
        currentModule.exports = function(rawDataInput) { // Renamed 'e'
            const inputLines = rawDataInput.split("\n"); // Renamed 't'

            // Parse the first line for node and query counts
            const parsedFirstLine = safeDestructure(
                inputLines[0].split(" ").map(Number), 2
            ); // Renamed 'r'
            const numberOfNodes = parsedFirstLine[0]; // Renamed 'o'
            const numberOfQueries = parsedFirstLine[1]; // Renamed 'a'

            // Initialize adjacency list for the graph
            const graphAdjacencyList = new Array(numberOfNodes); // Renamed 'u'

            // Process edges (numberOfNodes - 1 lines following the first)
            for (let edgeIndex = 0; edgeIndex < numberOfNodes - 1; edgeIndex++) { // Renamed 'l'
                const currentEdgeNodes = safeDestructure(
                    inputLines[edgeIndex + 1].split(" ").map(val => Number(val) - 1), 2
                ); // Renamed 's'
                const nodeA = currentEdgeNodes[0]; // Renamed 'f'
                const nodeB = currentEdgeNodes[1]; // Renamed 'd'

                // Basic validation for node indices
                if (nodeA < 0 || nodeA >= numberOfNodes || nodeB < 0 || nodeB >= numberOfNodes) {
                    // In a real application, would log an error or throw
                    // For competitive programming, assume valid input
                    continue;
                }

                // Ensure adjacency lists exist (using nullish coalescing for conciseness)
                graphAdjacencyList[nodeA] ??= [];
                graphAdjacencyList[nodeB] ??= [];

                // Add edges (undirected graph)
                graphAdjacencyList[nodeA].push(nodeB);
                graphAdjacencyList[nodeB].push(nodeA);
            }

            // Initialize an array to accumulate values for each node
            const nodeValueAccumulators = new Array(numberOfNodes).fill(0); // Renamed 'c'

            // Process queries (numberOfQueries lines following the edges)
            for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) { // Renamed 'h'
                const currentQueryData = safeDestructure(
                    inputLines[queryIndex + numberOfNodes].split(" ").map(Number), 2
                ); // Renamed 'p'
                const targetNodeIdentifier = currentQueryData[0]; // Renamed 'v' (1-based index)
                const valueIncrement = currentQueryData[1]; // Renamed 'y'

                const adjustedNodeIndex = targetNodeIdentifier - 1; // Convert to 0-based index

                // Basic validation for target node index
                if (adjustedNodeIndex < 0 || adjustedNodeIndex >= numberOfNodes) {
                    continue; // Skip invalid queries
                }

                nodeValueAccumulators[adjustedNodeIndex] += valueIncrement;
            }

            // Perform a Breadth-First Search (BFS) or Depth-First Search (DFS)
            // The original logic implies a BFS by using a queue and processing in order.
            const nodesToVisitQueue = new WorkQueue(); // Renamed 'x'
            const nodeVisitedFlags = new Array(numberOfNodes).fill(0); // Renamed 'b' (0: not visited, 1: visited)

            // Start traversal from node 0 (assuming a connected graph or processing all components)
            nodesToVisitQueue.enqueueValue(0);

            // Process nodes while the queue is not empty
            while (nodesToVisitQueue.elementCount > 0) {
                const currentNodeId = nodesToVisitQueue.dequeueValue(); // Renamed 'm'

                // Guard for unexpected empty queue (shouldn't happen with elementCount check)
                if (currentNodeId === undefined) {
                    break;
                }

                nodeVisitedFlags[currentNodeId] = 1; // Mark current node as visited

                // Get neighbors of the current node, default to empty array if no connections
                const neighborsOfCurrent = graphAdjacencyList[currentNodeId] || [];

                // Iterate over neighbors using a modern for...of loop (Type III change)
                for (const neighborId of neighborsOfCurrent) { // Replaces the verbose try-catch-finally iterator
                    // If neighbor has not been visited yet
                    if (nodeVisitedFlags[neighborId] !== 1) { // Renamed 'q'
                        // Propagate the accumulated value from parent to child
                        nodeValueAccumulators[neighborId] += nodeValueAccumulators[currentNodeId];
                        nodesToVisitQueue.enqueueValue(neighborId); // Add neighbor to queue
                    }
                }
            }

            // Output the final accumulated values for each node
            console.log(nodeValueAccumulators.join(" "));
        };
    },
    /* Module 2: fs module */
    function(fsModule, fsExports) { // Renamed 'e', 't'
        fsModule.exports = require("fs");
    }
]));