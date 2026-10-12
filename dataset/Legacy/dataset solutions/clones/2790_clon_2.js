module.exports = function(moduleDefinitions) {
  // This object serves as a cache for loaded modules.
  var moduleCache = {};

  // The core module loading function.
  function moduleLoader(moduleId) {
    // If the module is already in the cache, return its exports.
    if (moduleCache[moduleId]) {
      return moduleCache[moduleId].exports;
    }

    // If not in cache, create a new module entry in the cache.
    var currentModule = moduleCache[moduleId] = {
      identifier: moduleId, // Unique identifier for the module.
      isLoaded: false,      // Flag to indicate if the module has been loaded.
      exports: {}           // The exports object for this module.
    };

    // Execute the module function, passing the module object, its exports, and the loader itself.
    moduleDefinitions[moduleId].call(currentModule.exports, currentModule, currentModule.exports, moduleLoader);

    // Mark the module as loaded.
    currentModule.isLoaded = true;

    // Return the module's exports.
    return currentModule.exports;
  }

  // Store the module definitions for later access.
  moduleLoader.moduleMap = moduleDefinitions;

  // Store the module cache for later access.
  moduleLoader.cacheMap = moduleCache;

  // Helper function to define a getter property on an object.
  // Used for defining exports.
  moduleLoader.defineGetter = function(targetObject, propertyName, getterFunction) {
    // Check if the property already exists on the target object.
    if (!moduleLoader.hasOwn(targetObject, propertyName)) {
      // If not, define it with enumerable: true and the provided getter.
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction
      });
    }
  };

  // Helper function to mark a module as an ES module and set its Symbol.toStringTag.
  moduleLoader.registerModule = function(targetObject) {
    // If Symbol.toStringTag is available, set it to "Module".
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Define __esModule property to true, indicating it's an ES module.
    Object.defineProperty(targetObject, "__esModule", {
      value: true
    });
  };

  // Helper for interop requiring. Handles different module types.
  moduleLoader.interopRequire = function(moduleValue, flags) {
    // If flag 1 is set, just return the moduleValue (already resolved).
    if (1 & flags) {
      moduleValue = moduleLoader(moduleValue);
    }
    // If flag 8 is set, return the moduleValue directly.
    if (8 & flags) {
      return moduleValue;
    }
    // If flag 4 is set and it's an object and an ES module, return it directly.
    if (4 & flags && typeof moduleValue === "object" && moduleValue && moduleValue.__esModule) {
      return moduleValue;
    }

    // Otherwise, create a new object and populate it for interop.
    var newModuleObject = Object.create(null);
    moduleLoader.registerModule(newModuleObject); // Mark as ES module.
    Object.defineProperty(newModuleObject, "default", {
      enumerable: true,
      value: moduleValue
    }); // Set default export.

    // If flag 2 is set and it's not a string, copy all properties from the original module.
    if (2 & flags && typeof moduleValue !== "string") {
      for (var propName in moduleValue) {
        moduleLoader.defineGetter(newModuleObject, propName, (function(key) {
          return moduleValue[key];
        }).bind(null, propName));
      }
    }
    return newModuleObject;
  };

  // Helper to get the default export of a module.
  moduleLoader.getDefaultExport = function(moduleValue) {
    var defaultGetter = moduleValue && moduleValue.__esModule ?
      function() {
        return moduleValue.default;
      } :
      function() {
        return moduleValue;
      };
    moduleLoader.defineGetter(defaultGetter, "a", defaultGetter); // Define 'a' property for compatibility.
    return defaultGetter;
  };

  // Helper to check if an object has a specific property.
  moduleLoader.hasOwn = function(targetObject, propertyName) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyName);
  };

  // Public path for assets (empty in this case).
  moduleLoader.publicPath = "";

  // Start execution by loading the entry module (module 0).
  return moduleLoader(moduleLoader.entryModuleId = 0);

}(
  // Array of module definitions.
  [
    /* Module 0: Main entry point */
    function(currentModule, moduleExports, localRequire) {
      "use strict";
      // Require the 'fs' module.
      var fileSystemModule = localRequire(1);
      // Require the main processing logic module (module 2) and immediately call it
      // with the content read from standard input.
      localRequire(2)(fileSystemModule.readFileSync("/dev/stdin", "utf8"));
    },

    /* Module 1: Node.js 'fs' module */
    function(currentModule, moduleExports) {
      currentModule.exports = require("fs");
    },

    /* Module 2: Input processing and solver orchestration */
    function(currentModule, moduleExports, localRequire) {
      "use strict";
      // Get the InputProcessor class.
      var inputProcessorClass = localRequire(3);
      // Get the main solver function.
      var solverFunction = localRequire(5);

      // Export a function that takes raw input, processes it, and then solves.
      currentModule.exports = function(rawInputString) {
        // Create an instance of the InputProcessor with the raw input.
        var processorInstance = new inputProcessorClass(rawInputString);
        // Call the solver function with the processor instance.
        solverFunction(processorInstance);
      };
    },

    /* Module 3: InputProcessor class */
    function(currentModule, moduleExports, localRequire) {
      "use strict";
      // Get the Queue class.
      var queueClass = localRequire(4);

      // Define the InputProcessor class.
      currentModule.exports = class InputProcessor {
        constructor(inputContent) {
          // Trim whitespace and split the input string into tokens.
          var tokenArray = inputContent.trim().split(/\s+/g);
          // Initialize an internal queue with these tokens.
          this.tokenQueue = new queueClass(tokenArray);
        }

        // Method to dequeue and return a raw string token.
        getRawToken() {
          return this.tokenQueue.dequeueElement();
        }

        // Method to dequeue a token and parse it as an integer.
        getIntegerToken() {
          return parseInt(this.tokenQueue.dequeueElement(), 10);
        }

        // Method to clear the internal queue.
        resetInput() {
          this.tokenQueue.clearQueue();
        }
      };
    },

    /* Module 4: Queue class */
    function(currentModule, moduleExports, localRequire) {
      "use strict";
      // Define the Queue class.
      currentModule.exports = class Queue {
        constructor() {
          // Initialize with provided elements or an empty array.
          var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          this.elementCount = initialElements.length; // Current number of elements.
          this.elementStorage = initialElements;      // Array to store elements.
          this.readIndex = 0;                         // Index for the next element to dequeue.
        }

        // Adds an element to the end of the queue.
        enqueueElement(newItem) {
          this.elementCount += 1;
          this.elementStorage.push(newItem);
        }

        // Removes and returns the element from the front of the queue.
        dequeueElement() {
          var dequeuedItem = this.elementStorage[this.readIndex];
          this.elementCount -= 1;
          this.readIndex += 1;
          return dequeuedItem;
        }

        // Clears all elements from the queue.
        clearQueue() {
          this.elementStorage = [];
          this.elementCount = 0;
          this.readIndex = 0;
        }
      };
    },

    /* Module 5: Combinatorics solver logic */
    function(currentModule, moduleExports, localRequire) {
      "use strict";
      // Define a large prime number for modulo operations.
      var MOD_CONSTANT = 1000000007;

      // Function for modular multiplication of multiple arguments.
      function multiplyMod() {
        var args = arguments;
        var product = args[0];
        // Iterate through arguments from the second one.
        for (var argIdx = args.length; --argIdx;) {
          // Perform modular multiplication: (A * B) % M
          // This specific implementation uses a trick for larger numbers to avoid overflow before modulo.
          // ( (A >> 16) * B % M * 65536 + (A & 65535) * B ) % M
          // This is equivalent to (A * B) % M but handles intermediate products that might exceed 32-bit integer limits
          // by splitting A into high and low 16-bit parts.
          product = (((product >> 16) * args[argIdx] % MOD_CONSTANT * 65536) + ((65535 & product) * args[argIdx])) % MOD_CONSTANT;
        }
        return product;
      }

      // Arrays to store precomputed factorials, inverse factorials, and an unused array.
      var factorialValues = [];
      var invFactorialValues = [];
      var unusedArray = []; // This array is declared but not used in the final calculation logic.

      // Function to precompute factorials and inverse factorials up to a given limit.
      function precomputeCombinatorics(limit) {
        // Initialize factorialValues array.
        factorialValues.length = limit + 1;
        factorialValues[0] = factorialValues[1] = 1;
        // Calculate factorials iteratively.
        for (var idx = 2; idx <= limit;) {
          factorialValues[idx] = multiplyMod(factorialValues[idx - 1], idx++);
        }

        // Initialize invFactorialValues array.
        invFactorialValues.length = limit + 1;
        invFactorialValues[0] = invFactorialValues[1] = 1;
        // Calculate modular inverse of the last factorial using Fermat's Little Theorem (or extended Euclidean algorithm).
        // The inner function calculates modular inverse for a single number.
        invFactorialValues[limit] = (function(numberToInverse) {
          var tempA, tempB = MOD_CONSTANT,
            tempX = 0,
            tempY = 1;
          // Extended Euclidean Algorithm to find modular inverse.
          while (numberToInverse) {
            tempA = tempB / numberToInverse | 0; // Integer division.
            tempB -= tempA * numberToInverse;
            tempA = numberToInverse;
            numberToInverse = tempB;
            tempB = tempY;
            tempY = tempX - tempA * tempY;
            tempX = tempB;
          }
          // Ensure the result is positive.
          return (tempX %= MOD_CONSTANT) < 0 ? tempX + MOD_CONSTANT : tempX;
        })(factorialValues[limit]);

        // Calculate inverse factorials iteratively downwards.
        for (var idx = limit; 2 < idx;) {
          invFactorialValues[idx - 1] = multiplyMod(invFactorialValues[idx], idx--);
        }

        // Initialize unusedArray (structure preserved, but not used in this problem's logic).
        unusedArray.length = limit + 1;
        unusedArray[0] = unusedArray[1] = 1;
        for (var idx = 2; idx <= limit;) {
          unusedArray[idx] = multiplyMod(factorialValues[idx - 1], invFactorialValues[idx++]);
        }
      }

      // Function to calculate combinations (nCr) modulo MOD_CONSTANT.
      // nCr = n! / (r! * (n-r)!) = n! * (r!)^-1 * ((n-r)!)^-1
      function calculateCombination(nVal, kVal) {
        return multiplyMod(factorialValues[nVal], invFactorialValues[kVal], invFactorialValues[nVal - kVal]);
      }

      // The main solver function exported by this module.
      currentModule.exports = function(inputReader) {
        // Read N and K from the input processor.
        var upperBoundN = inputReader.getIntegerToken();
        var iterationCountK = inputReader.getIntegerToken();

        // Precompute factorials and inverse factorials up to N.
        precomputeCombinatorics(upperBoundN);

        // Loop from 1 to K to calculate and print results.
        for (var loopIndex = 1; loopIndex <= iterationCountK; loopIndex++) {
          // Calculate the term: C(N-K+1, loopIndex) * C(K-1, loopIndex-1)
          var currentResult = multiplyMod(
            calculateCombination(upperBoundN - iterationCountK + 1, loopIndex),
            calculateCombination(iterationCountK - 1, loopIndex - 1)
          );
          // Print the result modulo MOD_CONSTANT.
          console.log(currentResult % MOD_CONSTANT);
        }
      };
    }
  ]
);
