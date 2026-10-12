module.exports = function(modMap) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The core module loading function.
  function loadModule(moduleId) {
    // If the module is already in the cache, return its exports.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not, create a new module entry in the cache.
    var currentModule = moduleCache[moduleId] = {
      i: moduleId, // Module ID
      l: false, // Loaded flag
      exports: {} // Exports object
    };

    // Execute the module function, passing module, exports, and the require function.
    modMap[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

    // Mark the module as loaded.
    currentModule.l = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Store the module definitions on the loader function itself.
  loadModule.modules = modMap;

  // Store the module cache on the loader function.
  loadModule.cache = moduleCache;

  // Helper to define a getter function for a property on an object.
  loadModule.definePropertyGetter = function(targetObject, propertyName, getterFunction) {
    // Check if the property already exists.
    if (!loadModule.hasOwn(targetObject, propertyName)) {
      // If not, define it with an enumerable getter.
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  // Helper to mark a module as an ES module.
  loadModule.registerESModule = function(targetModule) {
    // Set Symbol.toStringTag for better module identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Mark as an ES module.
    Object.defineProperty(targetModule, "__esModule", {
      value: true
    });
  };

  // Helper for interoperability with non-ES modules (wildcard import).
  loadModule.interopRequireWildcard = function(moduleReference, modeFlags) {
    // If modeFlags indicates a direct module reference (1), just return it.
    if (modeFlags & 1) {
      moduleReference = loadModule(moduleReference);
    }
    // If modeFlags indicates an object and it's already an ES module (4), return it.
    if (modeFlags & 4 && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) {
      return moduleReference;
    }

    // Otherwise, create a new namespace object.
    var namespaceObject = Object.create(null);
    loadModule.registerESModule(namespaceObject); // Mark as ES module.

    // Define 'default' property pointing to the module reference.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: moduleReference
    });

    // If modeFlags indicates a string (2) and it's not a string,
    // iterate over its properties and define getters for them.
    if (modeFlags & 2 && typeof moduleReference !== "string") {
      for (var propKey in moduleReference) {
        loadModule.definePropertyGetter(namespaceObject, propKey, (function(currentPropKey) {
          return moduleReference[currentPropKey];
        }).bind(null, propKey));
      }
    }
    return namespaceObject;
  };

  // Helper for interoperability with non-ES modules (default import).
  loadModule.interopRequireDefault = function(moduleExports) {
    // If it's an ES module and has a 'default' export, return a getter for it.
    var defaultExportGetter = moduleExports && moduleExports.__esModule ?
      function() {
        return moduleExports.default;
      } :
      function() {
        return moduleExports;
      };
    // Define a getter 'a' for the default export.
    loadModule.definePropertyGetter(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // Helper to check if an object has a specific property.
  loadModule.hasOwn = function(objectToCheck, keyToCheck) {
    return Object.prototype.hasOwnProperty.call(objectToCheck, keyToCheck);
  };

  // Public path for assets (empty in this case).
  loadModule.publicPath = "";

  // Start execution by loading the startup module (module 0).
  return loadModule(loadModule.startupModule = 0);
}([
  /* Module 0 */
  function(moduleObj0, exportObj0, reqFunc0) {
    // Read input from stdin, then pass it to module 1's exported function.
    reqFunc0(1)(reqFunc0(2).readFileSync("/dev/stdin", "UTF-8"));
  },
  /* Module 1 */
  function(moduleObj1, exportObj1) {
    // Helper function to safely destructure arrays.
    function extractArrayElements(sourceArray, elementCount) {
      // If it's already an array, return it directly.
      if (Array.isArray(sourceArray)) {
        return sourceArray;
      }

      // If it's an iterable, try to extract elements up to elementCount.
      var collectedElements = [];
      var isIterationDone = true;
      var hadError = false;
      var errorValue = undefined;
      try {
        for (var iteratorInstance = sourceArray[Symbol.iterator](); !(isIterationDone = (currentIterationItem = iteratorInstance.next()).done) && (collectedElements.push(currentIterationItem.value), !elementCount || collectedElements.length !== elementCount); isIterationDone = true);
      } catch (err) {
        hadError = true;
        errorValue = err;
      } finally {
        try {
          if (!isIterationDone && iteratorInstance["return"] != null) {
            iteratorInstance["return"]();
          }
        } finally {
          if (hadError) {
            throw errorValue;
          }
        }
      }
      return collectedElements;
    }

    // The main logic for this module.
    moduleObj1.exports = function(inputData) {
      // Parse the first line of input into four numbers.
      var parsedValues = extractArrayElements(inputData.split("\n")[0].split(" ").map(function(strVal) {
        return Number(strVal);
      }), 4);

      // Destructure the parsed numbers.
      var firstVal = parsedValues[0];
      var secondVal = parsedValues[1];
      var thirdVal = parsedValues[2];
      var fourthVal = parsedValues[3];

      // Calculate the total range length.
      var rangeLength = secondVal - firstVal + 1;

      // Calculate the final answer using inclusion-exclusion principle.
      // Total numbers in range - (multiples of C) - (multiples of D) + (multiples of C*D)
      var finalAnswer = rangeLength - (Math.floor(rangeLength / thirdVal) + Math.floor(rangeLength / fourthVal) - Math.floor(rangeLength / (thirdVal * fourthVal)));

      // Print the result to the console.
      console.log(finalAnswer);
    };
  },
  /* Module 2 */
  function(moduleObj2, exportObj2) {
    // This module simply exports the 'fs' (file system) built-in module.
    moduleObj2.exports = require("fs");
  }
]);
