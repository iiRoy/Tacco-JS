module.exports = function(modules) {
  // The module cache stores already loaded modules.
  var moduleCache = {};

  // The main require function for loading modules.
  function __webpack_require__(moduleId) {
    // If the module is already in the cache, return its exports.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // Create a new module object and add it to the cache.
    var currentModule = moduleCache[moduleId] = {
      id: moduleId, // Unique identifier for the module.
      loaded: false, // Flag to indicate if the module has been loaded.
      exports: {} // The exports object for the module.
    };

    // Execute the module function with its specific context.
    // `this` is set to `currentModule.exports`, and parameters are `currentModule`, `currentModule.exports`, and `__webpack_require__`.
    modules[moduleId].call(currentModule.exports, currentModule, currentModule.exports, __webpack_require__);

    // Mark the module as loaded after execution.
    currentModule.loaded = true;

    // Return the exports of the module.
    return currentModule.exports;
  }

  // Expose the original modules array (for debugging or advanced usage).
  __webpack_require__.moduleMap = modules;

  // Expose the module cache.
  __webpack_require__.cache = moduleCache;

  // Helper to define a getter function for harmony exports (ESM compatibility).
  __webpack_require__.defineExport = function(targetObject, propertyName, getterFunction) {
    // Only define if the property doesn't already exist on the target object.
    if (!__webpack_require__.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable.
        get: getterFunction // Use the provided getter function.
      });
    }
  };

  // Helper to define __esModule and Symbol.toStringTag for ES module compatibility.
  __webpack_require__.registerModule = function(exportsObject) {
    // If Symbol and Symbol.toStringTag are available, define the toStringTag.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Define the __esModule property to indicate it's an ES module.
    Object.defineProperty(exportsObject, "__esModule", {
      value: true
    });
  };

  // Helper to create a fake namespace object for interop with non-ES modules.
  __webpack_require__.interopRequire = function(value, mode) {
    // mode & 1: value is a module ID, require it.
    if (mode & 1) value = __webpack_require__(value);
    // mode & 8: behave like a direct require, return the value as is.
    if (mode & 8) return value;
    // mode & 4: if value is already an ES module namespace object, return it.
    if ((mode & 4) && typeof value === "object" && value && value.__esModule) return value;

    // Create a new namespace object.
    var namespaceObject = Object.create(null);
    // Register it as an ES module.
    __webpack_require__.registerModule(namespaceObject);
    // Define a 'default' export pointing to the original value.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: value
    });
    // mode & 2: merge all properties of the original value into the namespace object.
    if (mode & 2 && typeof value !== "string") {
      for (var key in value) {
        __webpack_require__.defineExport(namespaceObject, key, (function(currentKey) {
          return value[currentKey];
        }).bind(null, key));
      }
    }
    return namespaceObject;
  };

  // Helper to get the default export for compatibility with non-harmony modules.
  __webpack_require__.importDefault = function(moduleObject) {
    var getter = moduleObject && moduleObject.__esModule ?
      function() {
        return moduleObject.default;
      } :
      function() {
        return moduleObject;
      };
    // Define a property 'a' on the getter function itself, pointing to the getter.
    __webpack_require__.defineExport(getter, "a", getter);
    return getter;
  };

  // Helper for Object.prototype.hasOwnProperty.call.
  __webpack_require__.hasOwn = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  // The public path for assets (often an empty string in simple setups).
  __webpack_require__.publicPath = "";

  // Load the entry module (module 0) and return its exports.
  // `__webpack_require__.s` is often used to store the entry module ID.
  return __webpack_require__(__webpack_require__.s = 0);
}([
  /* 0 */
  // This is the main entry module of the application.
  function(module, exports, localRequire) {
    // Read input from /dev/stdin, decode as UTF-8, split by newlines,
    // and pass the resulting array of lines to module 1.
    localRequire(1)(localRequire(2).readFileSync("/dev/stdin", "UTF-8").split("\n"));
  },
  /* 1 */
  // This module contains the core logic for processing the input.
  function(module, exports) {
    // A helper function to safely destructure an iterable into an array,
    // optionally limiting the number of elements extracted.
    function _arrayDestructure(iterableInput, limit) {
      // If the input is already an array, return it directly.
      if (Array.isArray(iterableInput)) {
        return iterableInput;
      }

      var tempArray = []; // Array to store extracted elements.
      var isDone = true; // Flag to track if iteration is complete.
      var hasError = false; // Flag to track if an error occurred during iteration.
      var errorValue = undefined; // Stores the error if one occurs.

      try {
        // Get the iterator for the input.
        for (var iterator = iterableInput[Symbol.iterator](); !(isDone = (iteratorResult = iterator.next()).done) && (tempArray.push(iteratorResult.value), !limit || tempArray.length !== limit); isDone = true) {
          // The loop body is intentionally empty; all logic is in the for-loop header.
          var iteratorResult; // Declared here to be accessible in the loop condition.
        }
      } catch (err) {
        hasError = true;
        errorValue = err;
      } finally {
        try {
          // If the iterator is not done and has a return method, call it.
          if (!isDone && iterator.return != null) {
            iterator.return();
          }
        } finally {
          // If an error occurred, re-throw it.
          if (hasError) {
            throw errorValue;
          }
        }
      }
      return tempArray; // Return the collected elements.
    }

    // The main function exported by this module.
    module.exports = function(inputLines) {
      // Parse the first line of input, which contains N, K, M.
      // Split by space, convert to numbers, and destructure into three variables.
      var firstLineValues = _arrayDestructure(inputLines[0].split(" ").map(function(strValue) {
        return Number(strValue);
      }), 3);

      var totalItems = firstLineValues[0]; // N: Total number of items.
      var maxCapacityPerContainer = firstLineValues[1]; // K: Maximum capacity of a container (including the base item).
      var itemRangeThreshold = firstLineValues[2]; // M: Maximum allowed difference from the base item in a container.

      // Collect the individual item measurements from the subsequent lines.
      var itemMeasurements = [];
      for (var itemIndex = 0; itemIndex < totalItems; itemIndex++) {
        var currentMeasurement = Number(inputLines[itemIndex + 1]);
        itemMeasurements.push(currentMeasurement);
      }

      // Sort the item measurements in ascending order.
      itemMeasurements.sort(function(valA, valB) {
        return valA - valB;
      });

      // Initialize variables for the container allocation algorithm.
      var containerCount = 1; // Start with one container.
      // Remaining capacity in the current container (K-1 because one item already sets the base).
      var currentContainerCapacity = maxCapacityPerContainer - 1;
      // The value of the first item in the current container, used as a reference.
      var containerBaseValue = itemMeasurements[0];

      // Iterate through the sorted items, starting from the second item.
      for (var sortedItemIndex = 1; sortedItemIndex < totalItems; sortedItemIndex++) {
        // Check if the current item can be placed in the current container:
        // 1. Its value is within the allowed range (containerBaseValue + itemRangeThreshold).
        // 2. There is still capacity left in the current container.
        if (itemMeasurements[sortedItemIndex] <= containerBaseValue + itemRangeThreshold && currentContainerCapacity > 0) {
          currentContainerCapacity -= 1; // Place the item, decrement remaining capacity.
        } else {
          // If the item cannot fit, a new container is required.
          containerCount += 1; // Increment the total container count.
          currentContainerCapacity = maxCapacityPerContainer - 1; // Reset capacity for the new container.
          containerBaseValue = itemMeasurements[sortedItemIndex]; // The current item becomes the base for the new container.
        }
      }

      // Output the final calculated number of containers.
      console.log(containerCount);
    };
  },
  /* 2 */
  // This module simply exports the Node.js 'fs' (file system) module.
  function(module, exports) {
    module.exports = require("fs");
  }
]);
