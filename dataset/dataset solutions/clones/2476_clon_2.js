module.exports = function (moduleDefinitions) {
  // A cache for loaded modules.
  var moduleCache = {};

  // The core module loading function, similar to a 'require' implementation.
  function moduleLoader(moduleIdentifier) {
    // If the module is already in the cache, return its exports immediately.
    if (moduleCache[moduleIdentifier]) {
      return moduleCache[moduleIdentifier].exportedContent;
    }

    // If not in cache, create a new module entry.
    // 'i' stores the module's unique identifier.
    // 'isLoaded' tracks if the module's code has been executed.
    // 'exportedContent' will hold the module's exports.
    var moduleEntry = (moduleCache[moduleIdentifier] = {
      i: moduleIdentifier,
      isLoaded: false,
      exportedContent: {},
    });

    // Execute the module function.
    // The module function receives:
    // 1. The module entry itself (as 'moduleObj' in the module's scope).
    // 2. The 'exportedContent' object (as 'exportObj').
    // 3. The 'moduleLoader' function (as 'req' for internal module dependencies).
    moduleDefinitions[moduleIdentifier].call(
      moduleEntry.exportedContent,
      moduleEntry,
      moduleEntry.exportedContent,
      moduleLoader
    );

    // Mark the module as loaded after its execution.
    moduleEntry.isLoaded = true;

    // Return the module's exports.
    return moduleEntry.exportedContent;
  }

  // Store all module definitions for easy access.
  moduleLoader.moduleMap = moduleDefinitions;

  // Store the module cache for introspection if needed.
  moduleLoader.cacheMap = moduleCache;

  // Utility function to define an enumerable getter property on an object.
  moduleLoader.defineExport = function (targetObject, propertyName, getterFunction) {
    // Only define the property if it doesn't already exist on the target.
    if (!moduleLoader.hasOwn(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property visible during enumeration.
        get: getterFunction, // The function to call when the property is accessed.
      });
    }
  };

  // Utility function to mark an object as an ECMAScript module.
  moduleLoader.registerESModule = function (targetModule) {
    // Set Symbol.toStringTag for better debugging and type identification.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, { value: "Module" });
    }
    // Explicitly mark the module as an ES module.
    Object.defineProperty(targetModule, "__esModule", { value: true });
  };

  // Utility function to create a namespace object from a module's exports.
  moduleLoader.createNamespaceObject = function (value, mode) {
    // If mode indicates a commonjs module (1 & mode), load it first.
    if (1 & mode) {
      value = moduleLoader(value);
    }
    // If mode indicates it's already a namespace object (8 & mode), return as is.
    if (8 & mode) {
      return value;
    }

    // If mode indicates it's an ES module (4 & mode) and it's an object, return it directly.
    if (4 & mode && typeof value === "object" && value && value.__esModule) {
      return value;
    }

    // Create a new plain object to serve as the namespace.
    var namespaceObject = Object.create(null);
    moduleLoader.registerESModule(namespaceObject); // Mark it as an ES module.
    // Set the 'default' export to the module's value.
    Object.defineProperty(namespaceObject, "default", { enumerable: true, value: value });

    // If mode indicates a commonjs module and it's not a string (2 & mode),
    // copy all its properties as named exports to the namespace object.
    if (2 & mode && typeof value !== "string") {
      for (var propName in value) {
        moduleLoader.defineExport(
          namespaceObject,
          propName,
          ((currentProp) => {
            return value[currentProp];
          }).bind(null, propName)
        );
      }
    }
    return namespaceObject;
  };

  // Utility function to get a getter for a module's default export.
  moduleLoader.getModuleDefault = function (moduleObject) {
    // If it's an ES module, the default export is `moduleObject.default`.
    // Otherwise, the entire moduleObject is considered the default export.
    var getter =
      moduleObject && moduleObject.__esModule
        ? function () {
            return moduleObject.default;
          }
        : function () {
            return moduleObject;
          };
    // Add a property 'a' to the getter itself, pointing back to the getter.
    moduleLoader.defineExport(getter, "a", getter);
    return getter;
  };

  // Utility function to check if an object has a specific own property.
  moduleLoader.hasOwn = function (objectToCheck, keyToCheck) {
    return Object.prototype.hasOwnProperty.call(objectToCheck, keyToCheck);
  };

  // Public path for assets (empty in this configuration).
  moduleLoader.publicPath = "";

  // Set the entry module identifier and immediately execute it.
  return moduleLoader((moduleLoader.startupModule = 0));
}([
  /* Module 0: The application's entry point */
  function (moduleObj, exportObj, req) {
    "use strict";
    // Import the Node.js 'fs' (file system) module.
    var fileSystem = req(1);
    // Import and execute Module 2, passing it the content read from standard input.
    req(2)(fileSystem.readFileSync("/dev/stdin", "utf8"));
  },

  /* Module 1: Node.js 'fs' module wrapper */
  function (moduleObj, exportObj) {
    // Export the native 'fs' module.
    moduleObj.exportedContent = require("fs");
  },

  /* Module 2: Main application logic orchestrator */
  function (moduleObj, exportObj, req) {
    "use strict";
    // Import the custom InputProcessor class.
    var inputParserClass = req(3);
    // Import the core solver function.
    var solverFunction = req(5);

    // Export a function that takes the raw input string.
    moduleObj.exportedContent = function (inputString) {
      // Create an instance of the InputProcessor to handle parsing.
      var parserInstance = new inputParserClass(inputString);
      // Invoke the solver function with the prepared input processor.
      solverFunction(parserInstance);
    };
  },

  /* Module 3: InputProcessor Class for parsing input */
  function (moduleObj, exportObj, req) {
    "use strict";
    // Import the custom DataQueue class.
    var queueClass = req(4);

    // Define and export the InputProcessor class.
    moduleObj.exportedContent = class InputProcessor {
      // Constructor takes the raw input string.
      constructor(rawData) {
        // Trim leading/trailing whitespace and split the string by any whitespace
        // to get an array of individual tokens.
        var tokenizedData = rawData.trim().split(/\s+/g);
        // Initialize an internal DataQueue with these tokens.
        this.inputQueue = new queueClass(tokenizedData);
      }

      // Method to read and return the next string token from the input queue.
      readNextString() {
        return this.inputQueue.dequeueItem();
      }

      // Method to read the next string token and parse it as an integer (base 10).
      readNextInt() {
        return parseInt(this.inputQueue.dequeueItem(), 10);
      }

      // Method to clear the internal input queue, resetting its state.
      finishProcessing() {
        this.inputQueue.resetQueue();
      }
    };
  },

  /* Module 4: DataQueue Class for managing a queue of items */
  function (moduleObj, exportObj, req) {
    "use strict";
    // Define and export the DataQueue class.
    moduleObj.exportedContent = class DataQueue {
      // Constructor can optionally take an array of initial items.
      constructor() {
        var initialItems =
          arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        this.currentSize = initialItems.length; // The current number of elements in the queue.
        this.dataElements = initialItems; // The underlying array storing the queue elements.
        this.currentIndex = 0; // The index of the next element to be dequeued.
      }

      // Adds an item to the end of the queue.
      enqueueItem(itemToAdd) {
        this.currentSize += 1;
        this.dataElements.push(itemToAdd);
      }

      // Removes and returns the item from the front of the queue.
      dequeueItem() {
        var dequeuedValue = this.dataElements[this.currentIndex];
        this.currentSize -= 1;
        this.currentIndex += 1;
        return dequeuedValue;
      }

      // Clears all items from the queue and resets its internal pointers.
      resetQueue() {
        this.dataElements = [];
        this.currentSize = 0;
        this.currentIndex = 0;
      }
    };
  },

  /* Module 5: The core problem-solving logic */
  function (moduleObj, exportObj, req) {
    "use strict";
    // Import the utility function for finding divisors.
    var divisorFinder = req(6);

    // Export the main solver function, which takes an InputProcessor instance.
    moduleObj.exportedContent = function (processor) {
      // Read the single integer input from the processor.
      var inputNumber = processor.readNextInt();
      // Get a map of all divisors for the input number.
      var divisorsMap = divisorFinder(inputNumber);

      // Initialize variables to track the pair of factors with the minimum difference.
      var minDiff = inputNumber; // The initial minimum difference (e.g., N and 1).
      var factor1 = 1; // The first factor of the best pair found.
      var factor2 = inputNumber; // The second factor of the best pair found.

      // Iterate through the keys (divisors) in the divisors map.
      for (var currentFactorKey in divisorsMap) {
        // Convert the string key to a number for arithmetic and comparison.
        const numCurrentFactor = Number(currentFactorKey);
        const numOtherFactor = Number(divisorsMap[currentFactorKey]);

        // Optimization: If the current factor is greater than its corresponding pair,
        // we have already considered this pair (or its symmetric counterpart),
        // so we can stop iterating. This ensures we only process a <= b for a*b=N.
        if (numCurrentFactor > numOtherFactor) {
          break;
        }

        // Calculate the difference between the current pair of factors.
        // If this difference is smaller than the current minimum difference,
        // update the minimum difference and store this new best pair.
        if (minDiff > numOtherFactor - numCurrentFactor) {
          factor1 = numCurrentFactor;
          factor2 = numOtherFactor;
          minDiff = numOtherFactor - numCurrentFactor;
        }
      }

      // Output the result: (factor1 - 1) + (factor2 - 1).
      // This is equivalent to factor1 + factor2 - 2.
      console.log(factor1 - 1 + (factor2 - 1));
    };
  },

  /* Module 6: Utility function to find all divisors of a number */
  function (moduleObj, exportObj, req) {
    "use strict";
    // Export a function that takes an integer and returns an object mapping its divisors.
    moduleObj.exportedContent = function (numberToFactor) {
      // An object to store divisor pairs (e.g., { factorA: factorB, factorB: factorA }).
      var factorsObject = {};
      // Calculate the ceiling of the square root to optimize the loop.
      // We only need to check divisors up to the square root.
      var sqrtVal = Math.ceil(Math.sqrt(numberToFactor));

      // Iterate from 1 up to the square root of the number.
      for (var counter = 1; counter < sqrtVal + 1; counter++) {
        // If 'counter' divides 'numberToFactor' evenly, then 'counter' is a divisor.
        if (numberToFactor % counter === 0) {
          // Store the pair: 'counter' and 'numberToFactor / counter'.
          factorsObject[counter] = numberToFactor / counter;
          factorsObject[numberToFactor / counter] = counter;
        }
      }
      return factorsObject;
    };
  },
]);
