(function (moduleDefinitionsList) {
  /* This is a module caching mechanism, similar to Webpack's runtime. */

  // A registry to store already loaded modules.
  var loadedModuleCache = {};

  /**
   * Retrieves a module from the cache or executes its definition to load it.
   * @param {number} requestedModuleId The unique identifier for the module.
   * @returns {object} The exported values from the module.
   */
  function accessModule(requestedModuleId) {
    // If the module is already in our cache, return its exports immediately.
    if (loadedModuleCache[requestedModuleId]) {
      return loadedModuleCache[requestedModuleId].moduleExports;
    }

    // If not cached, create a new module entry.
    var currentModuleInstance = (loadedModuleCache[requestedModuleId] = {
      idKey: requestedModuleId, // The module's internal identifier.
      isLoaded: false, // Flag to indicate if the module has finished loading.
      moduleExports: {}, // The object where the module will put its exports.
    });

    // Execute the module's definition function.
    // The definition function receives the module instance, its exports object,
    // and the `accessModule` function itself for internal module dependencies.
    moduleDefinitionsList[requestedModuleId].call(
      currentModuleInstance.moduleExports,
      currentModuleInstance,
      currentModuleInstance.moduleExports,
      accessModule
    );

    // Mark the module as loaded after execution.
    currentModuleInstance.isLoaded = true;
    return currentModuleInstance.moduleExports;
  }

  // Attach the list of module definitions to the `accessModule` function for reference.
  accessModule.moduleSources = moduleDefinitionsList;

  // Attach the module cache to `accessModule` for debugging or introspection.
  accessModule.moduleCache = loadedModuleCache;

  /**
   * Defines a getter property on an object, if it doesn't already exist.
   * This is used for lazy loading or computed exports.
   * @param {object} targetObject The object on which to define the property.
   * @param {string} propertyName The name of the property to define.
   * @param {Function} propertyGetter The function that will be called to get the property's value.
   */
  accessModule.configureExport = function (targetObject, propertyName, propertyGetter) {
    if (!accessModule.checkProperty(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable (visible in for...in loops).
        get: propertyGetter, // The getter function for this property.
      });
    }
  };

  /**
   * Configures an object as an ES module namespace, adding `Symbol.toStringTag` and `__esModule` properties.
   * @param {object} namespaceObject The object to configure as a namespace.
   */
  accessModule.setNamespace = function (namespaceObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(namespaceObject, Symbol.toStringTag, {
        value: "Module",
      });
    }
    Object.defineProperty(namespaceObject, "__esModule", { value: true });
  };

  /**
   * Converts a module's exports into a standardized namespace object based on provided flags.
   * @param {any} sourceModule The original module or value.
   * @param {number} conversionFlags Bitmask flags indicating the desired conversion behavior.
   * @returns {object} The resulting namespace object.
   */
  accessModule.standardizeNamespace = function (sourceModule, conversionFlags) {
    // Flag 1: If the flag is set, treat `sourceModule` as a module ID and load it.
    if (1 & conversionFlags) {
      sourceModule = accessModule(sourceModule);
    }
    // Flag 8: If the flag is set, and it's already a namespace, return it directly.
    if (8 & conversionFlags) {
      return sourceModule;
    }
    // Flag 4: If the flag is set, and it's an object and already an ES module, return it.
    if (
      4 & conversionFlags &&
      typeof sourceModule === "object" &&
      sourceModule &&
      sourceModule.__esModule
    ) {
      return sourceModule;
    }

    // Create a new empty object to serve as the namespace.
    var newNamespaceObject = Object.create(null);
    accessModule.setNamespace(newNamespaceObject); // Mark it as an ES module.

    // Define the 'default' export for the new namespace.
    Object.defineProperty(newNamespaceObject, "default", {
      enumerable: true,
      value: sourceModule,
    });

    // Flag 2: If the flag is set and `sourceModule` is not a string,
    // copy all its properties to the new namespace as getters.
    if (2 & conversionFlags && typeof sourceModule !== "string") {
      for (var exportKeyName in sourceModule) {
        accessModule.configureExport(
          newNamespaceObject,
          exportKeyName,
          function (key) {
            return sourceModule[key];
          }.bind(null, exportKeyName)
        );
      }
    }
    return newNamespaceObject;
  };

  /**
   * Creates a getter function for a module's default export.
   * @param {object} targetModule The module object.
   * @returns {Function} A function that returns the module's default export.
   */
  accessModule.createDefaultGetter = function (targetModule) {
    var defaultExportRetriever =
      targetModule && targetModule.__esModule
        ? function () {
            return targetModule.default;
          }
        : function () {
            return targetModule;
          };
    // Define an 'a' alias for the default export getter.
    accessModule.configureExport(defaultExportRetriever, "a", defaultExportRetriever);
    return defaultExportRetriever;
  };

  /**
   * Checks if an object has a specific own property.
   * @param {object} objectToCheck The object to inspect.
   * @param {string} propertyName The name of the property to look for.
   * @returns {boolean} True if the object has the property directly, false otherwise.
   */
  accessModule.checkProperty = function (objectToCheck, propertyName) {
    return Object.prototype.hasOwnProperty.call(objectToCheck, propertyName);
  };

  // The public path for assets (often used for dynamic imports, not relevant here).
  accessModule.assetBasePath = "";

  // Kick off the application by loading the entry module (module ID 0).
  accessModule((accessModule.entryModuleId = 0));
})([
  /* Module 0: Application Entry Point */
  function (currentModule, moduleExports, obtainModule) {
    // Load the BFS processing logic (module 1) and immediately execute it.
    // The input for the BFS logic is obtained by reading from standard input
    // using the Node.js 'fs' (file system) module (module 2).
    obtainModule(1)(obtainModule(2).readFileSync("/dev/stdin", "UTF-8"));
  },

  /* Module 1: Breadth-First Search (BFS) Algorithm for Grid Traversal */
  function (currentModule, moduleExports) {
    // This module exports a function that takes raw input text as an argument.
    currentModule.exports = function (rawInputText) {
      // Split the input text into individual lines.
      var inputLinesArray = rawInputText.split("\n");

      // Parse the grid dimensions (rows and columns) from the first line.
      var gridDimensionStrings = inputLinesArray[0].split(" ");
      var totalGridRows = Number(gridDimensionStrings[0]);
      var totalGridCols = Number(gridDimensionStrings[1]);

      // Data structures required for the BFS algorithm.
      var characterGridData = []; // Stores the grid's characters as a 2D array.
      var traversalQueue = []; // The queue for BFS, holding {x, y, distance} objects.
      var cellVisitedStatus = []; // A 2D array tracking which cells have been visited (false = unvisited, true = visited).

      // Initialize a counter for the number of cells yet to be visited.
      var unvisitedCellCount = totalGridRows * totalGridCols;

      // Iterate through the input lines to build the grid and initialize the BFS queue.
      for (var currentGridRowIdx = 0; currentGridRowIdx < totalGridRows; currentGridRowIdx++) {
        var currentLineCharacters = inputLinesArray[currentGridRowIdx + 1].split("");
        // Create a new row for the visited status grid, initially all cells are unvisited (false).
        var visitedFlagsForRow = new Array(totalGridCols).fill(false);
        cellVisitedStatus.push(visitedFlagsForRow); // Add the new row to the visited status grid.

        // Iterate through each character in the current line (row).
        for (var currentGridColIdx = 0; currentGridColIdx < totalGridCols; currentGridColIdx++) {
          // If a cell contains '#', it's an initial source/obstacle, add it to the queue with distance 0.
          if ("#" === currentLineCharacters[currentGridColIdx]) {
            traversalQueue.push({
              coordX: currentGridColIdx,
              coordY: currentGridRowIdx,
              travelDistance: 0,
            });
          }
        }
        characterGridData.push(currentLineCharacters); // Store the character data for the current row.
      }

      // Main BFS traversal loop. Continues as long as there are cells in the queue.
      while (traversalQueue.length > 0) {
        var currentCellCoordinate = traversalQueue.shift(); // Dequeue the next cell to process.

        // The 'true,' is a no-op to preserve original code structure.
        // Check if the current cell has not been visited yet.
        if (true, !cellVisitedStatus[currentCellCoordinate.coordY][currentCellCoordinate.coordX]) {
          // Mark the current cell as visited.
          cellVisitedStatus[currentCellCoordinate.coordY][currentCellCoordinate.coordX] = true;
          unvisitedCellCount--; // Decrement the count of remaining unvisited cells.

          // If all cells have been visited, print the current cell's distance and exit.
          if (unvisitedCellCount <= 0) {
            return void console.log(currentCellCoordinate.travelDistance);
          }

          // Explore all four possible neighbors (right, left, down, up).

          // Check right neighbor:
          if (
            currentCellCoordinate.coordX + 1 < totalGridCols &&
            !cellVisitedStatus[currentCellCoordinate.coordY][currentCellCoordinate.coordX + 1]
          ) {
            traversalQueue.push({
              coordX: currentCellCoordinate.coordX + 1,
              coordY: currentCellCoordinate.coordY,
              travelDistance: currentCellCoordinate.travelDistance + 1,
            });
          }
          // Check left neighbor:
          if (
            currentCellCoordinate.coordX - 1 >= 0 &&
            !cellVisitedStatus[currentCellCoordinate.coordY][currentCellCoordinate.coordX - 1]
          ) {
            traversalQueue.push({
              coordX: currentCellCoordinate.coordX - 1,
              coordY: currentCellCoordinate.coordY,
              travelDistance: currentCellCoordinate.travelDistance + 1,
            });
          }
          // Check down neighbor:
          if (
            currentCellCoordinate.coordY + 1 < totalGridRows &&
            !cellVisitedStatus[currentCellCoordinate.coordY + 1][currentCellCoordinate.coordX]
          ) {
            traversalQueue.push({
              coordX: currentCellCoordinate.coordX,
              coordY: currentCellCoordinate.coordY + 1,
              travelDistance: currentCellCoordinate.travelDistance + 1,
            });
          }
          // Check up neighbor:
          if (
            currentCellCoordinate.coordY - 1 >= 0 &&
            !cellVisitedStatus[currentCellCoordinate.coordY - 1][currentCellCoordinate.coordX]
          ) {
            traversalQueue.push({
              coordX: currentCellCoordinate.coordX,
              coordY: currentCellCoordinate.coordY - 1,
              travelDistance: currentCellCoordinate.travelDistance + 1,
            });
          }
        }
      }
    };
  },

  /* Module 2: File System Dependency */
  function (currentModule, moduleExports) {
    // This module simply exports the Node.js built-in 'fs' (file system) module.
    currentModule.exports = require("fs");
  },
]);