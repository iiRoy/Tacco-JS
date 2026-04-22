const moduleRegistry = {}; // Cache for loaded modules
const loadedModuleCache = {}; // Cache for exports

/**
 * Custom module loader function, mimicking a simplified Webpack runtime.
 * @param {string|number} moduleIdentifier - The ID of the module to load.
 * @returns {object} The exports of the requested module.
 */
function requireModule(moduleIdentifier) {
  // If module is already in cache, return its exports
  if (loadedModuleCache[moduleIdentifier]) {
    return loadedModuleCache[moduleIdentifier].exports;
  }

  // Check if the module definition exists in the registry
  if (!moduleRegistry[moduleIdentifier]) {
    console.error(`Error: Module with ID ${moduleIdentifier} not found in registry.`);
    // In a real scenario, this might throw an error or handle it differently.
    // For this clone, we'll return an empty object to avoid crashing.
    return {};
  }

  // Prepare a new module object and add it to the cache
  const moduleObject = (loadedModuleCache[moduleIdentifier] = {
    id: moduleIdentifier,
    isLoaded: false,
    exports: {},
  });

  // Execute the module function, populating its exports
  try {
    moduleRegistry[moduleIdentifier].call(
      moduleObject.exports,
      moduleObject,
      moduleObject.exports,
      requireModule
    );
    moduleObject.isLoaded = true; // Mark as loaded after execution
  } catch (executionError) {
    console.error(
      `Error executing module ${moduleIdentifier}:`,
      executionError
    );
    // Remove from cache if execution failed
    delete loadedModuleCache[moduleIdentifier];
    throw executionError; // Re-throw to propagate the error
  }

  return moduleObject.exports;
}

// Minimal utility function for object property definition
requireModule.defineProp = function (targetObject, propertyName, getterFunction) {
  // Only define if not already present
  if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
    Object.defineProperty(targetObject, propertyName, {
      enumerable: true,
      get: getterFunction,
    });
  }
};

// Utility to check if an object has a property
requireModule.hasOwn = function (targetObject, propertyName) {
  return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
};

// Set the entry point for the application.
// The entry module ID is typically 0 in webpack bundles.
const entryModuleId = 0;

// Execute the main application module.
try {
  requireModule(entryModuleId);
} catch (mainAppError) {
  console.error("Application execution failed:", mainAppError.message);
  // Optionally, exit the process in a Node.js environment
  if (typeof process !== 'undefined' && process.exit) {
    process.exit(1);
  }
}

// The module definitions for the custom runtime.
// The original `t` parameter becomes `moduleDefs`.
// Each array element is a module function.
// The original `r.s=0` becomes `entryModuleId`.
([
  // Module 0: Main Application Entry Point
  function (currentModule, exportsObject, getModule) {
    "use strict";
    // This module orchestrates reading input and invoking the solver.

    // Safely attempt to load the 'fs' module, primarily for Node.js environments.
    const fileSystemUtils = getModule(1);

    /**
     * Reads input from stdin, processes it, and invokes the problem solver.
     * @param {object} fsWrapper - An object providing file system read functionality.
     */
    const processInputAndSolve = (fsWrapper) => {
      let rawInputData = '';
      try {
        if (!fsWrapper || typeof fsWrapper.readSync !== 'function') {
          throw new Error("Filesystem utility 'readSync' not available.");
        }
        rawInputData = fsWrapper.readSync("/dev/stdin", "utf8");
      } catch (ioError) {
        console.error("Failed to read input from /dev/stdin:", ioError.message);
        return; // Exit if input cannot be read
      }

      if (typeof rawInputData !== 'string' || rawInputData.length === 0) {
        console.error("Input data is empty or invalid.");
        return;
      }

      // Load the input parsing and problem solving orchestrator.
      const orchestrator = getModule(2);
      orchestrator(rawInputData);
    };

    processInputAndSolve(fileSystemUtils);
  },

  // Module 1: File System Access Wrapper
  function (currentModule, exportsObject) {
    // This module provides a wrapper for Node.js 'fs' module.
    // It attempts to load 'fs' and makes it available.
    let nodeFsModule = null;
    try {
      // Use global.require or module.require for robustness in different contexts.
      nodeFsModule = typeof global.require === 'function' ? global.require('fs') : require('fs');
    } catch (err) {
      console.warn("Node.js 'fs' module not found. File operations may fail.", err.message);
    }

    // Export an object that provides read functionality.
    // This adds a layer of indirection and allows for mock testing.
    exportsObject.readSync = function (filePath, encoding) {
      if (!nodeFsModule || typeof nodeFsModule.readFileSync !== 'function') {
        throw new Error("readFileSync is not available. Is Node.js 'fs' module loaded?");
      }
      return nodeFsModule.readFileSync(filePath, encoding);
    };
  },

  // Module 2: Input Orchestrator and Solver Invoker
  function (currentModule, exportsObject, getModule) {
    "use strict";
    // This module takes raw input, parses it, and then passes it to the main solver.

    const InputTokenProcessor = getModule(3); // Class for processing input tokens
    const ProblemSolverLogic = getModule(5); // The function containing the core problem-solving logic

    /**
     * Sets up the input processor and runs the main solver function.
     * @param {string} rawInputString - The raw string input from stdin.
     */
    const setupAndRunSolver = (rawInputString) => {
      // Basic input validation
      if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Invalid or empty input string provided to solver setup.");
        return;
      }

      // Create an instance of the input processor with the provided raw data.
      const dataStreamHandler = new InputTokenProcessor(rawInputString);

      // Invoke the main problem solver with the data stream handler.
      ProblemSolverLogic(dataStreamHandler);
    };

    currentModule.exports = setupAndRunSolver;
  },

  // Module 3: Input Token Processor Class
  function (currentModule, exportsObject, getModule) {
    "use strict";
    // This class handles tokenizing and reading input values.

    const TokenBuffer = getModule(4); // Internal queue for tokens

    class InputTokenizer {
      /**
       * Initializes the InputTokenizer with a raw input string.
       * @param {string} rawInputData - The string containing all input, usually from stdin.
       */
      constructor(rawInputData) {
        if (typeof rawInputData !== 'string') {
          throw new TypeError("InputTokenizer expects a string for rawInputData.");
        }

        // Trim whitespace and split the input string into tokens by any sequence of whitespace.
        const tokens = rawInputData.trim().split(/\s+/g).filter(Boolean); // Filter out empty strings from split

        // Initialize an internal buffer (queue) to hold these tokens.
        this.tokenQueue = new TokenBuffer(tokens);
      }

      /**
       * Reads and returns the next raw string token from the input.
       * @returns {string} The next token.
       * @throws {Error} If no more tokens are available.
       */
      getNextToken() {
        if (this.tokenQueue.isEmpty()) {
          throw new Error("Attempted to read token from empty input stream.");
        }
        return this.tokenQueue.dequeue();
      }

      /**
       * Reads the next token and attempts to parse it as an integer.
       * @returns {number} The parsed integer.
       * @throws {Error} If no more tokens or if the token is not a valid integer.
       */
      readInteger() {
        const token = this.getNextToken();
        const parsedValue = parseInt(token, 10);

        if (isNaN(parsedValue)) {
          throw new Error(`Invalid integer format: '${token}'`);
        }
        return parsedValue;
      }

      /**
       * Checks if there are more tokens remaining in the input stream.
       * @returns {boolean} True if there are more tokens, false otherwise.
       */
      hasMoreTokens() {
        return !this.tokenQueue.isEmpty();
      }

      /**
       * Clears the internal token buffer, effectively resetting the input stream.
       */
      resetStream() {
        this.tokenQueue.clear();
      }
    }

    currentModule.exports = InputTokenizer;
  },

  // Module 4: Custom Queue (Token Buffer) Class
  function (currentModule, exportsObject) {
    "use strict";
    // A simple custom queue implementation using an array.

    class ItemBuffer {
      /**
       * Initializes a new ItemBuffer instance.
       * @param {Array<any>} [initialItems=[]] - Optional array of items to pre-populate the buffer.
       */
      constructor(initialItems = []) {
        // Ensure initialItems is an array.
        if (!Array.isArray(initialItems)) {
            throw new TypeError("Initial items for ItemBuffer must be an array.");
        }
        this.dataElements = initialItems; // The underlying array storing queue elements
        this.currentReadIndex = 0; // Index of the next element to dequeue
        this.currentSize = initialItems.length; // Current number of elements in the queue
      }

      /**
       * Adds an item to the end of the buffer (enqueue).
       * @param {any} item - The item to add.
       */
      enqueue(item) {
        this.dataElements.push(item);
        this.currentSize++;
      }

      /**
       * Removes and returns the item from the front of the buffer (dequeue).
       * @returns {any} The item at the front of the buffer.
       * @throws {Error} If the buffer is empty.
       */
      dequeue() {
        if (this.isEmpty()) {
          throw new Error("Cannot dequeue from an empty buffer.");
        }
        // Retrieve the item at the current read index.
        const itemToReturn = this.dataElements[this.currentReadIndex];
        // Increment the read index to effectively remove the item.
        this.currentReadIndex++;
        this.currentSize--;

        // Optional: Periodically clean up the `dataElements` array
        // to prevent excessive memory usage if `currentReadIndex` grows very large.
        // This is a trade-off between performance (shifting) and memory.
        if (this.currentReadIndex > 200 && this.currentReadIndex > this.currentSize * 0.5) {
          // If a significant portion of the start of the array is "empty",
          // create a new array with just the remaining elements.
          this.dataElements = this.dataElements.slice(this.currentReadIndex);
          this.currentReadIndex = 0;
        }

        return itemToReturn;
      }

      /**
       * Returns the item at the front of the buffer without removing it (peek).
       * @returns {any} The item at the front of the buffer.
       * @throws {Error} If the buffer is empty.
       */
      peek() {
          if (this.isEmpty()) {
              throw new Error("Cannot peek into an empty buffer.");
          }
          return this.dataElements[this.currentReadIndex];
      }

      /**
       * Checks if the buffer is currently empty.
       * @returns {boolean} True if the buffer contains no items, false otherwise.
       */
      isEmpty() {
        return this.currentReadIndex >= this.dataElements.length || this.currentSize <= 0;
      }

      /**
       * Resets the buffer, clearing all items and resetting indices.
       */
      clear() {
        this.dataElements = [];
        this.currentReadIndex = 0;
        this.currentSize = 0;
      }

      /**
       * Returns the number of items currently in the buffer.
       * @returns {number} The current size of the buffer.
       */
      size() {
        return this.currentSize;
      }
    }

    currentModule.exports = ItemBuffer;
  },

  // Module 5: Core Problem Solver Logic
  function (currentModule, exportsObject) {
    "use strict";
    // This module contains the main algorithm to solve the problem.

    /**
     * Solves a specific problem using input from a data source.
     * The problem appears to involve finding a range [min, max] based on a sequence of operations.
     * @param {object} dataSource - An instance of InputTokenizer (from module 3) to read input.
     */
    currentModule.exports = function solveProblem(dataSource) {
      if (!dataSource || typeof dataSource.readInteger !== 'function' || typeof dataSource.hasMoreTokens !== 'function') {
        console.error("Invalid data source provided to the solver.");
        return;
      }

      // Read the first integer, which defines the size of the subsequent array.
      const arrayLength = dataSource.readInteger();

      // Validate arrayLength
      if (isNaN(arrayLength) || arrayLength <= 0) {
        console.error("Invalid or non-positive array length received:", arrayLength);
        return;
      }

      // Read the array elements.
      const valueSequence = [];
      let currentIdx = 0;
      while (currentIdx < arrayLength) {
        if (!dataSource.hasMoreTokens()) {
          console.error("Insufficient input tokens to fill the value sequence array.");
          return;
        }
        valueSequence.push(dataSource.readInteger());
        currentIdx++;
      }

      // Initialize arrays to store the minimum and maximum possible values at each step.
      // These arrays are sized `arrayLength + 1` to simplify boundary conditions.
      const minPossibleValues = Array.from({ length: arrayLength + 1 });
      const maxPossibleValues = Array.from({ length: arrayLength + 1 });

      // Base cases for the last element (index `arrayLength`).
      // These seem to be fixed initial values for the backward iteration.
      maxPossibleValues[arrayLength] = 2;
      minPossibleValues[arrayLength] = 2;

      // Iterate backwards from the second-to-last element to the first.
      let reverseIndex = arrayLength - 1;
      while (reverseIndex >= 0) {
        const currentConstraint = valueSequence[reverseIndex];
        let calculatedValue = currentConstraint; // Start with the current element's value

        // Adjust `calculatedValue` until it exceeds the maximum possible value from the next step.
        // This loop ensures the condition `calculatedValue > maxPossibleValues[reverseIndex + 1]` is met.
        while (calculatedValue <= maxPossibleValues[reverseIndex + 1]) {
          calculatedValue += currentConstraint;
        }

        // Determine the new maximum and minimum bounds for the current step.
        // The maximum value is one less than the adjusted `calculatedValue`.
        maxPossibleValues[reverseIndex] = calculatedValue - 1;
        // The minimum value is `calculatedValue` minus the current constraint.
        minPossibleValues[reverseIndex] = calculatedValue - currentConstraint;

        // Check for impossible scenarios:
        // 1. If the maximum possible value for the current step is less than the current constraint itself.
        //    This implies the constraint cannot be satisfied.
        if (maxPossibleValues[reverseIndex] < currentConstraint) {
          console.log(-1);
          return;
        }
        // 2. If the minimum possible value becomes greater than the maximum possible value.
        //    This indicates an invalid or impossible range.
        if (minPossibleValues[reverseIndex] > maxPossibleValues[reverseIndex]) {
          console.log(-1);
          return;
        }

        reverseIndex--; // Move to the previous element
      }

      // Output the minimum and maximum values found for the very first element (index 0).
      console.log(`${minPossibleValues[0]} ${maxPossibleValues[0]}`);
    };
  },
])
.forEach((moduleFunc, index) => {
  // Populate the module registry with the functions.
  moduleRegistry[index] = moduleFunc;
});