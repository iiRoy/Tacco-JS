module.exports = function(moduleSources)
{
  // A registry for storing already loaded modules, acting as a cache.
  var moduleRegistry = {};

  // This function serves as a custom module loader/resolver within the bundle.
  function loadModule(moduleId)
  {
    // If the requested module is already in our registry, return its exports immediately.
    if (moduleRegistry[moduleId])
    {
      return moduleRegistry[moduleId].exports;
    }

    // If the module isn't loaded, create a new entry for it in the registry.
    var currentModule = moduleRegistry[moduleId] = {
      id: moduleId, // The unique identifier for this module.
      initialized: false, // Flag indicating if the module's code has been executed.
      exports: {} // The object that will hold the module's exported values.
    };

    // Execute the module's source function. The 'call' method sets 'this' to 'currentModule.exports'
    // and passes 'currentModule', 'currentModule.exports', and 'loadModule' as arguments.
    moduleSources[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

    // Mark the module as fully initialized after its code has run.
    currentModule.initialized = true;

    // Return the exports object of the newly loaded module.
    return currentModule.exports;
  }

  // Attach a reference to the array of module source functions.
  loadModule.sourceMap = moduleSources;

  // Attach a reference to the module registry (cache).
  loadModule.cacheStore = moduleRegistry;

  // Helper function to define an enumerable getter property on an object.
  loadModule.defineExport = function(targetObject, propertyName, getterFunction)
  {
    if (!loadModule.ownPropertyCheck(targetObject, propertyName))
    {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property iterable.
        get: getterFunction // Define the getter for the property's value.
      });
    }
  };

  // Helper function to mark an object as an ECMAScript Module (ESM) for compatibility.
  loadModule.markAsEsModule = function(exportObject)
  {
    // If Symbol and Symbol.toStringTag are available, set the module's string tag.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag)
    {
      Object.defineProperty(exportObject, Symbol.toStringTag, { value: "Module" });
    }
    // Set the __esModule flag, a common convention for ESMs.
    Object.defineProperty(exportObject, "__esModule", { value: true });
  };

  // Helper for handling interoperability between different module formats (e.g., CommonJS and ES Modules).
  loadModule.interopRequire = function(inputVal, modeFlags)
  {
    // If flag 1 is set, treat 'inputVal' as a module ID and load it.
    if (1 & modeFlags)
    {
      inputVal = loadModule(inputVal);
    }
    // If flag 8 is set, return the value directly.
    if (8 & modeFlags)
    {
      return inputVal;
    }
    // If flag 4 is set and the input is an object marked as an ES module, return it directly.
    if (4 & modeFlags && typeof inputVal === "object" && inputVal && inputVal.__esModule)
    {
      return inputVal;
    }

    // Create a new object to act as a container for the default export.
    var defaultExportContainer = Object.create(null);
    loadModule.markAsEsModule(defaultExportContainer); // Mark this container as an ES module.

    // Define a 'default' property pointing to the input value.
    Object.defineProperty(defaultExportContainer, "default", {
      enumerable: true,
      value: inputVal
    });

    // If flag 2 is set and the input is not a string, copy all its properties to the new container.
    if (2 & modeFlags && typeof inputVal !== "string")
    {
      for (var keyIter in inputVal)
      {
        loadModule.defineExport(defaultExportContainer, keyIter, (function(prop) {
          return inputVal[prop];
        }).bind(null, keyIter)); // Bind the current property name to the getter function.
      }
    }
    return defaultExportContainer;
  };

  // Helper function to retrieve the default export from a module reference.
  loadModule.getDefaultExport = function(moduleRef)
  {
    var accessorFunc = moduleRef && moduleRef.__esModule ? // Check if the module reference is an ES module.
      function() {
        return moduleRef.default; // If it is, return its 'default' export.
      } :
      function() {
        return moduleRef; // Otherwise, return the module reference itself.
      };
    loadModule.defineExport(accessorFunc, "a", accessorFunc); // Define a property 'a' on the accessor function.
    return accessorFunc;
  };

  // Helper function to check if an object has a specific property using Object.prototype.hasOwnProperty.
  loadModule.ownPropertyCheck = function(targetObj, propName)
  {
    return Object.prototype.hasOwnProperty.call(targetObj, propName);
  };

  // The public path for loading additional resources (empty string in this configuration).
  loadModule.publicPath = "";

  // Set the starting module ID and immediately load it to begin application execution.
  return loadModule(loadModule.startupModuleId = 0);
}([ // Array containing all module definitions, indexed by their module ID.

  /*
   * Module ID 0: The primary entry point for the application's logic.
   * This module reads data from standard input and processes it.
   */
  function(moduleZeroExports, moduleZeroModule, moduleZeroLoader)
  {
    // Load Module 1 (the main algorithm) and immediately invoke it.
    // The argument for Module 1 is the result of reading from /dev/stdin using Module 2's file system capabilities.
    moduleZeroLoader(1)(moduleZeroLoader(2).readFileSync("/dev/stdin", "UTF-8"));
  },

  /*
   * Module ID 1: Implements the core algorithm for processing textual input.
   * This module calculates a value based on comparisons between two sequences of characters.
   */
  function(moduleOneContainer, moduleOneExports)
  {
    moduleOneContainer.exports = function(inputStringData)
    {
      // Split the entire input string into individual lines.
      var lineFragments = inputStringData.split("\n");

      // A large prime number used for modulo operations to keep results within bounds.
      var moduloConstant = 1000000007;

      // Parse the first line of the input as a number, representing the length of sequences.
      var inputLength = Number(lineFragments[0]);

      // Split the second line into an array of individual characters.
      var firstSequence = lineFragments[1].split("");

      // Split the third line into another array of individual characters.
      var secondSequence = lineFragments[2].split("");

      // Initialize the accumulator for the final result.
      var resultAccumulator = 1;

      // State variable: 0 = initial, 1 = last operation was a match, 2 = last operation was a mismatch.
      var currentProcessingState = 0;

      // Iterate through the character sequences up to the determined input length.
      for (var loopIndex = 0; loopIndex < inputLength; loopIndex++)
      {
        // Check if characters at the current index in both sequences are identical.
        if (firstSequence[loopIndex] === secondSequence[loopIndex])
        {
          // If characters match:
          if (currentProcessingState === 0)
          { // First comparison
            resultAccumulator *= 3;
          }
          else if (currentProcessingState === 1)
          { // Previous was also a match
            resultAccumulator *= 2;
          }
          else if (currentProcessingState === 2)
          { // Previous was a mismatch
            resultAccumulator *= 1; // Multiplier of 1 keeps the value unchanged.
          }
          currentProcessingState = 1; // Update state to 'match'.
          resultAccumulator %= moduloConstant; // Apply modulo operation.
        }
        else
        {
          // If characters do not match:
          if (currentProcessingState === 0)
          { // First comparison
            resultAccumulator *= 6;
          }
          else if (currentProcessingState === 1)
          { // Previous was a match
            resultAccumulator *= 2;
          }
          else if (currentProcessingState === 2)
          { // Previous was a mismatch
            resultAccumulator *= 3;
          }
          resultAccumulator %= moduloConstant; // Apply modulo operation.
          currentProcessingState = 2; // Update state to 'mismatch'.
          loopIndex += 1; // Increment loop index by an additional step, as this accounts for two positions.
        }
      }
      // Print the final computed result to the console.
      console.log(resultAccumulator);
    };
  },

  /*
   * Module ID 2: Provides access to file system functionalities.
   * This module exports the Node.js 'fs' (file system) module.
   */
  function(moduleTwoContainer, moduleTwoExports)
  {
    // Export the standard Node.js 'fileSystem' module.
    moduleTwoContainer.exports = require("fileSystem");
  }
]);