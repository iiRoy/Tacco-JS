module.exports = function (moduleDefinitions) {
  // Cache for loaded modules
  var loadedModulesCache = {};

  // The primary module loading function
  function moduleLoader(requestedId) {
    // If module is already in cache, return its exports
    if (loadedModulesCache[requestedId]) {
      return loadedModulesCache[requestedId].exports;
    }

    // Create a new module object and store it in the cache
    var currentModule = loadedModulesCache[requestedId] = {
      moduleId: requestedId, // Identifier of the module
      isLoaded: false,       // Flag to indicate if the module has been loaded
      exports: {}            // The exports object for this module
    };

    // Execute the module function, populating its exports
    moduleDefinitions[requestedId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

    // Mark the module as loaded
    currentModule.isLoaded = true;

    // Return the module's exports
    return currentModule.exports;
  }

  // Store module definitions on the loader for internal use
  moduleLoader.definitions = moduleDefinitions;

  // Store the module cache on the loader
  moduleLoader.cache = loadedModulesCache;

  // Utility to define a getter function for Harmony exports (ES Modules)
  moduleLoader.defineExportGetter = function (exportObject, exportName, valueGetter) {
    if (!moduleLoader.hasOwnProperty(exportObject, exportName)) {
      Object.defineProperty(exportObject, exportName, {
        enumerable: true,
        get: valueGetter
      });
    }
  };

  // Utility to define __esModule property on exports
  moduleLoader.markAsEsModule = function (exportObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exportObject, "__esModule", {
      value: true
    });
  };

  // Utility to create a fake namespace object for compatibility
  moduleLoader.createNamespaceObject = function (moduleValue, lookupMode) {
    // If mode 1, moduleValue is already processed
    if (lookupMode & 1) {
      moduleValue = moduleLoader(moduleValue);
    }
    // If mode 8, return moduleValue directly
    if (lookupMode & 8) {
      return moduleValue;
    }
    // If mode 4 and it's an ES Module, return it
    if (lookupMode & 4 && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Create a new namespace object
    var newNamespace = Object.create(null);
    moduleLoader.markAsEsModule(newNamespace);
    Object.defineProperty(newNamespace, "default", {
      enumerable: true,
      value: moduleValue
    });
    // If mode 2 and not a string, copy all properties
    if (lookupMode & 2 && typeof moduleValue !== "string") {
      for (var propertyKey in moduleValue) {
        moduleLoader.defineExportGetter(newNamespace, propertyKey, (function (currentKey) {
          return moduleValue[currentKey];
        }).bind(null, propertyKey));
      }
    }
    return newNamespace;
  };

  // Utility to get the default export for compatibility
  moduleLoader.getModuleDefaultExport = function (targetModule) {
    var defaultExportGetter = targetModule && targetModule.__esModule ?
      function () {
        return targetModule.default;
      } :
      function () {
        return targetModule;
      };
    moduleLoader.defineExportGetter(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // Utility for Object.prototype.hasOwnProperty.call
  moduleLoader.hasOwnProperty = function (targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Public path for assets (empty string in this case)
  moduleLoader.assetPath = "";

  // Execute the entry point module (module 0)
  return moduleLoader(moduleLoader.startModuleId = 0);
}(
  // Array of module definitions
  [
    /* Module 0: Main application logic */
    function (localModule, localExports, localLoader) {
      // Read input, split by newline, and pass to module 1 for processing
      localLoader(1)(localLoader(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
    },

    /* Module 1: Sorting algorithm */
    function (sortingModule, sortingExports, sortingLoader) {
      "use strict"; // Enable strict mode for this module
      sortingModule.exports = function (inputDataLines) {
        // Parse the first line as the count of elements
        var elementCount = Number(inputDataLines[0]);
        // Parse the second line as space-separated numeric values
        var numericValues = inputDataLines[1].split(" ").map(function (valString) {
          return Number(valString);
        });

        // Create an array of objects, pairing original index with its value
        var indexedItems = [];
        for (var loopCounter = 0; loopCounter < elementCount; loopCounter++) {
          indexedItems.push({
            originalIndex: loopCounter + 1, // Store 1-based index
            itemValue: numericValues[loopCounter]
          });
        }

        // Sort the items based on their numeric values
        indexedItems.sort(function (itemA, itemB) {
          return itemA.itemValue - itemB.itemValue;
        });

        // Extract the original indices in the sorted order
        var finalOrder = [];
        for (var iteratorIndex = 0; iteratorIndex < elementCount; iteratorIndex++) {
          finalOrder.push(indexedItems[iteratorIndex].originalIndex);
        }

        // Output the sorted indices, joined by spaces
        console.log(finalOrder.join(" "));
      };
    },

    /* Module 2: File System module */
    function (fileSystemModule, fileSystemExports) {
      // Export the Node.js 'fs' module
      fileSystemModule.exports = require("fs");
    }
  ]
);