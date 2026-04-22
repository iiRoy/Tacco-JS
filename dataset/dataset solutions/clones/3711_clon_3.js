module.exports = function(moduleDefinitionsCollection) {
  // A private object to cache modules that have already been loaded,
  // preventing redundant execution and handling circular dependencies efficiently.
  const loadedModuleCache = {};

  // Internal constant definitions for magic strings and symbols used in module management,
  // enhancing readability and maintainability.
  const moduleSystemSymbols = {
    // Key used to mark an object as an ECMAScript module, influencing how bundlers treat it.
    ES_MODULE_INDICATOR: "__esModule",
    // Standard key for the default export of a module.
    DEFAULT_EXPORT_KEY: "default",
    // The Symbol.toStringTag is used by Object.prototype.toString for type identification.
    STRING_TAG_SYMBOL: typeof Symbol !== "undefined" && Symbol.toStringTag ? Symbol.toStringTag : "@@toStringTagFallback"
  };

  /**
   * Core function for dynamically loading modules by their unique identifier.
   * This mimics the behavior of a `require` function in a module system.
   * @param {number} requestedModuleId - The numeric ID of the module to be loaded.
   * @returns {object} The exports object of the specified module.
   * @throws {Error} If the module definition is invalid or execution fails.
   */
  function dynamicModuleLoader(requestedModuleId) {
    // If the module is already in the cache, return its exports immediately to save computation.
    if (loadedModuleCache[requestedModuleId]) {
      return loadedModuleCache[requestedModuleId].exportedContents;
    }

    // Initialize a new module object and store it in the cache.
    // 'identifier': The unique ID of the module.
    // 'isExecutionComplete': A flag indicating if the module's definition function has run.
    // 'exportedContents': The object where the module's exports will be accumulated.
    const currentModuleContext = loadedModuleCache[requestedModuleId] = {
      identifier: requestedModuleId,
      isExecutionComplete: false,
      exportedContents: {}
    };

    // Retrieve the module's definition function from the collection.
    const moduleDefinitionFunction = moduleDefinitionsCollection[requestedModuleId];

    // Validate that a proper module definition exists for the given ID.
    if (typeof moduleDefinitionFunction !== 'function') {
      console.error(`Runtime Error: Module definition for ID '${requestedModuleId}' is missing or not a function.`);
      throw new Error(`Invalid module definition for ID ${requestedModuleId}`);
    }

    // Execute the module's definition function within a try-catch block
    // to gracefully handle and report any errors during module initialization.
    try {
      moduleDefinitionFunction.call(currentModuleContext.exportedContents,
                                    currentModuleContext,
                                    currentModuleContext.exportedContents,
                                    dynamicModuleLoader);
    } catch (executionError) {
      console.error(`Module Execution Error [ID: ${requestedModuleId}]:`, executionError);
      // Re-throw the error to propagate the failure up the call stack,
      // as the original bundler behavior would likely do.
      throw executionError;
    }

    // Mark the module as fully executed and initialized.
    currentModuleContext.isExecutionComplete = true;

    // Return the exports of the newly loaded module.
    return currentModuleContext.exportedContents;
  }

  // --- Helper utility functions for the module loader, mimicking bundler internals ---

  /**
   * Safely defines a getter property on a target object.
   * This is used for lazy evaluation of exports or for defining read-only properties.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propName - The name of the property to define.
   * @param {function} getterFn - The function that returns the property's value when accessed.
   */
  dynamicModuleLoader.defineGetterProperty = function(targetObject, propName, getterFn) {
    // Only define if the property does not already exist, preventing unintended overwrites.
    if (!dynamicModuleLoader.hasOwnProperty(targetObject, propName)) {
      Object.defineProperty(targetObject, propName, {
        enumerable: true, // Make the property visible during enumeration (e.g., in `for...in` loops).
        get: getterFn     // Assign the provided function as the property's getter.
      });
    }
  };

  /**
   * Marks an exports object as an ECMAScript module. This is crucial for interoperability
   * between CommonJS and ES modules, especially in bundled environments.
   * @param {object} exportsContainer - The object representing the module's exports.
   */
  dynamicModuleLoader.setESModuleFlag = function(exportsContainer) {
    // If Symbol.toStringTag is available, set it to "Module" for better type identification.
    if (typeof Symbol !== "undefined" && moduleSystemSymbols.STRING_TAG_SYMBOL) {
      Object.defineProperty(exportsContainer, moduleSystemSymbols.STRING_TAG_SYMBOL, {
        value: "Module"
      });
    }
    // Set the __esModule flag to true, indicating this is an ES module.
    Object.defineProperty(exportsContainer, moduleSystemSymbols.ES_MODULE_INDICATOR, {
      value: true
    });
  };

  /**
   * Creates a comprehensive namespace object for a module, handling various export scenarios.
   * This includes defining default exports and re-exporting named exports.
   * @param {any} moduleSource - The raw source or ID of the module.
   * @param {number} processingFlags - Bitmask flags dictating how to process `moduleSource`.
   *   - Bit 1: If set, `moduleSource` is a module ID and should be loaded via `dynamicModuleLoader`.
   *   - Bit 2: If set, iterate properties of `moduleSource` (if it's an object) and define them as named exports.
   *   - Bit 4: If set, and `moduleSource` is an ES module object, return it directly.
   *   - Bit 8: If set, return `moduleSource` directly without any processing.
   * @returns {object} A namespace object containing the module's exports.
   */
  dynamicModuleLoader.createModuleNamespace = function(moduleSource, processingFlags) {
    // Direct return if flag 8 is set.
    if (processingFlags & 8) return moduleSource;
    // Load module if flag 1 is set.
    if (processingFlags & 1) moduleSource = dynamicModuleLoader(moduleSource);
    // Return directly if flag 4 is set and it's already an ES module.
    if (processingFlags & 4 && typeof moduleSource === "object" && moduleSource && moduleSource[moduleSystemSymbols.ES_MODULE_INDICATOR]) {
      return moduleSource;
    }

    // Create a new, empty object to serve as the namespace.
    const namespaceExports = Object.create(null);
    dynamicModuleLoader.setESModuleFlag(namespaceExports); // Mark it as an ES module.

    // Define the 'default' export getter.
    dynamicModuleLoader.defineGetterProperty(namespaceExports, moduleSystemSymbols.DEFAULT_EXPORT_KEY, function() {
      return moduleSource;
    });

    // If flag 2 is set and the source is an object (not a string),
    // iterate its properties and define them as named exports in the namespace.
    if (processingFlags & 2 && typeof moduleSource === "object" && moduleSource !== null) {
      for (const propertyName in moduleSource) {
        // Ensure only own properties are considered to avoid prototype chain issues.
        if (dynamicModuleLoader.hasOwnProperty(moduleSource, propertyName)) {
          // Use a closure to capture `propertyName` correctly for each getter.
          dynamicModuleLoader.defineGetterProperty(namespaceExports, propertyName, (function(key) {
            return function() { return moduleSource[key]; };
          })(propertyName));
        }
      }
    }
    return namespaceExports;
  };

  /**
   * Provides a getter function for a module's default export. This handles both
   * traditional CommonJS exports and explicit ES module default exports.
   * @param {object} moduleExportsObject - The raw exports object from a module.
   * @returns {function} A function that, when called, returns the module's default export.
   */
  dynamicModuleLoader.getDefaultExportAccessor = function(moduleExportsObject) {
    // Determine the correct way to access the default export.
    // If it's an ES module with the __esModule flag, use its 'default' property.
    // Otherwise, the entire exports object is considered the default.
    const accessorFunction = moduleExportsObject && moduleExportsObject[moduleSystemSymbols.ES_MODULE_INDICATOR] ?
      function() {
        return moduleExportsObject[moduleSystemSymbols.DEFAULT_EXPORT_KEY];
      } :
      function() {
        return moduleExportsObject;
      };
    // Attach a special 'a' property (a webpack convention) that returns the accessor itself.
    dynamicModuleLoader.defineGetterProperty(accessorFunction, "a", accessorFunction);
    return accessorFunction;
  };

  /**
   * A robust check to determine if an object has a specified property directly on itself
   * (not inherited from its prototype chain).
   * @param {object} targetObject - The object to inspect.
   * @param {string} propertyKey - The name of the property to check for.
   * @returns {boolean} `true` if the object has the property as its own, `false` otherwise.
   */
  dynamicModuleLoader.hasOwnProperty = function(targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  // The initial module to execute when the bundle starts.
  // In this setup, module with ID 0 is designated as the primary entry point.
  const mainApplicationEntryId = 0;

  // Begin execution by loading the main entry module and return its exports.
  // For most applications, the return value of the entry module is not used directly
  // by the outer environment, but the side effects (like console.log) are the goal.
  return dynamicModuleLoader(mainApplicationEntryId);
}(
  /* The array below contains all the module definitions, indexed by their ID. */
  [
    function(currentModule, moduleExports, moduleRequire) { // Module 0: The main application entry point.
      // This module is responsible for setting up the application flow,
      // including reading input and invoking the core processing logic.

      const CORE_PROCESSOR_MODULE_ID = 1; // Identifier for the module containing the primary algorithm.
      const FILE_SYSTEM_UTILITY_MODULE_ID = 2; // Identifier for the module providing file I/O.

      // Obtain the file system utility module.
      const fsAccess = moduleRequire(FILE_SYSTEM_UTILITY_MODULE_ID);

      let rawInputContent;
      try {
        // Read content from standard input. This path is common on Unix-like systems.
        // Specifying encoding is crucial for correct string interpretation.
        rawInputContent = fsAccess.readFileSync("/dev/stdin", { encoding: "utf8" });
      } catch (readError) {
        console.error("Failed to read input from /dev/stdin:", readError.message);
        // Depending on requirements, could provide default input or terminate.
        // For this clone, we'll propagate the error or exit.
        process.exit(1); // Terminate if input cannot be read.
      }

      // Process the raw input content into an array of lines.
      // Use a regex to handle both Windows (\r\n) and Unix (\n) line endings.
      // Filter out any empty lines that might result from trailing newlines or multiple consecutive newlines.
      const processedInputLines = rawInputContent.split(/\r?\n/).filter(line => line.trim().length > 0);

      // Implement a guard clause for scenarios where no meaningful input is provided.
      if (processedInputLines.length === 0) {
        console.warn("Application Warning: No valid input lines were provided via stdin. Exiting.");
        return; // Exit module execution gracefully if no input.
      }

      // Invoke the core processing logic module with the prepared input data.
      // The core processor is expected to be a function that takes the lines array.
      moduleRequire(CORE_PROCESSOR_MODULE_ID)(processedInputLines);
    },
    function(currentModule, moduleExports) { // Module 1: Contains the core algorithm for deviation calculation.
      // This module exports a single function that processes an array of input strings.
      currentModule.exports = function(dataInputStrings) {

        // Internal helper function to parse a string into a number with error handling.
        const parseValidatedNumber = (numericString) => {
          const parsedValue = Number(numericString);
          if (isNaN(parsedValue)) {
            throw new Error(`Input Parsing Error: Encountered non-numeric value "${numericString}".`);
          }
          return parsedValue;
        };

        // --- Input Validation and Parsing ---
        if (!dataInputStrings || dataInputStrings.length < 2) {
          throw new Error("Input Data Error: Expected at least two lines of input (N and the array elements).");
        }

        const numberOfItems = parseValidatedNumber(dataInputStrings[0]);
        if (numberOfItems <= 0) {
            console.warn("Warning: Number of items is zero or negative. No processing will occur.");
            return; // Exit early if no items to process.
        }

        const rawElementsLine = dataInputStrings[1];
        // Split the second line by spaces and parse each segment into a number.
        const initialNumericArray = rawElementsLine.split(" ").map(parseValidatedNumber);

        // Crucial validation: Ensure the declared number of items matches the actual count.
        if (initialNumericArray.length !== numberOfItems) {
          throw new Error(`Data Consistency Error: Declared ${numberOfItems} elements, but found ${initialNumericArray.length} in the input array.`);
        }

        // --- Core Transformation Logic ---
        // Create a new array by applying a specific transformation: value - index - 1.
        // This transformation is typical in problems solvable with median-based optimizations.
        const transformedDataPoints = new Array(numberOfItems);
        for (let dataIndex = 0; dataIndex < numberOfItems; dataIndex++) {
          transformedDataPoints[dataIndex] = initialNumericArray[dataIndex] - dataIndex - 1;
        }

        // Sort the transformed array in ascending order to facilitate median calculation.
        transformedDataPoints.sort((a, b) => a - b);

        // --- Median Calculation ---
        let calculatedMedian;
        const midPointIndex = Math.floor(numberOfItems / 2);

        if (numberOfItems % 2 === 0) { // If the count of elements is even
          // Median is the average of the two middle elements.
          calculatedMedian = (transformedDataPoints[midPointIndex - 1] + transformedDataPoints[midPointIndex]) / 2;
        } else { // If the count of elements is odd
          // Median is the single middle element.
          calculatedMedian = transformedDataPoints[midPointIndex];
        }

        // --- Sum of Absolute Deviations Calculation ---
        // Helper function for absolute difference (can be inlined, but separated for Type III change).
        const calculateAbsoluteDifference = (val1, val2) => Math.abs(val1 - val2);

        let totalAbsoluteDeviationSum = 0;
        // Iterate through the transformed data points and sum their absolute differences from the median.
        for (let i = 0; i < numberOfItems; i++) {
          totalAbsoluteDeviationSum += calculateAbsoluteDifference(transformedDataPoints[i], calculatedMedian);
        }

        // --- Output Result ---
        // Display the final calculated sum to standard output.
        console.log(totalAbsoluteDeviationSum);
      };
    },
    function(moduleReference, exportsReference) { // Module 2: Adapter for Node.js's native 'fs' (File System) module.
      // This module acts as a simple wrapper to make the 'fs' module available
      // within the bundled environment.

      try {
        // Attempt to load the native 'fs' module. This will only succeed in a Node.js environment.
        exportsReference.exports = require("fs");
      } catch (loadError) {
        // If 'fs' cannot be loaded (e.g., not in Node.js, or module missing),
        // log an error and provide a fallback/mock implementation that throws
        // to clearly indicate the dependency failure.
        console.error("Runtime Error: Failed to load Node.js 'fs' module. This application requires a Node.js environment.", loadError.message);
        // Provide a stub for readFileSync that throws, to prevent silent failures later.
        exportsReference.exports = {
          readFileSync: (path, options) => {
            throw new Error(`File system operation failed: 'fs.readFileSync' is not available. Original error: ${loadError.message}`);
          }
        };
      }
    }
  ]
);