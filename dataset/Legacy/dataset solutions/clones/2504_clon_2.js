module.exports = function(moduleDefinitions) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The core 'require' function for the bundled modules.
  function executeModule(moduleId) {
    // If the module is already in the cache, return its exports.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // Create a new module object and store it in the cache.
    var currentModule = moduleCache[moduleId] = {
      identifier: moduleId, // Unique identifier for the module
      isLoaded: false, // Flag to indicate if the module has been loaded
      exports: {} // The exports object for this module
    };

    // Execute the module function, populating its exports.
    // The module function receives:
    // 1. The module object itself.
    // 2. The module's exports object.
    // 3. The local 'require' function.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, executeModule);

    // Mark the module as loaded.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Attach the module definitions to the 'require' function.
  executeModule.moduleMap = moduleDefinitions;

  // Attach the module cache to the 'require' function.
  executeModule.cache = moduleCache;

  // Helper function to define a property on an exports object.
  executeModule.defineExport = function(targetObject, propertyName, getterFunction) {
    if (!executeModule.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable
        get: getterFunction // The getter function for the property
      });
    }
  };

  // Helper function to mark a module as an ES module.
  executeModule.registerModule = function(targetObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  // Helper function for interoperability with non-ES modules.
  executeModule.interopRequire = function(moduleReference, flags) {
    // If flag 1 is set, treat moduleReference as a module ID and require it.
    if (flags & 1) {
      moduleReference = executeModule(moduleReference);
    }
    // If flag 8 is set, return the moduleReference directly.
    if (flags & 8) {
      return moduleReference;
    }
    // If flag 4 is set and it's an object and an ES module, return it directly.
    if (flags & 4 && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) {
      return moduleReference;
    }

    // Create a new object for the default export.
    var defaultExportObject = Object.create(null);
    executeModule.registerModule(defaultExportObject); // Mark as ES module
    Object.defineProperty(defaultExportObject, "default", {
      enumerable: true,
      value: moduleReference
    });

    // If flag 2 is set and it's not a string, copy all properties.
    if (flags & 2 && typeof moduleReference !== "string") {
      for (var propKey in moduleReference) {
        executeModule.defineExport(defaultExportObject, propKey, (function(key) {
          return moduleReference[key];
        }).bind(null, propKey));
      }
    }
    return defaultExportObject;
  };

  // Helper function to get the default export of a module.
  executeModule.getModuleDefault = function(moduleReference) {
    var defaultGetter = moduleReference && moduleReference.__esModule ?
      function() {
        return moduleReference.default;
      } :
      function() {
        return moduleReference;
      };
    executeModule.defineExport(defaultGetter, "a", defaultGetter); // 'a' is a common convention for default export
    return defaultGetter;
  };

  // Helper function to check if an object has a property.
  executeModule.hasOwn = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Public path for assets (empty in this case).
  executeModule.publicPath = "";

  // Start execution by requiring the entry module (module 0).
  return executeModule(executeModule.startupModule = 0);
}([
  /* Module 0: Main entry point */
  function(moduleObj0, exportsObj0, requireFunc0) {
    "use strict";
    // Require the 'fs' module (Module 1).
    var fileSystemModule = requireFunc0(1);
    // Require the main processing function (Module 2) and execute it.
    requireFunc0(2)(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
  },

  /* Module 1: Node.js 'fs' module */
  function(moduleObj1, exportsObj1) {
    moduleObj1.exports = require("fs");
  },

  /* Module 2: Main processing function */
  function(moduleObj2, exportsObj2, requireFunc2) {
    "use strict";
    // Require the InputReader class (Module 3).
    var inputProcessorClass = requireFunc2(3);
    // Require the graph solver function (Module 5).
    var graphSolverFunction = requireFunc2(5);

    // Export a function that takes raw input string.
    moduleObj2.exports = function(rawInputText) {
      // Create an instance of the InputReader with the provided text.
      var readerInstance = new inputProcessorClass(rawInputText);
      // Execute the graph solver with the reader instance.
      graphSolverFunction(readerInstance);
    };
  },

  /* Module 3: InputReader class */
  function(moduleObj3, exportsObj3, requireFunc3) {
    "use strict";
    // Require the Deque/Queue class (Module 4).
    var dataQueueClass = requireFunc3(4);

    // Define the InputReader class.
    moduleObj3.exports = class InputReader {
      constructor(inputString) {
        // Trim whitespace and split the input string by any whitespace.
        var tokenArray = inputString.trim().split(/\s+/g);
        // Initialize an internal queue with the parsed tokens.
        this.inputQueue = new dataQueueClass(tokenArray);
      }

      // Method to dequeue and return the next string token.
      readString() {
        return this.inputQueue.deq();
      }

      // Method to dequeue, parse as integer, and return the next token.
      readInteger() {
        return parseInt(this.inputQueue.deq(), 10);
      }

      // Method to clear the internal queue.
      finishReading() {
        this.inputQueue.clear();
      }
    };
  },

  /* Module 4: Deque/Queue class */
  function(moduleObj4, exportsObj4, requireFunc4) {
    "use strict";
    // Define the Deque class.
    moduleObj4.exports = class Deque {
      constructor() {
        // Initialize with an optional array of elements, defaulting to empty.
        var initialElements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        this.elementCount = initialElements.length; // Current number of elements
        this.elementStorage = initialElements; // Array to store elements
        this.readIndex = 0; // Index for dequeuing elements
      }

      // Method to enqueue a new item.
      enqueue(newItem) {
        this.elementCount += 1;
        this.elementStorage.push(newItem);
      }

      // Method to dequeue an item from the front.
      dequeue() {
        var dequeuedItem = this.elementStorage[this.readIndex];
        this.elementCount -= 1;
        this.readIndex += 1;
        return dequeuedItem;
      }

      // Method to clear the deque.
      clear() {
        this.elementStorage = [];
        this.elementCount = 0;
        this.readIndex = 0;
      }
    };
  },

  /* Module 5: Graph processing logic */
  function(moduleObj5, exportsObj5, requireFunc5) {
    "use strict";
    // Require the Floyd-Warshall algorithm function (Module 6).
    var floydWarshallAlgorithm = requireFunc5(6);

    // Export the main graph processing function.
    moduleObj5.exports = function(readerInstance) {
      // Read graph parameters: number of nodes, number of edges, max path length.
      var nodeCount = readerInstance.readInteger();
      var edgeCount = readerInstance.readInteger();
      var maxPathLength = readerInstance.readInteger();

      // Initialize an adjacency matrix for the graph.
      // All distances are initially set to a large number (representing infinity).
      var adjMatrix = new Array(nodeCount);
      for (var idx = 0; idx < nodeCount; idx++) {
        adjMatrix[idx] = new Array(nodeCount).fill(9999999999); // A large number for infinity
        adjMatrix[idx][idx] = 0; // Distance to self is 0
      }

      // Read edge information and populate the adjacency matrix.
      for (var edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        var nodeA = readerInstance.readInteger();
        var nodeB = readerInstance.readInteger();
        var edgeWeight = readerInstance.readInteger();
        // Adjust to 0-indexed.
        adjMatrix[nodeA - 1][nodeB - 1] = edgeWeight;
        adjMatrix[nodeB - 1][nodeA - 1] = edgeWeight; // Graph is undirected
      }

      // Apply Floyd-Warshall to find all-pairs shortest paths based on initial edge weights.
      var firstFWResult = floydWarshallAlgorithm(adjMatrix);

      // Re-evaluate adjacency based on maxPathLength.
      // If a path between two nodes is within maxPathLength, consider it an edge with weight 1.
      for (var rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
        for (var colIdx = 0; colIdx < nodeCount; colIdx++) {
          if (firstFWResult[rowIdx][colIdx] <= maxPathLength) {
            adjMatrix[rowIdx][colIdx] = 1;
            adjMatrix[colIdx][rowIdx] = 1; // Ensure symmetry
          } else {
            // If not reachable within maxPathLength, reset to infinity (unless it's self-loop)
            if (rowIdx !== colIdx) {
              adjMatrix[rowIdx][colIdx] = 9999999999;
            }
          }
        }
      }

      // Apply Floyd-Warshall again on the modified adjacency matrix (where edges are 1 or infinity).
      var secondFWResult = floydWarshallAlgorithm(adjMatrix);

      // Read the number of queries.
      var queryCount = readerInstance.readInteger();

      // Process each query.
      for (var queryIdx = 0; queryIdx < queryCount; queryIdx++) {
        var queryNodeA = readerInstance.readInteger();
        var queryNodeB = readerInstance.readInteger();
        // Get the shortest path length from the second Floyd-Warshall result.
        var resultPathLength = secondFWResult[queryNodeA - 1][queryNodeB - 1];

        // Output the result.
        if (resultPathLength === 9999999999) {
          console.log(-1); // Not reachable
        } else {
          console.log(resultPathLength - 1); // Output path length minus 1 (as per problem statement)
        }
      }
    };
  },

  /* Module 6: Floyd-Warshall algorithm implementation */
  function(moduleObj6, exportsObj6, requireFunc6) {
    "use strict";
    // Export the Floyd-Warshall function.
    moduleObj6.exports = function(graphMatrix) {
      var matrixDimension = graphMatrix.length;
      // Create a deep copy of the input graph matrix to store distances.
      var distanceMatrix = [];
      for (var outerIdx = 0; outerIdx < matrixDimension; outerIdx++) {
        distanceMatrix.push(graphMatrix[outerIdx].concat());
      }

      // Floyd-Warshall algorithm:
      // Iterate through all possible intermediate nodes.
      for (var intermediateIdx = 0; intermediateIdx < matrixDimension; intermediateIdx++) {
        // Iterate through all possible source nodes.
        for (var sourceIdx = 0; sourceIdx < matrixDimension; sourceIdx++) {
          // Iterate through all possible destination nodes.
          for (var destIdx = 0; destIdx < matrixDimension; destIdx++) {
            // If the path through the intermediate node is shorter, update the distance.
            if (distanceMatrix[sourceIdx][destIdx] > distanceMatrix[sourceIdx][intermediateIdx] + distanceMatrix[intermediateIdx][destIdx]) {
              distanceMatrix[sourceIdx][destIdx] = distanceMatrix[sourceIdx][intermediateIdx] + distanceMatrix[intermediateIdx][destIdx];
            }
          }
        }
      }
      return distanceMatrix;
    };
  }
]);
