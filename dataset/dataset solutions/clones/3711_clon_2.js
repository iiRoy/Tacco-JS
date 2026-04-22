module.exports = function (moduleDefinitions) {
  // A cache for already loaded modules, preventing redundant execution.
  var loadedModulesCache = {};

  /**
   * Universal module loader / "require" function for the bundled application.
   * @param {number} moduleId - The unique identifier for the module to load.
   * @returns {object} The exports object of the requested module.
   */
  function obtainModule(moduleId) {
    // If the module is already in the cache, return its exports immediately.
    if (loadedModulesCache[moduleId]) {
      return loadedModulesCache[moduleId].exports;
    }

    // If not cached, create a new module descriptor and add it to the cache.
    // This descriptor holds the module's ID, a flag for its loaded state,
    // and an empty exports object to be populated.
    var moduleDescriptor = loadedModulesCache[moduleId] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module function, passing the module descriptor,
    // its exports object, and this very loader function.
    moduleDefinitions[moduleId].call(moduleDescriptor.exports, moduleDescriptor, moduleDescriptor.exports, obtainModule);

    // Mark the module as loaded after its execution.
    moduleDescriptor.isLoaded = true;

    // Return the populated exports object.
    return moduleDescriptor.exports;
  }

  // Store the collection of module definitions on the loader for potential introspection.
  obtainModule.moduleSources = moduleDefinitions;

  // Store the module cache on the loader for direct access.
  obtainModule.cachedModules = loadedModulesCache;

  /**
   * Utility to define an enumerable getter property on an object.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} valueGetter - A function that returns the value of the property.
   */
  obtainModule.defineGetter = function (targetObject, propertyName, valueGetter) {
    // Only define the property if it doesn't already exist on the target object.
    if (!obtainModule.hasOwnProp(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: valueGetter
      });
    }
  };

  /**
   * Sets up CommonJS module compatibility for a given exports object.
   * This includes setting `Symbol.toStringTag` and `__esModule`.
   * @param {object} exportObject - The exports object to configure.
   */
  obtainModule.setupInterop = function (exportObject) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    Object.defineProperty(exportObject, '__esModule', {
      value: true
    });
  };

  /**
   * Creates a namespace object for interop compatibility, handling various import modes.
   * @param {any} targetModule - The module or its exports to create a namespace from.
   * @param {number} interopMode - Bitmask indicating the import type.
   *   1 = CommonJS `require` call, load the module first.
   *   8 = Return as-is if already a module.
   *   4 = If object and `__esModule` is true, return as-is.
   *   2 = If not string, define properties for all exports.
   * @returns {object} The interop namespace object.
   */
  obtainModule.createInteropNamespace = function (targetModule, interopMode) {
    if (1 & interopMode) {
      targetModule = obtainModule(targetModule);
    }
    if (8 & interopMode) {
      return targetModule;
    }
    if (4 & interopMode && typeof targetModule === 'object' && targetModule && targetModule.__esModule) {
      return targetModule;
    }
    var namespaceObject = Object.create(null);
    obtainModule.setupInterop(namespaceObject);
    Object.defineProperty(namespaceObject, 'default', {
      enumerable: true,
      value: targetModule
    });
    if (2 & interopMode && typeof targetModule !== 'string') {
      for (var propertyKey in targetModule) {
        obtainModule.defineGetter(namespaceObject, propertyKey, (function (currentKey) {
          return targetModule[currentKey];
        }).bind(null, propertyKey));
      }
    }
    return namespaceObject;
  };

  /**
   * Creates a getter function for the default export of a module.
   * This is used for compatibility with both ES modules and CommonJS.
   * @param {object} potentialModule - The module's exports object.
   * @returns {function} A function that returns the default export.
   */
  obtainModule.getDefaultExport = function (potentialModule) {
    var defaultExportAccessor = potentialModule && potentialModule.__esModule ?
      function () {
        return potentialModule['default'];
      } :
      function () {
        return potentialModule;
      };
    obtainModule.defineGetter(defaultExportAccessor, 'a', defaultExportAccessor);
    return defaultExportAccessor;
  };

  /**
   * Checks if an object has a specified property using `Object.prototype.hasOwnProperty.call`.
   * @param {object} checkObject - The object to check.
   * @param {string} checkProperty - The name of the property to look for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  obtainModule.hasOwnProp = function (checkObject, checkProperty) {
    return Object.prototype.hasOwnProperty.call(checkObject, checkProperty);
  };

  // The public path for loading additional assets (often left empty for local bundles).
  obtainModule.publicPath = '';

  // Execute the entry module (module 0) and thus start the application.
  obtainModule(obtainModule.entryPoint = 0);

}([
  /* Module 0: Entry Point */
  function (entryModule, entryExports, requestDependency) {
    // This module reads input from stdin, processes it using another module,
    // and then passes the result to a third module for further processing/output.

    // 1. Request the module at ID 2 (likely 'fs' for file system operations).
    // 2. Use 'fs.readFileSync' to read data from '/dev/stdin' with UTF-8 encoding.
    // 3. Split the read content by newline characters to get an array of lines.
    // 4. Pass this array of lines to the function exported by module ID 1.
    requestDependency(1)(
      requestDependency(2)
      .readFileSync("/dev/stdin", "UTF-8")
      .split("\n")
    );
  },

  /* Module 1: Core Logic for Data Processing */
  function (processingModule, processingExports) {
    // This module exports a function that takes an array of strings (input lines)
    // and performs a specific calculation, then prints the result to console.

    processingModule.exports = function (inputLines) {
      // Parse the first line to get the count of elements.
      var elementCount = Number(inputLines[0]);

      // Parse the second line, split by space, and convert each part to a number.
      var originalValues = inputLines[1].split(" ").map(function (stringValue) {
        return Number(stringValue);
      });

      // Initialize an array to hold adjusted values, filled with zeros.
      var adjustedValues = new Array(elementCount).fill(0);

      // Adjust each value by subtracting its index and 1.
      for (var indexCounter = 0; indexCounter < elementCount; indexCounter++) {
        adjustedValues[indexCounter] = originalValues[indexCounter] - indexCounter - 1;
      }

      // Sort the adjusted values in ascending order.
      adjustedValues.sort(function (valA, valB) {
        return valA - valB;
      });

      // Determine the median of the sorted adjusted values.
      var computedMedian = 0;
      computedMedian = elementCount % 2 === 0 ?
        (adjustedValues[elementCount / 2 - 1] + adjustedValues[elementCount / 2]) / 2 :
        adjustedValues[Math.floor(elementCount / 2)];

      // Calculate the sum of absolute differences from the median.
      var totalDifference = 0;
      for (var iterateIndex = 0; iterateIndex < elementCount; iterateIndex++) {
        totalDifference += Math.abs(adjustedValues[iterateIndex] - computedMedian);
      }

      // Output the final calculated sum.
      console.log(totalDifference);
    };
  },

  /* Module 2: File System Dependency */
  function (fileSystemModule, fileSystemExports) {
    // This module simply exports the native 'fs' (file system) module,
    // making it available to other parts of the bundled application.
    fileSystemModule.exports = require("fs");
  }
]));