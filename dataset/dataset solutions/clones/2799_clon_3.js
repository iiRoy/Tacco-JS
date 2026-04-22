/*
 * This JavaScript module bundling system is a highly customized implementation,
 * designed to manage and execute distinct code components (modules) within an isolated environment.
 * It takes an array of module definitions and orchestrates their loading, caching, and execution.
 *
 * The primary goal of this particular bundle is to read the first line from standard input
 * and then analyze it for the presence of any adjacent identical characters.
 * The outcome of this analysis ("Good" or "Bad") is printed directly to the console.
 */
module.exports = (function(moduleDefinitionsCollection) {
  // A central repository to store and retrieve already loaded modules.
  // This acts as a cache to prevent redundant execution of module code and manage dependencies.
  const loadedModuleRegistry = {};

  /**
   * The core module resolution and loading function for this custom system.
   * Given a module identifier (its index in the `moduleDefinitionsCollection`),
   * it attempts to load, execute, and return the module's exports.
   *
   * @param {number} requestedModuleIdentifier - The unique numerical ID of the module to load.
   * @returns {object} The exports object (public interface) of the requested module.
   */
  function moduleResolutionSystem(requestedModuleIdentifier) {
    // First, check if the module has already been loaded and cached in our registry.
    // This is an optimization to avoid re-executing module code.
    if (loadedModuleRegistry[requestedModuleIdentifier]) {
      return loadedModuleRegistry[requestedModuleIdentifier].exports;
    }

    // If the module is not in the cache, we need to create a new entry for it.
    // This entry includes metadata about the module and its public 'exports' object.
    const activeModuleEntry = (loadedModuleRegistry[requestedModuleIdentifier] = {
      identifier: requestedModuleIdentifier, // Store the module's ID.
      isLoaded: false, // Flag to indicate if the module's code has been fully executed.
      exports: {}, // An empty object that the module's code will populate with its public interface.
    });

    // Retrieve the module's definition function from the collection.
    // This function contains the actual code for the module.
    const moduleDefinitionFunction = moduleDefinitionsCollection[requestedModuleIdentifier];

    // --- Type III Addition: Guard Clause for Invalid Module Definitions ---
    // Validate if the retrieved module definition is indeed a function.
    // If not, it indicates an issue (e.g., trying to load a non-existent module ID).
    if (typeof moduleDefinitionFunction !== "function") {
      console.error(
        `Critical Error: Module definition for ID ${requestedModuleIdentifier} is not a valid function.`
      );
      // Mark as loaded to prevent infinite loops if this error occurs during a dependency cycle.
      activeModuleEntry.isLoaded = true;
      return activeModuleEntry.exports; // Return an empty exports object.
    }

    // Execute the module's definition function.
    // It is called with specific arguments:
    // 1. `activeModuleEntry.exports`: The context for `this` (often unused in modern JS modules).
    // 2. `activeModuleEntry`: The module object itself (contains `exports`, `id`, `loaded` status).
    // 3. `activeModuleEntry.exports`: The direct reference to the exports object.
    // 4. `moduleResolutionSystem`: A reference to this very module loader, allowing for nested `require` calls.
    moduleDefinitionFunction.call(
      activeModuleEntry.exports,
      activeModuleEntry,
      activeModuleEntry.exports,
      moduleResolutionSystem
    );

    // After the definition function has run, mark the module as fully loaded.
    activeModuleEntry.isLoaded = true;
    return activeModuleEntry.exports; // Return the populated exports object.
  }

  // --- Auxiliary Properties and Functions for Module System Enhancement ---

  // Stores a direct reference to the complete collection of module definitions.
  moduleResolutionSystem.allModuleDefinitions = moduleDefinitionsCollection;

  // Stores a direct reference to the module cache (loadedModuleRegistry).
  moduleResolutionSystem.moduleCacheReference = loadedModuleRegistry;

  /**
   * Defines a getter property on a target object. This is often used for lazy
   * loading or for exports that are computed on demand.
   *
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyKey - The name of the property to define.
   * @param {function} getterFunction - The function that will be called to retrieve the property's value.
   */
  moduleResolutionSystem.defineExportGetter = function(
    targetObject,
    propertyKey,
    getterFunction
  ) {
    // --- Type III Addition: Check for Existing Property to Prevent Unintended Overwrites ---
    if (
      !moduleResolutionSystem.hasOwnPropertyCheck(targetObject, propertyKey)
    ) {
      Object.defineProperty(targetObject, propertyKey, {
        enumerable: true, // Makes the property visible during enumeration (e.g., `for...in`).
        get: getterFunction, // Assigns the provided function as the getter.
      });
    } else {
      // --- Type III Addition: Optional Logging for Redundant Property Definitions ---
      // console.warn(`Warning: Attempted to redefine existing property '${propertyKey}'.`);
    }
  };

  /**
   * Marks a module's exports object as an ES module. This involves setting specific
   * properties (`Symbol.toStringTag` and `__esModule`) for interoperability
   * with ES module specifications and tools.
   *
   * @param {object} exportsContainer - The exports object to modify.
   */
  moduleResolutionSystem.markAsEsModule = function(exportsContainer) {
    // Check if `Symbol` and `Symbol.toStringTag` are available in the environment.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsContainer, Symbol.toStringTag, {
        value: "Module",
      });
    }
    // Set the `__esModule` flag, a common convention to denote ES modules.
    Object.defineProperty(exportsContainer, "__esModule", {
      value: true,
    });
  };

  /**
   * Provides advanced interoperability logic for different module export formats.
   * This function attempts to normalize exports from various module types (e.g., CommonJS,
   * ES Modules, etc.) into a consistent structure for the current module system.
   *
   * @param {*} moduleExports - The raw exports value obtained from a module.
   * @param {number} modeFlags - A bitmask of flags indicating desired interop behavior.
   * @returns {*} The normalized exports object or value.
   */
  moduleResolutionSystem.interopNamespace = function(moduleExports, modeFlags) {
    // Flag 1: If set, `moduleExports` is treated as a module ID, and the module is resolved.
    if (1 & modeFlags) {
      moduleExports = moduleResolutionSystem(moduleExports);
    }
    // Flag 8: If set, return `moduleExports` directly without further processing.
    if (8 & modeFlags) {
      return moduleExports;
    }
    // Flag 4: If set, and `moduleExports` is an object marked as `__esModule`, return it directly.
    if (
      4 & modeFlags &&
      typeof moduleExports === "object" &&
      moduleExports &&
      moduleExports.__esModule
    ) {
      return moduleExports;
    }

    // Default processing: Create a new object, mark it as an ES module, and set its 'default' export.
    const normalizedExportsObject = Object.create(null);
    moduleResolutionSystem.markAsEsModule(normalizedExportsObject);
    Object.defineProperty(normalizedExportsObject, "default", {
      enumerable: true,
      value: moduleExports,
    });

    // Flag 2: If set and `moduleExports` is not a string, copy all its enumerable properties
    // as getters onto the `normalizedExportsObject`.
    if (2 & modeFlags && typeof moduleExports !== "string") {
      for (const propertyName in moduleExports) {
        // Use an IIFE (Immediately Invoked Function Expression) to capture `propertyName`
        // for the getter function's closure, ensuring correct variable scope.
        moduleResolutionSystem.defineExportGetter(
          normalizedExportsObject,
          propertyName,
          ((capturedKey) => {
            return () => moduleExports[capturedKey];
          })(propertyName)
        );
      }
    }
    return normalizedExportsObject;
  };

  /**
   * Retrieves the "default" export of a module, providing a unified way to access
   * default exports regardless of whether the module uses CommonJS or ES module syntax.
   *
   * @param {*} moduleValue - The module's exports object or value.
   * @returns {function} A getter function that, when called, returns the default export.
   */
  moduleResolutionSystem.getDefaultExport = function(moduleValue) {
    // Determine the appropriate getter function for the default export.
    // If the module is explicitly marked as an ES module and has a 'default' property, use that.
    // Otherwise, the entire moduleValue itself is considered the default export.
    const internalDefaultExportGetter =
      moduleValue && moduleValue.__esModule ?
      () => moduleValue.default :
      () => moduleValue;

    // Define a property named 'a' (a common convention in some bundlers) on the getter function itself.
    // This property also acts as a getter for the default export, providing an alternative access method.
    moduleResolutionSystem.defineExportGetter(
      internalDefaultExportGetter,
      "a",
      internalDefaultExportGetter
    );
    return internalDefaultExportGetter;
  };

  /**
   * A robust utility function to check if an object possesses its own (non-inherited) property.
   *
   * @param {object} targetObject - The object to inspect.
   * @param {string} propertyName - The name of the property to check for.
   * @returns {boolean} `true` if the object has the specified own property, `false` otherwise.
   */
  moduleResolutionSystem.hasOwnPropertyCheck = function(
    targetObject,
    propertyName
  ) {
    // --- Type III Addition: Guard against null/undefined target objects ---
    if (targetObject === null || typeof targetObject === "undefined") {
      return false;
    }
    // Use `Object.prototype.hasOwnProperty.call` for safer and more explicit property checking.
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Defines the base public path for assets, typically an empty string for relative paths.
  moduleResolutionSystem.publicAssetPath = "";

  // --- Application Entry Point ---
  // The entire module system's execution begins by resolving and running the module
  // designated as the starting point. In this configuration, module ID 0 is the entry.
  const startupModuleID = 0; // --- Type III Addition: Intermediate variable for clarity ---
  moduleResolutionSystem.startupModuleID = startupModuleID; // Store the startup ID on the resolver.

  // Execute the main application module and return its exports (if any).
  return moduleResolutionSystem(moduleResolutionSystem.startupModuleID);

})(
  // The array containing all module definitions, passed as an argument
  // to the self-executing module system wrapper.
  [
    /*
     * Module 0: The primary application entry point.
     * This module orchestrates the fetching of input and triggers the core logic.
     * It does not export any values; its purpose is purely to initiate side effects (console output).
     */
    function primaryApplicationModule(
      currentModuleRecord,
      exportsReference,
      moduleResolver
    ) {
      // 1. Acquire the necessary file system utility module.
      // The `fs` module is located at index 2 in our module definitions.
      const fileSystemAccessTool = moduleResolver(2);

      // 2. Define the standard input source path.
      // On Unix-like systems, `/dev/stdin` represents standard input.
      const inputSourceIdentifier = "/dev/stdin";

      // 3. Read the complete content from the specified input source.
      // We explicitly specify UTF-8 encoding for text processing.
      // --- Type III Update: Accessing 'fs' through its new named export ---
      const rawStreamContent = fileSystemAccessTool.fsNativeObject.readFileSync(
        inputSourceIdentifier,
        "UTF-8"
      );

      // 4. Process the raw input content, splitting it into an array of individual lines.
      // Each element in `processedInputLines` will correspond to a line from stdin.
      const processedInputLines = rawStreamContent.split("\n");

      // 5. Obtain the core character analysis function from Module 1.
      // --- Type III Update: Accessing the function via its new named export ---
      const characterSequenceAnalyzer =
        moduleResolver(1).validateStringForAdjacentDuplicates;

      // 6. Execute the character analysis with the prepared input lines.
      // The `characterSequenceAnalyzer` function is responsible for printing the result.
      characterSequenceAnalyzer(processedInputLines);

      // This module implicitly returns `undefined`, as its task is completed by triggering the analysis.
    },

    /*
     * Module 1: Contains the core logic to check a string for adjacent identical characters.
     * It exports a function that performs this validation and prints "Good" or "Bad".
     */
    function characterAnalysisModule(
      moduleObject,
      exportsObj,
      moduleLoader
    ) {
      "use strict"; // Enforce strict mode for cleaner and safer JavaScript code.

      /**
       * Analyzes a collection of input lines to determine if the first line
       * contains any two adjacent identical characters.
       *
       * @param {string[]} inputLinesCollection - An array where the first element is the target string for analysis.
       * @returns {void} - This function does not return a value; it prints "Good" or "Bad" to the console.
       */
      const processInputStringForDuplicates = function(inputLinesCollection) {
        // --- Type III Addition: Input Validation for the collection ---
        // Ensure the input is a valid array and contains at least one line to process.
        if (!Array.isArray(inputLinesCollection) || inputLinesCollection.length === 0) {
          console.error(
            "Error: The provided input lines collection is empty or not an array. Cannot perform analysis."
          );
          return; // Exit early if input is invalid.
        }

        // Extract the very first line from the collection for analysis.
        const targetCharacterSequence = inputLinesCollection[0];

        // --- Type III Addition: Further Validation for the target string ---
        // A string must have at least two characters to potentially contain adjacent duplicates.
        if (
          typeof targetCharacterSequence !== "string" ||
          targetCharacterSequence.length < 2
        ) {
          // If the string is too short or not a string, it cannot have adjacent duplicates.
          console.log("Good"); // Therefore, it's "Good" by default.
          return; // Exit early.
        }

        const sequenceLength = targetCharacterSequence.length;
        // --- Type III Addition: Introduce a boolean flag to track the condition ---
        // This flag will be set to `true` if any adjacent identical characters are found.
        let foundAdjacentDuplication = false;

        // Iterate through the character sequence.
        // The loop runs up to `sequenceLength - 1` because we compare `characterIndex`
        // with `characterIndex + 1`, preventing an out-of-bounds access.
        for (let characterIndex = 0; characterIndex < sequenceLength - 1; characterIndex++) {
          // Access characters using `charAt()` for robustness, though `[]` also works.
          const currentCharacter = targetCharacterSequence.charAt(characterIndex);
          const nextCharacter = targetCharacterSequence.charAt(characterIndex + 1);

          // Compare the current character with its immediate successor.
          if (currentCharacter === nextCharacter) {
            foundAdjacentDuplication = true; // Mark that a duplication was found.
            break; // --- Type III Update: Optimization - Exit loop early once a match is found ---
          }
        }

        // --- Type III Update: Output based on the final state of the flag ---
        // Print the final verdict based on whether any adjacent duplicates were detected.
        if (foundAdjacentDuageduplication) {
          console.log("Bad");
        } else {
          console.log("Good");
        }
      };

      // --- Type III Update: Export the function as a named property ---
      // Instead of directly assigning to `module.exports`, we assign to a named property
      // on the `exportsObj`. This is a structural change in how this module's API is exposed.
      exportsObj.validateStringForAdjacentDuplicates = processInputStringForDuplicates;
    },

    /*
     * Module 2: Provides direct access to Node.js's native 'fs' (File System) module.
     * This module acts as a simple wrapper to integrate the built-in 'fs' functionality
     * into this custom module loading system.
     */
    function fileSystemAccessorModule(moduleRecord, moduleExportsContainer) {
      // --- Type III Update: Changed export mechanism ---
      // Instead of making `module.exports` directly equal to `require("fs")`,
      // we now assign the result of `require("fs")` to a specific named property
      // on the module's `exports` object (`moduleExportsContainer`).
      // This changes how other modules will access the 'fs' functionalities.
      moduleExportsContainer.fsNativeObject = require("fs");
    },
  ]
);