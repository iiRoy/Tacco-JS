module.exports = function(moduleDefinitions) {
  // A cache to store already loaded modules, preventing redundant execution.
  var moduleCache = {};

  /**
   * The core module loading function, similar to a 'require' statement in CommonJS.
   * It retrieves modules from the cache or executes them if not yet loaded.
   * @param {number} requestedModuleId - The unique identifier for the module to be loaded.
   * @returns {object} The exports object of the requested module.
   */
  function moduleLoader(requestedModuleId) {
    // If the module is already in our cache, return its exports immediately.
    if (moduleCache[requestedModuleId]) {
      return moduleCache[requestedModuleId].exports;
    }

    // If not in cache, create a new module entry.
    // This object holds the module's ID, a flag for its loading status, and its exports.
    var currentModuleObject = moduleCache[requestedModuleId] = {
      moduleIdProp: requestedModuleId, // The internal ID of this module.
      isModuleLoaded: false, // Flag indicating if the module's code has been executed.
      exports: {} // The object that will hold the module's exported values.
    };

    // Execute the module's definition function.
    // The function receives the module object, its exports, and the moduleLoader itself.
    moduleDefinitions[requestedModuleId].call(
      currentModuleObject.exports, // 'this' context for the module function.
      currentModuleObject, // The module object.
      currentModuleObject.exports, // The exports object.
      moduleLoader // The module loader function (for internal 'require' calls).
    );

    // After execution, mark the module as loaded.
    currentModuleObject.isModuleLoaded = true;

    // Return the module's exports.
    return currentModuleObject.exports;
  }

  // Attach the module definitions array to the loader for potential introspection.
  moduleLoader.modules = moduleDefinitions;

  // Attach the module cache to the loader.
  moduleLoader.cache = moduleCache;

  /**
   * A utility function to define a getter for a property on an object.
   * It ensures that the property is enumerable and only defines it if it doesn't already exist.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} getterFunction - The function that will be called to get the property's value.
   */
  moduleLoader.defineProperty = function(targetObject, propertyName, getterFunction) {
    // Check if the property already exists on the target object.
    if (!moduleLoader.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property visible during enumeration (e.g., in for...in loops).
        get: getterFunction // Assign the provided function as the getter.
      });
    }
  };

  /**
   * Marks a module's exports object as an ES Module and sets its Symbol.toStringTag.
   * This is crucial for interoperability between CommonJS and ES Modules.
   * @param {object} targetModule - The exports object of the module to register.
   */
  moduleLoader.registerModule = function(targetModule) {
    // If Symbol and Symbol.toStringTag are available, set the toStringTag for better debugging.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Define the __esModule property, indicating it's an ES Module.
    Object.defineProperty(targetModule, "__esModule", {
      value: true
    });
  };

  /**
   * Handles interoperability between different module formats (e.g., CommonJS, ES Modules).
   * It transforms a module's exports into a format compatible with ES Module imports.
   * @param {any} sourceModule - The module's exports or ID to be processed.
   * @param {number} modeFlags - Bitmask flags indicating the desired interop behavior.
   * @returns {any} The interoped module object.
   */
  moduleLoader.interopRequire = function(sourceModule, modeFlags) {
    // Flag 1: If set, the sourceModule is an ID, so load it first.
    if (modeFlags & 1) {
      sourceModule = moduleLoader(sourceModule);
    }
    // Flag 8: If set, return the module as is (e.g., already an ES Module).
    if (modeFlags & 8) {
      return sourceModule;
    }
    // Flag 4: If set, and it's an object with __esModule, return it as is.
    if (modeFlags & 4 && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
      return sourceModule;
    }

    // Create a new plain object to hold the interoped module's exports.
    var newModuleObject = Object.create(null);
    // Register this new object as an ES Module.
    moduleLoader.registerModule(newModuleObject);
    // Define a 'default' export pointing to the original source module.
    Object.defineProperty(newModuleObject, "default", {
      enumerable: true,
      value: sourceModule
    });

    // Flag 2: If set, and the source module is not a string, copy all its properties.
    if (modeFlags & 2 && typeof sourceModule !== "string") {
      for (var propKey in sourceModule) {
        // Define each property on the new module object with a getter.
        moduleLoader.defineProperty(
          newModuleObject,
          propKey,
          (function(key) {
            return sourceModule[key];
          }).bind(null, propKey) // Use bind to capture the current propKey.
        );
      }
    }
    return newModuleObject;
  };

  /**
   * Creates a getter function for a module's default export.
   * This handles cases where the module might or might not be an ES Module.
   * @param {object} moduleExports - The exports object of the module.
   * @returns {function} A function that returns the module's default export.
   */
  moduleLoader.normalizeDefault = function(moduleExports) {
    // Determine the appropriate getter based on whether it's an ES Module.
    var defaultGetter = moduleExports && moduleExports.__esModule ?
      function() {
        return moduleExports.default;
      } :
      function() {
        return moduleExports;
      };
    // Webpack-specific: Define a property 'a' on the getter itself, pointing back to the getter.
    moduleLoader.defineProperty(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  /**
   * Checks if an object has a specified property directly (not inherited).
   * This is a wrapper around Object.prototype.hasOwnProperty.call.
   * @param {object} checkObject - The object to inspect.
   * @param {string} checkProperty - The name of the property to check for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  moduleLoader.hasOwn = function(checkObject, checkProperty) {
    return Object.prototype.hasOwnProperty.call(checkObject, checkProperty);
  };

  // The public path for loading additional chunks or assets (empty in this bundle).
  moduleLoader.publicPath = "";

  // Set the startup module ID to 0 and then immediately load it to start execution.
  return moduleLoader(moduleLoader.startupModule = 0);
}([
  /* Module 0: Entry point for the application */
  function(moduleParam, exportsParam, requireFunc) {
    // Read input from standard input, decode as UTF-8, split by newlines,
    // and pass the resulting array of lines to Module 1 for processing.
    requireFunc(1)(requireFunc(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },

  /* Module 1: Contains the main logic to solve the problem */
  function(moduleParam, exportsParam) {
    /**
     * A helper function to safely extract a fixed number of elements from an iterable,
     * mimicking array destructuring behavior.
     * @param {Iterable} sourceArray - The iterable object (e.g., array, string, Set) to extract from.
     * @param {number} [limitCount] - An optional maximum number of elements to extract.
     * @returns {Array} An array containing the extracted elements.
     * @throws {TypeError} If the provided sourceArray is not iterable.
     */
    function _extractElements(sourceArray, limitCount) {
      // If the source is already an array, return it directly.
      if (Array.isArray(sourceArray)) {
        return sourceArray;
      }

      var extractedItems = []; // Array to store the extracted elements.
      var iterationDone = true; // Flag to track if the iterator has completed.
      var errorOccurred = false; // Flag to track if an error occurred during iteration.
      var caughtError = undefined; // Variable to store any caught error.

      try {
        // Obtain the iterator for the source array.
        for (
          var currentIterationItem, dataIterator = sourceArray[Symbol.iterator](); // Get the iterator.
          // Loop condition: continue if not done AND (no limit OR limit not reached).
          !(iterationDone = (currentIterationItem = dataIterator.next()).done) &&
          (extractedItems.push(currentIterationItem.value), !limitCount || extractedItems.length !== limitCount);
          iterationDone = true // Reset iterationDone for the next loop check.
        ) {
          // Loop body is empty; elements are pushed in the condition.
        }
      } catch (err) {
        errorOccurred = true; // Mark that an error occurred.
        caughtError = err; // Store the error.
      } finally {
        try {
          // If the iterator has a 'return' method and iteration wasn't done, call it to clean up.
          if (!iterationDone && dataIterator.return != null) {
            dataIterator.return();
          }
        } finally {
          // If an error occurred, re-throw it after cleanup.
          if (errorOccurred) {
            throw caughtError;
          }
        }
      }
      return extractedItems; // Return the array of collected items.
    }

    // The main logic of Module 1, exported as a function.
    moduleParam.exports = function(inputLines) {
      // Parse the first line of input, which contains two space-separated numbers (N and K).
      var parsedInput = _extractElements(
        inputLines[0].split(" ").map(function(strNum) {
          return Number(strNum); // Convert string numbers to actual numbers.
        }),
        2 // Expect exactly two numbers.
      );

      var firstValue = parsedInput[0]; // N: The count of numbers in the second line.
      var secondValue = parsedInput[1]; // K: The limit value.

      // Parse the second line of input, which is a list of space-separated numbers.
      var numericData = inputLines[1].split(" ").map(function(strNum) {
        return Number(strNum); // Convert string numbers to actual numbers.
      });

      // Sort the numeric data in ascending order.
      numericData.sort(function(valA, valB) {
        return valA - valB;
      });

      // Flags to track the conditions required for "POSSIBLE".
      var hasDivisorIssue = false; // True if any number (except the first) is not divisible by the first number.
      var hasLimitExceeded = false; // True if any number is strictly greater than K.

      // Iterate through the sorted numeric data up to 'firstValue' elements.
      for (var dataIndex = 0; dataIndex < firstValue; dataIndex++) {
        // Check for divisibility: if it's not the first element and not divisible by the first element.
        if (dataIndex !== 0 && numericData[dataIndex] % numericData[0] !== 0) {
          hasDivisorIssue = true;
        }
        // Check if the current number exceeds the limit 'secondValue' (K).
        if (numericData[dataIndex] > secondValue) {
          hasLimitExceeded = true;
        }
        // If any number is exactly equal to 'secondValue' (K), the condition is immediately "POSSIBLE".
        if (numericData[dataIndex] === secondValue) {
          return void console.log("POSSIBLE");
        }
      }

      // After checking all numbers, determine the final output based on the flags.
      if (hasDivisorIssue && hasLimitExceeded) {
        console.log("POSSIBLE");
      } else {
        console.log("IMPOSSIBLE");
      }
    };
  },

  /* Module 2: Provides access to the Node.js 'fs' (file system) module */
  function(moduleParam, exportsParam) {
    // This module simply exports the built-in 'fs' module, allowing other modules to use it.
    moduleParam.exports = require("fs");
  }
]);
