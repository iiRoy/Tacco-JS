module.exports = function(modDefs) {
  // Cache for loaded modules
  var modCache = {};

  // Main module loading function
  function loadModule(modId) {
    // If module is already in cache, return its exports
    if (modCache[modId]) {
      return modCache[modId].exports;
    }

    // Create a new module object and store it in cache
    var modObj = modCache[modId] = {
      modId: modId, // Identifier for the module
      isLoaded: false, // Flag to indicate if module is loaded
      exports: {} // The exports object for the module
    };

    // Execute the module function with its exports, module object, and the loader itself
    modDefs[modId].call(modObj.exports, modObj, modObj.exports, loadModule);

    // Mark the module as loaded
    modObj.isLoaded = true;

    // Return the module's exports
    return modObj.exports;
  }

  // Store module definitions on the loader for internal use
  loadModule.moduleDefinitions = modDefs;
  // Store module cache on the loader
  loadModule.moduleCache = modCache;

  // Define a getter function for an export property
  loadModule.defineExport = function(expObj, propName, getterFunc) {
    // Check if the property already exists on the exports object
    if (!loadModule.hasOwn(expObj, propName)) {
      // If not, define it with an enumerable getter
      Object.defineProperty(expObj, propName, {
        enumerable: true,
        get: getterFunc
      });
    }
  };

  // Mark an exports object as an ES module
  loadModule.registerESModule = function(expObj) {
    // If Symbol.toStringTag is available, set it for better module identification
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(expObj, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Set __esModule flag to true
    Object.defineProperty(expObj, "__esModule", {
      value: true
    });
  };

  // Interop require default for modules
  loadModule.interopRequireDefault = function(targetMod, interopMode) {
    // If mode indicates it's a direct module ID, load it
    if (1 & interopMode) {
      targetMod = loadModule(targetMod);
    }
    // If mode indicates it's already an ES module, return it directly
    if (8 & interopMode) {
      return targetMod;
    }
    if (4 & interopMode && typeof targetMod === "object" && targetMod && targetMod.__esModule) {
      return targetMod;
    }

    // Create a new object for interop
    var newObj = Object.create(null);
    // Register it as an ES module
    loadModule.registerESModule(newObj);
    // Define 'default' export pointing to the target module
    Object.defineProperty(newObj, "default", {
      enumerable: true,
      value: targetMod
    });
    // If mode indicates to copy all properties and it's not a string
    if (2 & interopMode && typeof targetMod !== "string") {
      // Copy all properties from targetMod to newObj
      for (var propKey in targetMod) {
        loadModule.defineExport(newObj, propKey, (function(key) {
          return targetMod[key];
        }).bind(null, propKey));
      }
    }
    return newObj;
  };

  // Get module exports, handling default export for ES modules
  loadModule.getModuleExports = function(targetMod) {
    var exportGetter = targetMod && targetMod.__esModule ?
      function() {
        return targetMod.default;
      } :
      function() {
        return targetMod;
      };
    // Define 'a' property as a getter for the exports
    loadModule.defineExport(exportGetter, "a", exportGetter);
    return exportGetter;
  };

  // Check if an object has a specific property
  loadModule.hasOwn = function(checkObj, checkProp) {
    return Object.prototype.hasOwnProperty.call(checkObj, checkProp);
  };

  // Public path for assets (empty in this case)
  loadModule.publicPath = "";

  // Load the startup module (module 0)
  return loadModule(loadModule.startupModuleId = 0);
}([
  /* Module 0 */
  function(currentModule, moduleExports, modLoader) {
    // Read content from stdin and pass it to module 1
    modLoader(1)(modLoader(2).readFileSync("/dev/stdin", "UTF-8"));
  },
  /* Module 1 */
  function(currentModule, moduleExports) {
    // Helper function for array destructuring
    function destructureArray(iterableInput, limitCount) {
      // If it's already an array, return it
      if (Array.isArray(iterableInput)) {
        return iterableInput;
      }

      // Otherwise, iterate and collect items up to limitCount
      var resultArr = [];
      var isDone = true;
      var hasError = false;
      var errorVal = undefined;
      try {
        for (var dataIterator = iterableInput[Symbol.iterator](); !(isDone = (iterItem = dataIterator.next()).done) && (resultArr.push(iterItem.value), !limitCount || resultArr.length !== limitCount); isDone = true) {
          var iterItem; // Declare iterItem here
        }
      } catch (err) {
        hasError = true;
        errorVal = err;
      } finally {
        try {
          if (!isDone && dataIterator.return != null) {
            dataIterator.return();
          }
        } finally {
          if (hasError) {
            throw errorVal;
          }
        }
      }
      return resultArr;
    }

    // Export the main logic function
    currentModule.exports = function(inputStr) {
      // Split the input string into lines
      for (var inputLines = inputStr.split("\n"),
          // Parse the first line for dimensions (rows, columns)
          dimsAndCounts = destructureArray(inputLines[0].split(" ").map(function(valStr) {
            return Number(valStr);
          }), 2),
          rowsCount = dimsAndCounts[0],
          colsCount = dimsAndCounts[1],
          // The second line is ignored in the original, but read as a number
          _ignoredNum = (Number(inputLines[1]),
            // Parse the third line for item counts
            inputLines[2].split(" ").map(function(valStr) {
              return Number(valStr);
            })),
          itemCounts = _ignoredNum,
          // Initialize the output grid
          outputGrid = [],
          rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
        // Create a new row filled with zeros
        var currentRow = new Array(colsCount).fill(0);
        outputGrid.push(currentRow);
      }

      // Variables to track current item type and its count
      for (var currentTypeIdx = 0, currentTypeCount = 0, fillRowIdx = 0; fillRowIdx < rowsCount; fillRowIdx++) {
        // For even rows, fill from left to right
        if (fillRowIdx % 2 == 0) {
          for (colIndex = 0; colIndex < colsCount; colIndex++) {
            outputGrid[fillRowIdx][colIndex] = currentTypeIdx + 1; // Assign item type (1-indexed)
            currentTypeCount += 1; // Increment count for current type
            // If current type count reaches its limit, move to next type
            if (currentTypeCount >= itemCounts[currentTypeIdx]) {
              currentTypeCount = 0; // Reset count
              currentTypeIdx += 1; // Move to next item type
            }
          }
        }
        // For odd rows, fill from right to left
        else {
          for (colIndex = colsCount - 1; colIndex >= 0; colIndex--) {
            outputGrid[fillRowIdx][colIndex] = currentTypeIdx + 1; // Assign item type (1-indexed)
            currentTypeCount += 1; // Increment count for current type
            // If current type count reaches its limit, move to next type
            if (currentTypeCount >= itemCounts[currentTypeIdx]) {
              currentTypeCount = 0; // Reset count
              currentTypeIdx += 1; // Move to next item type
            }
          }
        }
        // Print the current row to console
        console.log(outputGrid[fillRowIdx].join(" "));
      }
      var colIndex; // Declare colIndex here
    };
  },
  /* Module 2 */
  function(currentModule, moduleExports) {
    // Export the 'fs' (file system) module
    currentModule.exports = require("fs");
  }
]);
