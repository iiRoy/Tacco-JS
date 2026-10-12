module.exports = function (moduleDefinitions) {
  // A cache to store already loaded modules.
  var moduleCache = {};

  // The core function responsible for loading modules.
  function moduleLoader(moduleId) {
    // If the module is already in the cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not cached, create a new module object and store it.
    var moduleObject = (moduleCache[moduleId] = {
      identifier: moduleId, // The unique ID of this module.
      isLoaded: false, // Flag indicating if the module's code has been executed.
      exports: {}, // The object that will hold the module's exports.
    });

    // Execute the module's definition function.
    // It receives the module object, its exports, and the moduleLoader itself.
    moduleDefinitions[moduleId].call(
      moduleObject.exports,
      moduleObject,
      moduleObject.exports,
      moduleLoader
    );

    // Mark the module as loaded after its definition has run.
    moduleObject.isLoaded = true;

    // Return the module's exports.
    return moduleObject.exports;
  }

  // Store the original module definitions on the loader for internal use.
  moduleLoader.modulesMap = moduleDefinitions;
  // Store the module cache on the loader.
  moduleLoader.cacheMap = moduleCache;

  // Helper to define a getter property on an object, used for exports.
  moduleLoader.defineExport = function (targetObject, propertyName, getterFunction) {
    // Only define if the property doesn't already exist.
    if (!moduleLoader.hasOwnProp(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make it enumerable so it appears in for...in loops.
        get: getterFunction, // The function to call when the property is accessed.
      });
    }
  };

  // Helper to mark an object as an ES module.
  moduleLoader.registerModule = function (targetObject) {
    // Set Symbol.toStringTag for better debugging in some environments.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
    }
    // Set the __esModule flag, a common convention for ES modules.
    Object.defineProperty(targetObject, "__esModule", { value: true });
  };

  // Resolves a module reference based on type flags, handling various export formats.
  moduleLoader.resolveModuleType = function (moduleRef, typeFlags) {
    // Bit 1: If it's a direct module ID, load it first.
    if (1 & typeFlags) {
      moduleRef = moduleLoader(moduleRef);
    }
    // Bit 8: If it's already a module, return it as is.
    if (8 & typeFlags) {
      return moduleRef;
    }
    // Bit 4: If it's an object and explicitly marked as an ES module, return it.
    if (4 & typeFlags && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
      return moduleRef;
    }

    // Otherwise, create a new namespace object.
    var namespaceObject = Object.create(null);
    // Register it as an ES module.
    moduleLoader.registerModule(namespaceObject);
    // Set the 'default' export to the module reference.
    Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleRef });

    // Bit 2: If it's not a string, copy all its properties as named exports.
    if (2 & typeFlags && typeof moduleRef !== "string") {
      for (var propKey in moduleRef) {
        moduleLoader.defineExport(
          namespaceObject,
          propKey,
          (function (key) {
            return moduleRef[key];
          }).bind(null, propKey)
        );
      }
    }
    return namespaceObject;
  };

  // Creates a getter function for a module's namespace.
  moduleLoader.getNamespaceObject = function (moduleRef) {
    var getterFunction =
      moduleRef && moduleRef.__esModule
        ? function () {
            return moduleRef.default;
          }
        : function () {
            return moduleRef;
          };
    // Define a property 'a' on the getter function itself, pointing to the getter.
    moduleLoader.defineExport(getterFunction, "a", getterFunction);
    return getterFunction;
  };

  // Checks if an object has a specific property directly (not inherited).
  moduleLoader.hasOwnProp = function (targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Public path for assets, typically used in web environments (empty here).
  moduleLoader.publicPath = "";

  // Set the starting module ID and immediately load it to begin execution.
  return moduleLoader((moduleLoader.startModuleId = 0));
}(
  // Array containing all module definitions.
  [
    // Module 0: The application's entry point.
    function (currentModule, currentExports, localRequire) {
      // This module requires module 1 and calls it with the content read from /dev/stdin.
      localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8"));
    },

    // Module 1: Contains the main graph processing logic.
    function (currentModule, currentExports, localRequire) {
      "use strict";

      // A utility function to safely extract elements from an iterable,
      // handling both arrays and iterators, with an optional limit.
      function extractElements(iterableInput, limitCount) {
        // If the input is already an array, return it directly.
        if (Array.isArray(iterableInput)) {
          return iterableInput;
        }

        // Otherwise, iterate through the input to collect elements.
        var collectedElements = [],
          isIterationDone = true,
          hasIterationError = false,
          iterationErrorObject = void 0; // Stores any error during iteration.

        try {
          for (
            var currentItem,
              iteratorInstance = iterableInput[Symbol.iterator](); // Get the iterator.
            // Loop until iteration is done OR the limitCount is reached.
            !(isIterationDone = (currentItem = iteratorInstance.next()).done) &&
            (collectedElements.push(currentItem.value), !limitCount || collectedElements.length !== limitCount);
            isIterationDone = true // Reset for the next iteration check.
          ) {}
        } catch (err) {
          // Catch any errors that occur during iteration.
          hasIterationError = true;
          iterationErrorObject = err;
        } finally {
          try {
            // If iteration was not completed naturally and the iterator has a return method, call it.
            if (!isIterationDone && iteratorInstance.return != null) {
              iteratorInstance.return();
            }
          } finally {
            // If an error occurred, re-throw it after cleanup.
            if (hasIterationError) {
              throw iterationErrorObject;
            }
          }
        }
        return collectedElements;
      }

      // A custom Queue implementation using a doubly linked list with sentinel nodes.
      class DataQueue {
        constructor() {
          this.itemCount = 0; // Number of items currently in the queue.
          // Sentinel head node (points to the first actual element).
          this.frontNode = { nodeValue: void 0, previousNode: void 0, nextNode: void 0 };
          // Sentinel tail node (points to the last actual element).
          this.backNode = { nodeValue: void 0, previousNode: void 0, nextNode: void 0 };
        }

        // Adds an item to the end of the queue.
        enqueueItem(itemValue) {
          this.itemCount += 1;
          var newNode = { nodeValue: itemValue, previousNode: void 0, nextNode: void 0 };

          if (this.frontNode.nextNode) {
            // If the queue is not empty, insert the new node between the current last node and the tail sentinel.
            this.backNode.previousNode.nextNode = newNode;
            newNode.previousNode = this.backNode.previousNode;
            newNode.nextNode = this.backNode;
            this.backNode.previousNode = newNode;
          } else {
            // If the queue is empty, insert the new node between the head and tail sentinels.
            this.frontNode.nextNode = newNode;
            this.backNode.previousNode = newNode;
            newNode.previousNode = this.frontNode;
            newNode.nextNode = this.backNode;
          }
        }

        // Removes and returns the item from the front of the queue.
        dequeueItem() {
          if (this.itemCount !== 0) {
            this.itemCount -= 1;
            var dequeuedValue = this.frontNode.nextNode.nodeValue; // Get value from the first actual node.
            this.frontNode.nextNode = this.frontNode.nextNode.nextNode; // Bypass the dequeued node.
            this.frontNode.nextNode.previousNode = this.frontNode; // Update the new first node's previous pointer.
            return dequeuedValue;
          }
        }

        // (Optional) Returns all values in the queue as an array.
        retrieveValuesAsArray() {
          for (var valuesArray = [], currentNode = this.frontNode.nextNode; currentNode.nextNode;) {
            valuesArray.push(currentNode.nodeValue);
            currentNode = currentNode.nextNode;
          }
          return valuesArray;
        }
      }

      // The main function exported by this module, which processes the input string.
      currentModule.exports = function (inputDataString) {
        // Split the entire input into individual lines.
        for (
          var inputLines = inputDataString.split("\n"),
            // Parse the first line to get the number of nodes (N) and queries (M).
            parsedDimensions = extractElements(
              inputLines[0].split(" ").map(function (strNum) {
                return Number(strNum); // Convert string numbers to actual numbers.
              }),
              2
            ),
            nodeCount = parsedDimensions[0], // N
            queryCount = parsedDimensions[1], // M
            // Initialize an adjacency list to represent the graph.
            adjacencyList = new Array(nodeCount),
            idx = 0; // Loop counter for processing edges.
          idx < nodeCount - 1; // There are N-1 edges for a tree.
          idx++
        ) {
          // Parse each line representing an edge.
          var edgePair = extractElements(
              inputLines[idx + 1].split(" ").map(function (strNum) {
                return Number(strNum) - 1; // Convert to 0-indexed node IDs.
              }),
              2
            ),
            firstNode = edgePair[0],
            secondNode = edgePair[1];

          // Ensure the adjacency list entries for these nodes are initialized as arrays.
          if (!adjacencyList[firstNode]) {
            adjacencyList[firstNode] = [];
          }
          if (!adjacencyList[secondNode]) {
            adjacencyList[secondNode] = [];
          }

          // Add the nodes to each other's adjacency lists (undirected graph).
          adjacencyList[firstNode].push(secondNode);
          adjacencyList[secondNode].push(firstNode);
        }

        // Initialize an array to store values associated with each node, starting with zeros.
        for (
          var nodeValues = new Array(nodeCount).fill(0),
            queryIdx = 0; // Loop counter for processing queries.
          queryIdx < queryCount;
          queryIdx++
        ) {
          // Parse each line representing a query.
          var queryPair = extractElements(
              inputLines[queryIdx + nodeCount].split(" ").map(function (strNum) {
                return Number(strNum); // Convert string numbers to actual numbers.
              }),
              2
            ),
            targetNode = queryPair[0], // The 1-indexed node ID.
            valueToAdd = queryPair[1]; // The value to add to that node.

          // Add the value to the specified node (converting to 0-indexed).
          nodeValues[targetNode - 1] += valueToAdd;
        }

        // Initialize a queue for Breadth-First Search (BFS) or Depth-First Search (DFS) traversal.
        var processingQueue = new DataQueue(),
          // Initialize an array to keep track of visited nodes during traversal.
          visitedNodes = new Array(nodeCount).fill(0);

        // Start the traversal from node 0 (assuming it's the root or an arbitrary starting point).
        processingQueue.enqueueItem(0);

        // Continue processing nodes as long as the queue is not empty.
        for (; processingQueue.itemCount > 0;) {
          var currentNode = processingQueue.dequeueItem(); // Get the next node to process.
          visitedNodes[currentNode] = 1; // Mark the current node as visited.

          // Variables for handling iterator errors in the try-finally block.
          var isIterationDone = true,
            hasIterationError = false,
            errorObject = void 0;

          try {
            // Iterate over all neighbors of the current node.
            for (
              var iteratorResult,
                nodeIterator = adjacencyList[currentNode][Symbol.iterator]();
              !(isIterationDone = (iteratorResult = nodeIterator.next()).done);
              isIterationDone = true
            ) {
              var neighborNode = iteratorResult.value;
              // If the neighbor has not been visited yet.
              if (visitedNodes[neighborNode] !== 1) {
                // Propagate the value from the current node to its unvisited neighbor.
                nodeValues[neighborNode] += nodeValues[currentNode];
                // Enqueue the neighbor for further processing.
                processingQueue.enqueueItem(neighborNode);
              }
            }
          } catch (err) {
            // Catch any errors during neighbor iteration.
            hasIterationError = true;
            errorObject = err;
          } finally {
            try {
              // If iteration was not completed naturally and the iterator has a return method, call it.
              if (!isIterationDone && nodeIterator.return != null) {
                nodeIterator.return();
              }
            } finally {
              // If an error occurred, re-throw it after cleanup.
              if (hasIterationError) {
                throw errorObject;
              }
            }
          }
        }

        // Output the final calculated values for all nodes, joined by spaces.
        console.log(nodeValues.join(" "));
      };
    },

    // Module 2: Provides access to the Node.js 'fs' (file system) module.
    function (currentModule, currentExports) {
      currentModule.exports = localRequire("fs"); // Simply exports the 'fs' module.
    },
  ]
);
