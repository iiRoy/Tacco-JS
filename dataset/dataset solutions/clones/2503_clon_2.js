module.exports = function(moduleDefinitions) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The central function responsible for loading and executing modules.
  function moduleLoader(moduleId) {
    // If the requested module is already in the cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not cached, create a new module object and store it in the cache.
    var moduleObject = moduleCache[moduleId] = {
      id: moduleId, // The module's unique identifier.
      loaded: false, // Flag indicating if the module has finished loading.
      exports: {} // The object that will hold the module's exported values.
    };

    // Execute the module's definition function.
    // The 'this' context is set to moduleObject.exports.
    // Arguments passed are: moduleObject, moduleObject.exports, and the moduleLoader itself (for local 'require').
    moduleDefinitions[moduleId].call(
      moduleObject.exports,
      moduleObject,
      moduleObject.exports,
      moduleLoader
    );

    // Mark the module as fully loaded after execution.
    moduleObject.loaded = true;

    // Return the exports of the newly loaded module.
    return moduleObject.exports;
  }

  // Attach the original module definitions to the loader for internal use.
  moduleLoader.moduleDefinitions = moduleDefinitions;
  // Attach the module cache to the loader.
  moduleLoader.cache = moduleCache;

  // Helper function to define a getter property on an exports object.
  moduleLoader.defineExport = function(exportsObject, propertyName, getterFunction) {
    // Only define if the property doesn't already exist.
    if (!moduleLoader.hasOwn(exportsObject, propertyName)) {
      Object.defineProperty(exportsObject, propertyName, {
        enumerable: true, // Make the property enumerable.
        get: getterFunction // The function to call when the property is accessed.
      });
    }
  };

  // Helper function to mark an exports object as an ES module.
  moduleLoader.markAsEsModule = function(exportsObject) {
    // Set Symbol.toStringTag for better debugging in some environments.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set the __esModule flag to true.
    Object.defineProperty(exportsObject, "__esModule", {
      value: true
    });
  };

  // Helper function to create a namespace object for a module.
  moduleLoader.createNamespace = function(moduleValue, flags) {
    // Flag 1: If set, the moduleValue is a module ID and needs to be loaded.
    if (flags & 1) {
      moduleValue = moduleLoader(moduleValue);
    }
    // Flag 8: If set, return the moduleValue directly (it's already a namespace or raw value).
    if (flags & 8) {
      return moduleValue;
    }
    // Flag 4: If set, and moduleValue is an object and already an ES module, return it directly.
    if (flags & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    // Mark it as an ES module.
    moduleLoader.markAsEsModule(namespaceObject);
    // Define a 'default' export pointing to the moduleValue.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: moduleValue
    });

    // Flag 2: If set, and moduleValue is not a string, copy all its properties as getters.
    if (flags & 2 && typeof moduleValue !== "string") {
      for (var key in moduleValue) {
        moduleLoader.defineExport(
          namespaceObject,
          key,
          (function(currentKey) {
            return moduleValue[currentKey];
          }).bind(null, key) // Bind 'key' to the inner function to capture its value.
        );
      }
    }
    return namespaceObject;
  };

  // Helper function to get the default export of a module.
  moduleLoader.getDefaultExport = function(moduleValue) {
    var defaultExportGetter = moduleValue && moduleValue.__esModule ?
      // If it's an ES module, return its 'default' property.
      function() {
        return moduleValue.default;
      } :
      // Otherwise, the moduleValue itself is the default export.
      function() {
        return moduleValue;
      };
    // Define a property 'a' on the getter function itself, pointing to the getter.
    moduleLoader.defineExport(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // Helper function to check if an object has its own property.
  moduleLoader.hasOwn = function(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };

  // Public path for assets (empty in this specific setup).
  moduleLoader.publicPath = "";

  // Start the application by loading the entry module (module ID 0).
  return moduleLoader(moduleLoader.moduleEntry = 0);
}([
  /* Module 0: Main Application Entry Point */
  function(module, moduleExports, localRequire) {
    "use strict";
    // Import the Node.js 'fs' (file system) module.
    var fileSystem = localRequire(1);
    // Read the entire content of /dev/stdin as a UTF-8 string.
    // Then, pass this string to the main input processing function (Module 2).
    localRequire(2)(fileSystem.readFileSync("/dev/stdin", "utf8"));
  },

  /* Module 1: File System Module Wrapper */
  function(module, moduleExports) {
    // Directly export the Node.js 'fs' module.
    module.exports = require("fs");
  },

  /* Module 2: Input Processing Orchestrator */
  function(module, moduleExports, localRequire) {
    "use strict";
    // Import the custom InputReader class (Module 3).
    var inputParserClass = localRequire(3);
    // Import the main algorithm logic function (Module 5).
    var processInputData = localRequire(5);

    // Export a function that takes the raw input string.
    module.exports = function(rawInputString) {
      // Create an instance of the InputReader to handle parsing.
      var readerInstance = new inputParserClass(rawInputString);
      // Pass the reader instance to the main algorithm for processing.
      processInputData(readerInstance);
    };
  },

  /* Module 3: InputReader Class Definition */
  function(module, moduleExports, localRequire) {
    "use strict";
    // Import the custom Queue class (Module 4).
    var tokenQueueClass = localRequire(4);

    // Define the InputReader class for convenient input parsing.
    module.exports = class InputReader {
      constructor(rawInputString) {
        // Trim leading/trailing whitespace and split the input string by any whitespace.
        var inputTokens = rawInputString.trim().split(/\s+/g);
        // Initialize an internal queue with these parsed tokens.
        this.inputQueue = new tokenQueueClass(inputTokens);
      }

      // Retrieves the next raw string token from the input queue.
      readNextRaw() {
        return this.inputQueue.dequeue();
      }

      // Retrieves the next token, parses it as an integer (base 10), and returns it.
      readNextInt() {
        return parseInt(this.inputQueue.dequeue(), 10);
      }

      // Clears the internal input queue, effectively resetting the reader.
      finishReading() {
        this.inputQueue.clear();
      }
    };
  },

  /* Module 4: Queue Class Definition */
  function(module, moduleExports, localRequire) {
    "use strict";
    // Define a simple Queue class.
    module.exports = class Queue {
      constructor() {
        // Initialize with an optional array of elements.
        // If no array is provided, it defaults to an empty array.
        var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.currentSize = initialElements.length; // Current number of elements in the queue.
        this.queueElements = initialElements; // The underlying array storing queue elements.
        this.currentIndex = 0; // The index of the next element to dequeue.
      }

      // Adds an element to the end of the queue.
      enqueue(elementToAdd) {
        this.currentSize += 1;
        this.queueElements.push(elementToAdd);
      }

      // Removes and returns the element at the front of the queue.
      dequeue() {
        var dequeuedElement = this.queueElements[this.currentIndex];
        this.currentSize -= 1;
        this.currentIndex += 1;
        return dequeuedElement;
      }

      // Resets the queue to an empty state.
      clear() {
        this.queueElements = [];
        this.currentSize = 0;
        this.currentIndex = 0;
      }
    };
  },

  /* Module 5: Main Algorithm Logic (Graph Processing) */
  function(module, moduleExports, localRequire) {
    "use strict";
    // Import the Floyd-Warshall algorithm implementation (Module 6).
    var calculateAllPairsShortestPaths = localRequire(6);

    // Export the main function that processes graph input and queries.
    module.exports = function(inputReaderInstance) {
      // A large number used to represent unreachable paths (infinity).
      var infinityValue = 99999999999;

      // Read graph parameters from the input.
      var numVertices = inputReaderInstance.readNextInt(); // Number of nodes in the graph.
      var numEdges = inputReaderInstance.readNextInt(); // Number of direct connections.
      var maxPathLength = inputReaderInstance.readNextInt(); // Maximum allowed path length for a "valid" connection.

      // Initialize an adjacency matrix for the graph.
      // All distances are initially set to infinity.
      var adjacencyMatrix = new Array(numVertices);
      for (var vertexIndex = 0; vertexIndex < numVertices; vertexIndex++) {
        adjacencyMatrix[vertexIndex] = new Array(numVertices).fill(infinityValue);
      }

      // Populate the adjacency matrix with given edge weights.
      for (var edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        var startNode = inputReaderInstance.readNextInt();
        var endNode = inputReaderInstance.readNextInt();
        var edgeWeight = inputReaderInstance.readNextInt();
        // Adjust node indices to be 0-based.
        adjacencyMatrix[startNode - 1][endNode - 1] = edgeWeight;
        adjacencyMatrix[endNode - 1][startNode - 1] = edgeWeight; // Assuming an undirected graph.
      }

      // First application of Floyd-Warshall to find all-pairs shortest paths
      // based on the original edge weights.
      var firstShortestPaths = calculateAllPairsShortestPaths(adjacencyMatrix);

      // Re-evaluate the adjacency matrix based on the 'maxPathLength' threshold.
      // If a path from 'firstShortestPaths' is within 'maxPathLength',
      // it's considered a direct connection with cost 1 in the new graph.
      // Otherwise, it remains infinity.
      for (var rowIdx = 0; rowIdx < numVertices; rowIdx++) {
        for (var colIdx = 0; colIdx < numVertices; colIdx++) {
          if (firstShortestPaths[rowIdx][colIdx] <= maxPathLength) {
            adjacencyMatrix[rowIdx][colIdx] = 1;
          } else {
            adjacencyMatrix[rowIdx][colIdx] = infinityValue;
          }
        }
      }

      // Second application of Floyd-Warshall on the modified adjacency matrix.
      // This calculates shortest paths in terms of "hops" (cost 1 per valid connection).
      var secondShortestPaths = calculateAllPairsShortestPaths(adjacencyMatrix);

      // Read the number of queries to process.
      var numQueries = inputReaderInstance.readNextInt();
      // An array to store the results for each query.
      var queryResults = [];

      // Process each query.
      for (var queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        var queryStart = inputReaderInstance.readNextInt();
        var queryEnd = inputReaderInstance.readNextInt();
        // Retrieve the calculated path length from the second shortest paths matrix.
        var calculatedPath = secondShortestPaths[queryStart - 1][queryEnd - 1];

        // If the path is infinity, it means no valid path exists, so push -1.
        // Otherwise, push (path length - 1) as the result.
        // (This implies the problem asks for the number of edges/hops, not total weight).
        if (calculatedPath === infinityValue) {
          queryResults.push(-1);
        } else {
          queryResults.push(calculatedPath - 1);
        }
      }

      // Print all collected query results, each on a new line.
      console.log(queryResults.join("\n"));
    };
  },

  /* Module 6: Floyd-Warshall Algorithm Implementation */
  function(module, moduleExports, localRequire) {
    "use "
    "strict";
    // Export the Floyd-Warshall function.
    module.exports = function(graphMatrix) {
      var matrixDimension = graphMatrix.length;
      // Create a deep copy of the input graph matrix.
      // This copy will be modified to store the shortest distances.
      var distanceMatrix = [];
      for (var copyRowIndex = 0; copyRowIndex < matrixDimension; copyRowIndex++) {
        distanceMatrix.push(graphMatrix[copyRowIndex].concat());
      }

      // The core Floyd-Warshall algorithm.
      // Iterate through all possible intermediate vertices (k).
      for (var intermediateNode = 0; intermediateNode < matrixDimension; intermediateNode++) {
        // Iterate through all possible source vertices (i).
        for (var sourceNode = 0; sourceNode < matrixDimension; sourceNode++) {
          // Iterate through all possible destination vertices (j).
          for (var destNode = 0; destNode < matrixDimension; destNode++) {
            // If the path from source to destination via the intermediate node
            // is shorter than the currently known path, update the distance.
            if (distanceMatrix[sourceNode][destNode] > distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode]) {
              distanceMatrix[sourceNode][destNode] = distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode];
            }
          }
        }
      }
      // Return the matrix containing all-pairs shortest paths.
      return distanceMatrix;
    };
  }
]);
