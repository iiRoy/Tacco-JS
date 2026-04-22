module.exports = function(moduleDefinitions) {
  /**
   * @type {Object.<number, {moduleId: number, isModuleLoaded: boolean, moduleExportsObject: any}>}
   * A central cache to store references to modules that have already been loaded.
   * Keys are numeric module identifiers.
   */
  const loadedModuleRegistry = {};

  /**
   * The primary function for loading and resolving modules.
   * This acts as the internal 'require' function within the bundled application.
   * @param {number} requestedModuleId - The unique identifier of the module to be loaded.
   * @returns {any} The exports object of the specified module.
   */
  function resolveAndLoadModule(requestedModuleId) {
    // Check if the module is already present in our registry.
    // If so, return its exports immediately to avoid redundant loading.
    if (loadedModuleRegistry[requestedModuleId]) {
      return loadedModuleRegistry[requestedModuleId].moduleExportsObject;
    }

    // If the module is not in the registry, create a new entry for it.
    // This entry will hold the module's state and its exports.
    const newModuleEntry = loadedModuleRegistry[requestedModuleId] = {
      moduleId: requestedModuleId, // Store the module's ID for internal reference.
      isModuleLoaded: false, // Flag indicating that the module is currently being processed.
      moduleExportsObject: {} // The object that will be populated with module exports.
    };

    // Before executing, ensure the module definition actually exists.
    if (typeof moduleDefinitions[requestedModuleId] !== 'function') {
        console.error(`Error: Module definition for ID ${requestedModuleId} is missing or invalid.`);
        // Return an empty object or throw an error, depending on desired robustness.
        return {};
    }

    // Execute the module's definition function.
    // This function typically receives three arguments:
    // 1. `module` (the newModuleEntry object itself)
    // 2. `exports` (newModuleEntry.moduleExportsObject, the object to populate)
    // 3. `require` (a reference to this `resolveAndLoadModule` function for dependencies)
    try {
        moduleDefinitions[requestedModuleId].call(
            newModuleEntry.moduleExportsObject, // `this` context for the module function
            newModuleEntry,
            newModuleEntry.moduleExportsObject,
            resolveAndLoadModule
        );
    } catch (moduleExecutionError) {
        console.error(`Error executing module ${requestedModuleId}:`, moduleExecutionError);
        // Mark as loaded but with empty exports on error, or rethrow.
        newModuleEntry.isModuleLoaded = true;
        return {};
    }

    // After successful execution, mark the module as fully loaded.
    newModuleEntry.isModuleLoaded = true;

    // Return the exports object of the newly loaded module.
    return newModuleEntry.moduleExportsObject;
  }

  // --- Extended functionalities attached to the module loader ---

  /**
   * Stores a reference to the complete array of module definitions.
   * This can be useful for introspection or advanced loader operations.
   */
  resolveAndLoadModule.allSourceModules = moduleDefinitions;

  /**
   * Provides direct access to the internal module cache.
   * Enables other loader utilities to inspect or modify the cache state.
   */
  resolveAndLoadModule.moduleCacheReference = loadedModuleRegistry;

  /**
   * A helper function to define a non-enumerable, read-only property on an object.
   * This is primarily used for setting internal flags like `__esModule`.
   * @param {object} targetObj - The object to modify.
   * @param {string|symbol} propKey - The name or symbol of the property to define.
   * @param {any} propValue - The value to assign to the property.
   * @param {boolean} [isEnumerable=false] - Whether the property should be enumerable.
   */
  const defineHiddenProperty = (targetObj, propKey, propValue, isEnumerable = false) => {
    Object.defineProperty(targetObj, propKey, {
      value: propValue,
      writable: true, // Allow modification if needed, though often false for internal flags.
      configurable: true, // Allow redefinition or deletion.
      enumerable: isEnumerable // Control visibility in `for...in` loops or `Object.keys()`.
    });
  };

  /**
   * Defines an enumerable getter property on a target object.
   * This is commonly used to create "live bindings" for exports.
   * @param {object} targetObj - The object on which to define the property.
   * @param {string} propertyName - The name of the property.
   * @param {function} getterFunc - The function to execute when the property is accessed.
   */
  resolveAndLoadModule.exposeExportAsGetter = function(targetObj, propertyName, getterFunc) {
    // Only define if the property doesn't already exist to prevent conflicts.
    if (!Object.prototype.hasOwnProperty.call(targetObj, propertyName)) {
      Object.defineProperty(targetObj, propertyName, {
        enumerable: true, // Make the property visible when enumerating object properties.
        get: getterFunc // The function that returns the value when the property is read.
      });
    }
  };

  /**
   * Marks an object as an ECMAScript module.
   * This involves setting standard properties like `Symbol.toStringTag` and `__esModule`.
   * @param {object} targetModuleExports - The exports object of the module to register.
   */
  resolveAndLoadModule.registerAsESModule = function(targetModuleExports) {
    // If Symbol.toStringTag is supported, set it to "Module" for better debugging.
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      defineHiddenProperty(targetModuleExports, Symbol.toStringTag, "Module");
    }
    // Set the __esModule flag to true, indicating it's an ES module.
    defineHiddenProperty(targetModuleExports, "__esModule", true);
  };

  /**
   * Generates a "namespace object" for a module, facilitating interoperability
   * between CommonJS and ES module conventions. It creates an object that
   * can be used to access both default and named exports.
   * @param {any} sourceContent - The raw exports of the module (either a direct value or a module ID).
   * @param {number} transformationFlags - A bitmask indicating specific transformation rules.
   *   - Bit 1: If set, `sourceContent` is a module ID and needs to be loaded first.
   *   - Bit 2: If set, properties should be treated as non-string, affecting how they are handled (less common).
   *   - Bit 4: If set, and `sourceContent` is already an ES module, return it directly.
   *   - Bit 8: If set, return `sourceContent` directly as it's already the final export.
   * @returns {object} A new object representing the module's namespace.
   */
  resolveAndLoadModule.createModuleNamespace = function(sourceContent, transformationFlags) {
    let processedSource = sourceContent; // Use a new variable for clarity.

    // Flag 1: If sourceContent is a module ID, load it.
    if (transformationFlags & 1) {
      processedSource = resolveAndLoadModule(sourceContent);
    }
    // Flag 8: If sourceContent is already the final desired export, return it.
    if (transformationFlags & 8) {
      return processedSource;
    }
    // Flag 4: If sourceContent is already an ES module, use it as is.
    if ((transformationFlags & 4) && typeof processedSource === 'object' && processedSource && processedSource.__esModule) {
      return processedSource;
    }

    // Create a new, empty object to serve as the namespace.
    const namespaceContainer = Object.create(null);
    // Mark this new object as an ES module.
    resolveAndLoadModule.registerAsESModule(namespaceContainer);
    // Define a 'default' export that points to the original module's exports.
    resolveAndLoadModule.exposeExportAsGetter(namespaceContainer, "default", () => processedSource);

    // If Flag 2 is NOT set and the source is not a primitive string,
    // iterate over its own properties and re-export them as named exports.
    // This handles CommonJS modules being treated like ES modules with named exports.
    if (!(transformationFlags & 2) && typeof processedSource !== "string") {
      for (const propertyKey in processedSource) {
        // Ensure we only process own properties to avoid inheriting from prototype chain.
        if (Object.prototype.hasOwnProperty.call(processedSource, propertyKey)) {
          // Define a getter for each property, linking it to the source module's property.
          // This creates a "live binding".
          resolveAndLoadModule.exposeExportAsGetter(namespaceContainer, propertyKey, () => processedSource[propertyKey]);
        }
      }
    }
    return namespaceContainer;
  };

  /**
   * Provides a standardized way to access a module's default export.
   * This handles both explicit ES module `default` exports and CommonJS exports.
   * @param {any} moduleReference - The raw exports object of a module.
   * @returns {function(): any} A getter function that returns the default export.
   */
  resolveAndLoadModule.retrieveDefaultExport = function(moduleReference) {
    // Determine the appropriate getter based on whether it's an ES module or CommonJS.
    const defaultExportGetter = moduleReference && moduleReference.__esModule ?
      () => moduleReference.default : // For explicit ES module default export.
      () => moduleReference; // For CommonJS, the entire export is the default.

    // As a Webpack convention, also expose this default getter via a property named 'a'.
    resolveAndLoadModule.exposeExportAsGetter(defaultExportGetter, "a", defaultExportGetter);
    return defaultExportGetter;
  };

  // --- Application Entry Point ---
  // Set the starting module ID and initiate the application execution.
  resolveAndLoadModule.entryModuleIdentifier = 0;
  resolveAndLoadModule(resolveAndLoadModule.entryModuleIdentifier);
};


// --- The Array of Application Module Definitions ---
// Each function in this array represents a distinct module within the bundled application.

/* Module 0: Primary Application Flow */
// This module orchestrates the input reading and passes it to the core calculation module.
(function(currentModuleInstance, moduleExportsObject, moduleRequester) {
  // Obtain the 'fs' (file system) utility module from the bundler's registry.
  const fileSystemModule = moduleRequester(2);

  // Specify the standard input path for reading data.
  const standardInputPath = "/dev/stdin";
  let receivedInputContent = "";

  try {
    // Attempt to read the content of the standard input file synchronously.
    // The second argument for encoding is often passed to `toString` directly for buffers.
    const fileBuffer = fileSystemModule.readFileSync(standardInputPath);
    if (!fileBuffer) {
        console.warn(`[Module 0 Warning]: No buffer content read from '${standardInputPath}'.`);
        receivedInputContent = "";
    } else {
        // Convert the buffer to a UTF-8 string.
        receivedInputContent = fileBuffer.toString('UTF-8');

        // Add a guard to ensure content was actually read.
        if (!receivedInputContent.trim()) {
          console.warn(`[Module 0 Warning]: No significant content found in '${standardInputPath}'. Proceeding with empty string.`);
          receivedInputContent = ""; // Ensure it's explicitly an empty string if only whitespace.
        }
    }
  } catch (inputReadError) {
    // Handle potential errors during file reading.
    console.error(`[Module 0 Error]: Failed to read from '${standardInputPath}': ${inputReadError.message}`);
    // Depending on criticality, rethrow or set a default empty value.
    receivedInputContent = ""; // Default to empty string on error to allow program to continue.
  }

  // Pass the processed input content to the main calculation module (Module 1).
  moduleRequester(1)(receivedInputContent);

}) /* End of Module 0 */ ,

/* Module 1: Core Calculation Logic */
// This module processes the input string, extracts numerical parameters,
// performs a specific mathematical calculation, and outputs the result.
(function(currentModuleContext, moduleExportContainer) {

  /**
   * A robust utility function designed to safely extract a specified number of elements
   * from an iterable source (like an array or other iterable objects).
   * This function provides similar behavior to array destructuring assignments,
   * with additional error handling and type checking.
   * @param {Iterable<any>} sourceIterable - The iterable object from which to extract elements.
   * @param {number} [extractionLimit] - The maximum number of elements to extract. If undefined, all are extracted.
   * @returns {Array<any>} An array containing the extracted elements.
   * @throws {TypeError} If the source is not a valid iterable.
   */
  function safelyExtractLimitedElements(sourceIterable, extractionLimit) {
    // Pre-check for null/undefined source to avoid immediate errors.
    if (sourceIterable === null || sourceIterable === undefined) {
      throw new TypeError("Cannot extract elements from null or undefined source.");
    }

    // Optimization: If it's already an array and no limit, return as is.
    if (Array.isArray(sourceIterable) && (extractionLimit === undefined || extractionLimit >= sourceIterable.length)) {
      return sourceIterable;
    }
    // If it's an array and a limit is specified, just slice it.
    if (Array.isArray(sourceIterable) && extractionLimit !== undefined) {
      return sourceIterable.slice(0, extractionLimit);
    }

    const resultElements = [];
    let iterationComplete = false;
    let iterationErrorOccurred = false;
    let caughtIterationException = undefined;
    let currentIterator;

    try {
      // Check if the source has a Symbol.iterator method, which indicates it's iterable.
      const iteratorMethod = sourceIterable[Symbol.iterator];
      if (typeof iteratorMethod !== 'function') {
        throw new TypeError("Input source is not an iterable object.");
      }

      currentIterator = iteratorMethod.call(sourceIterable);
      let nextIterationResult;

      // Loop through the iterator until done or the limit is reached.
      while (!(nextIterationResult = currentIterator.next()).done) {
        resultElements.push(nextIterationResult.value);
        if (extractionLimit !== undefined && resultElements.length >= extractionLimit) {
          break; // Stop if the desired number of elements has been collected.
        }
      }
      iterationComplete = true; // Mark as successfully iterated.

    } catch (err) {
      iterationErrorOccurred = true;
      caughtIterationException = err;
    } finally {
      // Ensure the iterator's 'return' method (for cleanup) is called if available,
      // especially if the iteration was not completed naturally (e.g., due to 'break' or error).
      try {
        if (!iterationComplete && currentIterator && typeof currentIterator.return === 'function') {
          currentIterator.return();
        }
      } finally {
        // If an error occurred during iteration, re-throw it after cleanup.
        if (iterationErrorOccurred) {
          throw caughtIterationException;
        }
      }
    }
    return resultElements;
  }

  // The main processing function exported by this module.
  moduleExportContainer.exports = function(rawInputDataString) {
    // --- Input Validation and Parsing (Type III additions) ---
    if (typeof rawInputDataString !== 'string' || rawInputDataString.trim().length === 0) {
      console.error("[Module 1 Error]: Received empty or invalid input string for calculation.");
      return; // Exit if input is not valid.
    }

    const inputLines = rawInputDataString.split("\n");
    const firstDataLine = inputLines[0];

    if (!firstDataLine || firstDataLine.trim().length === 0) {
      console.error("[Module 1 Error]: First line of input data is empty or missing.");
      return;
    }

    const stringComponents = firstDataLine.trim().split(" ");
    if (stringComponents.length < 2) {
      console.error(`[Module 1 Error]: Expected at least two numbers in the first line, but found ${stringComponents.length}. Input: '${firstDataLine}'`);
      return;
    }

    // Convert string components to numbers, with validation.
    const numericParameters = stringComponents.map(component => {
      const parsedValue = Number(component);
      if (isNaN(parsedValue)) {
        console.error(`[Module 1 Error]: Non-numeric input encountered: '${component}'.`);
        throw new Error("Invalid numeric input for calculation.");
      }
      return parsedValue;
    });

    let mainValueN, thresholdK;
    try {
        // Use the robust helper to extract N and K.
        [mainValueN, thresholdK] = safelyExtractLimitedElements(numericParameters, 2);
    } catch (extractionError) {
        console.error(`[Module 1 Error]: Failed to extract N and K from input: ${extractionError.message}`);
        return;
    }


    // Further validation for N and K (Type III additions).
    if (typeof mainValueN !== 'number' || !Number.isInteger(mainValueN) || mainValueN < 0) {
      console.error(`[Module 1 Error]: 'N' must be a non-negative integer. Received: ${mainValueN}`);
      return;
    }
    if (typeof thresholdK !== 'number' || !Number.isInteger(thresholdK) || thresholdK < 0) {
      console.error(`[Module 1 Error]: 'K' must be a non-negative integer. Received: ${thresholdK}`);
      return;
    }

    // console.debug(`[Module 1 Info]: Starting calculation with N = ${mainValueN}, K = ${thresholdK}`);

    let accumulatedSum = 0; // Initialize the sum.

    // --- Main Calculation Loop (Type III: rewritten with helper variables) ---
    // The loop iterates for each possible divisor 'currentIterationDivisor' from 1 to N.
    for (let currentIterationDivisor = 1; currentIterationDivisor <= mainValueN; currentIterationDivisor++) {
      // Calculate the remainder when N is divided by the current divisor.
      const remainderResult = mainValueN % currentIterationDivisor;

      // Calculate the integer quotient of N divided by the current divisor.
      const integerQuotient = Math.floor(mainValueN / currentIterationDivisor);

      // Determine the first part of the contribution: based on quotient and K.
      // It's `integerQuotient * max(0, currentIterationDivisor - K)`.
      const contributionPart1 = integerQuotient * Math.max(0, currentIterationDivisor - thresholdK);

      // Determine the second part of the contribution: based on remainder and K.
      // It's `max(0, remainderResult - K + 1)`.
      const contributionPart2 = Math.max(0, remainderResult - thresholdK + 1);

      // Add both parts to the total accumulated sum.
      accumulatedSum += contributionPart1 + contributionPart2;

      // console.debug(`  [Module 1 Debug]: Divisor ${currentIterationDivisor}: Remainder=${remainderResult}, Quotient=${integerQuotient}, Part1=${contributionPart1}, Part2=${contributionPart2}, Current Sum=${accumulatedSum}`);
    }

    // --- Conditional Adjustment (Type III: rewritten for clarity) ---
    // If K is exactly 0, a specific adjustment is required: subtract N from the total sum.
    if (thresholdK === 0) {
      accumulatedSum -= mainValueN;
      // console.debug(`[Module 1 Debug]: K is 0, adjusting sum by -N. Final Sum before log: ${accumulatedSum}`);
    }

    // Output the final calculated result to the standard console.
    console.log(accumulatedSum);

  }; // End of exported calculation function

}) /* End of Module 1 */ ,

/* Module 2: Node.js File System Wrapper */
// This module simply provides access to Node.js's native 'fs' (file system) module.
(function(moduleReference, exportsReference) {
  // Ensure that the native 'require' function is available in the current environment.
  // This is a guard against running in non-Node.js contexts where 'fs' might not exist.
  if (typeof require === 'function' && typeof require.resolve === 'function') {
    try {
      // Attempt to load the 'fs' module.
      exportsReference.exports = require("fs");
    } catch (fsLoadError) {
      console.error(`[Module 2 Error]: Failed to load native 'fs' module: ${fsLoadError.message}`);
      exportsReference.exports = {}; // Export an empty object as a fallback.
    }
  } else {
    console.error("[Module 2 Error]: Native 'require' function is not available; 'fs' module cannot be loaded.");
    exportsReference.exports = {}; // Provide an empty object if 'require' is absent.
  }
}) /* End of Module 2 */

]; // End of the 'moduleDefinitions' array.