module.exports = function ( moduleSources ) {
  // This object acts as a cache for already loaded modules.
  // It stores the module's state once it has been processed.
  var loadedModulesCache = {};

  /**
   * The core module loading function.
   * It attempts to retrieve a module from the cache; if not found, it loads it.
   * @param {number} moduleId - The unique identifier for the module to load.
   * @returns {object} The exports object of the requested module.
   */
  function moduleLoader( moduleId ) {
    // If the module is already in the cache, return its exports.
    if ( loadedModulesCache[moduleId] ) {
      return loadedModulesCache[moduleId].exports;
    }

    // If not in cache, create a new module entry in the cache.
    // 'currentModule' holds the module's properties: id, loaded status, and exports.
    var currentModule = loadedModulesCache[moduleId] = {
      id: moduleId,
      isLoaded: false,
      exports: {}
    };

    // Execute the module function, providing it with the module object, its exports, and the loader itself.
    // The module function is retrieved from the 'moduleSources' array using 'moduleId'.
    moduleSources[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

    // Mark the module as loaded.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // --- Helper properties and functions for the moduleLoader ---

  // 'moduleDefinitions' stores all the module functions provided to the loader.
  moduleLoader.moduleDefinitions = moduleSources;

  // 'moduleCache' is a reference to the cache object used by the loader.
  moduleLoader.moduleCache = loadedModulesCache;

  /**
   * Defines a getter property on an object for a specific export.
   * This is used to expose module exports.
   * @param {object} targetObject - The object to define the property on (e.g., module.exports).
   * @param {string} propertyName - The name of the property to define.
   * @param {Function} getterFunction - The function that returns the value of the property.
   */
  moduleLoader.defineExport = function ( targetObject, propertyName, getterFunction ) {
    // Only define the property if it doesn't already exist on the target object.
    if ( !moduleLoader.hasOwn(targetObject, propertyName) ) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable (visible in loops).
        get: getterFunction // Define the getter for the property.
      });
    }
  };

  /**
   * Registers a module by adding '__esModule' and 'Symbol.toStringTag' properties.
   * This helps in identifying ES modules and provides a custom string tag.
   * @param {object} exportObject - The module's exports object.
   */
  moduleLoader.registerModule = function ( exportObject ) {
    // If Symbol is available and Symbol.toStringTag exists, define it.
    if ( typeof Symbol !== "undefined" && Symbol.toStringTag ) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Define '__esModule' to true, indicating it's an ES module.
    Object.defineProperty(exportObject, "__esModule", {
      value: true
    });
  };

  /**
   * Handles interoperability for different module formats (CommonJS, ES Modules).
   * It ensures consistent access to module exports, especially the default export.
   * @param {any} moduleContent - The raw content of the module.
   * @param {number} flags - Bitmask flags indicating how to process the module.
   * @returns {any} The processed module content, often an interop object.
   */
  moduleLoader.interopRequire = function ( moduleContent, flags ) {
    // If flag 1 is set, it means the moduleContent itself needs to be required first.
    if ( flags & 1 ) {
      moduleContent = moduleLoader(moduleContent);
    }
    // If flag 8 is set, simply return the moduleContent as is.
    if ( flags & 8 ) {
      return moduleContent;
    }
    // If flag 4 is set and it's an object with __esModule, return it directly.
    if ( flags & 4 && typeof moduleContent === "object" && moduleContent && moduleContent.__esModule ) {
      return moduleContent;
    }

    // Create a new interop object.
    var interopObject = Object.create(null);
    // Register it as an ES module.
    moduleLoader.registerModule(interopObject);
    // Define the 'default' export property.
    Object.defineProperty(interopObject, "default", {
      enumerable: true,
      value: moduleContent
    });

    // If flag 2 is set and moduleContent is not a string,
    // iterate over its properties and define them on the interop object.
    if ( flags & 2 && typeof moduleContent !== "string" ) {
      for ( var propName in moduleContent ) {
        moduleLoader.defineExport(interopObject, propName, (function ( currentProp ) {
          return moduleContent[currentProp];
        }).bind(null, propName));
      }
    }
    return interopObject;
  };

  /**
   * Creates a getter function for the default export of a module.
   * This is used for 'require' compatibility with ES modules.
   * @param {object} inputModule - The module object.
   * @returns {Function} A getter function that returns the default export or the module itself.
   */
  moduleLoader.createDefaultExportGetter = function ( inputModule ) {
    var defaultExportGetter = inputModule && inputModule.__esModule ? function () {
      return inputModule.default;
    } : function () {
      return inputModule;
    };
    // Define a property 'a' (common convention) on the getter that returns the getter itself.
    moduleLoader.defineExport(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  /**
   * Checks if an object has a specific property as its own property.
   * @param {object} objToCheck - The object to inspect.
   * @param {string} propToCheck - The name of the property to check for.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  moduleLoader.hasOwn = function ( objToCheck, propToCheck ) {
    return Object.prototype.hasOwnProperty.call(objToCheck, propToCheck);
  };

  // 'publicPath' is typically used for resolving asset URLs in web environments.
  // Here it's an empty string, indicating no specific public path.
  moduleLoader.publicPath = "";

  // Set the startup module ID and immediately call the module loader for it.
  // This kicks off the application by loading the entry point module (module ID 0).
  return moduleLoader(moduleLoader.startupModuleId = 0);
}(
  // Array of module definitions. Each function represents a module.
  [
    // Module 0: The application's entry point.
    // It orchestrates the main logic by requiring other modules.
    function ( moduleExports, moduleObject, requireFunction ) {
      requireFunction(1)(requireFunction(2).readFileSync("/dev/stdin", "UTF-8"));
    },

    // Module 1: Contains the core business logic.
    // It processes the input data to calculate a specific result.
    function ( moduleExports, moduleObject ) {
      moduleExports.exports = function ( inputDataString ) {
        // Split the input string by newlines to get an array of lines.
        var linesArray = inputDataString.split("\n");
        // Parse the first line as the total count.
        var totalCount = Number(linesArray[0]);
        // Parse the second line, split by spaces, and convert each part to a number.
        var parsedNumbers = linesArray[1].split(" ").map(function ( currentNumberString ) {
          return Number(currentNumberString);
        });

        // Initialize variables for the calculation.
        var finalResult = 0; // Stores the final calculated count.
        var consecutiveMatchFlag = 0; // Flag to track consecutive matches.

        // Loop through the parsed numbers up to the total count.
        for ( var loopIndex = 0; loopIndex < totalCount; loopIndex++ ) {
          // Check if the number at the current index minus 1 equals the index itself.
          // This implies a condition like `numbers[i] == i + 1`.
          if ( parsedNumbers[loopIndex] - 1 == loopIndex ) {
            // If it's a match:
            if ( consecutiveMatchFlag == 1 ) {
              // If there was a consecutive match immediately before, reset the flag.
              consecutiveMatchFlag = 0;
            } else {
              // Otherwise, increment the final result and set the consecutive match flag.
              finalResult += 1;
              consecutiveMatchFlag = 1;
            }
          } else {
            // If it's not a match, reset the consecutive match flag.
            consecutiveMatchFlag = 0;
          }
        }
        // Output the final calculated result to the console.
        console.log(finalResult);
      };
    },

    // Module 2: Exposes the Node.js 'fs' (file system) module.
    // This allows other modules to interact with the file system.
    function ( moduleExports, moduleObject ) {
      moduleExports.exports = require("fs");
    }
  ]
);