module.exports = function (moduleDefinitions) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The primary function responsible for loading and caching modules.
  function loadModule(moduleId) {
    // If the module is already in the cache, return its exported value immediately.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If the module is not cached, create a new entry for it.
    // The 'currentModule' object holds the module's metadata and its exports.
    var currentModule = moduleCache[moduleId] = {
      identifier: moduleId, // 'i' in original: Unique ID for the module.
      isLoaded: false, // 'l' in original: Flag indicating if the module's code has been executed.
      exports: {} // The object that will be populated with the module's exports.
    };

    // Execute the module's definition function.
    // The definition function receives:
    // 1. The 'currentModule' object itself.
    // 2. The 'exports' object to which the module should add its public API.
    // 3. The 'loadModule' function, allowing the module to 'require' its dependencies.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, loadModule);

    // Mark the module as loaded after its definition function has run.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Attach the original module definitions to the loader for potential introspection.
  loadModule.moduleMap = moduleDefinitions;

  // Attach the module cache to the loader.
  loadModule.cache = moduleCache;

  // Helper function to define a getter for a property on an object.
  // Used for ES module compatibility to expose exports as getters.
  loadModule.defineGetter = function (targetObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist.
    if (!loadModule.hasProperty(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property visible during enumeration.
        get: getterFunction // The function to call when the property is accessed.
      });
    }
  };

  // Helper function to mark an object as an ES module and set its Symbol.toStringTag.
  loadModule.markAsEsModule = function (targetModule) {
    // If Symbol and Symbol.toStringTag are available, set the tag.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Mark the module as an ES module.
    Object.defineProperty(targetModule, "__esModule", {
      value: true
    });
  };

  // Helper for interoperability between different module export styles (CommonJS, ES Modules).
  // 'typeFlags' control how the module value is processed.
  loadModule.interopDefault = function (moduleValue, typeFlags) {
    // Flag 1: If the moduleValue is an ID, load the module first.
    if (1 & typeFlags && (moduleValue = loadModule(moduleValue)));
    // Flag 8: If set, return the moduleValue directly without further processing.
    if (8 & typeFlags) return moduleValue;
    // Flag 4: If set and the moduleValue is an object already marked as an ES module, return it directly.
    if (4 & typeFlags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) return moduleValue;

    // If none of the above, create a new object to represent the module.
    var newObject = Object.create(null);
    // Mark the new object as an ES module and define its 'default' export.
    if (loadModule.markAsEsModule(newObject), Object.defineProperty(newObject, "default", {
        enumerable: true,
        value: moduleValue
      }),
      // Flag 2: If set and moduleValue is not a string, copy all its properties to the new object.
      2 & typeFlags && typeof moduleValue !== "string")
      for (var propName in moduleValue) loadModule.defineGetter(newObject, propName, (function (key) {
        return moduleValue[key]
      }).bind(null, propName));
    return newObject;
  };

  // Helper function to get the default export of a module, handling ES module default exports.
  loadModule.getDefaultExport = function (moduleExports) {
    var defaultExportFn = moduleExports && moduleExports.__esModule ?
      function () {
        return moduleExports.default
      } :
      function () {
        return moduleExports
      };
    // Define an alias 'a' for the default export function.
    return loadModule.defineGetter(defaultExportFn, "a", defaultExportFn), defaultExportFn
  };

  // Helper function to check if an object has a specific property directly (not inherited).
  loadModule.hasProperty = function (targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey)
  };

  // The public path for assets (empty in this specific bundle).
  loadModule.assetPath = "";

  // Set the entry point module ID and then load it to start the application.
  return loadModule(loadModule.entryPoint = 0)
}([ // Array containing all the module definitions.

  // Module 0: The application's entry point.
  function (mod0, exp0, req0) {
    // Require module 1 (the main logic) and immediately invoke it.
    // The input for module 1 is read from standard input, decoded as UTF-8, and split by newlines.
    req0(1)(req0(2).readFileSync("/dev/stdin", "UTF-8").split("\n"))
  },

  // Module 1: Contains the core logic to process the input string.
  function (mod1, exp1, req1) {
    "use strict"; // Enforce strict mode for this module.

    // Export a function that takes an array of input lines.
    mod1.exports = function (inputData) {
      // Get the first line from the input array.
      var firstString = inputData[0];
      // Determine the length of the first line.
      var stringLength = firstString.length;

      // Iterate through the characters of the first line, checking for adjacent identical characters.
      for (var charIndex = 0; charIndex < stringLength - 1; charIndex++) {
        // If two consecutive characters are the same, print "Bad" and terminate the function.
        if (firstString[charIndex] == firstString[charIndex + 1]) return void console.log("Bad");
      }
      // If no adjacent identical characters are found after checking the entire string, print "Good".
      console.log("Good")
    }
  },

  // Module 2: Provides access to the Node.js 'fs' (file system) module.
  function (mod2, exp2) {
    // Export the native 'fs' module directly.
    mod2.exports = require("fs")
  }
]);
