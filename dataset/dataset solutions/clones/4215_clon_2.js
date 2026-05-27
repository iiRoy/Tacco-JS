module.exports = function (moduleDefinitions) {
  // Cache for loaded modules
  var moduleCache = {};

  /**
   * Custom module loading function, similar to webpack's __webpack_require__.
   * @param {number} moduleId - The ID of the module to load.
   * @returns {object} The exports of the loaded module.
   */
  function moduleLoader(moduleId) {
    // If module is already in cache, return its exports
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // Create a new module instance and add it to the cache
    var moduleInstance = (moduleCache[moduleId] = {
      i: moduleId, // Module ID
      l: false, // Loaded flag
      exports: {}, // Module exports object
    });

    // Execute the module function with its exports and the loader
    moduleDefinitions[moduleId].call(
      moduleInstance.exports,
      moduleInstance,
      moduleInstance.exports,
      moduleLoader
    );

    // Mark module as loaded
    moduleInstance.l = true;

    // Return the module's exports
    return moduleInstance.exports;
  }

  // Store module definitions and cache on the loader for internal use
  moduleLoader.m = moduleDefinitions;
  moduleLoader.c = moduleCache;

  /**
   * Define a getter function for a module export.
   * @param {object} targetObject - The object to define the property on.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} getterFunction - The getter function for the property.
   */
  moduleLoader.d = function (targetObject, propertyName, getterFunction) {
    // Only define if the property doesn't already exist
    if (!moduleLoader.o(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make it enumerable
        get: getterFunction, // Set the getter
      });
    }
  };

  /**
   * Add __esModule and Symbol.toStringTag properties to exports for ES module compatibility.
   * @param {object} exportsObject - The exports object to modify.
   */
  moduleLoader.r = function (exportsObject) {
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, {
        value: "Module",
      });
    }
    Object.defineProperty(exportsObject, "__esModule", { value: true });
  };

  /**
   * Create a namespace object for module exports.
   * @param {any} valueToWrap - The module's exports.
   * @param {number} modeFlags - Flags indicating how to handle the value.
   * @returns {object} The namespace object.
   */
  moduleLoader.t = function (valueToWrap, modeFlags) {
    // If flag 1 is set, load the module first
    if (1 & modeFlags) valueToWrap = moduleLoader(valueToWrap);
    // If flag 8 is set, return the value directly
    if (8 & modeFlags) return valueToWrap;
    // If flag 4 is set and it's an object with __esModule, return it directly
    if (4 & modeFlags && typeof valueToWrap === "object" && valueToWrap && valueToWrap.__esModule)
      return valueToWrap;

    // Create a new namespace object
    var namespaceObject = Object.create(null);
    moduleLoader.r(namespaceObject); // Add ES module properties
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: valueToWrap,
    }); // Set default export

    // If flag 2 is set and it's not a string, copy all properties
    if (2 & modeFlags && typeof valueToWrap !== "string")
      for (var propKey in valueToWrap)
        moduleLoader.d(
          namespaceObject,
          propKey,
          (function (key) {
            return valueToWrap[key];
          }).bind(null, propKey)
        );
    return namespaceObject;
  };

  /**
   * Get a default export function for a module.
   * @param {object} moduleExports - The module's exports object.
   * @returns {function} A function that returns the default export.
   */
  moduleLoader.n = function (moduleExports) {
    var defaultExportGetter =
      moduleExports && moduleExports.__esModule
        ? function () {
            return moduleExports.default;
          }
        : function () {
            return moduleExports;
          };
    moduleLoader.d(defaultExportGetter, "a", defaultExportGetter); // Add 'a' property for compatibility
    return defaultExportGetter;
  };

  /**
   * Check if an object has a property.
   * @param {object} targetObject - The object to check.
   * @param {string} propertyKey - The key of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  moduleLoader.o = function (targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  // Public path for assets (empty in this case)
  moduleLoader.p = "";

  // Execute the entry module (module 0) and return its exports
  return moduleLoader((moduleLoader.s = 0));
}([
  /* Module 0: Main entry point */
  function (moduleObj0, exportsObj0, localRequire0) {
    "use strict";
    // Require the file system module
    var fileSystemHandler = localRequire0(1);
    // Require the main processing function
    var processInputData = localRequire0(2);

    // Read data from standard input synchronously and process it
    processInputData(fileSystemHandler.readFileSync("/dev/stdin", "utf8"));
  },

  /* Module 1: File System module */
  function (moduleObj1, exportsObj1) {
    // Export the 'fs' module directly
    moduleObj1.exports = require("fs");
  },

  /* Module 2: Input processing orchestrator */
  function (moduleObj2, exportsObj2, localRequire2) {
    "use strict";
    // Get the InputParser class
    var inputProcessorClass = localRequire2(3);
    // Get the digit sequence checker function
    var digitCheckerFunction = localRequire2(5);

    /**
     * Main function to process the input string.
     * @param {string} inputStringData - The raw input string.
     */
    moduleObj2.exports = function (inputStringData) {
      // Create an instance of the input processor
      var processorInstance = new inputProcessorClass(inputStringData);
      // Pass the processor instance to the digit checker
      digitCheckerFunction(processorInstance);
    };
  },

  /* Module 3: InputParser class */
  function (moduleObj3, exportsObj3, localRequire3) {
    "use strict";
    // Get the DataQueue class
    var dataQueueClass = localRequire3(4);

    /**
     * Class for parsing and managing input tokens.
     */
    moduleObj3.exports = class InputParser {
      /**
       * Constructor for InputParser.
       * @param {string} initialString - The raw input string.
       */
      constructor(initialString) {
        // Trim whitespace and split the string into tokens
        var parsedElements = initialString.trim().split(/\s+/g);
        // Initialize an internal queue with these tokens
        this.inputQueue = new dataQueueClass(parsedElements);
      }

      /**
       * Dequeues and returns the next raw input token.
       * @returns {string} The next token.
       */
      inr() {
        return this.inputQueue.deq();
      }

      /**
       * Dequeues the next input token and parses it as an integer.
       * @returns {number} The next token as an integer.
       */
      in() {
        return parseInt(this.inputQueue.deq(), 10);
      }

      /**
       * Clears the internal input queue.
       */
      fin() {
        this.inputQueue.clear();
      }
    };
  },

  /* Module 4: DataQueue class */
  function (moduleObj4, exportsObj4, localRequire4) {
    "use strict";

    /**
     * A simple queue implementation.
     */
    moduleObj4.exports = class DataQueue {
      /**
       * Constructor for DataQueue.
       * @param {Array<any>} [initialItems=[]] - Optional array of initial items.
       */
      constructor() {
        var initialItems =
          arguments.length > 0 && arguments[0] !== undefined
            ? arguments[0]
            : [];
        this.currentSize = initialItems.length; // Current number of items in the queue
        this.dataElements = initialItems; // The underlying array storing items
        this.currentIndex = 0; // Index of the next item to dequeue
      }

      /**
       * Enqueues an item to the end of the queue.
       * @param {any} itemToAdd - The item to add.
       */
      enq(itemToAdd) {
        this.currentSize += 1;
        this.dataElements.push(itemToAdd);
      }

      /**
       * Dequeues and returns the item at the front of the queue.
       * @returns {any} The dequeued item.
       */
      deq() {
        var dequeuedItem = this.dataElements[this.currentIndex];
        this.currentSize -= 1;
        this.currentIndex += 1;
        return dequeuedItem;
      }

      /**
       * Clears all items from the queue and resets its state.
       */
      clear() {
        this.dataElements = [];
        this.currentSize = 0;
        this.currentIndex = 0;
      }
    };
  },

  /* Module 5: Digit sequence checker */
  function (moduleObj5, exportsObj5, localRequire5) {
    "use strict";

    /**
     * Checks if a number contains at least three consecutive identical digits.
     * @param {object} inputHandler - An object with an 'in' method to get the number.
     */
    moduleObj5.exports = function (inputHandler) {
      var consecutiveCount = 1; // Counter for consecutive identical digits
      var previousDigit = -1; // Stores the previously encountered digit (initialized to a non-digit value)
      var currentNumber = inputHandler.in(); // Get the number from the input handler

      // Loop while the number is greater than 0
      while (currentNumber > 0) {
        var currentDigit = currentNumber % 10; // Get the last digit

        // Check if the current digit is the same as the previous one
        if (currentDigit === previousDigit) {
          consecutiveCount++; // Increment count if they are the same
        } else {
          previousDigit = currentDigit; // Reset previous digit
          consecutiveCount = 1; // Reset count
        }

        // Move to the next digit by removing the last one
        currentNumber = Math.floor(currentNumber / 10);
      }

      // Output "Yes" if three or more consecutive digits were found, otherwise "No"
      if (consecutiveCount >= 3) {
        console.log("Yes");
      } else {
        console.log("No");
      }
    };
  },
]);
