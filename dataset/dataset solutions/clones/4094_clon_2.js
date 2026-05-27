module.exports = function (moduleDefinitions) {
  // A cache for already loaded modules.
  var moduleCache = {};

  /**
   * Loads a module by its identifier.
   * @param {number} moduleIdentifier - The ID of the module to load.
   * @returns {*} The exports of the loaded module.
   */
  function loadModule(moduleIdentifier) {
    // If the module is already in the cache, return its exports.
    if (moduleCache[moduleIdentifier]) {
      return moduleCache[moduleIdentifier].exports;
    }

    // Create a new module entry in the cache.
    var moduleEntry = (moduleCache[moduleIdentifier] = {
      id: moduleIdentifier, // The module's unique identifier.
      loaded: false, // Flag indicating if the module has been fully loaded.
      exports: {}, // The exports object for this module.
    });

    // Execute the module function, populating its exports.
    // The module function receives: module, module.exports, and the local loadModule function.
    moduleDefinitions[moduleIdentifier].call(
      moduleEntry.exports,
      moduleEntry,
      moduleEntry.exports,
      loadModule
    );

    // Mark the module as loaded.
    moduleEntry.loaded = true;

    // Return the module's exports.
    return moduleEntry.exports;
  }

  // Store all module definitions.
  loadModule.modules = moduleDefinitions;

  // Store the module cache.
  loadModule.cache = moduleCache;

  /**
   * Defines a getter function for an export on a target object.
   * @param {object} targetObject - The object to define the property on.
   * @param {string} exportName - The name of the export property.
   * @param {function} getterFunction - The function to call to get the export value.
   */
  loadModule.defineExport = function (targetObject, exportName, getterFunction) {
    // Only define if the property doesn't already exist.
    if (!loadModule.hasOwn(targetObject, exportName)) {
      Object.defineProperty(targetObject, exportName, {
        enumerable: true, // Make the property enumerable.
        get: getterFunction, // Set the getter function.
      });
    }
  };

  /**
   * Marks an object as an ES module.
   * @param {object} targetObject - The object to mark.
   */
  loadModule.markAsEsModule = function (targetObject) {
    // Set Symbol.toStringTag for better module identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
    }
    // Set __esModule flag.
    Object.defineProperty(targetObject, "__esModule", { value: true });
  };

  /**
   * Handles interoperability for different module types (e.g., CommonJS to ES module).
   * @param {*} moduleValue - The module's value.
   * @param {number} mode - Bitmask for interop behavior.
   * @returns {*} The interoperable module object.
   */
  loadModule.interopRequireDefault = function (moduleValue, mode) {
    // If bit 1 is set, load the module first.
    if (1 & mode) {
      moduleValue = loadModule(moduleValue);
    }
    // If bit 8 is set, return the module value directly.
    if (8 & mode) {
      return moduleValue;
    }
    // If bit 4 is set and it's an object and an ES module, return it directly.
    if (4 & mode && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Create a new object for interoperability.
    var interopObject = Object.create(null);
    // Mark it as an ES module.
    loadModule.markAsEsModule(interopObject);
    // Define a 'default' export pointing to the original module value.
    Object.defineProperty(interopObject, "default", { enumerable: true, value: moduleValue });

    // If bit 2 is set and it's not a string, copy all properties from the original module.
    if (2 & mode && typeof moduleValue !== "string") {
      for (var propName in moduleValue) {
        loadModule.defineExport(
          interopObject,
          propName,
          // Bind the property name to the getter function.
          function (p) {
            return moduleValue[p];
          }.bind(null, propName)
        );
      }
    }
    return interopObject;
  };

  /**
   * Creates a getter for the default export, primarily for `r.n` in webpack.
   * @param {*} moduleValue - The module's value.
   * @returns {function} A getter function for the default export.
   */
  loadModule.createDefaultExportGetter = function (moduleValue) {
    var defaultGetter =
      moduleValue && moduleValue.__esModule
        ? function () {
            return moduleValue.default;
          }
        : function () {
            return moduleValue;
          };
    // Define an 'a' export that also points to the default getter.
    loadModule.defineExport(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  /**
   * Checks if an object has a specific property.
   * @param {object} targetObject - The object to check.
   * @param {string} propertyName - The name of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  loadModule.hasOwn = function (targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Public path for assets (empty in this case).
  loadModule.publicPath = "";

  // Load the entry module (module 0) and return its exports.
  return loadModule((loadModule.startupModule = 0));
}([
  // Module 0: Main entry point
  function (module, exports, loadModule) {
    "use strict";
    // Import the 'fs' module.
    var fileSystem = loadModule(1);
    // Import the main processing logic.
    var processInput = loadModule(2);

    // Read from standard input and pass the content to the processing function.
    processInput(fileSystem.readFileSync("/dev/stdin", "utf8"));
  },

  // Module 1: Node.js 'fs' module
  function (module, exports) {
    module.exports = require("fs");
  },

  // Module 2: Orchestrates input parsing and algorithm execution
  function (module, exports, loadModule) {
    "use strict";
    // Import the InputProcessor class.
    var InputProcessor = loadModule(3);
    // Import the core algorithm function.
    var executeAlgorithm = loadModule(5);

    // Export a function that takes raw input text.
    module.exports = function (rawInputText) {
      // Create an instance of the InputProcessor with the raw text.
      var parserInstance = new InputProcessor(rawInputText);
      // Execute the main algorithm using the parser instance.
      executeAlgorithm(parserInstance);
    };
  },

  // Module 3: InputProcessor class for reading values
  function (module, exports, loadModule) {
    "use strict";
    // Import the DataQueue class.
    var DataQueue = loadModule(4);

    // Define and export the InputProcessor class.
    module.exports = class InputProcessor {
      /**
       * Constructs an InputProcessor instance.
       * @param {string} rawText - The raw input string.
       */
      constructor(rawText) {
        // Trim whitespace and split the input into tokens by any whitespace.
        var tokenArray = rawText.trim().split(/\s+/g);
        // Initialize a DataQueue with these tokens.
        this.tokenQueue = new DataQueue(tokenArray);
      }

      /**
       * Dequeues and returns the next string token.
       * @returns {string} The next string token.
       */
      getNextString() {
        return this.tokenQueue.dequeue();
      }

      /**
       * Dequeues the next token and parses it as an integer.
       * @returns {number} The next integer value.
       */
      getNextInt() {
        return parseInt(this.tokenQueue.dequeue(), 10);
      }

      /**
       * Clears the internal token queue.
       */
      finalize() {
        this.tokenQueue.reset();
      }
    };
  },

  // Module 4: DataQueue class for managing tokens
  function (module, exports, loadModule) {
    "use strict";
    // Define and export the DataQueue class.
    module.exports = class DataQueue {
      /**
       * Constructs a DataQueue instance.
       * @param {Array<*>} [initialItems=[]] - Optional array of initial items.
       */
      constructor() {
        // Get initial items from arguments, defaulting to an empty array.
        var initialItems =
          arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        // Initialize current size, queue elements, and current index.
        this.currentSize = initialItems.length;
        this.queueElements = initialItems;
        this.currentIndex = 0;
      }

      /**
       * Adds an item to the end of the queue.
       * @param {*} item - The item to enqueue.
       */
      enqueue(item) {
        this.currentSize += 1;
        this.queueElements.push(item);
      }

      /**
       * Removes and returns the item at the front of the queue.
       * @returns {*} The dequeued item.
       */
      dequeue() {
        var dequeuedItem = this.queueElements[this.currentIndex];
        this.currentSize -= 1;
        this.currentIndex += 1;
        return dequeuedItem;
      }

      /**
       * Clears all items from the queue and resets its state.
       */
      reset() {
        this.queueElements = [];
        this.currentSize = 0;
        this.currentIndex = 0;
      }
    };
  },

  // Module 5: Core algorithm logic
  function (module, exports, loadModule) {
    "use strict";
    // Export the main algorithm function.
    module.exports = function (inputReader) {
      // Read the number of elements.
      var numElements = inputReader.getNextInt();
      // Create an array to store the input values.
      var valuesArray = new Array(numElements);

      // Populate the valuesArray with integers from the input.
      for (var idx = 0; idx < numElements; idx++) {
        valuesArray[idx] = inputReader.getNextInt();
      }

      // Initialize two arrays for dynamic programming: minRange and maxRange.
      var minRange = new Array(numElements + 1);
      var maxRange = new Array(numElements + 1);

      // Set base cases for the last element.
      minRange[numElements] = 2;
      maxRange[numElements] = 2;

      // Iterate backwards from the second-to-last element.
      for (var currentIdx = numElements - 1; currentIdx >= 0; currentIdx--) {
        // Get the current value from the input array.
        var currentValue = valuesArray[currentIdx];

        // Adjust currentValue until it's greater than the minimum of the next range.
        while (currentValue <= minRange[currentIdx + 1]) {
          currentValue += valuesArray[currentIdx];
        }

        // Calculate the new minimum and maximum possible values for the current range.
        minRange[currentIdx] = currentValue - 1;
        maxRange[currentIdx] = currentValue - valuesArray[currentIdx];

        // Check for invalid conditions:
        // 1. If the minimum possible value is less than the current value itself.
        // 2. If the maximum possible value is greater than the minimum possible value.
        if (minRange[currentIdx] < valuesArray[currentIdx] || maxRange[currentIdx] > minRange[currentIdx]) {
          // If invalid, print -1 and terminate.
          return void console.log(-1);
        }
      }

      // If all conditions are valid, print the final maxRange and minRange for the first element.
      console.log(`${maxRange[0]} ${minRange[0]}`);
    };
  },
]);
