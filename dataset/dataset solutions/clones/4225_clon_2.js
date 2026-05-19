module.exports = function(moduleDefinitions) {
  // This object serves as a cache for modules that have already been loaded.
  var moduleCache = {};

  // This is the core module loading function, similar to 'require'.
  function retrieveModule(moduleId) {
    // If the module is already in the cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not in cache, create a new module entry.
    var currentModuleEntry = moduleCache[moduleId] = {
      id: moduleId, // The unique identifier for this module.
      isLoaded: false, // Flag to track if the module's code has been executed.
      exports: {} // The object that will hold the module's exported values.
    };

    // Execute the module's definition function.
    // It receives the module entry, its exports object, and the 'retrieveModule' function itself.
    moduleDefinitions[moduleId].call(currentModuleEntry.exports, currentModuleEntry, currentModuleEntry.exports, retrieveModule);

    // Mark the module as loaded after its definition function has run.
    currentModuleEntry.isLoaded = true;

    // Return the exports object of the newly loaded module.
    return currentModuleEntry.exports;
  }

  // Store the module definitions array on the loader function for internal use.
  retrieveModule.moduleDefinitions = moduleDefinitions;
  // Store the module cache on the loader function.
  retrieveModule.cache = moduleCache;

  // Helper function to define an enumerable getter for a property on an object.
  retrieveModule.defineExportProperty = function(targetObject, propertyKey, getterFunction) {
    // Only define if the property doesn't already exist.
    if (!retrieveModule.hasOwnProperty(targetObject, propertyKey)) {
      Object.defineProperty(targetObject, propertyKey, {
        enumerable: true, // Make the property enumerable.
        get: getterFunction // The function to call when the property is accessed.
      });
    }
  };

  // Helper function to mark an exports object as an ES module.
  retrieveModule.markAsEsModule = function(exportsObject) {
    // Add Symbol.toStringTag for better debugging and module identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Add the __esModule flag, a common convention for ES modules in CommonJS environments.
    Object.defineProperty(exportsObject, "__esModule", {
      value: true
    });
  };

  // Helper function to create a namespace object from a module's exports.
  retrieveModule.createNamespaceObject = function(moduleValue, modeFlags) {
    // If modeFlags indicates it's a module ID (1 & modeFlags), resolve it.
    if (1 & modeFlags) {
      moduleValue = retrieveModule(moduleValue);
    }
    // If modeFlags indicates it's a CommonJS module (8 & modeFlags), return as is.
    if (8 & modeFlags) {
      return moduleValue;
    }
    // If modeFlags indicates it's an ES module object (4 & modeFlags) and it's an object, return as is.
    if (4 & modeFlags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    // Mark this new object as an ES module.
    retrieveModule.markAsEsModule(namespaceObject);
    // Define a 'default' export pointing to the original module value.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: moduleValue
    });
    // If modeFlags indicates to copy all properties (2 & modeFlags) and the module value is not a string.
    if (2 & modeFlags && typeof moduleValue !== "string") {
      // Iterate over all properties of the original module value.
      for (var propertyName in moduleValue) {
        // Define a getter for each property on the namespace object.
        retrieveModule.defineExportProperty(namespaceObject, propertyName, (function(key) {
          return moduleValue[key];
        }).bind(null, propertyName));
      }
    }
    return namespaceObject;
  };

  // Helper function to create a getter for a module's default export.
  retrieveModule.createDefaultExportGetter = function(moduleExports) {
    var defaultExportAccessor = moduleExports && moduleExports.__esModule ?
      function() {
        return moduleExports.default;
      } :
      function() {
        return moduleExports;
      };
    // Define a property 'a' on the accessor function itself, pointing to the accessor.
    retrieveModule.defineExportProperty(defaultExportAccessor, "a", defaultExportAccessor);
    return defaultExportAccessor;
  };

  // Helper function to check if an object has its own property.
  retrieveModule.hasOwnProperty = function(targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  // Set the public path for assets (empty in this specific bundle).
  retrieveModule.publicPath = "";

  // Execute the entry module (module ID 0) and return its exports.
  return retrieveModule(retrieveModule.entryModuleId = 0);
}([
  /* Module 0: The main application entry point */
  function(moduleObject, exportsObject, localRetrieve) {
    // Call the function exported by module 1, passing it processed input from module 3.
    localRetrieve(1)(
      localRetrieve(3) // Retrieve the 'fs' module.
      .readFileSync("/dev/stdin", "UTF-8") // Read content from standard input as UTF-8.
      .split("\n") // Split the content into an array of lines.
    );
  },

  /* Module 1: Contains the primary logic for processing input and calculating the final result. */
  function(moduleObject, exportsObject, localRetrieve) {
    // A utility function to safely destructure arrays, similar to Babel's _slicedToArray.
    function safeArrayDestructure(inputArray, expectedLength) {
      return (function(arr) {
        if (Array.isArray(arr)) {
          return arr;
        }
      })(inputArray) || (function(arr, len) {
        var collectedElements = [];
        var iterationComplete = false;
        var iterationError = false;
        var caughtError = undefined;
        try {
          for (var itemIterator = arr[Symbol.iterator](), nextValue; !(iterationComplete = (nextValue = itemIterator.next()).done) && (collectedElements.push(nextValue.value), !len || collectedElements.length !== len); iterationComplete = true);
        } catch (err) {
          iterationError = true;
          caughtError = err;
        } finally {
          try {
            if (!iterationComplete && itemIterator["return"] != null) {
              itemIterator["return"]();
            }
          } finally {
            if (iterationError) {
              throw caughtError;
            }
          }
        }
        return collectedElements;
      })(inputArray, expectedLength) || (function() {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      })();
    }

    // Retrieve the all-pairs shortest path algorithm from module 2.
    var calculateShortestPaths = localRetrieve(2);

    // Export the main processing function.
    moduleObject.exports = function(inputLines) {
      // Parse the first line of input to get the number of nodes and edges.
      var parsedFirstLine = safeArrayDestructure(
        inputLines[0].split(" ").map(function(strValue) {
          return Number(strValue);
        }), 2
      );
      var numberOfNodes = parsedFirstLine[0];
      var numberOfEdges = parsedFirstLine[1]; // This variable is declared but not used in the original logic.

      // Initialize an empty array to store the adjacency matrix.
      var graphAdjacencyMatrix = [];
      // Populate the adjacency matrix from the next 10 lines of input.
      for (var currentLineIndex = 0; currentLineIndex < 10; currentLineIndex++) {
        var lineData = inputLines[currentLineIndex + 1].split(" ").map(function(strValue) {
          return Number(strValue);
        });
        graphAdjacencyMatrix.push(lineData);
      }

      // Compute the all-pairs shortest paths using the retrieved algorithm.
      var allShortestPaths = calculateShortestPaths(graphAdjacencyMatrix);

      // Initialize a variable to accumulate the total cost.
      var accumulatedCost = 0;
      // Process the query lines, starting from line 11, for 'numberOfNodes' queries.
      for (var queryIteration = 0; queryIteration < numberOfNodes; queryIteration++) {
        var currentQueryData = inputLines[queryIteration + 11].split(" ").map(function(strValue) {
          return Number(strValue);
        });
        // Iterate through each element in the current query data.
        for (var dataElementIndex = 0; dataElementIndex < numberOfEdges; dataElementIndex++) {
          // If the element is not -1, add the corresponding shortest path cost.
          if (currentQueryData[dataElementIndex] !== -1) {
            accumulatedCost += allShortestPaths[currentQueryData[dataElementIndex]][1]; // Accessing the second element of the path result.
          }
        }
      }
      // Print the final accumulated cost to the console.
      console.log(accumulatedCost);
    };
  },

  /* Module 2: Implementation of the Floyd-Warshall algorithm for all-pairs shortest paths. */
  function(moduleObject, exportsObject, localRetrieve) {
    "use strict"; // Enforce strict mode for this module.

    // Export the Floyd-Warshall function.
    moduleObject.exports = function(inputGraph) {
      var graphDimension = inputGraph.length;
      // Create a new matrix to store distances, initialized with a deep copy of the input graph.
      var distanceResultMatrix = new Array(graphDimension);
      for (var rowCounter = 0; rowCounter < graphDimension; rowCounter++) {
        distanceResultMatrix[rowCounter] = inputGraph[rowCounter].concat(); // Shallow copy each row.
      }

      // The main loops for the Floyd-Warshall algorithm.
      // 'intermediateNode' represents the intermediate vertex in the path.
      for (var intermediateNode = 0; intermediateNode < graphDimension; intermediateNode++) {
        // 'sourceNode' represents the starting vertex.
        for (var sourceNode = 0; sourceNode < graphDimension; sourceNode++) {
          // 'destinationNode' represents the ending vertex.
          for (var destinationNode = 0; destinationNode < graphDimension; destinationNode++) {
            // If the path from 'sourceNode' to 'destinationNode' through 'intermediateNode'
            // is shorter than the currently known direct path, update the distance.
            if (distanceResultMatrix[sourceNode][destinationNode] > distanceResultMatrix[sourceNode][intermediateNode] + distanceResultMatrix[intermediateNode][destinationNode]) {
              distanceResultMatrix[sourceNode][destinationNode] = distanceResultMatrix[sourceNode][intermediateNode] + distanceResultMatrix[intermediateNode][destinationNode];
            }
          }
        }
      }
      return distanceResultMatrix; // Return the matrix containing all-pairs shortest paths.
    };
  },

  /* Module 3: A simple wrapper to re-export the Node.js 'fs' module. */
  function(moduleObject, exportsObject) {
    // Assign the Node.js built-in 'fs' module to this module's exports.
    moduleObject.exports = require("fs");
  }
]);
