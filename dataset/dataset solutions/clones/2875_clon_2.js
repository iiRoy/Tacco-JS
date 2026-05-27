module.exports = function(moduleDefinitions) {
  // This object serves as a cache for modules that have already been loaded.
  var moduleCache = {};

  // The core function responsible for loading and executing modules.
  // It mimics the behavior of a 'require' function in a module system.
  function executeModule(requestedModuleId) {
    // If the module is already in the cache, return its exports immediately.
    if (moduleCache[requestedModuleId]) {
      return moduleCache[requestedModuleId].exports;
    }

    // If the module is not in the cache, create a new module entry.
    var moduleObject = moduleCache[requestedModuleId] = {
      identifier: requestedModuleId, // A unique identifier for this module.
      isLoaded: false, // A flag indicating whether the module's code has been executed.
      exports: {} // The object that will hold the module's exported values.
    };

    // Execute the module's definition function.
    // The function receives the module object, its exports, and the 'executeModule' function itself.
    moduleDefinitions[requestedModuleId].call(
      moduleObject.exports,
      moduleObject,
      moduleObject.exports,
      executeModule
    );

    // Mark the module as loaded after its definition function has run.
    moduleObject.isLoaded = true;

    // Return the exports of the newly loaded module.
    return moduleObject.exports;
  }

  // Helper function to define a getter for an export property on an object.
  // This is typically used for ES module compatibility to define named exports.
  executeModule.defineExport = function(exportObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist on the export object.
    if (!executeModule.hasOwn(exportObject, propertyName)) {
      Object.defineProperty(exportObject, propertyName, {
        enumerable: true, // Make the property visible during enumeration (e.g., in `for...in` loops).
        get: getterFunction // The function to call when the property is accessed.
      });
    }
  };

  // Helper function to mark an exports object as an ES module.
  // This adds `Symbol.toStringTag` and `__esModule` properties.
  executeModule.markAsEsModule = function(exportObject) {
    // Set `Symbol.toStringTag` for better object identification in some environments.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set `__esModule` to true, a common convention for ES modules.
    Object.defineProperty(exportObject, "__esModule", {
      value: true
    });
  };

  // Helper function for interoperability between different module formats (e.g., CommonJS and ES Modules).
  executeModule.interopRequireDefault = function(moduleToProcess, processingMode) {
    // Bit 1: If set, the module ID needs to be resolved via `executeModule`.
    if (1 & processingMode) {
      moduleToProcess = executeModule(moduleToProcess);
    }
    // Bit 8: If set, return the module as is (e.g., already a default export).
    if (8 & processingMode) {
      return moduleToProcess;
    }
    // Bit 4: If set, and the module is an object and already marked as an ES module, return it as is.
    if (4 & processingMode && typeof moduleToProcess === "object" && moduleToProcess && moduleToProcess.__esModule) {
      return moduleToProcess;
    }

    // Create a new plain object to hold the interop exports.
    var newExportObject = Object.create(null);
    // Mark the new object as an ES module.
    executeModule.markAsEsModule(newExportObject);
    // Define a 'default' export pointing to the original module.
    Object.defineProperty(newExportObject, "default", {
      enumerable: true,
      value: moduleToProcess
    });

    // Bit 2: If set, and the module is not a string, copy all its enumerable properties as named exports.
    if (2 & processingMode && typeof moduleToProcess !== "string") {
      for (var exportKey in moduleToProcess) {
        executeModule.defineExport(
          newExportObject,
          exportKey,
          (function(key) {
            return moduleToProcess[key];
          }).bind(null, exportKey)
        );
      }
    }
    return newExportObject;
  };

  // Helper function to create a getter for a module's default export.
  executeModule.createDefaultExportGetter = function(moduleToWrap) {
    var defaultExportGetter =
      moduleToWrap && moduleToWrap.__esModule ?
      function() {
        return moduleToWrap.default;
      } :
      function() {
        return moduleToWrap;
      };
    // Define a property 'a' on the getter function itself, pointing to the getter.
    // This is a common webpack pattern for default export access.
    executeModule.defineExport(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // Helper function to check if an object has a specific property directly (not inherited).
  executeModule.hasOwn = function(targetObject, targetProperty) {
    return Object.prototype.hasOwnProperty.call(targetObject, targetProperty);
  };

  // The public path for loading assets (empty in this specific bundle).
  executeModule.publicPath = "";

  // Set the entry module ID and then execute it to start the application.
  return executeModule(executeModule.entryModuleId = 0);
}([
  // Module 0: The application's entry point.
  function(moduleRef, exportsRef, localRequire) {
    // This module reads input from standard input and passes it to the main logic module.
    localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8"));
  },

  // Module 1: Contains the primary business logic for processing the input data.
  function(moduleRef, exportsRef) {
    // A utility function to safely destructure an array-like input.
    // It handles both actual arrays and iterables, ensuring a consistent output.
    function destructureArray(inputArray, expectedLength) {
      // If the input is already an array, return it directly.
      if (Array.isArray(inputArray)) {
        return inputArray;
      }

      // For iterable inputs, attempt to extract elements.
      var tempArr = [];
      var isDone = false;
      var hasError = false;
      var errorValue = undefined;
      try {
        // Iterate over the input using its Symbol.iterator.
        for (
          var item, iterator = inputArray[Symbol.iterator]();
          !(isDone = (item = iterator.next()).done) &&
          (tempArr.push(item.value), !expectedLength || tempArr.length !== expectedLength);
          isDone = true
        ) {}
      } catch (err) {
        hasError = true;
        errorValue = err;
      } finally {
        try {
          // Ensure the iterator's `return` method is called if it exists and iteration was not completed.
          if (!isDone && iterator.return != null) {
            iterator.return();
          }
        } finally {
          // If an error occurred during iteration, re-throw it.
          if (hasError) {
            throw errorValue;
          }
        }
      }
      return tempArr;
    }

    // The main function exported by this module, which processes the input string.
    moduleRef.exports = function(inputData) {
      // Split the entire input string into an array of lines.
      var inputLines = inputData.split("\n");

      // Process the first line: split by spaces, convert to numbers, and destructure.
      // The numbers represent: totalSegments (N), (unused), startPoint (B), endPoint (C), targetPoint (D).
      var parsedNumbers = destructureArray(
        inputLines[0].split(" ").map(function(strNum) {
          return Number(strNum); // Convert each string number to a numeric type.
        }),
        5 // Expecting 5 numbers in the first line.
      );

      var totalSegments = parsedNumbers[0]; // N: The total number of segments in the path.
      // parsedNumbers[1] is present in the input but not used in the logic.
      var startPoint = (parsedNumbers[1], parsedNumbers[2]); // B: The starting position.
      var endPoint = parsedNumbers[3]; // C: The ending position.
      var targetPoint = parsedNumbers[4]; // D: The target position to reach.

      // Convert the second line of input into an array of individual characters.
      var segmentChars = inputLines[1].split("");

      // First check: Determine if there are any two consecutive '#' characters in the path.
      // If found, it's impossible to pass, so output "No".
      for (var segmentIndex = 1; segmentIndex < totalSegments; segmentIndex++) {
        if (segmentChars[segmentIndex - 1] === "#" && segmentChars[segmentIndex] === "#") {
          return void console.log("No"); // Output "No" and terminate execution.
        }
      }

      // Second check: If the endPoint (C) is less than the targetPoint (D), it's always "Yes".
      if (!(endPoint < targetPoint)) {
        // If C >= D, more complex checks are required.
        // This block checks for a sequence of two consecutive '.' characters between startPoint and targetPoint - 1.
        var dotCount = 0; // Counter for consecutive '.' characters.
        for (var checkIndex = startPoint; checkIndex < targetPoint - 1; checkIndex++) {
          if (segmentChars[checkIndex] === ".") {
            dotCount += 1; // Increment the counter if a '.' is found.
            if (dotCount === 2) {
              return void console.log("Yes"); // If two consecutive '.' are found, output "Yes" and terminate.
            }
          } else {
            dotCount = 0; // Reset the counter if a non-'.' character is encountered.
          }
        }

        // The following lines access array elements but do not use their values in a conditional or assignment.
        // This behavior is preserved as per Type II cloning rules.
        targetPoint - 2 >= 0 && targetPoint - 2 < totalSegments && segmentChars[targetPoint - 2];
        targetPoint >= 0 && targetPoint < totalSegments && segmentChars[targetPoint];

        // If none of the preceding conditions resulted in a "Yes", then output "No".
        return void console.log("No");
      }

      // If the condition (endPoint < targetPoint) was true, output "Yes".
      console.log("Yes");
    };
  },

  // Module 2: A simple module that exports the Node.js 'fs' (file system) module.
  function(moduleRef, exportsRef) {
    moduleRef.exports = require("fs");
  }
]);
