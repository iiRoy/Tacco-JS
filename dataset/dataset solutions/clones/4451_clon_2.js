module.exports = function (moduleDefinitions) {

  /* A cache for already loaded modules. */
  var cachedModules = {};

  /**
   * The core module loading function.
   * @param {number} moduleId - The unique identifier for the module to load.
   * @returns {object} The exports of the requested module.
   */
  function obtainModule(moduleId) {
    // If the module is already in cache, return its exports.
    if (cachedModules[moduleId]) {
      return cachedModules[moduleId].exports;
    }

    // Otherwise, create a new module entry in the cache.
    var currentModule = cachedModules[moduleId] = {
      identifier: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module function with its specific context.
    moduleDefinitions[moduleId].call(
      currentModule.exports,
      currentModule,
      currentModule.exports,
      obtainModule
    );

    // Mark the module as loaded and return its exports.
    currentModule.isLoaded = true;
    return currentModule.exports;
  }

  // Store all module definitions on the loader function.
  obtainModule.allDefinitions = moduleDefinitions;

  // Reference to the module cache on the loader function.
  obtainModule.moduleCache = cachedModules;

  /**
   * Defines a getter property on an object, if it doesn't already exist.
   * @param {object} targetObj - The object to define the property on.
   * @param {string} propName - The name of the property.
   * @param {function} getterFn - The getter function for the property.
   */
  obtainModule.defineGetter = function (targetObj, propName, getterFn) {
    if (!obtainModule.hasOwnProp(targetObj, propName)) {
      Object.defineProperty(targetObj, propName, {
        enumerable: true,
        get: getterFn
      });
    }
  };

  /**
   * Marks an object as an ES Module, adding __esModule and Symbol.toStringTag properties.
   * @param {object} exportObj - The object to mark.
   */
  obtainModule.markAsEsModule = function (exportObj) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObj, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(exportObj, "__esModule", {
      value: true
    });
  };

  /**
   * Creates a namespace object for a module, handling different export types.
   * @param {any} sourceModule - The module or its exports.
   * @param {number} modeFlags - Flags indicating how to interpret the source module.
   * @returns {object} The created namespace object.
   */
  obtainModule.createNamespace = function (sourceModule, modeFlags) {
    // If flag 1 is set and sourceModule is not already a module, load it.
    if (modeFlags & 1) {
      sourceModule = obtainModule(sourceModule);
    }
    // If flag 8 is set, return the source module directly.
    if (modeFlags & 8) {
      return sourceModule;
    }
    // If flag 4 is set and sourceModule is an object and already an ES Module, return it.
    if (modeFlags & 4 && typeof sourceModule === "object" && sourceModule && sourceModule.__esModule) {
      return sourceModule;
    }

    // Create a new empty object for the namespace.
    var namespaceObj = Object.create(null);
    // Mark it as an ES Module.
    obtainModule.markAsEsModule(namespaceObj);
    // Define a 'default' getter for the sourceModule.
    Object.defineProperty(namespaceObj, "default", {
      enumerable: true,
      value: sourceModule
    });
    // If flag 2 is set and sourceModule is not a string, copy all properties.
    if (modeFlags & 2 && typeof sourceModule !== "string") {
      for (var keyName in sourceModule) {
        obtainModule.defineGetter(namespaceObj, keyName, ((prop) => sourceModule[prop]).bind(null, keyName));
      }
    }
    return namespaceObj;
  };

  /**
   * Helper to get an accessor function for a module's default export.
   * @param {object} moduleRef - The module reference.
   * @returns {function} An accessor function.
   */
  obtainModule.getExportAccessor = function (moduleRef) {
    var accessorFn = moduleRef && moduleRef.__esModule ?
      () => moduleRef.default :
      () => moduleRef;
    obtainModule.defineGetter(accessorFn, "a", accessorFn); // 'a' is a common webpack alias for the accessor.
    return accessorFn;
  };

  /**
   * Checks if an object has a specific property as its own property.
   * @param {object} objectToCheck - The object to check.
   * @param {string} propertyKey - The property key to look for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  obtainModule.hasOwnProp = function (objectToCheck, propertyKey) {
    return Object.prototype.hasOwnProperty.call(objectToCheck, propertyKey);
  };

  // Public path for assets (empty in this case).
  obtainModule.basePath = "";

  // Kick off the loading process by requiring the entry module (module ID 0).
  return obtainModule(obtainModule.startupModuleId = 0);

}([
  /* Module Definitions Array */

  /**
   * Module 0: Reads input from stdin and passes it to Module 1 for processing.
   * @param {object} moduleZeroExports - The exports object for this module.
   * @param {object} moduleZeroImports - The imports object for this module (unused here).
   * @param {function} moduleZeroRequester - The local require function for this module.
   */
  function (moduleZeroExports, moduleZeroImports, moduleZeroRequester) {
    // Obtain module 1 (the main logic) and call it with the content of stdin.
    moduleZeroRequester(1)(
      moduleZeroRequester(2).readFileSync("/dev/stdin", "UTF-8")
    );
  },

  /**
   * Module 1: Contains the core logic for processing input and generating the grid.
   * @param {object} moduleOneExports - The exports object for this module.
   * @param {object} moduleOneImports - The imports object for this module (unused here).
   */
  function (moduleOneExports, moduleOneImports) {

    /**
     * Safely destructures an array, handling non-iterable instances.
     * @param {Array} inputArray - The array to destructure.
     * @param {number} expectedLength - The expected number of elements to extract.
     * @returns {Array} An array of extracted elements.
     * @throws {TypeError} If the input is not an iterable instance.
     */
    function safeDestructure(inputArray, expectedLength) {
      // Case 1: If it's already an array, return it.
      if (Array.isArray(inputArray)) return inputArray;

      // Case 2: Attempt to iterate and extract items.
      return (function (sourceIterable, limit) {
        var extractedItems = [];
        var notDoneYet = true;
        var hasError = false;
        var errorValue = undefined;

        try {
          // Get the iterator for the source.
          for (
            var iteratorItem, iteratorInstance = sourceIterable[Symbol.iterator](); !(notDoneYet = (iteratorItem = iteratorInstance.next()).done) &&
            (extractedItems.push(iteratorItem.value), !limit || extractedItems.length !== limit); notDoneYet = true
          ) {}
        } catch (iterationError) {
          hasError = true;
          errorValue = iterationError;
        } finally {
          try {
            // Ensure the iterator is closed if it wasn't done naturally.
            if (!notDoneYet && iteratorInstance.return != null) {
              iteratorInstance.return();
            }
          } finally {
            // Re-throw if an error occurred during iteration.
            if (hasError) throw errorValue;
          }
        }
        return extractedItems;
      })(inputArray, expectedLength) ||
      // Case 3: If all else fails, throw an error.
      (function () {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      })();
    }

    /* Assign the main processing function to module exports. */
    moduleOneExports.exports = function (rawDataString) {
      // Split the raw input into individual lines.
      var lineFragments = rawDataString.split("\n");

      // Parse the first line for grid dimensions (rows, columns).
      var dimensionsTuple = safeDestructure(
        lineFragments[0].split(" ").map((strVal) => Number(strVal)),
        2
      );
      var rowsCount = dimensionsTuple[0];
      var colsCount = dimensionsTuple[1];

      // Parse the third line for the sequence values, ignoring the second line.
      // The original code `(Number(e[1]), e[2]...)` evaluates `Number(e[1])` but discards its result.
      var sequenceValues = (Number(lineFragments[1]), lineFragments[2].split(" ").map((strVal) => Number(strVal)));

      // Initialize the output grid structure.
      var outputGrid = [];
      for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
        var currentRow = Array.from({
          length: colsCount
        }, () => 0); // Using Array.from for diversity
        outputGrid.push(currentRow);
      }

      // Variables to track the current sequence and its count.
      var currentSequenceIndex = 0;
      var currentSequenceCount = 0;

      // Populate the grid in a snake-like pattern.
      for (let gridRowIndexer = 0; gridRowIndexer < rowsCount; gridRowIndexer++) {
        if (gridRowIndexer % 2 === 0) {
          // Even rows: fill from left to right.
          for (let gridColIndexer = 0; gridColIndexer < colsCount; gridColIndexer++) {
            outputGrid[gridRowIndexer][gridColIndexer] = currentSequenceIndex + 1;
            currentSequenceCount++;
            // Check if the current sequence value limit is reached.
            if (currentSequenceCount >= sequenceValues[currentSequenceIndex]) {
              currentSequenceCount = 0; // Reset count.
              currentSequenceIndex++; // Move to the next sequence.
            }
          }
        } else {
          // Odd rows: fill from right to left.
          for (let gridColIndexer = colsCount - 1; gridColIndexer >= 0; gridColIndexer--) {
            outputGrid[gridRowIndexer][gridColIndexer] = currentSequenceIndex + 1;
            currentSequenceCount++;
            // Check if the current sequence value limit is reached.
            if (currentSequenceCount >= sequenceValues[currentSequenceIndex]) {
              currentSequenceCount = 0; // Reset count.
              currentSequenceIndex++; // Move to the next sequence.
            }
          }
        }
        // Print the current row to console.
        console.log(outputGrid[gridRowIndexer].join(" "));
      }
    };
  },

  /**
   * Module 2: Exports the Node.js 'fs' (file system) module.
   * @param {object} moduleTwoExports - The exports object for this module.
   * @param {object} moduleTwoImports - The imports object for this module (unused here).
   */
  function (moduleTwoExports, moduleTwoImports) {
    // Export the built-in 'fs' module for file operations.
    moduleTwoExports.exports = require("fs");
  }
]);