module.exports = function (moduleBank) {
  // A cache for already loaded modules.
  var loadedModules = {};

  /**
   * Loads a module by its identifier.
   * If the module is already in cache, its exports are returned.
   * Otherwise, the module is initialized and its exports are cached.
   * @param {number} moduleId The unique identifier for the module to load.
   * @returns {object} The exports of the loaded module.
   */
  function loadModule(moduleId) {
    // Check if the module is already in our cache.
    if (loadedModules[moduleId]) {
      return loadedModules[moduleId].exports;
    }

    // If not, create a new module entry in the cache.
    var currentModule = loadedModules[moduleId] = {
      identifier: moduleId, // Store the module's unique ID.
      isLoaded: false,      // Flag to indicate if the module has finished loading.
      exports: {}           // The object that will hold the module's exported values.
    };

    // Execute the module function, passing in the module object, its exports, and the loader itself.
    moduleBank[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

    // Mark the module as loaded.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // --- Utility functions attached to the main module loader ---

  // Store the collection of all available modules.
  loadModule.moduleDefinitions = moduleBank;

  // Store the module cache.
  loadModule.moduleCache = loadedModules;

  /**
   * Defines a property on an exports object.
   * This is used for creating getters for properties.
   * @param {object} targetExports The object on which to define the property.
   * @param {string} propertyName The name of the property to define.
   * @param {function} valueGetter A function that returns the value of the property.
   */
  loadModule.defineProp = function (targetExports, propertyName, valueGetter) {
    // Only define if the property doesn't already exist.
    if (!loadModule.hasOwnProp(targetExports, propertyName)) {
      Object.defineProperty(targetExports, propertyName, {
        enumerable: true, // Make the property enumerable.
        get: valueGetter  // Set the getter function.
      });
    }
  };

  /**
   * Marks an exports object as an ES Module.
   * @param {object} exportObject The exports object to mark.
   */
  loadModule.markAsEsModule = function (exportObject) {
    // Set Symbol.toStringTag for better debugging experience if available.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Mark as an ES Module.
    Object.defineProperty(exportObject, "__esModule", {
      value: true
    });
  };

  /**
   * Creates a namespace object for a module.
   * Handles various module types (commonjs, esm, etc.).
   * @param {any} originalModule The original module value.
   * @param {number} modeFlags Flags indicating how to interpret the module.
   * @returns {object} A namespace object.
   */
  loadModule.createNamespace = function (originalModule, modeFlags) {
    // If flag 1 is set, treat `originalModule` as a module ID and load it.
    if (modeFlags & 1) {
      originalModule = loadModule(originalModule);
    }
    // If flag 8 is set, just return the module as is.
    if (modeFlags & 8) {
      return originalModule;
    }
    // If flag 4 is set and it's an object and already an ES Module, return it.
    if (modeFlags & 4 && typeof originalModule === "object" && originalModule && originalModule.__esModule) {
      return originalModule;
    }

    // Otherwise, create a new namespace object.
    var namespaceObj = Object.create(null);
    loadModule.markAsEsModule(namespaceObj); // Mark it as an ES Module.
    Object.defineProperty(namespaceObj, "default", {
      enumerable: true,
      value: originalModule
    });

    // If flag 2 is set and it's not a string, iterate over its properties and define getters.
    if (modeFlags & 2 && typeof originalModule !== "string") {
      for (var moduleKey in originalModule) {
        loadModule.defineProp(namespaceObj, moduleKey, (function (currentKey) {
          return originalModule[currentKey];
        }).bind(null, moduleKey));
      }
    }
    return namespaceObj;
  };

  /**
   * Helper to get the default export of a module.
   * @param {object} sourceModule The module object.
   * @returns {function} A function that returns the default export.
   */
  loadModule.getDefaultExport = function (sourceModule) {
    var defaultGetter = sourceModule && sourceModule.__esModule ?
      function () {
        return sourceModule.default;
      } :
      function () {
        return sourceModule;
      };
    loadModule.defineProp(defaultGetter, "a", defaultGetter); // Define a property 'a' which is the getter itself.
    return defaultGetter;
  };

  /**
   * Checks if an object has a given property.
   * @param {object} checkedObject The object to check.
   * @param {string} checkedProperty The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  loadModule.hasOwnProp = function (checkedObject, checkedProperty) {
    return Object.prototype.hasOwnProperty.call(checkedObject, checkedProperty);
  };

  // The public path for assets (empty in this case).
  loadModule.publicPath = "";

  // Start the application by loading the entry module (module 0).
  return loadModule(loadModule.startupModule = 0);

}(
  // The array of module definitions.
  [
    /* Module 0: Entry point */
    function (modObj, expObj, reqFn) {
      // Load module 1, execute its exported function with data from module 2.
      reqFn(1)(
        reqFn(2) // Load module 2 (fs).
        .readFileSync("/dev/stdin", "UTF-8") // Read input from stdin.
        .split("\n") // Split the input into an array of lines.
      );
    },

    /* Module 1: Core logic for processing game scores */
    function (modObj, expObj) {
      expObj.exports = function (inputStrings) {
        // The first line contains the game sequence.
        var firstLine = inputStrings[0];
        // The total number of characters in the sequence.
        var lineLength = firstLine.length;
        // This variable tracks the final score.
        var scoreCounter = 0;
        // This variable tracks the balance of 'g' vs 'p' characters.
        var balanceTracker = 0;
        // Loop through each character in the sequence.
        for (var charIndex = 0; charIndex < lineLength; charIndex++) {
          // If balanceTracker is positive, we are in a 'gain' state.
          if (balanceTracker > 0) {
            // If character is 'g', increment score.
            if ("g" === firstLine[charIndex]) {
              scoreCounter++;
            }
            // Decrement balanceTracker, indicating a 'p' was matched or a 'g' was processed.
            balanceTracker--;
          } else { // balanceTracker is zero or negative, we are in a 'loss' state.
            // If character is 'p', decrement score.
            if ("p" === firstLine[charIndex]) {
              scoreCounter--;
            }
            // Increment balanceTracker, indicating a 'g' was matched or a 'p' was processed.
            balanceTracker++;
          }
        }
        // Output the final calculated score.
        console.log(scoreCounter);
      };
    },

    /* Module 2: File System utility */
    function (modObj, expObj) {
      // Export the built-in 'fs' module.
      modObj.exports = require("fs");
    }
  ]
);