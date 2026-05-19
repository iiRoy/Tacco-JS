module.exports = function (moduleDefinitions) {
  // This object serves as a cache for modules that have already been loaded.
  var moduleCache = {};

  // The core function responsible for loading and executing modules.
  function localRequire(moduleId) {
    // If the module is already in the cache, return its exported value immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not cached, create a new module entry.
    // 'identifier' stores the module's unique ID.
    // 'isLoaded' tracks if the module's code has been executed.
    // 'exports' is the object that will hold the module's public interface.
    var currentModule = moduleCache[moduleId] = {
      identifier: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module's function, passing in the module object, its exports,
    // and the 'localRequire' function itself for internal dependencies.
    moduleDefinitions[moduleId].call(
      currentModule.exports,
      currentModule,
      currentModule.exports,
      localRequire
    );

    // Mark the module as loaded after its function has completed execution.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Attach the original module definitions and the cache to the 'localRequire' function
  // for potential introspection or further use by the bundling system.
  localRequire.modules = moduleDefinitions;
  localRequire.cache = moduleCache;

  // Helper function to define a getter property on an object.
  // This is often used for lazy loading or creating computed properties.
  localRequire.defineGetter = function (targetObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist on the target object.
    if (!localRequire.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable (visible in for...in loops).
        get: getterFunction // The function to call when the property is accessed.
      });
    }
  };

  // Helper function to mark an exports object as an ES module.
  // This adds '__esModule: true' and potentially 'Symbol.toStringTag: "Module"'.
  localRequire.markAsEsModule = function (exportsObject) {
    // Set Symbol.toStringTag for better debugging and type identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, { value: "Module" });
    }
    // Standard flag to indicate an ES module.
    Object.defineProperty(exportsObject, "__esModule", { value: true });
  };

  // Helper function to create a namespace object for a module, handling various import modes.
  localRequire.createNamespace = function (moduleRef, modeFlags) {
    // Mode 1: If the module reference is an ID, resolve it using localRequire.
    if (1 & modeFlags) {
      moduleRef = localRequire(moduleRef);
    }
    // Mode 8: If direct return is indicated, return the module reference as is.
    if (8 & modeFlags) {
      return moduleRef;
    }
    // Mode 4: If it's an ES module object, return it directly.
    if (4 & modeFlags && typeof moduleRef === "object" && moduleRef && moduleRef.__esModule) {
      return moduleRef;
    }

    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    // Mark it as an ES module.
    localRequire.markAsEsModule(namespaceObject);
    // Define a 'default' export pointing to the module reference.
    Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleRef });

    // Mode 2: If not a string and indicated, copy all properties from the module reference
    // to the namespace object as getters.
    if (2 & modeFlags && typeof moduleRef !== "string") {
      for (var propName in moduleRef) {
        localRequire.defineGetter(namespaceObject, propName, (function (prop) {
          return moduleRef[prop];
        }).bind(null, propName));
      }
    }
    return namespaceObject;
  };

  // Helper function to create a getter for a module's default export.
  localRequire.getDefaultExport = function (moduleExports) {
    // If the module is an ES module, the default export is `moduleExports.default`.
    // Otherwise, the entire `moduleExports` object is considered the default.
    var defaultExportGetter = moduleExports && moduleExports.__esModule ?
      function () { return moduleExports.default; } :
      function () { return moduleExports; };
    // Define an 'a' property that also points to the default export getter.
    localRequire.defineGetter(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // Helper function to check if an object has a specific property directly (not inherited).
  localRequire.hasOwn = function (objToCheck, propToFind) {
    return Object.prototype.hasOwnProperty.call(objToCheck, propToFind);
  };

  // Public path for assets (empty in this configuration).
  localRequire.publicPath = "";

  // Set the entry module ID and immediately load and execute it.
  // The result of the entry module is the final export of the entire bundle.
  return localRequire(localRequire.entryModuleId = 0);
}([
  // Module 0: The main entry point of the application.
  function (moduleObj, moduleExports, localRequire) {
    // Read the entire content of /dev/stdin, decode as UTF-8,
    // split it into an array of lines, and pass this array to Module 1.
    localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },

  // Module 1: Contains the primary logic for graph processing and query handling.
  function (moduleObj, moduleExports, localRequire) {
    "use strict";

    // A utility function to safely extract a specified number of elements from an iterable.
    // It mimics array destructuring behavior, providing fallbacks for non-array iterables.
    function extractElements(inputIterable, elementCount) {
      // If the input is already an array, return it directly.
      if (Array.isArray(inputIterable)) {
        return inputIterable;
      }

      // Attempt to iterate over the input and collect elements.
      return (function (iterable, count) {
        var extractedItems = [];
        var isDone = true;
        var hasError = false;
        var errorValue = undefined;

        try {
          // Loop through the iterable, pushing items to 'extractedItems'
          // until the iterator is done or 'count' elements are collected.
          for (
            var valueIterator = iterable[Symbol.iterator]();
            !(isDone = (iteratorItem = valueIterator.next()).done) &&
            (extractedItems.push(iteratorItem.value), !count || extractedItems.length !== count);
            isDone = true
          ) { }
        } catch (err) {
          // Catch any errors during iteration.
          hasError = true;
          errorValue = err;
        } finally {
          try {
            // If the iterator was not fully consumed, call its 'return' method if available.
            if (!isDone && valueIterator.return != null) {
              valueIterator.return();
            }
          } finally {
            // Re-throw any caught errors.
            if (hasError) {
              throw errorValue;
            }
          }
        }
        return extractedItems;
      })(inputIterable, elementCount) ||
        // If the above extraction fails (e.g., input is not iterable), throw a TypeError.
        (function () {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        })();
    }

    // The main function exported by this module, which processes the input lines.
    moduleExports.exports = function (inputLines) {
      // The first line of input contains the total number of nodes (N).
      var nodeCount = Number(inputLines[0]);

      // Initialize an adjacency list to represent the graph.
      // Each element in the array will be a list of neighbors for a given node.
      var graphAdjacencyList = new Array(nodeCount);
      for (var idx = 0; idx < nodeCount; idx++) {
        graphAdjacencyList[idx] = [];
      }

      // The line at index 'nodeCount' contains the start node (S) and target node (T).
      var pathNodes = extractElements(
        inputLines[nodeCount].split(" ").map(function (strNum) {
          return Number(strNum);
        }),
        2
      );
      var startNodeS = pathNodes[0]; // The starting node for queries.
      var targetNodeT = pathNodes[1]; // The special target node.

      // Process the next 'nodeCount - 1' lines, which define the edges of the graph.
      for (var edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
        var edgeData = extractElements(
          inputLines[edgeIdx + 1].split(" ").map(function (strNum) {
            return Number(strNum);
          }),
          3
        );
        var firstNode = edgeData[0];
        var secondNode = edgeData[1];
        var edgeCost = edgeData[2];

        // Add an edge from 'firstNode' to 'secondNode' if 'secondNode' is not the target node.
        // Node IDs are 1-based in input, convert to 0-based for array indexing.
        if (secondNode !== targetNodeT) {
          graphAdjacencyList[firstNode - 1].push({ vertexId: secondNode - 1, weight: edgeCost });
        }
        // Add an edge from 'secondNode' to 'firstNode' if 'firstNode' is not the target node.
        if (firstNode !== targetNodeT) {
          graphAdjacencyList[secondNode - 1].push({ vertexId: firstNode - 1, weight: edgeCost });
        }
      }

      // Initialize an array to store the calculated distances from the 'targetNodeT'
      // to all other nodes. -1 indicates an unvisited node.
      var distancesFromTarget = new Array(nodeCount).fill(-1);
      // Initialize a processing queue (acting as a stack due to 'pop') for traversal.
      // Start with the target node itself, with a distance of 0.
      var processingQueue = [{ vertexId: targetNodeT - 1, currentSum: 0 }];

      // Perform a traversal (DFS-like due to 'pop') starting from the target node.
      while (processingQueue.length > 0) {
        var currentItem = processingQueue.pop(); // Get the current node and its accumulated distance.
        var neighborCount = graphAdjacencyList[currentItem.vertexId].length;

        // Iterate through all neighbors of the current node.
        for (var neighborIdx = 0; neighborIdx < neighborCount; neighborIdx++) {
          var neighborInfo = graphAdjacencyList[currentItem.vertexId][neighborIdx];

          // If this neighbor has not been visited yet (its distance is -1).
          if (distancesFromTarget[neighborInfo.vertexId] === -1) {
            // Calculate the distance to this neighbor.
            var calculatedDistance = currentItem.currentSum + neighborInfo.weight;
            // Update the distance in the 'distancesFromTarget' array.
            distancesFromTarget[neighborInfo.vertexId] = calculatedDistance;
            // Add the neighbor to the processing queue.
            processingQueue.push({ vertexId: neighborInfo.vertexId, currentSum: calculatedDistance });
          }
        }
      }

      // Process the remaining 'startNodeS' lines as queries.
      for (var queryIdx = 0; queryIdx < startNodeS; queryIdx++) {
        // Each query line contains two node IDs.
        var queryNodes = extractElements(
          inputLines[queryIdx + nodeCount + 1].split(" ").map(function (strNum) {
            return Number(strNum);
          }),
          2
        );
        var queryStartNode = queryNodes[0];
        var queryEndNode = queryNodes[1];

        // Calculate the total path cost by summing the distances from 'targetNodeT'
        // to 'queryStartNode' and 'queryEndNode'.
        var totalPathCost = distancesFromTarget[queryStartNode - 1] + distancesFromTarget[queryEndNode - 1];
        // Print the calculated total path cost to standard output.
        console.log(totalPathCost);
      }
    };
  },

  // Module 2: Provides access to Node.js's built-in 'fs' (file system) module.
  function (moduleObj, moduleExports) {
    moduleObj.exports = localRequire("fs");
  }
]);
