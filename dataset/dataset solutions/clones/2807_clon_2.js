// This module provides the core functionality for loading and managing code units.
module.exports = function(programUnits) {
  // Cache for already loaded code units, storing their exports and metadata.
  var loadedUnits = {};

  // Main function to load a code unit by its unique ID.
  function unitLoader(unitId) {
    // If the unit is already in the cache, return its exports immediately.
    if (loadedUnits[unitId]) {
      return loadedUnits[unitId].exports;
    }

    // If not in cache, create a new unit object and add it to the cache.
    var currentUnit = loadedUnits[unitId] = {
      identifier: unitId, // The unique ID of this code unit.
      isLoaded: false,    // Flag indicating whether the unit has completed loading.
      exports: {}         // The exports object for this particular unit.
    };

    // Execute the unit's code. The `call` method ensures `this` context is correct
    // and passes the module object, its exports, and the loader itself as arguments.
    programUnits[unitId].call(currentUnit.exports, currentUnit, currentUnit.exports, unitLoader);

    // Mark the unit as loaded after its code has been executed.
    currentUnit.isLoaded = true;
    // Return the exports of the newly loaded unit.
    return currentUnit.exports;
  }

  // Store a reference to the collection of all program units on the loader itself.
  unitLoader.moduleStore = programUnits;

  // Store a reference to the cache of loaded units on the loader.
  unitLoader.cache = loadedUnits;

  // Helper function to define an enumerable getter property on a target object.
  unitLoader.defineExport = function(outputObject, propKey, valueProvider) {
    // Only define the property if it doesn't already exist on the object.
    unitLoader.hasOwn(outputObject, propKey) || Object.defineProperty(outputObject, propKey, {
      enumerable: true, // Make the property appear during enumeration (e.g., in `for...in` loops).
      get: valueProvider // Assign the provided function as the getter for the property.
    });
  };

  // Helper function to register an object as an ES Module.
  unitLoader.registerESModule = function(outputObject) {
    // If Symbol.toStringTag is supported, set it to "Module" for better debugging and identification.
    ("undefined" != typeof Symbol && Symbol.toStringTag) && Object.defineProperty(outputObject, Symbol.toStringTag, {
      value: "Module"
    });
    // Define the __esModule property to explicitly mark this object as an ES Module.
    Object.defineProperty(outputObject, "__esModule", {
      value: true
    });
  };

  // Helper function to create a module namespace object, handling various import modes.
  unitLoader.createNamespace = function(sourceItem, accessMode) {
    // Mode 1: If sourceItem is an ID, load it using the unitLoader.
    if (1 & accessMode) sourceItem = unitLoader(sourceItem);
    // Mode 8: If mode indicates direct return, return sourceItem as is.
    if (8 & accessMode) return sourceItem;
    // Mode 4: If sourceItem is an object, truthy, and already an ES Module, return it.
    if (4 & accessMode && "object" == typeof sourceItem && sourceItem && sourceItem.__esModule) return sourceItem;

    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    // Register this new object as an ES Module.
    unitLoader.registerESModule(namespaceObject);
    // Define a 'default' export on the namespace, pointing to the original sourceItem.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: sourceItem
    });
    // Mode 2: If sourceItem is not a string, copy all its enumerable properties to the namespace.
    if (2 & accessMode && "string" != typeof sourceItem)
      for (var propKey in sourceItem)
        unitLoader.defineExport(namespaceObject, propKey, (function(copiedKey) {
          return sourceItem[copiedKey];
        }).bind(null, propKey)); // Use a bound function to capture the current propKey.
    // Return the constructed namespace object.
    return namespaceObject;
  };

  // Helper function to retrieve the standard export of a module (default or direct).
  unitLoader.getStandardExport = function(sourceModule) {
    // Determine the appropriate getter for the default export.
    var defaultExportGetter = sourceModule && sourceModule.__esModule ?
      function() {
        return sourceModule.default;
      } : // If it's an ES Module, return its 'default' property.
      function() {
        return sourceModule;
      }; // Otherwise, return the module object itself.
    // Define an 'a' property on the getter function itself, pointing back to the getter.
    unitLoader.defineExport(defaultExportGetter, "a", defaultExportGetter);
    // Return the getter function.
    return defaultExportGetter;
  };

  // Helper function to check if an object possesses its own property (not inherited).
  unitLoader.hasOwn = function(checkObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(checkObject, propertyName);
  };

  // Public path for loading assets (currently an empty string).
  unitLoader.publicPath = "";

  // Execute the entry point unit (typically unit with ID 0) and return its exports.
  return unitLoader(unitLoader.startUnit = 0);

  // The collection of all program units, defined as an array of functions.
}([
  // Unit 0: The main application entry point and orchestration logic.
  function(currentModule, moduleExports, unitLoader) {
    // Load unit 1 (the core calculation logic) and unit 2 (the file system module).
    // Read content from standard input using the file system module, then pass it to unit 1 for processing.
    unitLoader(1)(unitLoader(2).readFileSync("/dev/stdin", "UTF-8"));
  },
  // Unit 1: Contains the number processing logic and a utility for array destructuring.
  function(currentModule, moduleExports) {
    // Helper function to safely unpack values from an iterable, mimicking Babel's _slicedToArray.
    function unpackValues(sourceIterable, limitCount) {
      return (
        // Part 1: If the source is already an array, return it directly.
        function(inputSource) {
          if (Array.isArray(inputSource)) {
            return inputSource;
          }
        }(sourceIterable)
      ) || (
        // Part 2: If not an array, attempt to iterate and collect values up to a limit.
        function(inputSource, countLimit) {
          var collectedItems = [],
            isIterationDone = true,
            hadError = false,
            thrownError = undefined;
          try {
            // Get the iterator from the source object.
            for (
              var iterResult, dataIterator = inputSource[Symbol.iterator](); !(isIterationDone = (iterResult = dataIterator.next()).done) &&
              (collectedItems.push(iterResult.value), !countLimit || collectedItems.length !== countLimit);
              isIterationDone = true
            ) {}
          } catch (exceptionObject) {
            hadError = true;
            thrownError = exceptionObject;
          } finally {
            try {
              // Ensure the iterator's `return` method is called if iteration wasn't naturally completed.
              isIterationDone || null == dataIterator.return || dataIterator.return();
            } finally {
              // If an error occurred during iteration, re-throw it after cleanup.
              if (hadError) throw thrownError;
            }
          }
          // Return the array of collected items.
          return collectedItems;
        }(sourceIterable, limitCount)
      ) || (
        // Part 3: If neither of the above returned a value, it indicates an invalid non-iterable instance.
        function() {
          throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }()
      );
    }

    // Assign the main calculation function to this module's exports.
    currentModule.exports = function(inputData) {
      // Process the input string:
      // 1. Split by newline to get the first line.
      // 2. Split the first line by space.
      // 3. Map each string segment to a Number.
      // 4. Use `unpackValues` to extract the first four numbers.
      var parsedNumbers = unpackValues(inputData.split("\n")[0].split(" ").map(function(valStr) {
        return Number(valStr);
      }), 4);

      // Destructure the extracted numbers into individual variables.
      var firstNum = parsedNumbers[0],
        secondNum = parsedNumbers[1],
        thirdNum = parsedNumbers[2],
        fourthNum = parsedNumbers[3];

      // Calculate the inclusive length of the numerical range.
      var rangeLength = secondNum - firstNum + 1;

      // Apply the principle of inclusion-exclusion to find the count of numbers
      // within the range that are NOT divisible by 'thirdNum' NOR 'fourthNum'.
      // Total length - (multiples of thirdNum + multiples of fourthNum - multiples of LCM(thirdNum, fourthNum))
      var finalResult = rangeLength - (
        Math.floor(rangeLength / thirdNum) +
        Math.floor(rangeLength / fourthNum) -
        Math.floor(rangeLength / (thirdNum * fourthNum))
      );

      // Output the calculated final result to the console.
      console.log(finalResult);
    };
  },
  // Unit 2: Provides access to Node.js's native File System module.
  function(currentModule, moduleExports) {
    // Export the standard Node.js 'fs' module for file operations.
    currentModule.exports = require("node:fs");
  }
]));