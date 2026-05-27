module.exports = function (moduleDefinitions) {
  // This object serves as a cache for modules that have already been loaded.
  var moduleCache = {};

  // The central function responsible for loading and resolving modules.
  function moduleLoader(moduleId) {
    // If the requested module is already in the cache, return its exported value immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If the module is not in the cache, create a new module entry.
    // 'i' stores the module's unique identifier.
    // 'l' is a boolean flag indicating whether the module has finished loading.
    // 'exports' is the object that will hold the module's public interface.
    var currentModule = moduleCache[moduleId] = {
      i: moduleId,
      l: false, // Mark as not yet loaded
      exports: {}
    };

    // Execute the module's definition function.
    // The 'call' method ensures that 'this' inside the module function refers to 'currentModule.exports',
    // and passes 'currentModule', 'currentModule.exports', and the 'moduleLoader' itself as arguments.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

    // After execution, mark the module as fully loaded.
    currentModule.l = true;

    // Return the exports of the newly loaded module.
    return currentModule.exports;
  }

  // Attach the array of all module definitions to the loader for internal access.
  moduleLoader.m = moduleDefinitions;

  // Attach the module cache to the loader.
  moduleLoader.c = moduleCache;

  // A utility function to define a getter property on an object.
  // This is often used for ES module interop to expose properties.
  moduleLoader.d = function (targetObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist on the target object.
    if (!moduleLoader.o(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable
        get: getterFunction // Assign the provided function as its getter
      });
    }
  };

  // A utility function to mark an object as an ECMAScript module.
  moduleLoader.r = function (targetObject) {
    // If Symbol and Symbol.toStringTag are available, set the module's string tag.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Always set the __esModule flag to true, indicating it's an ES module.
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  // An interop function to handle different module formats (e.g., CommonJS, ES Modules).
  moduleLoader.t = function (moduleReference, modeFlags) {
    // If the first bit of modeFlags is set (1 & modeFlags), resolve the module first.
    if (1 & modeFlags && (moduleReference = moduleLoader(moduleReference)));
    // If the third bit is set (8 & modeFlags), return the module reference directly.
    if (8 & modeFlags) {
      return moduleReference;
    }
    // If the second bit is set (4 & modeFlags) and it's an object and an ES module, return it directly.
    if (4 & modeFlags && typeof moduleReference === "object" && moduleReference && moduleReference.__esModule) {
      return moduleReference;
    }

    // Create a new plain object to hold the interop exports.
    var interopExports = Object.create(null);
    moduleLoader.r(interopExports); // Mark this new object as an ES module.
    Object.defineProperty(interopExports, "default", {
      enumerable: true,
      value: moduleReference
    });

    // If the zero bit is set (2 & modeFlags) and the module reference is not a string,
    // copy all properties from the original module to the interop object.
    if (2 & modeFlags && typeof moduleReference !== "string") {
      for (var propertyKey in moduleReference) {
        moduleLoader.d(interopExports, propertyKey, (function (key) {
          return moduleReference[key];
        }).bind(null, propertyKey));
      }
    }
    return interopExports;
  };

  // A helper function to retrieve the default export of a module.
  moduleLoader.n = function (moduleReference) {
    // Determine the getter function: if it's an ES module, return its 'default' property, otherwise return the module itself.
    var defaultGetter = moduleReference && moduleReference.__esModule ?
      function () {
        return moduleReference.default;
      } :
      function () {
        return moduleReference;
      };
    // Define a property 'a' on the getter function itself, pointing back to the getter.
    moduleLoader.d(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  // A utility function to check if an object has a specific property directly (not inherited).
  moduleLoader.o = function (targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // The public path for assets, which is empty in this configuration.
  moduleLoader.p = "";

  // Set the entry module ID (module 0) and then execute it to start the application.
  return moduleLoader(moduleLoader.s = 0);

}([ // This array contains the definitions for all modules in the bundle.

  // Module 0: The primary entry point of the application.
  function (moduleZeroModule, moduleZeroExports, moduleZeroRequire) {
    // This module requires module 1 and immediately calls the function exported by it.
    // The argument passed to module 1 is the result of reading from standard input.
    moduleZeroRequire(1)(
      moduleZeroRequire(2) // First, require module 2 (which exports the 'fs' module).
      .readFileSync("/dev/stdin", "UTF-8") // Use 'fs' to read from standard input with UTF-8 encoding.
      .split("\n") // Split the entire input string into an array of lines.
    );
  },

  // Module 1: Contains the core business logic for processing the input data.
  function (moduleOneModule, moduleOneExports, moduleOneRequire) {
    "use strict"; // Enforce strict mode for this module.
    // This module exports a function that takes an array of string lines as input.
    moduleOneExports.exports = function (inputLines) {
      // Parse the first line of input to get the total count of numbers.
      var inputCount = Number(inputLines[0]);
      // Parse the second line, splitting it by spaces and converting each part to a number.
      var inputNumbers = inputLines[1].split(" ").map(function (numStr) {
        return Number(numStr);
      });

      // Create an array of objects, where each object stores a number and its original 1-based index.
      var indexedSums = [];
      for (var idx = 0; idx < inputCount; idx++) {
        indexedSums.push({
          num: idx + 1, // Store the original 1-based index.
          sum: inputNumbers[idx] // Store the actual number.
        });
      }

      // Sort the array of objects based on their 'sum' property in ascending order.
      indexedSums.sort(function (itemA, itemB) {
        return itemA.sum - itemB.sum;
      });

      // Create a new array to store only the original 1-based indices from the sorted objects.
      var sortedIndices = [];
      for (var k = 0; k < inputCount; k++) {
        sortedIndices.push(indexedSums[k].num);
      }

      // Print the sorted indices to the console, joined by a single space.
      console.log(sortedIndices.join(" "));
    };
  },

  // Module 2: A simple module that re-exports the Node.js 'fs' (file system) module.
  function (moduleTwoModule, moduleTwoExports) {
    // Assign the Node.js 'fs' module directly to this module's exports.
    moduleTwoExports.exports = require("fs");
  }
]);
