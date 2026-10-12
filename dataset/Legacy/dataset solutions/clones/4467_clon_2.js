module.exports = function (moduleDefinitions) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The main function responsible for loading modules.
  // It takes a module's unique identifier (ID) as input.
  function moduleLoader(moduleId) {
    // If the module is already in our cache, return its exported values immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If the module is not cached, create a new entry for it.
    // 'identifier' stores the module's ID, 'isLoaded' tracks its loading status,
    // and 'exports' will hold the values the module makes public.
    var currentModuleEntry = moduleCache[moduleId] = {
      identifier: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module's definition function.
    // This function is provided with the module entry, its exports object,
    // and a reference to the moduleLoader itself (acting as a local 'require').
    moduleDefinitions[moduleId].call(
      currentModuleEntry.exports,
      currentModuleEntry,
      currentModuleEntry.exports,
      moduleLoader
    );

    // Mark the module as fully loaded after its definition function has run.
    currentModuleEntry.isLoaded = true;

    // Return the exports of the newly loaded module.
    return currentModuleEntry.exports;
  }

  // Attach the array of all module definitions to the loader for internal access.
  moduleLoader.modules = moduleDefinitions;

  // Attach the module cache to the loader.
  moduleLoader.cache = moduleCache;

  // A utility function to define a property on an object.
  // It ensures the property is enumerable and uses a getter function.
  moduleLoader.defineProperty = function (targetObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist on the target object.
    if (!moduleLoader.hasOwnPropertyCheck(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property visible during enumeration.
        get: getterFunction // Use the provided function to get the property's value.
      });
    }
  };

  // A utility function to mark an object as an ECMAScript module.
  moduleLoader.registerEsModule = function (targetObject) {
    // If Symbol.toStringTag is available, set it to "Module" for better debugging.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set the __esModule property to true, indicating it's an ES module.
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  // A utility function to create a namespace object for a module,
  // handling different export scenarios (default, named, etc.).
  moduleLoader.createNamespaceObject = function (moduleValue, flags) {
    // If the first flag (1) is set, resolve the module ID to its actual value first.
    if (1 & flags) {
      moduleValue = moduleLoader(moduleValue);
    }
    // If the eighth flag (8) is set, return the module value directly.
    if (8 & flags) {
      return moduleValue;
    }
    // If the fourth flag (4) is set and the module value is an object marked as an ES module,
    // return it directly as it's already a namespace object.
    if (4 & flags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    // Register this new object as an ES module.
    moduleLoader.registerEsModule(namespaceObject);
    // Define the 'default' export property, making it enumerable.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: moduleValue
    });

    // If the second flag (2) is set and the module value is not a string,
    // iterate over its properties and define them as named exports on the namespace object.
    if (2 & flags && typeof moduleValue !== "string") {
      for (var propKey in moduleValue) {
        moduleLoader.defineProperty(namespaceObject, propKey, (function (key) {
          return moduleValue[key];
        }).bind(null, propKey));
      }
    }
    return namespaceObject;
  };

  // A utility function to get a getter for a module's default export.
  moduleLoader.getDefaultExport = function (moduleObject) {
    // If the module object is an ES module, the default export is moduleObject.default.
    // Otherwise, the module object itself is considered the default export.
    var defaultExportGetter = moduleObject && moduleObject.__esModule ?
      function () {
        return moduleObject.default;
      } :
      function () {
        return moduleObject;
      };
    // For compatibility (e.g., with webpack's interop), also define 'a' as the default getter.
    moduleLoader.defineProperty(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // A utility function to check if an object has a specific property directly (not inherited).
  moduleLoader.hasOwnPropertyCheck = function (targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // The public path for loading assets (empty in this configuration).
  moduleLoader.publicPath = "";

  // Set the ID of the module that should be executed upon startup (module 0 in this case),
  // and then immediately load and execute it to start the application.
  return moduleLoader(moduleLoader.startupModuleId = 0);

}(
  // This array contains all the module definitions. Each function in this array
  // represents a distinct module within the bundled application.
  [
    /* Module 0: The application's entry point */
    function (currentModule, moduleExports, localRequire) {
      // This module reads input from standard input, splits it by newlines,
      // and then passes the resulting array of lines to Module 1 for processing.
      localRequire(1)(
        localRequire(2) // Load the 'fs' (file system) module.
        .readFileSync("/dev/stdin", "UTF-8") // Read content from standard input as UTF-8.
        .split("\n") // Split the input string into an array of lines.
      );
    },

    /* Module 1: Contains the core logic for processing the input data */
    function (currentModule, moduleExports) {
      // A helper function designed to safely destructure an array or iterable.
      // It handles cases where the input might not be an array or might be an iterator.
      function destructureArray(inputArray, limitCount) {
        // If the input is already an array, return it directly.
        if (Array.isArray(inputArray)) {
          return inputArray;
        }

        // For non-array iterables, manually iterate and collect elements.
        var tempArr = [];
        var isDone = true;
        var hasError = false;
        var errorValue = undefined;

        try {
          // Iterate through the input using its Symbol.iterator.
          for (
            var arrayIterator = inputArray[Symbol.iterator](); !(isDone = (arrayIterator.next()).done) &&
            (tempArr.push(arrayIterator.value), !limitCount || tempArr.length !== limitCount); isDone = true
          ) {}
        } catch (err) {
          // Catch any errors that occur during iteration.
          hasError = true;
          errorValue = err;
        } finally {
          try {
            // Ensure the iterator's 'return' method is called if it exists and iteration wasn't complete.
            if (!isDone && arrayIterator.return != null) {
              arrayIterator.return();
            }
          } finally {
            // Re-throw any caught error after cleanup.
            if (hasError) {
              throw errorValue;
            }
          }
        }
        return tempArr;
      }

      // The main logic function, which is exported by this module.
      // It takes an array of input lines (strings) as its argument.
      currentModule.exports = function (inputLines) {
        // Process the first line of input:
        // Split it by space, convert parts to numbers, and destructure into two variables.
        var parsedNumbers = destructureArray(
            inputLines[0].split(" ").map(function (val) {
              return Number(val);
            }),
            2 // Expect exactly two numbers.
          ),
          firstNum = parsedNumbers[0], // This typically represents 'N' (e.g., count of elements).
          secondNum = parsedNumbers[1], // This typically represents 'K' (e.g., a target value).
          // Process the second line of input:
          // Split it by space and convert all parts into an array of numbers.
          dataValues = inputLines[1].split(" ").map(function (val) {
            return Number(val);
          });

        // Sort the array of data values in ascending numerical order.
        dataValues.sort(function (valA, valB) {
          return valA - valB;
        });

        // Initialize two boolean flags to track specific conditions.
        var conditionOneMet = false; // Flag for the first condition.
        var conditionTwoMet = false; // Flag for the second condition.

        // Iterate through the sorted data values.
        for (var loopIndex = 0; loopIndex < firstNum; loopIndex++) {
          // Check the first condition:
          // If it's not the very first element (loopIndex > 0) AND
          // the current data value modulo the first data value is equal to
          // 'secondNum' modulo the first data value.
          if (loopIndex !== 0 && dataValues[loopIndex] % dataValues[0] === secondNum % dataValues[0]) {
            conditionOneMet = true;
          }

          // Check the second condition:
          // If the current data value is strictly greater than 'secondNum'.
          if (dataValues[loopIndex] > secondNum) {
            conditionTwoMet = true;
          }

          // If any data value is exactly equal to 'secondNum',
          // then the result is "POSSIBLE" immediately, and we can exit.
          if (dataValues[loopIndex] === secondNum) {
            return void console.log("POSSIBLE");
          }
        }

        // After checking all elements, if both conditions (conditionOneMet AND conditionTwoMet)
        // were met at some point, then the result is "POSSIBLE".
        if (conditionOneMet && conditionTwoMet) {
          console.log("POSSIBLE");
        } else {
          // Otherwise, the result is "IMPOSSIBLE".
          console.log("IMPOSSIBLE");
        }
      };
    },

    /* Module 2: Provides access to Node.js's built-in 'fs' (File System) module */
    function (currentModule, moduleExports) {
      // This module simply exports the standard Node.js 'fs' module.
      currentModule.exports = require("fs");
    }
  ]
);
