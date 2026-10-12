module.exports = function(moduleDefinitions) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The primary function for loading and executing modules.
  function executeModule(moduleId) {
    // If the module is already in the cache, return its exported values.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not cached, create a new module entry and store it.
    var currentModule = moduleCache[moduleId] = {
      identifier: moduleId, // Unique ID for the module.
      isLoaded: false,      // Flag indicating if the module has finished loading.
      exports: {}           // The object where the module's exports will be placed.
    };

    // Execute the module's definition function.
    // It receives the module object, its exports, and the module loader itself.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, executeModule);

    // Mark the module as fully loaded.
    currentModule.isLoaded = true;
    return currentModule.exports;
  }

  // Attach the collection of module definitions to the loader for internal access.
  executeModule.modules = moduleDefinitions;
  // Attach the module cache to the loader.
  executeModule.cache = moduleCache;

  // Helper to define a getter for a property on an object, ensuring it's enumerable.
  executeModule.defineExport = function(targetObject, propertyName, getterFunction) {
    if (!executeModule.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  // Helper to mark an object as an ES module, adding Symbol.toStringTag and __esModule.
  executeModule.registerESModule = function(targetObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  // Helper for interoperability with CommonJS modules when importing as ES modules (e.g., `import * as name from 'mod'`).
  executeModule.interopRequireWildcard = function(moduleReference, flags) {
    // If flag 1 is set, the reference is a module ID, so load it.
    if (1 & flags) {
      moduleReference = executeModule(moduleReference);
    }
    // If flag 8 is set, the reference is already the exports object.
    if (8 & flags) {
      return moduleReference;
    }
    // If flag 4 is set and it's an object marked as an ES module, return it directly.
    if (4 & flags && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) {
      return moduleReference;
    }

    // Create a new namespace object for the module.
    var namespaceObject = Object.create(null);
    executeModule.registerESModule(namespaceObject);
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: moduleReference
    });

    // If flag 2 is set and it's not a string, copy all properties from the original module.
    if (2 & flags && typeof moduleReference !== "string") {
      for (var propKey in moduleReference) {
        executeModule.defineExport(namespaceObject, propKey, (function(key) {
          return moduleReference[key];
        }).bind(null, propKey));
      }
    }
    return namespaceObject;
  };

  // Helper for interoperability with CommonJS modules when importing a default export (e.g., `import name from 'mod'`).
  executeModule.interopRequireDefault = function(moduleReference) {
    var defaultExportGetter = moduleReference && moduleReference.__esModule ?
      function() {
        return moduleReference.default;
      } :
      function() {
        return moduleReference;
      };
    executeModule.defineExport(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // Utility to check if an object has a specific property directly (not inherited).
  executeModule.hasOwn = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Base path for loading assets (empty in this configuration).
  executeModule.publicPath = "";

  // Set the startup module ID and immediately execute it to begin the application.
  return executeModule(executeModule.startupModule = 0);
}([
  // Module 0: The application's entry point.
  function(entryModule, entryExports, moduleLoader) {
    // Load module 1 (the GCD logic) and pass it the processed input.
    // The input is read from /dev/stdin using module 2 (fs) and split by newlines.
    moduleLoader(1)(
      moduleLoader(2)
      .readFileSync("/dev/stdin", "UTF-8")
      .split("\n")
    );
  },

  // Module 1: Contains the Greatest Common Divisor (GCD) calculation.
  function(gcdModule, gcdExports) {
    // A utility function to safely extract elements from an array-like or iterable object.
    // This mimics Babel's `_slicedToArray` helper.
    function extractArrayElements(inputArray, elementLimit) {
      // If the input is already an array, return it directly.
      if (Array.isArray(inputArray)) {
        return inputArray;
      }

      // Attempt to iterate over the input and collect elements.
      var extractedElements = [];
      var isIterationDone = true;
      var encounteredError = false;
      var errorDuringIteration = undefined;

      try {
        // Obtain an iterator for the input.
        for (
          var arrayIterator = inputArray[Symbol.iterator]();
          !(isIterationDone = (currentIteration = arrayIterator.next()).done) &&
          (extractedElements.push(currentIteration.value), !elementLimit || extractedElements.length !== elementLimit);
          isIterationDone = true
        ) {}
      } catch (err) {
        // Catch any errors during iteration.
        encounteredError = true;
        errorDuringIteration = err;
      } finally {
        // Ensure the iterator is closed if it wasn't fully consumed.
        try {
          if (!isIterationDone && arrayIterator.return != null) {
            arrayIterator.return();
          }
        } finally {
          // Re-throw any error encountered during iteration.
          if (encounteredError) {
            throw errorDuringIteration;
          }
        }
      }
      return extractedElements;
    }

    // The main export of this module: a function that calculates GCD.
    gcdModule.exports = function(inputLines) {
      // Parse the first line of input: split by space, convert to numbers, and destructure.
      var parsedNumbers = extractArrayElements(
        inputLines[0].split(" ").map(function(strValue) {
          return Number(strValue);
        }),
        2
      );

      // Assign the two numbers for GCD calculation.
      var firstNum = parsedNumbers[0];
      var secondNum = parsedNumbers[1];

      // Implement the Euclidean algorithm to find the GCD.
      // `currentX` will hold the current dividend, `currentY` the current divisor/remainder.
      var currentX = Math.floor(secondNum / firstNum);
      var currentY = secondNum % firstNum;

      // Continue as long as the remainder (`currentY`) is not zero.
      while (currentY > 0) {
        var tempVal = currentY; // Store the current remainder.
        currentY = currentX % currentY; // Calculate the new remainder.
        currentX = tempVal; // The old remainder becomes the new dividend.
      }

      // The GCD is the last non-zero remainder, which is now stored in `currentX`.
      console.log(currentX);
    };
  },

  // Module 2: Provides access to Node.js's 'fs' (file system) module.
  function(fsModule, fsExports) {
    fsModule.exports = require("fs");
  }
]);
