module.exports = function(modules) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The core function to require a module by its identifier.
  function requireModule(moduleIdentifier) {
    // If the module is already in the cache, return its exports.
    if (moduleCache[moduleIdentifier]) {
      return moduleCache[moduleIdentifier].exports;
    }

    // If not, create a new module object and add it to the cache.
    // 'id' is the module identifier, 'loaded' tracks if it's been processed.
    var moduleObject = moduleCache[moduleIdentifier] = {
      id: moduleIdentifier,
      loaded: false,
      exports: {}
    };

    // Execute the module function, passing the module object, its exports, and the require function itself.
    // Mark the module as loaded after execution.
    modules[moduleIdentifier].call(moduleObject.exports, moduleObject, moduleObject.exports, requireModule);
    moduleObject.loaded = true;

    // Return the module's exports.
    return moduleObject.exports;
  }

  // Store the modules array on the require function for internal use.
  requireModule.modules = modules;

  // Store the module cache on the require function.
  requireModule.cache = moduleCache;

  // Utility function to define a property on an object.
  // Used for getters in ES module interop.
  requireModule.defineProperty = function(targetObject, propertyName, getterFunction) {
    // Only define if the property doesn't already exist.
    if (!requireModule.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make it enumerable
        get: getterFunction // Use the provided function as a getter
      });
    }
  };

  // Utility function to mark an exports object as an ES module.
  requireModule.registerModule = function(moduleExports) {
    // Set Symbol.toStringTag for better debugging of module objects.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(moduleExports, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Mark as an ES module.
    Object.defineProperty(moduleExports, "__esModule", {
      value: true
    });
  };

  // Utility function for interop with non-ES modules.
  requireModule.interopRequireDefault = function(moduleExports, mode) {
    // If mode 1 is set, require the module first.
    if (1 & mode) moduleExports = requireModule(moduleExports);
    // If mode 8 is set, return the module exports directly.
    if (8 & mode) return moduleExports;
    // If mode 4 is set and it's an object and an ES module, return it directly.
    if (4 & mode && typeof moduleExports === "object" && moduleExports && moduleExports.__esModule) return moduleExports;

    // Otherwise, create a new object to represent the module.
    var newObject = Object.create(null);
    requireModule.registerModule(newObject); // Mark it as an ES module.
    Object.defineProperty(newObject, "default", {
      enumerable: true,
      value: moduleExports
    }); // Set the default export.

    // If mode 2 is set and it's not a string, copy all properties.
    if (2 & mode && typeof moduleExports !== "string") {
      for (var propName in moduleExports) {
        requireModule.defineProperty(newObject, propName, (function(key) {
          return moduleExports[key];
        }).bind(null, propName));
      }
    }
    return newObject;
  };

  // Utility function to get the default export or the module itself.
  requireModule.getModuleExports = function(moduleExports) {
    var getter = moduleExports && moduleExports.__esModule ?
      function() {
        return moduleExports.default;
      } :
      function() {
        return moduleExports;
      };
    requireModule.defineProperty(getter, "a", getter); // Define a property 'a' that returns the getter itself.
    return getter;
  };

  // Utility function to check if an object has a specific property.
  requireModule.hasOwn = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  };

  // Public path for assets (empty in this case).
  requireModule.publicPath = "";

  // Set the startup module and execute it.
  return requireModule(requireModule.startupModule = 0);
}([
  /* Module 0: Main entry point */
  function(moduleObject, moduleExports, requireModule) {
    "use strict";
    // Require the 'fs' module (Module 1).
    var fileSystem = requireModule(1);
    // Require the main processing logic (Module 2) and immediately call it
    // with the content of /dev/stdin read as UTF-8.
    requireModule(2)(fileSystem.readFileSync("/dev/stdin", "utf8"));
  },

  /* Module 1: Node.js 'fs' module */
  function(moduleObject, moduleExports) {
    // Export the Node.js 'fs' module directly.
    moduleObject.exports = require("fs");
  },

  /* Module 2: Input processing orchestrator */
  function(moduleObject, moduleExports, requireModule) {
    "use strict";
    // Require the InputHandler class (Module 3) and the main algorithm function (Module 5).
    var inputHandlerClass = requireModule(3),
      mainAlgorithmFunction = requireModule(5);

    // Export a function that takes raw input string.
    moduleObject.exports = function(rawInputString) {
      // Create a new instance of the InputHandler with the raw input.
      var inputProcessorInstance = new inputHandlerClass(rawInputString);
      // Pass the input processor instance to the main algorithm.
      mainAlgorithmFunction(inputProcessorInstance);
    };
  },

  /* Module 3: InputHandler class */
  function(moduleObject, moduleExports, requireModule) {
    "use strict";
    // Require the SimpleQueue class (Module 4).
    var simpleQueueClass = requireModule(4);

    // Export the InputHandler class.
    moduleObject.exports = class InputHandler {
      // Constructor takes the raw input string.
      constructor(rawInput) {
        // Trim whitespace and split the input into tokens by any whitespace.
        var inputTokens = rawInput.trim().split(/\s+/g);
        // Initialize an internal queue with these tokens.
        this.inputQueue = new simpleQueueClass(inputTokens);
      }

      // Method to read the next raw string token.
      readString() {
        return this.inputQueue.dequeue();
      }

      // Method to read the next integer token.
      readInt() {
        return parseInt(this.inputQueue.dequeue(), 10);
      }

      // Method to clear the internal input queue.
      finishReading() {
        this.inputQueue.clearQueue();
      }
    };
  },

  /* Module 4: SimpleQueue class */
  function(moduleObject, moduleExports, requireModule) {
    "use strict";
    // Export the SimpleQueue class.
    moduleObject.exports = class SimpleQueue {
      // Constructor can take an optional array of initial elements.
      constructor() {
        var initialElements = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
        this.currentSize = initialElements.length; // Current number of elements in the queue.
        this.queueElements = initialElements; // The array holding queue elements.
        this.currentIndex = 0; // Index of the next element to dequeue.
      }

      // Method to add an element to the end of the queue.
      enqueue(elementToAdd) {
        this.currentSize += 1;
        this.queueElements.push(elementToAdd);
      }

      // Method to remove and return the element from the front of the queue.
      dequeue() {
        var retrievedElement = this.queueElements[this.currentIndex];
        this.currentSize -= 1;
        this.currentIndex += 1;
        return retrievedElement;
      }

      // Method to clear all elements from the queue.
      clearQueue() {
        this.queueElements = [];
        this.currentSize = 0;
        this.currentIndex = 0;
      }
    };
  },

  /* Module 5: Main algorithm logic */
  function(moduleObject, moduleExports, requireModule) {
    "use strict";
    // Export the main algorithm function, which takes an input reader instance.
    moduleObject.exports = function(inputReader) {
      // Read the total count of numbers.
      var totalNumbersCount = inputReader.readInt();
      // Create an array to store the numbers.
      var numberSequence = new Array(totalNumbersCount);

      // Read each number and populate the array.
      for (var elementIndex = 0; elementIndex < totalNumbersCount; elementIndex++) {
        numberSequence[elementIndex] = inputReader.readInt();
      }

      // Create an array to store the length of consecutive sequences ending at each number.
      // Initialize with zeros, size is totalNumbersCount + 1 to handle numbers up to totalNumbersCount.
      var consecutiveSequenceLengths = new Array(totalNumbersCount + 1).fill(0);

      // Iterate through the numbers to calculate consecutive sequence lengths.
      for (var currentPosition = 1; currentPosition <= totalNumbersCount; currentPosition++) {
        var currentNumber = numberSequence[currentPosition - 1];
        // The length of the sequence ending at currentNumber is 1 plus the length of the sequence ending at (currentNumber - 1).
        consecutiveSequenceLengths[currentNumber] = consecutiveSequenceLengths[currentNumber - 1] + 1;
      }

      // Find the maximum consecutive sequence length found.
      var maximumSequenceLength = 0;
      for (var checkValue = 0; checkValue <= totalNumbersCount; checkValue++) {
        maximumSequenceLength = Math.max(maximumSequenceLength, consecutiveSequenceLengths[checkValue]);
      }

      // The result is the total number of elements minus the maximum consecutive sequence length.
      console.log(totalNumbersCount - maximumSequenceLength);
    };
  }
]);
