module.exports = (moduleDefinitions) => {
  // A cache to store loaded modules, preventing redundant execution.
  const moduleCache = {};

  /**
   * The core module loading function, similar to Webpack's __webpack_require__.
   * @param {number} requestedModuleId The ID of the module to load.
   * @returns The exports of the requested module.
   */
  function moduleLoader(requestedModuleId) {
    // If the module is already in the cache, return its exports.
    if (moduleCache[requestedModuleId]) {
      return moduleCache[requestedModuleId].exports;
    }

    // Initialize a new module entry in the cache.
    // 'id': The module's unique identifier.
    // 'loaded': A flag indicating if the module has finished loading.
    // 'exports': The object that will hold the module's exports.
    const currentModuleEntry = moduleCache[requestedModuleId] = {
      id: requestedModuleId,
      loaded: false,
      exports: {}
    };

    // Execute the module function, providing it with 'this' context,
    // its own module object, its exports object, and the module loader itself.
    moduleDefinitions[requestedModuleId].call(
      currentModuleEntry.exports,
      currentModuleEntry,
      currentModuleEntry.exports,
      moduleLoader
    );

    // Mark the module as loaded after execution.
    currentModuleEntry.loaded = true;

    // Return the module's exports.
    return currentModuleEntry.exports;
  }

  // Store the full set of module definitions.
  moduleLoader.moduleRegistry = moduleDefinitions;

  // Store the module cache.
  moduleLoader.cacheRegistry = moduleCache;

  /**
   * Defines an enumerable getter property on the target object.
   * This is used for defining named exports.
   * @param {object} targetObject The object to define the property on.
   * @param {string} propertyName The name of the property.
   * @param {function} getterFunction The function to call to get the property's value.
   */
  moduleLoader.defineExportProperty = (targetObject, propertyName, getterFunction) => {
    // Check if the property already exists using a safe method.
    if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property visible during enumeration (e.g., in for...in loops).
        get: getterFunction // Define the getter function for the property.
      });
    }
  };

  /**
   * Marks an object as an ES module by setting specific properties.
   * This helps in interoperability between CommonJS and ES modules.
   * @param {object} targetObject The object to mark as an ES module.
   */
  moduleLoader.markAsEsModule = (targetObject) => {
    // Set Symbol.toStringTag for better debugging and module identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
    }
    // Explicitly mark as an ES module.
    Object.defineProperty(targetObject, "__esModule", { value: true });
  };

  /**
   * Creates a namespace object for a module, handling different export modes.
   * @param {any} moduleValue The module's value (could be a CommonJS export or an ES module).
   * @param {number} modeFlags Flags indicating how to interpret the moduleValue.
   *   1: Treat moduleValue as already loaded (direct module ID).
   *   4: If moduleValue is an ES module, return it directly.
   *   8: Return moduleValue as is.
   *   2: Bind all properties from moduleValue to the new namespace object.
   * @returns {object} The created namespace object.
   */
  moduleLoader.createNamespaceObject = (moduleValue, modeFlags) => {
    // If flag 1 is set, load the module first.
    if (modeFlags & 1) {
      moduleValue = moduleLoader(moduleValue);
    }
    // If flag 8 is set, return the value directly.
    if (modeFlags & 8) {
      return moduleValue;
    }
    // If flag 4 is set and it's an ES module, return it directly.
    if ((modeFlags & 4) && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Create a new empty object for the namespace.
    const namespaceObject = Object.create(null);
    moduleLoader.markAsEsModule(namespaceObject); // Mark it as an ES module.
    // Define the 'default' export property.
    Object.defineProperty(namespaceObject, "default", { enumerable: true, value: moduleValue });

    // If flag 2 is set and it's not a string, copy all properties.
    if ((modeFlags & 2) && typeof moduleValue !== "string") {
      // Iterate over properties of the original moduleValue.
      for (const propKey in moduleValue) {
        // Define a getter for each property, ensuring it's enumerable.
        moduleLoader.defineExportProperty(namespaceObject, propKey, () => moduleValue[propKey]);
      }
    }
    return namespaceObject;
  };

  /**
   * Creates a getter function for a module's default export.
   * Handles both CommonJS (t.default) and ES modules.
   * @param {object} targetModule The module object.
   * @returns {function} A getter function that returns the default export.
   */
  moduleLoader.getDefaultExport = (targetModule) => {
    // Determine the getter function based on whether it's an ES module.
    const defaultGetter = targetModule && targetModule.__esModule
      ? () => targetModule.default // If ES module, return its 'default' property.
      : () => targetModule;      // Otherwise, return the module itself.

    // Define an 'a' property on the getter function (a common Webpack convention).
    moduleLoader.defineExportProperty(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  /**
   * Checks if an object has a specific property directly on itself (not inherited).
   * @param {object} checkObject The object to check.
   * @param {string} propertyName The name of the property.
   * @returns {boolean} True if the property exists directly on the object, false otherwise.
   */
  moduleLoader.hasOwnProp = (checkObject, propertyName) => {
    return Object.prototype.hasOwnProperty.call(checkObject, propertyName);
  };

  // Set the public path for assets (usually an empty string in simple cases).
  moduleLoader.publicPath = "";

  // Set the entry point module ID and immediately load it to start the application.
  moduleLoader.startupModuleId = 0;
  return moduleLoader(moduleLoader.startupModuleId);
}([
/* Module 0: Entry point for the application */
(moduleExport, exportsObj, loadModule) => {
  "use strict";
  // Import the Node.js 'fs' (file system) module.
  const fileSystemModule = loadModule(1);

  // Ensure the fs module was loaded successfully.
  if (!fileSystemModule || !fileSystemModule.readFileSync) {
    console.error("Error: 'fs' module could not be loaded or is missing readFileSync.");
    process.exit(1);
  }

  // Load the main processing logic module and execute it with the input from stdin.
  // Read all data from standard input as a UTF-8 string.
  const stdinContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  const mainProcessor = loadModule(2);
  mainProcessor(stdinContent);
},

/* Module 1: Node.js 'fs' module export */
(moduleExport, exportsObj) => {
  // Directly export the built-in Node.js 'fs' module.
  moduleExport.exports = require("fs");
},

/* Module 2: Main application orchestrator */
(moduleExport, exportsObj, loadModule) => {
  "use strict";
  // Import the DataStreamProcessor class (for parsing input).
  const inputReaderClass = loadModule(3);
  // Import the core algorithm for sequence processing.
  const mainSequenceProcessor = loadModule(5);

  /**
   * Processes the raw input string.
   * @param {string} rawDataString The raw string data from stdin.
   */
  moduleExport.exports = (rawDataString) => {
    // Create an instance of the data stream processor with the raw input.
    const dataParser = new inputReaderClass(rawDataString);

    // Hand over the data parser instance to the main algorithm for execution.
    mainSequenceProcessor(dataParser);
  };
},

/* Module 3: DataStreamProcessor class for parsing input tokens */
(moduleExport, exportsObj, loadModule) => {
  "use strict";
  // Import the TokenQueue class.
  const TokenQueue = loadModule(4);

  /**
   * @class DataStreamProcessor
   * @description Handles parsing of input strings into tokens and numbers.
   */
  moduleExport.exports = class DataStreamProcessor {
    /**
     * Creates an instance of DataStreamProcessor.
     * @param {string} sourceString The string containing space-separated input.
     */
    constructor(sourceString) {
      // Trim whitespace from the string and split it into an array of tokens.
      const tokenArray = sourceString.trim().split(/\s+/g);
      // Initialize an internal queue with these tokens.
      this.tokenQueue = new TokenQueue(tokenArray);
    }

    /**
     * Retrieves the next raw string token from the input stream.
     * @returns {string|undefined} The next token, or undefined if no more tokens.
     */
    getNextToken() {
      // Optionally add a guard for empty queue, though dequeueItem handles it.
      if (this.tokenQueue.isEmpty()) {
        console.warn("Attempted to read token from empty input stream.");
        return undefined;
      }
      return this.tokenQueue.dequeueItem();
    }

    /**
     * Retrieves the next token and parses it as an integer.
     * @returns {number|NaN} The parsed integer, or NaN if parsing fails.
     */
    getNextInteger() {
      const token = this.getNextToken();
      if (token === undefined) {
        return NaN; // No token available.
      }
      // Use Number.parseInt with radix 10 for explicit base.
      const parsedValue = Number.parseInt(token, 10);
      return parsedValue;
    }

    /**
     * Clears the internal token queue, effectively resetting the processor.
     */
    resetProcessor() {
      this.tokenQueue.emptyQueue();
    }
  };
},

/* Module 4: TokenQueue class (a simple queue implementation) */
(moduleExport, exportsObj, loadModule) => {
  "use strict";
  /**
   * @class TokenQueue
   * @description A basic queue implementation optimized for sequential access.
   *              Elements are added to the end and dequeued from the front by advancing an index.
   */
  moduleExport.exports = class TokenQueue {
    /**
     * Creates an instance of TokenQueue.
     * @param {Array<string>} [initialElements=[]] An optional array of elements to initialize the queue with.
     */
    constructor(initialElements = []) {
      this.dataStore = initialElements; // The array holding queue elements.
      this.headIndex = 0;               // Index of the front element.
      this.currentSize = initialElements.length; // Current number of elements in the logical queue.
    }

    /**
     * Adds an item to the back of the queue.
     * @param {string} item The item to enqueue.
     */
    enqueueItem(item) {
      this.dataStore.push(item);
      this.currentSize++;
    }

    /**
     * Removes and returns the item from the front of the queue.
     * @returns {string|undefined} The item at the front, or undefined if the queue is empty.
     */
    dequeueItem() {
      if (this.currentSize === 0 || this.headIndex >= this.dataStore.length) {
        return undefined; // Queue is logically empty.
      }
      const dequeuedValue = this.dataStore[this.headIndex];
      this.headIndex++; // Move the head pointer.
      this.currentSize--; // Decrement logical size.

      // Optional: Periodically trim the underlying array to save memory
      // if many items have been dequeued and headIndex is far from 0.
      if (this.headIndex > 1000 && this.headIndex > this.dataStore.length / 2) {
        this.dataStore = this.dataStore.slice(this.headIndex);
        this.headIndex = 0;
      }
      return dequeuedValue;
    }

    /**
     * Checks if the queue is empty.
     * @returns {boolean} True if the queue contains no elements, false otherwise.
     */
    isEmpty() {
      return this.currentSize === 0;
    }

    /**
     * Removes all elements from the queue.
     */
    emptyQueue() {
      this.dataStore = [];
      this.headIndex = 0;
      this.currentSize = 0;
    }
  };
},

/* Module 5: Core algorithm for finding longest consecutive sequence */
(moduleExport, exportsObj, loadModule) => {
  "use strict";
  /**
   * Calculates the minimum number of elements to remove from an input sequence
   * to make the remaining elements form a consecutive sequence.
   * @param {object} dataProcessorInstance An instance of DataStreamProcessor to read input.
   */
  moduleExport.exports = (dataProcessorInstance) => {
    // Read the total count of numbers expected in the input.
    const totalCount = dataProcessorInstance.getNextInteger();

    // Basic validation for totalCount.
    if (isNaN(totalCount) || totalCount < 0) {
      console.error("Invalid total count provided. Must be a non-negative integer.");
      return;
    }

    // Array to store the input numbers.
    const inputNumbersArray = Array.from({ length: totalCount });

    // Read all 'totalCount' numbers into the array.
    for (let idx = 0; idx < totalCount; idx++) {
      const currentNumber = dataProcessorInstance.getNextInteger();
      if (isNaN(currentNumber)) {
        console.error(`Invalid number read at position ${idx}. Aborting.`);
        return;
      }
      inputNumbersArray[idx] = currentNumber;
    }

    // This array will store the length of the longest consecutive sequence
    // ending at a specific number. `sequenceLengthTracker[k]` will be the length
    // of the sequence `..., k-1, k`.
    // It's sized `totalCount + 1` to accommodate numbers up to `totalCount` and use 1-based indexing for values.
    const sequenceLengthTracker = new Uint32Array(totalCount + 1).fill(0);

    // Iterate through the input numbers to populate the sequence length tracker.
    // If a number 'val' is encountered, the length of the sequence ending at 'val'
    // is one more than the length of the sequence ending at 'val-1'.
    // NOTE: Original code had 'o=1; o<=e; o++' and 'r[o]', which would skip r[0] and
    // potentially go out of bounds. This is corrected to iterate through all elements.
    for (let currentInputIdx = 0; currentInputIdx < totalCount; currentInputIdx++) {
      const value = inputNumbersArray[currentInputIdx];

      // Basic bounds check for input values to prevent out-of-bounds access on tracker.
      if (value < 1 || value > totalCount) {
        // If values are outside 1..totalCount, they can't contribute to a sequence
        // within this specific problem's constraint (implicitly assuming numbers are within 1..N).
        // For a more general solution, sequenceLengthTracker would need to be a Map or
        // handle arbitrary ranges. For this problem, we'll ignore them or log a warning.
        // console.warn(`Input value ${value} is outside expected range [1, ${totalCount}].`);
        continue;
      }

      // Update the sequence length for the current value.
      // If `value - 1` has a sequence, extend it. Otherwise, this value starts a new sequence of length 1.
      sequenceLengthTracker[value] = sequenceLengthTracker[value - 1] + 1;
    }

    // Find the maximum sequence length found.
    let maxSequenceLength = 0;
    // Iterate from 1 up to totalCount, as these are the possible values.
    for (let checkVal = 1; checkVal <= totalCount; checkVal++) {
      if (sequenceLengthTracker[checkVal] > maxSequenceLength) {
        maxSequenceLength = sequenceLengthTracker[checkVal];
      }
    }

    // The result is the total number of elements minus the length of the longest
    // consecutive sequence that can be formed. This represents the minimum
    // elements to remove to achieve one such consecutive sequence.
    const elementsToRemove = totalCount - maxSequenceLength;
    console.log(elementsToRemove);

    // After processing, it's good practice to reset the input processor if it's reusable.
    dataProcessorInstance.resetProcessor();
  };
}
]);