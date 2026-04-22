// This module exports a custom JavaScript module loader and runtime environment.
// It is designed to manage and execute application-specific modules defined within an array.
module.exports = (moduleDefinitions) => {
  // A private cache to store instances of modules that have already been loaded,
  // preventing redundant execution and facilitating module singleton patterns.
  const moduleInstancesCache = {};

  /**
   * Core function for loading and returning a module by its unique numeric identifier.
   * This function ensures that each module is initialized only once.
   * @param {number} requestedModuleId - The unique ID of the module to load.
   * @returns {object} The exports object of the requested module.
   */
  function moduleLoadDirector(requestedModuleId) {
    // If the module is already present in our cache, return its exports immediately.
    if (moduleInstancesCache[requestedModuleId]) {
      return moduleInstancesCache[requestedModuleId].exports;
    }

    // If not cached, create a new module entry. This entry holds the module's ID,
    // a 'loaded' flag (initially false), and an empty 'exports' object.
    const newModuleEntry = moduleInstancesCache[requestedModuleId] = {
      id: requestedModuleId,
      loaded: false,
      exports: {},
    };

    // Execute the module's definition function. The definition receives:
    // 1. The module object itself (`newModuleEntry`).
    // 2. The module's exports object (`newModuleEntry.exports`).
    // 3. A reference to this `moduleLoadDirector` function, allowing modules to `require` others.
    moduleDefinitions[requestedModuleId].call(
      newModuleEntry.exports,
      newModuleEntry,
      newModuleEntry.exports,
      moduleLoadDirector
    );

    // After execution, mark the module as fully loaded.
    newModuleEntry.loaded = true;
    return newModuleEntry.exports;
  }

  // Attach internal data structures to the loader for potential debugging or advanced use cases.
  moduleLoadDirector.definitionsRegistry = moduleDefinitions;
  moduleLoadDirector.activeCache = moduleInstancesCache;

  /**
   * Defines a getter property on a target object. This is typically used to expose
   * module exports in a controlled, enumerable manner, especially for ES module interop.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} propertyValueGetter - A function that returns the value of the property.
   */
  moduleLoadDirector.configureExportGetter = (targetObject, propertyName, propertyValueGetter) => {
    // Only define the property if it doesn't already exist on the target object itself.
    if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property visible when iterating over object keys.
        get: propertyValueGetter, // The function to execute when the property is accessed.
      });
    }
  };

  /**
   * Marks a given object as an ECMAScript module, adding standard metadata properties.
   * This improves compatibility and introspection for module systems.
   * @param {object} moduleNamespaceObject - The object to be registered as an ES module.
   */
  moduleLoadDirector.tagAsESModule = (moduleNamespaceObject) => {
    // Set the Symbol.toStringTag for better object type identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(moduleNamespaceObject, Symbol.toStringTag, { value: "Module" });
    }
    // Set the __esModule flag, a common convention to denote an ES module.
    Object.defineProperty(moduleNamespaceObject, "__esModule", { value: true });
  };

  // Define bitmask constants for various module creation behaviors.
  const INTEROP_FLAG_FORCE_LOAD = 1;     // Treat input as module ID and load it.
  const INTEROP_FLAG_RETURN_RAW = 8;     // Return module exports directly if possible.
  const INTEROP_FLAG_CHECK_ESM = 4;     // Check for __esModule property.
  const INTEROP_FLAG_COPY_ALL_PROPS = 2; // Copy all enumerable properties to the namespace.

  /**
   * Creates a synthetic module namespace object, handling interoperability between
   * different module formats (e.g., CommonJS and ES Modules).
   * @param {any} moduleRawExports - The raw exports of a module or its ID.
   * @param {number} interopFlags - A bitmask indicating desired creation behavior.
   * @returns {object} A module namespace object conforming to ES module conventions.
   */
  moduleLoadDirector.constructNamespaceObject = (moduleRawExports, interopFlags) => {
    // If INTEROP_FLAG_FORCE_LOAD is set, load the module using its ID.
    if (interopFlags & INTEROP_FLAG_FORCE_LOAD) {
      moduleRawExports = moduleLoadDirector(moduleRawExports);
    }
    // If INTEROP_FLAG_RETURN_RAW is set, and it's an object, return it directly.
    if (interopFlags & INTEROP_FLAG_RETURN_RAW && typeof moduleRawExports === "object" && moduleRawExports !== null) {
      return moduleRawExports;
    }
    // If INTEROP_FLAG_CHECK_ESM is set, and it already looks like an ES module, return it.
    if (
      (interopFlags & INTEROP_FLAG_CHECK_ESM) &&
      typeof moduleRawExports === "object" &&
      moduleRawExports !== null &&
      moduleRawExports.__esModule
    ) {
      return moduleRawExports;
    }

    // Create a new, empty object to serve as the synthetic namespace.
    const syntheticNamespace = Object.create(null);
    moduleLoadDirector.tagAsESModule(syntheticNamespace); // Mark it as an ES module.

    // Define the 'default' export of the namespace, pointing to the raw exports.
    Object.defineProperty(syntheticNamespace, "default", {
      enumerable: true,
      value: moduleRawExports,
    });

    // If INTEROP_FLAG_COPY_ALL_PROPS is set and the raw exports is an object (not string/primitive),
    // copy all its enumerable properties to the synthetic namespace.
    if ((interopFlags & INTEROP_FLAG_COPY_ALL_PROPS) && typeof moduleRawExports === "object" && moduleRawExports !== null) {
      for (const propKey in moduleRawExports) {
        // Ensure we only copy own properties to avoid issues with prototype chain.
        if (Object.prototype.hasOwnProperty.call(moduleRawExports, propKey)) {
          moduleLoadDirector.configureExportGetter(syntheticNamespace, propKey, () => moduleRawExports[propKey]);
        }
      }
    }
    return syntheticNamespace;
  };

  /**
   * Creates a getter function that resolves to a module's default export.
   * This handles both CommonJS modules (where `module.exports` is the default)
   * and ES Modules (where `exports.default` is the default).
   * @param {object} moduleObject - The module's exports object.
   * @returns {function} A function that, when called, returns the default export.
   */
  moduleLoadDirector.retrieveDefaultExportGetter = (moduleObject) => {
    // Determine the appropriate getter based on whether it's an ES module.
    const defaultExportResolver =
      moduleObject && moduleObject.__esModule ?
        () => moduleObject.default : // If ES module, use its 'default' property.
        () => moduleObject; // Otherwise, the entire module object is the default.

    // Attach a common alias ('a') to this getter for shorthand access.
    moduleLoadDirector.configureExportGetter(defaultExportResolver, "a", defaultExportResolver);
    return defaultExportResolver;
  };

  // The application's entry point is designated as Module 0.
  // The 'entryModuleId' property is set on the loader for clarity.
  return moduleLoadDirector(moduleLoadDirector.entryModuleId = 0);
}(
  // Array containing all module definitions. Each function in this array
  // represents a distinct module that can be loaded by the `moduleLoadDirector`.
  [
    // Module 0: Primary Application Entry Point.
    // This module is responsible for reading input and initiating the main processing flow.
    function (currentModule, moduleExports, requireModule) {
      "use strict"; // Enable strict mode for this module.

      // Acquire the Node.js 'fs' (file system) module for input operations.
      const fileSystemUtility = requireModule(1);

      // Acquire the main application processing logic from Module 2.
      const centralApplicationProcessor = requireModule(2);

      try {
        // Read all content from standard input (stdin) as a UTF-8 string.
        const inputDataFromStdin = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

        // Pass the raw input string to the central application processor.
        centralApplicationProcessor(inputDataFromStdin);
      } catch (processingError) {
        // If any error occurs during input reading or processing, log it and exit.
        console.error("Application encountered an error:", processingError.message);
        process.exit(1); // Indicate failure with a non-zero exit code.
      }
    },

    // Module 1: Node.js 'fs' Module Wrapper.
    // This module simply re-exports the native Node.js 'fs' module.
    function (currentModule, moduleExports) {
      currentModule.exports = require("fs");
    },

    // Module 2: Input Handling and Problem Solver Orchestrator.
    // This module bridges the raw input string with the structured input parser
    // and then invokes the core problem-solving algorithm.
    function (currentModule, moduleExports, requireModule) {
      "use strict";

      // Import the custom class designed for parsing tokenized input.
      const InputTokenStreamParser = requireModule(3);
      // Import the algorithm responsible for solving the core problem.
      const MainCombinatorialSolver = requireModule(5);

      /**
       * Primary function to process raw input: parses it and feeds it to the solver.
       * @param {string} rawInputContent - The unprocessed string data from the input source.
       */
      currentModule.exports = function (rawInputContent) {
        // Instantiate the input parser with the provided raw data.
        const inputDataReader = new InputTokenStreamParser(rawInputContent);

        // Execute the main solver algorithm using the structured input reader.
        MainCombinatorialSolver(inputDataReader);

        // After processing, ensure the input reader's resources are cleaned up.
        inputDataReader.resetStream();
      };
    },

    // Module 3: Data Stream Reader Class.
    // This class provides methods to sequentially read various data types (strings, integers)
    // from a pre-processed string that has been split into tokens.
    function (currentModule, moduleExports, requireModule) {
      "use strict";

      // Import the underlying buffer mechanism used to store and manage tokens.
      const TokenSequenceBuffer = requireModule(4);

      /**
       * Manages sequential reading of tokens from an input string.
       * Tokens are extracted by splitting the input string by whitespace.
       */
      currentModule.exports = class DataStreamReader {
        /**
         * Constructs an instance of DataStreamReader.
         * @param {string} rawTextData - The complete string content to be tokenized and read.
         */
        constructor(rawTextData) {
          // Pre-process the input: remove leading/trailing whitespace and split by any whitespace.
          // If `rawTextData` is empty or falsy, initialize with an empty array to prevent errors.
          const processedTokens = rawTextData ? rawTextData.trim().split(/\s+/g) : [];
          // Initialize the internal token buffer with the prepared tokens.
          this.tokenBuffer = new TokenSequenceBuffer(processedTokens);
        }

        /**
         * Reads and returns the next available token as a string.
         * @returns {string|undefined} The next string token, or `undefined` if no more tokens.
         */
        readNextString() {
          return this.tokenBuffer.popItem();
        }

        /**
         * Reads the next token and attempts to parse it into an integer.
         * Includes a warning for non-numeric tokens.
         * @returns {number} The parsed integer, or `NaN` if the token cannot be parsed.
         */
        readNextInteger() {
          const nextToken = this.tokenBuffer.popItem();
          // Attempt to parse the token as a base-10 integer.
          const numericValue = parseInt(nextToken, 10);

          // Type III Addition: Basic validation and warning for unexpected input.
          if (isNaN(numericValue) && nextToken !== undefined) {
            console.warn(`Warning: Expected an integer but received non-numeric token "${nextToken}".`);
          }
          return numericValue;
        }

        /**
         * Resets the internal token stream, effectively clearing all tokens
         * and resetting the read position to the beginning.
         */
        resetStream() {
          this.tokenBuffer.resetBuffer();
        }
      };
    },

    // Module 4: Sequential Data Buffer Class.
    // Implements a simple queue-like structure for managing a sequence of items.
    // It allows items to be added to the end and retrieved from the front.
    function (currentModule, moduleExports, requireModule) {
      "use strict";

      /**
       * A basic buffer (first-in, first-out queue) for managing a sequence of data items.
       * It supports adding items, retrieving items, and clearing the buffer.
       */
      currentModule.exports = class TokenSequenceBuffer {
        /**
         * Creates a new instance of SequentialDataBuffer.
         * @param {Array<any>} [initialElements=[]] - An optional array of elements to pre-fill the buffer.
         */
        constructor(initialElements = []) {
          // Internal array to hold the buffer's items. Using spread to ensure a new array instance.
          this.itemsContainer = [...initialElements];
          // Pointer to the index of the next item to be read (dequeue position).
          this.currentReadIndex = 0;
        }

        /**
         * Adds a single item to the end of the buffer.
         * @param {any} itemToAdd - The item to be added.
         */
        pushItem(itemToAdd) {
          this.itemsContainer.push(itemToAdd);
        }

        /**
         * Retrieves and removes the item from the front of the buffer.
         * Includes a heuristic cleanup mechanism to manage memory for large buffers.
         * @returns {any|undefined} The item at the front, or `undefined` if the buffer is empty.
         */
        popItem() {
          // Guard clause: if the read pointer has reached or surpassed the end of the items,
          // there are no more items to retrieve.
          if (this.currentReadIndex >= this.itemsContainer.length) {
            return undefined;
          }

          const retrievedItem = this.itemsContainer[this.currentReadIndex];
          this.currentReadIndex++; // Advance the read pointer.

          // Type III Addition: Heuristic buffer cleanup for memory optimization.
          // If a significant portion of the buffer has been read (e.g., more than 100 items
          // and more than half the total items are "old"), re-slice the array to free memory.
          const CLEANUP_THRESHOLD_COUNT = 100;
          const CLEANUP_THRESHOLD_RATIO = 0.5; // If more than 50% of the buffer is past the read index.

          if (
            this.currentReadIndex > CLEANUP_THRESHOLD_COUNT &&
            this.currentReadIndex > this.itemsContainer.length * CLEANUP_THRESHOLD_RATIO
          ) {
            this.itemsContainer = this.itemsContainer.slice(this.currentReadIndex);
            this.currentReadIndex = 0; // Reset read index after slicing.
          }

          return retrievedItem;
        }

        /**
         * Clears all items from the buffer and resets the read position to the start.
         */
        resetBuffer() {
          this.itemsContainer = [];
          this.currentReadIndex = 0;
        }

        /**
         * Type III Addition: Provides a getter for the number of items currently available to be read.
         * @returns {number} The count of unread items in the buffer.
         */
        get remainingItemCount() {
          return this.itemsContainer.length - this.currentReadIndex;
        }
      };
    },

    // Module 5: Core Combinatorial Problem Solver.
    // This module implements the main algorithm to find the largest valid subset
    // of elements based on a set of conditional dependencies.
    function (currentModule, moduleExports, requireModule) {
      "use strict";

      /**
       * Defines the structure for a conditional dependency.
       * If a parent element is included in a subset, this condition specifies
       * the required state (present/absent) of a target element.
       * @typedef {object} ElementDependency
       * @property {number} dependentElementIndex - The 0-based index of the element whose state is conditioned.
       * @property {number} requiredPresenceState - The required state (0 for absent, 1 for present) of the dependent element.
       */

      /**
       * Solves a problem to find the maximum-sized subset of elements
       * that satisfies all specified conditional dependencies.
       * @param {object} inputReader - An object providing methods like `readNextInteger()` for input.
       */
      currentModule.exports = function (inputReader) {
        // Read the total number of elements (N) involved in the problem.
        const numberOfElements = inputReader.readNextInteger();

        // Type III Addition: Input validation for `numberOfElements`.
        // A small upper bound is chosen to keep 2^N computations feasible.
        const MAX_ELEMENTS_SUPPORTED = 20;
        if (numberOfElements <= 0 || numberOfElements > MAX_ELEMENTS_SUPPORTED) {
          console.error(
            `Error: Invalid number of elements provided (N=${numberOfElements}). ` +
            `Must be between 1 and ${MAX_ELEMENTS_SUPPORTED} for performance.`
          );
          process.exit(1);
        }

        // `allElementRules` will store an array of rules for each element.
        // `allElementRules[i]` contains an array of `ElementDependency` objects.
        const allElementRules = [];
        // `rulesPerElementCount` stores the number of rules for each element.
        // This array is technically redundant if `allElementRules[i].length` is used,
        // but kept for a Type III structural change/intermediate step.
        const rulesPerElementCount = [];

        // Loop to read all conditional rules for each element from the input.
        for (let elementIdx = 0; elementIdx < numberOfElements; elementIdx++) {
          const countOfRulesForCurrent = inputReader.readNextInteger();
          rulesPerElementCount[elementIdx] = countOfRulesForCurrent; // Store count (redundant but structural change).

          const currentElementSpecificRules = [];
          for (let ruleIdx = 0; ruleIdx < countOfRulesForCurrent; ruleIdx++) {
            // Read the index of the dependent element (1-based, convert to 0-based).
            const dependentIdx = inputReader.readNextInteger() - 1;
            // Read the required presence state (0 or 1).
            const requiredState = inputReader.readNextInteger();

            // Add the parsed rule to the current element's rule list.
            currentElementSpecificRules.push({
              dependentElementIndex: dependentIdx,
              requiredPresenceState: requiredState,
            });
          }
          allElementRules.push(currentElementSpecificRules); // Add all rules for this element.
        }

        let largestValidSubsetSize = 0; // Initialize the maximum size found to zero.

        // Type III Addition: Helper function for bitwise checks, improving readability.
        /**
         * Checks if a specific bit is set (i.e., is 1) at a given position in a number.
         * @param {number} value - The number to check.
         * @param {number} bitPosition - The 0-based position of the bit to check.
         * @returns {boolean} True if the bit is set, false otherwise.
         */
        const isBitActive = (value, bitPosition) => ((value >>> bitPosition) & 1) === 1;

        // Iterate through all possible subsets of elements.
        // A bitmask `currentSubsetBitmask` represents each subset, where the i-th bit
        // being set means the i-th element is included in the subset.
        const totalPossibleSubsets = 1 << numberOfElements; // Calculates 2^N.

        for (let currentSubsetBitmask = 0; currentSubsetBitmask < totalPossibleSubsets; currentSubsetBitmask++) {
          let isCurrentSubsetValid = true;
          let currentSubsetMemberCount = 0;

          // Examine each element to determine if it's part of the current subset.
          for (let elementPosition = 0; elementPosition < numberOfElements; elementPosition++) {
            // Check if the element at `elementPosition` is included in the current `currentSubsetBitmask`.
            if (isBitActive(currentSubsetBitmask, elementPosition)) {
              currentSubsetMemberCount++; // Increment count for elements in this subset.

              // If this element is selected, check all its associated rules.
              for (const rule of allElementRules[elementPosition]) {
                // Determine the actual state of the dependent element in the current subset.
                const actualStateOfDependent = isBitActive(currentSubsetBitmask, rule.dependentElementIndex) ? 1 : 0;

                // If the actual state does not match the required state for this rule,
                // then the current subset is invalid.
                if (actualStateOfDependent !== rule.requiredPresenceState) {
                  isCurrentSubsetValid = false;
                  break; // Exit this inner loop, as this subset is already invalid.
                }
              }
            }
            // If the subset has already been determined to be invalid,
            // there's no need to check further elements or their rules.
            if (!isCurrentSubsetValid) {
              break; // Exit the outer loop for elements.
            }
          }

          // If, after checking all elements and their rules, the subset remains valid,
          // update the `largestValidSubsetSize` if this subset is larger.
          if (isCurrentSubsetValid) {
            largestValidSubsetSize = Math.max(currentSubsetMemberCount, largestValidSubsetSize);
          }
        }

        // Output the final result: the maximum size of a valid subset.
        console.log(largestValidSubsetSize);
      };
    },
  ]
);