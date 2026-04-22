module.exports = ((moduleDefinitionsCollection) => {
  // This object serves as a cache for already loaded modules.
  const moduleCache = {};

  /**
   * Core function to resolve and load modules.
   * If a module is already in the cache, its exports are returned immediately.
   * Otherwise, the module's definition is executed, and its exports are cached.
   * @param {number} moduleId - The unique identifier for the module to load.
   * @returns {object} The exports of the requested module.
   */
  const moduleResolver = (moduleId) => {
    // Check if the module is already in our internal cache.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not cached, create a new module entry.
    const currentModuleInstance = moduleCache[moduleId] = {
      identifier: moduleId,  // Store the module's ID for debugging.
      isLoaded: false,       // Flag to indicate if the module has finished loading.
      exports: {}            // The object that will hold the module's exported values.
    };

    // Execute the module's definition function.
    // The definition function receives the module instance, its exports object,
    // and the moduleResolver itself for internal dependencies.
    moduleDefinitionsCollection[moduleId].call(
      currentModuleInstance.exports,
      currentModuleInstance,
      currentModuleInstance.exports,
      moduleResolver
    );

    // Mark the module as fully loaded after its definition has executed.
    currentModuleInstance.isLoaded = true;

    // Return the module's exports.
    return currentModuleInstance.exports;
  };

  // Attach the collection of all module definitions to the resolver for internal use.
  moduleResolver.definitions = moduleDefinitionsCollection;
  // Attach the module cache to the resolver.
  moduleResolver.cachedModules = moduleCache;

  /**
   * Defines a getter property on an object if it doesn't already exist.
   * Used for managing module exports.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {Function} getterFunction - The function that returns the property's value.
   */
  moduleResolver.setExportProperty = (targetObject, propertyName, getterFunction) => {
    // Only define the property if it's not already present as an own property.
    if (!moduleResolver.checkOwnKey(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property enumerable (visible in for...in loops).
        get: getterFunction // Define a getter function for the property.
      });
    }
  };

  /**
   * Marks a module's exports object as an ES Module.
   * This adds `Symbol.toStringTag` and `__esModule` properties.
   * @param {object} moduleExportsObject - The exports object to mark.
   */
  moduleResolver.markAsESModule = (moduleExportsObject) => {
    // If Symbol and Symbol.toStringTag are available, set the toStringTag.
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(moduleExportsObject, Symbol.toStringTag, { value: 'Module' });
    }
    // Set the __esModule flag to true.
    Object.defineProperty(moduleExportsObject, '__esModule', { value: true });
  };

  /**
   * Creates a namespace object for a module, handling different import scenarios.
   * @param {any} moduleRef - The module identifier or the module's exports.
   * @param {number} processingFlags - Bitmask flags indicating processing steps.
   * @returns {object} A namespace object representing the module.
   */
  moduleResolver.createModuleNamespace = (moduleRef, processingFlags) => {
    let resolvedModuleContent = moduleRef;

    // Flag 1: If set, moduleRef is an ID, so resolve it.
    if (processingFlags & 1) {
      resolvedModuleContent = moduleResolver(moduleRef);
    }
    // Flag 8: If set, return the module content as is.
    if (processingFlags & 8) {
      return resolvedModuleContent;
    }
    // Flag 4: If set and it's an object already marked as ES module, return it.
    if (processingFlags & 4 && typeof resolvedModuleContent === 'object' && resolvedModuleContent && resolvedModuleContent.__esModule) {
      return resolvedModuleContent;
    }

    // Create a new empty object for the namespace.
    const namespaceContainer = Object.create(null);
    // Mark this new object as an ES Module.
    moduleResolver.markAsESModule(namespaceContainer);
    // Define a 'default' export property pointing to the resolved module content.
    Object.defineProperty(namespaceContainer, 'default', {
      enumerable: true,
      value: resolvedModuleContent
    });

    // Flag 2: If set and module content is not a string, copy all its properties.
    if (processingFlags & 2 && typeof resolvedModuleContent !== 'string') {
      for (const propKey in resolvedModuleContent) {
        // Ensure we only copy own properties and don't overwrite 'default'.
        if (propKey !== 'default' && moduleResolver.checkOwnKey(resolvedModuleContent, propKey)) {
          moduleResolver.setExportProperty(namespaceContainer, propKey, () => resolvedModuleContent[propKey]);
        }
      }
    }
    return namespaceContainer;
  };

  /**
   * Provides a getter function for module exports, handling default exports.
   * @param {object} moduleExports - The module's exports object.
   * @returns {Function} A function that returns the module's main export.
   */
  moduleResolver.getModuleAccessor = (moduleExports) => {
    // Determine the appropriate getter: default export if it's an ES module, otherwise the module itself.
    const exportRetrievalFunction = (moduleExports && moduleExports.__esModule)
      ? () => moduleExports.default
      : () => moduleExports;

    // For compatibility with webpack's `t.n` behavior, we define a property 'a' on the getter itself.
    // This is a bit unusual but matches the original boilerplate's structure.
    moduleResolver.setExportProperty(exportRetrievalFunction, 'a', exportRetrievalFunction);
    return exportRetrievalFunction;
  };

  /**
   * Checks if an object has a specified property as its own property (not inherited).
   * @param {object} targetObject - The object to check.
   * @param {string} propertyKey - The name of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  moduleResolver.checkOwnKey = (targetObject, propertyKey) => {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  // The primary entry point module ID for the application.
  moduleResolver.entryPointId = 0;

  // Start the application by resolving and executing the entry point module.
  return moduleResolver(moduleResolver.entryPointId);
})([
  // Module 0: The main application entry point.
  // This module is responsible for reading input and orchestrating the main logic.
  (moduleInstance, moduleExports, resolveModule) => {
    // Module 0: Primary application entry point.
    // It retrieves input, processes it via another module, and handles potential errors.
    try {
      const fileSystemModule = resolveModule(2); // Get the 'fs' module for I/O.

      // Validate the availability of the file system module and its readFileSync method.
      if (!fileSystemModule || typeof fileSystemModule.readFileSync !== 'function') {
        console.error("Error: File system module (fs) not found or missing readFileSync capability.");
        // If critical dependency is missing, exit gracefully.
        return;
      }

      // Read raw input content from standard input, using UTF-8 encoding.
      const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

      // Split the input into lines and filter out any completely empty lines.
      const inputDataLines = rawInputContent.split('\n').filter(line => line.trim() !== '');

      // Pass the processed input lines to the main application logic module (Module 1) for execution.
      resolveModule(1)(inputDataLines);

    } catch (errorDetails) {
      // Catch and log any errors that occur during input reading or module execution.
      console.error("An error occurred during input processing or module execution:", errorDetails.message);
    }
  },

  // Module 1: Contains the core sorting and processing logic for the input data.
  (moduleInstance, moduleExports, resolver) => {
    'use strict'; // Enforce strict mode for cleaner code.

    // This module exports a function that takes an array of input lines.
    moduleInstance.exports = (inputDataLines) => {
      // --- Input Validation ---
      if (!Array.isArray(inputDataLines) || inputDataLines.length < 2) {
        console.error("Invalid input: Expected at least two lines of data for processing.");
        return; // Stop execution if input is malformed.
      }

      // Extract the first line, which should contain the count of elements.
      const elementsCountString = inputDataLines[0];
      // Extract the second line, which contains the space-separated numbers.
      const rawNumericStringInput = inputDataLines[1];

      // Parse the element count from the first line.
      const expectedElementCount = parseInt(elementsCountString, 10);

      // Validate the parsed element count.
      if (isNaN(expectedElementCount) || expectedElementCount <= 0) {
        console.error(`Invalid element count provided: "${elementsCountString}". Expected a positive integer.`);
        return;
      }

      // Parse the raw numeric string into an array of integers.
      const potentialNumericValues = rawNumericStringInput.split(' ').map(val => parseInt(val, 10));

      // Filter out any values that failed to parse into numbers (e.g., empty strings, non-numeric text).
      const actualNumericValues = potentialNumericValues.filter(val => !isNaN(val));

      // --- Data Consistency Check ---
      if (actualNumericValues.length !== expectedElementCount) {
        console.error(
          `Data mismatch: Expected ${expectedElementCount} numbers based on the first line, ` +
          `but found ${actualNumericValues.length} valid numbers in the second line.`
        );
        return;
      }

      // --- Core Logic: Indexing and Sorting ---
      // Create an array of objects, pairing each number with its original 1-based index.
      const indexedDataItems = actualNumericValues.map((value, originalZeroBasedIndex) => ({
        originalPosition: originalZeroBasedIndex + 1, // Convert to 1-based index.
        numericValue: value
      }));

      // Sort the array of objects based on their `numericValue` in ascending order.
      indexedDataItems.sort((itemA, itemB) => itemA.numericValue - itemB.numericValue);

      // --- Result Extraction and Output ---
      // After sorting, extract only the `originalPosition` from each object.
      const finalSortedOriginalPositions = indexedDataItems.map(item => item.originalPosition);

      // Output the sorted original positions, joined by spaces.
      console.log(finalSortedOriginalPositions.join(' '));
    };
  },

  // Module 2: External dependency for Node.js 'fs' (File System) module.
  (moduleInstance, moduleExports) => {
    // Module 2: External dependency for file system operations.
    // This module simply exposes the Node.js 'fs' module for use by other modules.
    moduleInstance.exports = require('fs');
  }
]);