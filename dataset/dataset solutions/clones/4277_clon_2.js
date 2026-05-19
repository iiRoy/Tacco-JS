module.exports = (function(moduleDefinitionsArray) {
  // This object serves as a cache for modules that have already been loaded.
  var loadedModuleCache = {};

  // The central function responsible for loading modules.
  // It takes a numeric identifier for the module to be loaded.
  function moduleLoaderFunction(moduleId) {
    // If the module is already present in the cache, return its exported value immediately.
    if (loadedModuleCache[moduleId]) {
      return loadedModuleCache[moduleId].exports;
    }

    // If the module is not in the cache, create a new module object.
    // This object tracks the module's identifier, its loading status, and its exports.
    var currentModuleObject = loadedModuleCache[moduleId] = {
      moduleIdentifier: moduleId,
      isModuleLoaded: false,
      exports: {}
    };

    // Execute the module's definition function.
    // The function is called with the module object, its exports, and the loader itself.
    // This allows the module to populate its exports and require other modules.
    moduleDefinitionsArray[moduleId].call(
      currentModuleObject.exports,
      currentModuleObject,
      currentModuleObject.exports,
      moduleLoaderFunction
    );

    // Mark the module as fully loaded after its definition function has executed.
    currentModuleObject.isModuleLoaded = true;

    // Return the exports of the newly loaded module.
    return currentModuleObject.exports;
  }

  // Attach the array of module definitions to the loader function for internal access.
  moduleLoaderFunction.allModuleDefinitions = moduleDefinitionsArray;

  // Attach the module cache to the loader function.
  moduleLoaderFunction.cachedModules = loadedModuleCache;

  // A utility function to define a getter property on an object.
  // This is often used for lazy loading or computed exports.
  moduleLoaderFunction.defineExportProperty = function(targetObject, propertyKey, getterFunction) {
    // Only define the property if it doesn't already exist on the target object.
    if (!moduleLoaderFunction.checkOwnProperty(targetObject, propertyKey)) {
      Object.defineProperty(targetObject, propertyKey, {
        enumerable: true, // Make the property enumerable (visible in for...in loops).
        get: getterFunction // Assign the provided function as the getter.
      });
    }
  };

  // Marks an exports object as an ES Module.
  // This adds standard properties like Symbol.toStringTag and __esModule.
  moduleLoaderFunction.markAsEsModule = function(exportsObject) {
    // If Symbol and Symbol.toStringTag are available, set the tag.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Always set the __esModule flag to true.
    Object.defineProperty(exportsObject, "__esModule", {
      value: true
    });
  };

  // Creates a synthetic namespace object for interoperability between different module formats.
  moduleLoaderFunction.createInteropNamespace = function(originalModule, modeFlags) {
    // If the first bit is set, resolve the module using the loader.
    if (modeFlags & 1) {
      originalModule = moduleLoaderFunction(originalModule);
    }
    // If the eighth bit is set, return the module as is.
    if (modeFlags & 8) {
      return originalModule;
    }
    // If the fourth bit is set, and it's an object that's already an ES module, return it.
    if (modeFlags & 4 && typeof originalModule === "object" && originalModule && originalModule.__esModule) {
      return originalModule;
    }

    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    // Mark this new object as an ES module.
    moduleLoaderFunction.markAsEsModule(namespaceObject);
    // Define a 'default' export that points to the original module content.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: originalModule
    });

    // If the second bit is set and the module is not a string,
    // copy all properties from the original module to the namespace object.
    if (modeFlags & 2 && typeof originalModule !== "string") {
      for (var propertyName in originalModule) {
        moduleLoaderFunction.defineExportProperty(
          namespaceObject,
          propertyName,
          (function(key) {
            return originalModule[key];
          }).bind(null, propertyName)
        );
      }
    }
    return namespaceObject;
  };

  // Creates a getter function for a module's default export.
  moduleLoaderFunction.createDefaultExportGetter = function(moduleReference) {
    var accessorForDefault = moduleReference && moduleReference.__esModule ?
      function() {
        return moduleReference.default;
      } :
      function() {
        return moduleReference;
      };
    // Define an 'a' property on the accessor, which also points to the default export.
    moduleLoaderFunction.defineExportProperty(accessorForDefault, "a", accessorForDefault);
    return accessorForDefault;
  };

  // Checks if an object has a specific property directly (not inherited).
  moduleLoaderFunction.checkOwnProperty = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // The public path for loading assets (currently an empty string).
  moduleLoaderFunction.assetPublicPath = "";

  // Set the startup module ID and immediately load it to begin execution.
  return moduleLoaderFunction(moduleLoaderFunction.startupModuleId = 0);

})([
  // Module 0: The application's entry point.
  function(moduleContext, moduleExports, moduleRequire) {
    // This module reads content from standard input and passes it to the main logic module.
    moduleRequire(1)(moduleRequire(2).readFileSync("/dev/stdin", "UTF-8"));
  },

  // Module 1: Contains the core logic for string pattern matching and replacement.
  function(moduleContext, moduleExports) {
    // This function is exported and takes the input string as an argument.
    moduleContext.exports = function(fullInputString) {
      // Split the input string into an array of lines.
      var inputLines = fullInputString.split("\n");
      // The first line is considered the primary text.
      var primaryText = inputLines[0];
      // Determine the length of the primary text.
      var primaryTextLength = primaryText.length;
      // The second line is the pattern to search for.
      var searchPattern = inputLines[1];
      // Determine the length of the search pattern.
      var searchPatternLength = searchPattern.length;

      // Initialize a variable to store the starting index of a found match.
      // -1 indicates no match has been found yet.
      var matchStartPos = -1;

      // Iterate backwards through the primary text to find the rightmost match.
      // The loop starts from the latest possible position where the pattern could fit.
      for (var textCurrentPos = primaryTextLength - searchPatternLength; textCurrentPos >= 0; textCurrentPos--) {
        // Assume a match at the current position until proven otherwise.
        var isCurrentPositionMatch = true;
        // Compare characters of the pattern with the corresponding characters in the primary text.
        for (var patternCharIdx = 0; patternCharIdx < searchPatternLength; patternCharIdx++) {
          // If characters do not match AND the pattern character is not a wildcard '?',
          // then this position is not a match.
          if (
            primaryText[textCurrentPos + patternCharIdx] !== searchPattern[patternCharIdx] &&
            "?" !== searchPattern[patternCharIdx]
          ) {
            isCurrentPositionMatch = false;
            // Break out of the inner loop as soon as a mismatch is found.
            break;
          }
        }
        // If a full match was found for the current position, record its starting index
        // and stop searching further (since we want the rightmost match).
        if (isCurrentPositionMatch) {
          matchStartPos = textCurrentPos;
          break;
        }
      }

      // After the search, check the result.
      // If no match was found (matchStartPos is still -1) or the pattern is longer than the text,
      // print "UNRESTORABLE".
      if (matchStartPos === -1 || searchPatternLength > primaryTextLength) {
        console.log("UNRESTORABLE");
      } else {
        // If a match was found, construct the restored string.
        // It's composed of the part of the primary text before the match,
        // followed by the search pattern itself,
        // and then the part of the primary text after the match.
        var finalOutputString =
          primaryText.slice(0, matchStartPos) +
          searchPattern +
          primaryText.slice(matchStartPos + searchPatternLength);

        // Replace any remaining '?' characters in the final string with 'a'.
        finalOutputString = finalOutputString.replace(/\?/g, "a");
        // Print the final, restored string to the console.
        console.log(finalOutputString);
      }
    };
  },

  // Module 2: Simply exports the Node.js 'fs' (file system) module.
  function(moduleContext, moduleExports) {
    moduleContext.exports = require("fs");
  }
]);
