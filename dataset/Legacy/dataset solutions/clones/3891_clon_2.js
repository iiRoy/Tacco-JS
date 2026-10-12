module.exports = function (moduleDefinitions) {
  // This is a Type II clone of a JavaScript module bundle.
  // The original structure, control flow, and behavior are strictly preserved.

  // A private cache for already loaded modules.
  var moduleCache = {};

  // The internal 'require' function for this bundle.
  function localRequire(moduleId) {
    // If the module is already present in our cache, return its exports immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not cached, create a new module entry in the cache.
    var currentModule = moduleCache[moduleId] = {
      identifier: moduleId, // The unique ID for this module.
      isLoaded: false,      // A flag indicating if the module's function has been executed.
      exports: {}           // The object that will hold the module's exports.
    };

    // Execute the module's definition function, passing in the module object,
    // its exports, and the local 'require' function.
    moduleDefinitions[moduleId].call(
      currentModule.exports,
      currentModule,
      currentModule.exports,
      localRequire
    );

    // Mark the module as fully loaded after its definition function completes.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Store the collection of module definitions on the 'require' function itself.
  localRequire.m = moduleDefinitions;

  // Store the module cache on the 'require' function.
  localRequire.c = moduleCache;

  // Helper to define a getter function for an export property.
  localRequire.d = function (exportObj, propName, getterFn) {
    // Only define the property if it doesn't already exist on the object.
    if (!localRequire.o(exportObj, propName)) {
      Object.defineProperty(exportObj, propName, {
        enumerable: true, // Make the property enumerable.
        get: getterFn     // Set the getter function.
      });
    }
  };

  // Helper to add '__esModule' and 'Symbol.toStringTag' properties for ES module compatibility.
  localRequire.r = function (exportObj) {
    // If Symbol and Symbol.toStringTag are available, define the toStringTag.
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exportObj, Symbol.toStringTag, { value: 'Module' });
    }
    // Always define '__esModule' to true.
    Object.defineProperty(exportObj, '__esModule', { value: true });
  };

  // Helper to create a namespace object for a module, handling various import flags.
  localRequire.t = function (exportObj, flag) {
    // Flag 1: If it's a direct require, resolve it first.
    if (1 & flag) {
      exportObj = localRequire(exportObj);
    }
    // Flag 8: If direct return is requested, return the value as is.
    if (8 & flag) {
      return exportObj;
    }
    // Flag 4: If it's an ES module and an object, return it directly.
    if (4 & flag && typeof exportObj === 'object' && exportObj && exportObj.__esModule) {
      return exportObj;
    }
    // Create a new namespace object.
    var namespaceObject = Object.create(null);
    localRequire.r(namespaceObject); // Add ES module properties.
    Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: exportObj }); // Set default export.
    // Flag 2: If it's not a string, merge all properties into the namespace.
    if (2 & flag && typeof exportObj !== 'string') {
      for (var propKey in exportObj) {
        localRequire.d(namespaceObject, propKey, (function (key) {
          return exportObj[key];
        }).bind(null, propKey));
      }
    }
    return namespaceObject;
  };

  // Helper to get the default export from a module.
  localRequire.n = function (exportObj) {
    var defaultGetter = exportObj && exportObj.__esModule ?
      function () { return exportObj.default; } : // If it's an ES module, return its 'default' property.
      function () { return exportObj; };           // Otherwise, return the module itself.
    localRequire.d(defaultGetter, 'a', defaultGetter); // Define a getter 'a' for compatibility.
    return defaultGetter;
  };

  // Helper to check if an object has a specific property.
  localRequire.o = function (targetObj, propName) {
    return Object.prototype.hasOwnProperty.call(targetObj, propName);
  };

  // The public path for assets (empty in this specific bundle).
  localRequire.p = "";

  // Execute the entry module (module with ID 0) and return its exports.
  return localRequire(localRequire.s = 0);
}([
  // Module 0: The primary entry point of the application.
  function (mod, exp, req) {
    // Read input from standard input, decode as UTF-8, split by newlines,
    // and then pass the resulting array of lines to Module 1 for processing.
    req(1)(req(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },

  // Module 1: Contains the core business logic for processing the input.
  function (mod, exp) {
    // A helper function designed to mimic Babel's _slicedToArray for destructuring iterables.
    function arrayDestructureHelper(inputIterable, limitCount) {
      // First attempt: Check if the input is already an array.
      return (function (potentialArray) {
        if (Array.isArray(potentialArray)) {
          return potentialArray;
        }
      })(inputIterable) ||
      // Second attempt: If not an array, try to iterate over it.
      (function (iterableSource, countLimit) {
        var temporaryArray = [];
        var iterationComplete = false;
        var encounteredError = false;
        var caughtErrorValue = undefined;

        try {
          for (
            var currentIterationResult,
                iteratorInstance = iterableSource[Symbol.iterator]();
            !(iterationComplete = (currentIterationResult = iteratorInstance.next()).done) &&
            (temporaryArray.push(currentIterationResult.value), !countLimit || temporaryArray.length !== countLimit);
            iterationComplete = true
          ) {
            // The loop's logic is entirely within its condition and initialization.
            // No statements are needed in the body.
          }
        } catch (iterationError) {
          encounteredError = true;
          caughtErrorValue = iterationError;
        } finally {
          try {
            // If iteration was not completed (e.g., due to break or limit),
            // and the iterator has a return method, call it to clean up.
            if (!iterationComplete && iteratorInstance.return != null) {
              iteratorInstance.return();
            }
          } finally {
            // If an error was caught during iteration, re-throw it.
            if (encounteredError) {
              throw caughtErrorValue;
            }
          }
        }
        return temporaryArray;
      })(inputIterable, limitCount) ||
      // Third attempt: If neither of the above worked, throw a TypeError.
      (function () {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      })();
    }

    // The main logic function, which is exported by this module.
    mod.exports = function (inputLines) {
      // Take the first line of input, split it by spaces,
      // convert each part to a number, and then destructure the first three.
      var parsedValues = arrayDestructureHelper(
        inputLines[0].split(" ").map(function (strValue) {
          return Number(strValue);
        }),
        3
      );

      // Assign the destructured numbers to descriptive variables.
      var firstNum = parsedValues[0];
      var secondNum = parsedValues[1];
      var thirdNum = parsedValues[2];

      // Implement the conditional logic based on the problem statement.
      // This logic checks specific relationships between the three numbers.
      if (firstNum !== thirdNum || secondNum !== 0) {
        // If firstNum is not equal to thirdNum OR secondNum is not zero.
        if (firstNum < thirdNum && firstNum + secondNum >= thirdNum) {
          // If firstNum is strictly less than thirdNum AND
          // the sum of firstNum and secondNum is greater than or equal to thirdNum.
          console.log("YES");
        } else {
          // Otherwise, print "NO".
          console.log("NO");
        }
      } else {
        // If firstNum equals thirdNum AND secondNum is zero.
        console.log("YES");
      }
    };
  },

  // Module 2: Provides access to the Node.js 'fs' (File System) module.
  function (mod, exp) {
    // Simply export the built-in 'fs' module.
    mod.exports = require("fs");
  }
]);
