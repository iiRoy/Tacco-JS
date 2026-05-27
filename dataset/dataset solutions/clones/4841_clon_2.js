module.exports = (function(moduleDefinitions) {
  // A cache to store already loaded modules.
  var moduleCache = {};

  // The core function responsible for loading and executing modules.
  function executeModule(moduleId) {
    // If the module is already in the cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not in cache, create a new module object and store it.
    var moduleObject = moduleCache[moduleId] = {
      id: moduleId, // The unique identifier for this module.
      loaded: false, // Flag to indicate if the module has finished loading.
      exports: {} // The object that will hold the module's exports.
    };

    // Execute the module's definition function.
    // The 'this' context is set to moduleObject.exports, and it receives
    // moduleObject, moduleObject.exports, and the executeModule function itself.
    moduleDefinitions[moduleId].call(
      moduleObject.exports,
      moduleObject,
      moduleObject.exports,
      executeModule
    );

    // Mark the module as loaded after its definition function has run.
    moduleObject.loaded = true;

    // Return the module's exports.
    return moduleObject.exports;
  }

  // Store the array of module definitions on the executeModule function for reference.
  executeModule.moduleMap = moduleDefinitions;

  // Store the module cache on the executeModule function.
  executeModule.cache = moduleCache;

  // Helper function to define a getter for an export property.
  executeModule.definePropertyExport = function(targetObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist on the target object.
    if (!executeModule.hasOwnProp(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable.
        get: getterFunction // Set the getter function for the property.
      });
    }
  };

  // Helper function to mark a module as an ES module.
  executeModule.registerEsModule = function(targetObject) {
    // If Symbol.toStringTag is available, set it to 'Module' for better debugging and identification.
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: 'Module'
      });
    }
    // Set the __esModule flag to true, indicating it's an ES module.
    Object.defineProperty(targetObject, '__esModule', {
      value: true
    });
  };

  // Helper function for transpiling modules, handling various export formats.
  executeModule.transpileModule = function(inputModule, flags) {
    // Flag 1: If set, resolve the module ID to its exports first.
    if ((1 & flags)) {
      inputModule = executeModule(inputModule);
    }
    // Flag 8: If set, return the module as is (e.g., for direct module objects).
    if ((8 & flags)) {
      return inputModule;
    }
    // Flag 4: If set and the module is an object and already an ES module, return it directly.
    if ((4 & flags) && typeof inputModule === 'object' && inputModule && inputModule.__esModule) {
      return inputModule;
    }

    // Create a new plain object to hold the transpiled exports.
    var transpiledObject = Object.create(null);
    // Register it as an ES module.
    executeModule.registerEsModule(transpiledObject);
    // Define the 'default' export, pointing to the original module's value.
    Object.defineProperty(transpiledObject, 'default', {
      enumerable: true,
      value: inputModule
    });

    // Flag 2: If set and the module is not a string, copy all its properties as getters.
    if ((2 & flags) && typeof inputModule !== 'string') {
      for (var propName in inputModule) {
        executeModule.definePropertyExport(transpiledObject, propName, (function(key) {
          return inputModule[key];
        }).bind(null, propName));
      }
    }
    return transpiledObject;
  };

  // Helper function to normalize default exports, especially for interop.
  executeModule.normalizeDefaultExport = function(moduleReference) {
    var getterFunction = moduleReference && moduleReference.__esModule ?
      function() {
        return moduleReference.default;
      } :
      function() {
        return moduleReference;
      };
    // Define a property 'a' (common alias) that also returns the default export.
    executeModule.definePropertyExport(getterFunction, 'a', getterFunction);
    return getterFunction;
  };

  // Helper function to check if an object has its own property.
  executeModule.hasOwnProp = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Public path for assets (empty string in this configuration).
  executeModule.publicPath = '';

  // Set the startup module ID (module 0) and execute it to start the application.
  return executeModule(executeModule.startupModuleId = 0);

})([
  /* Module 0: Entry point */
  function(currentModule, moduleExports, localRequire) {
    // This module reads input from standard input, processes it, and then logs the result.
    // It requires module 1 (the main logic) and module 2 (fs module).
    localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },

  /* Module 1: Main algorithm logic */
  function(currentModule, moduleExports) {
    // A utility function to safely destructure an iterable into an array with a specified limit.
    function _arrayWithLimit(inputIterable, limitCount) {
      // If the input is already an array, return it directly.
      if (Array.isArray(inputIterable)) {
        return inputIterable;
      }

      var collectedItems = []; // Array to store collected items.
      var isIterationDone = false; // Flag to track if iteration is complete.
      var encounteredError = false; // Flag to track if an error occurred during iteration.
      var errorDetails = undefined; // Stores error details if an error occurs.

      try {
        // Iterate over the input iterable.
        // The loop continues as long as the iterator is not done and the limit is not reached.
        for (var nextItem, iteratorInstance = inputIterable[Symbol.iterator](); !(isIterationDone = (nextItem = iteratorInstance.next()).done) && (collectedItems.push(nextItem.value), !limitCount || collectedItems.length !== limitCount); isIterationDone = true) {
          // Loop body is empty as collection happens in the condition.
        }
      } catch (err) {
        encounteredError = true;
        errorDetails = err;
      } finally {
        try {
          // If the iteration was not completed (e.g., due to limit or break),
          // and the iterator has a 'return' method, call it to clean up resources.
          if (!isIterationDone && iteratorInstance.return != null) {
            iteratorInstance.return();
          }
        } finally {
          // If an error was encountered, re-throw it after cleanup.
          if (encounteredError) {
            throw errorDetails;
          }
        }
      }
      return collectedItems;
    }

    // The main exported function of this module, which processes the input lines.
    currentModule.exports = function(inputLines) {
      // Parse the first line of input, which contains two numbers (N and M).
      var parsedHeader = _arrayWithLimit(
        inputLines[0].split(" ").map(function(strValue) {
          return Number(strValue); // Convert string parts to numbers.
        }),
        2 // Expect exactly two numbers.
      );
      var arrayLength = parsedHeader[0]; // N: The size of the array.
      var maxElementValue = parsedHeader[1]; // M: The maximum allowed value for an element.

      // Parse the second line of input, which contains the array elements.
      var numericData = inputLines[1].split(" ").map(function(strValue) {
        return Number(strValue); // Convert string parts to numbers.
      });

      var totalAdjustments = 0; // Initialize a counter for total adjustments made.

      // Iterate through the numeric data array.
      for (var idx = 0; idx < arrayLength; idx++) {
        // First check: If the current element exceeds the maximum allowed value.
        if (numericData[idx] > maxElementValue) {
          // Add the excess amount to total adjustments.
          totalAdjustments += numericData[idx] - maxElementValue;
          // Cap the current element at the maximum allowed value.
          numericData[idx] = maxElementValue;
        }

        // Second check: If not the last element and the sum of current and next element exceeds maxElementValue.
        if (idx < arrayLength - 1 && numericData[idx] + numericData[idx + 1] > maxElementValue) {
          // Calculate the excess amount from the sum.
          var currentExcess = numericData[idx] + numericData[idx + 1] - maxElementValue;
          // Reduce the next element by the excess amount.
          numericData[idx + 1] -= currentExcess;
          // Add this excess to the total adjustments.
          totalAdjustments += currentExcess;
        }
      }
      // Output the final calculated total adjustments to the console.
      console.log(totalAdjustments);
    };
  },

  /* Module 2: File System (fs) module */
  function(currentModule, moduleExports) {
    // This module simply exports the Node.js 'fs' (file system) built-in module.
    currentModule.exports = require("fs");
  }
]);
