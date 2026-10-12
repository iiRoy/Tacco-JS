module.exports = function (moduleDefinitions) {
  // Cache for loaded modules
  var moduleCache = {};

  // Custom require function for modules
  function requireModule(moduleId) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // Create a new module object and add it to the cache
    var currentModule = moduleCache[moduleId] = {
      id: moduleId, // Module identifier
      loaded: false, // Flag to indicate if module is loaded
      exports: {} // The exports object for the module
    };

    // Execute the module function with its exports, module object, and local require
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, requireModule);

    // Mark the module as loaded
    currentModule.loaded = true;

    // Return the module's exports
    return currentModule.exports;
  }

  // Store module definitions and cache on the require function itself
  requireModule.moduleDefinitions = moduleDefinitions;
  requireModule.cache = moduleCache;

  // Define property on exports object
  requireModule.defineExport = function (exportsObject, propertyName, getterFunction) {
    if (!requireModule.hasOwn(exportsObject, propertyName)) {
      Object.defineProperty(exportsObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  // Register module as an ES module
  requireModule.registerModule = function (exportsObject) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    Object.defineProperty(exportsObject, '__esModule', {
      value: true
    });
  };

  // Interop require default for compatibility
  requireModule.interopRequireDefault = function (moduleValue, mode) {
    // If mode bit 1 is set, treat moduleValue as already resolved
    if (mode & 1) {
      moduleValue = requireModule(moduleValue);
    }
    // If mode bit 8 is set, return moduleValue directly
    if (mode & 8) {
      return moduleValue;
    }
    // If mode bit 4 is set and it's an object with __esModule, return it
    if (mode & 4 && typeof moduleValue === 'object' && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }
    // Create a new object for default export
    var defaultExportObject = Object.create(null);
    requireModule.registerModule(defaultExportObject);
    Object.defineProperty(defaultExportObject, 'default', {
      enumerable: true,
      value: moduleValue
    });
    // If mode bit 2 is set and it's not a string, copy all properties
    if (mode & 2 && typeof moduleValue !== 'string') {
      for (var key in moduleValue) {
        requireModule.defineExport(defaultExportObject, key, (function (currentKey) {
          return moduleValue[currentKey];
        }).bind(null, key));
      }
    }
    return defaultExportObject;
  };

  // Create a getter function for default export
  requireModule.createDefaultExportGetter = function (moduleObject) {
    var getter = moduleObject && moduleObject.__esModule ?
      function () {
        return moduleObject.default;
      } :
      function () {
        return moduleObject;
      };
    requireModule.defineExport(getter, 'a', getter);
    return getter;
  };

  // Check if an object has a property
  requireModule.hasOwn = function (object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  // Public path for assets (empty in this case)
  requireModule.publicPath = "";

  // Execute the entry module (module 0)
  return requireModule(requireModule.startupModuleId = 0);
}([
  /* Module 0 */
  function (moduleObject, moduleExports, localRequire) {
    "use strict";
    // Import the 'fs' module
    var fileSystemModule = localRequire(1);
    // Import and execute the main processing function with stdin content
    localRequire(2)(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
  },
  /* Module 1 */
  function (moduleObject, moduleExports) {
    // Export the 'fs' module directly
    moduleObject.exports = require("fs");
  },
  /* Module 2 */
  function (moduleObject, moduleExports, localRequire) {
    "use strict";
    // Import the InputReader class and the graph processing function
    var InputReaderClass = localRequire(3);
    var processGraphData = localRequire(5);

    // Export a function that takes raw input, creates an InputReader, and processes it
    moduleObject.exports = function (rawInputText) {
      var dataReaderInstance = new InputReaderClass(rawInputText);
      processGraphData(dataReaderInstance);
    };
  },
  /* Module 3 */
  function (moduleObject, moduleExports, localRequire) {
    "use strict";
    // Import the Queue class
    var QueueClass = localRequire(4);

    // Export an InputReader class
    moduleObject.exports = class InputReader {
      constructor(initialInput) {
        // Trim whitespace and split input by any whitespace into tokens
        var inputTokens = initialInput.trim().split(/\s+/g);
        // Initialize an internal queue with these tokens
        this.inputQueue = new QueueClass(inputTokens);
      }

      // Method to read the next raw string token
      readNextString() {
        return this.inputQueue.dequeueItem();
      }

      // Method to read the next integer token
      readNextInt() {
        return parseInt(this.inputQueue.dequeueItem(), 10);
      }

      // Method to clear the input queue
      finishReading() {
        this.inputQueue.clearQueue();
      }
    };
  },
  /* Module 4 */
  function (moduleObject, moduleExports, localRequire) {
    "use strict";
    // Export a simple Queue class
    moduleObject.exports = class Queue {
      constructor() {
        // Initialize with an optional array of items, default to empty array
        var initialItems = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.currentSize = initialItems.length; // Current number of items in the queue
        this.queueElements = initialItems; // Array holding the queue elements
        this.readIndex = 0; // Index for the next item to dequeue
      }

      // Add an item to the end of the queue
      enqueueItem(itemToAdd) {
        this.currentSize += 1;
        this.queueElements.push(itemToAdd);
      }

      // Remove and return the item from the front of the queue
      dequeueItem() {
        var retrievedItem = this.queueElements[this.readIndex];
        this.currentSize -= 1;
        this.readIndex += 1;
        return retrievedItem;
      }

      // Clear all items from the queue
      clearQueue() {
        this.queueElements = [];
        this.currentSize = 0;
        this.readIndex = 0;
      }
    };
  },
  /* Module 5 */
  function (moduleObject, moduleExports, localRequire) {
    "use strict";
    // Import the Floyd-Warshall algorithm implementation
    var floydWarshallSolver = localRequire(6);

    // Export the main graph processing function
    moduleObject.exports = function (inputReader) {
      // Read graph parameters: number of nodes, number of edges, and max allowed weight
      var numberOfNodes = inputReader.readNextInt();
      var numberOfEdges = inputReader.readNextInt();
      var maxEdgeWeightThreshold = inputReader.readNextInt();

      // Initialize adjacency matrix with a large value representing infinity
      var graphAdjacencyMatrix = new Array(numberOfNodes);
      for (var nodeIndex = 0; nodeIndex < numberOfNodes; nodeIndex++) {
        graphAdjacencyMatrix[nodeIndex] = new Array(numberOfNodes).fill(9999999999);
      }

      // Read edges and populate the adjacency matrix (undirected graph)
      for (var edgeIndex = 0; edgeIndex < numberOfEdges; edgeIndex++) {
        var startNode = inputReader.readNextInt();
        var endNode = inputReader.readNextInt();
        var weight = inputReader.readNextInt();
        graphAdjacencyMatrix[startNode - 1][endNode - 1] = weight;
        graphAdjacencyMatrix[endNode - 1][startNode - 1] = weight;
      }

      // Calculate all-pairs shortest paths using Floyd-Warshall on the initial graph
      var initialShortestPaths = floydWarshallSolver(graphAdjacencyMatrix);

      // Re-evaluate edges based on the max allowed weight threshold
      // If a path between two nodes is within the threshold, consider it an edge with weight 1
      for (var rowIdx = 0; rowIdx < numberOfNodes; rowIdx++) {
        for (var colIdx = 0; colIdx < numberOfNodes; colIdx++) {
          if (initialShortestPaths[rowIdx][colIdx] <= maxEdgeWeightThreshold) {
            graphAdjacencyMatrix[rowIdx][colIdx] = 1;
          }
        }
      }

      // Calculate all-pairs shortest paths again on the modified graph
      var finalShortestPaths = floydWarshallSolver(graphAdjacencyMatrix);

      // Read and process queries
      var numberOfQueries = inputReader.readNextInt();
      for (var queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
        var queryStartNode = inputReader.readNextInt();
        var queryEndNode = inputReader.readNextInt();
        var pathResult = finalShortestPaths[queryStartNode - 1][queryEndNode - 1];

        // Output result: -1 if no path, otherwise path length - 1
        if (pathResult === 9999999999) {
          console.log(-1);
        } else {
          console.log(pathResult - 1);
        }
      }
    };
  },
  /* Module 6 */
  function (moduleObject, moduleExports, localRequire) {
    "use strict";
    // Export the Floyd-Warshall algorithm function
    moduleObject.exports = function (inputGraphMatrix) {
      var matrixDimension = inputGraphMatrix.length;
      // Create a deep copy of the input matrix to store distances
      var distanceResultMatrix = [];
      for (var copyRow = 0; copyRow < matrixDimension; copyRow++) {
        distanceResultMatrix.push(inputGraphMatrix[copyRow].concat());
      }

      // Floyd-Warshall algorithm: Iterate through all possible intermediate nodes
      for (var intermediateNode = 0; intermediateNode < matrixDimension; intermediateNode++) {
        // Iterate through all possible start nodes
        for (var startNode = 0; startNode < matrixDimension; startNode++) {
          // Iterate through all possible end nodes
          for (var endNode = 0; endNode < matrixDimension; endNode++) {
            // If a shorter path is found through the intermediate node, update the distance
            if (distanceResultMatrix[startNode][endNode] > distanceResultMatrix[startNode][intermediateNode] + distanceResultMatrix[intermediateNode][endNode]) {
              distanceResultMatrix[startNode][endNode] = distanceResultMatrix[startNode][intermediateNode] + distanceResultMatrix[intermediateNode][endNode];
            }
          }
        }
      }
      return distanceResultMatrix;
    };
  }
]);
