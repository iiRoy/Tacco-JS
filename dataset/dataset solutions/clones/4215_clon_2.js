/*
 * This file contains a custom module runtime environment.
 * It's designed to load and execute various application components.
 * The primary goal is to manage module dependencies and their lifecycle.
 */
module.exports = function (packageContents) {
  // A cache to store already loaded modules.
  // This prevents redundant execution and ensures singletons where appropriate.
  const assetStore = {};

  /**
   * Loads a specific application component based on its unique identifier.
   * If the component is already loaded, its exports are returned from the cache.
   * Otherwise, it's initialized, executed, and then cached.
   * @param {number} unitKey - The unique identifier for the component to load.
   * @returns {any} The exports of the loaded component.
   */
  function loadComponent(unitKey) {
    /* Check if the component is already in our asset store. */
    if (assetStore[unitKey]) {
      return assetStore[unitKey].output;
    }

    // Initialize a new component object and add it to the store.
    // 'id' stores the unit key, 'loaded' tracks its initialization status,
    // and 'output' will hold the component's exported values.
    const itemInstance = assetStore[unitKey] = {
      id: unitKey,
      loaded: false,
      output: {}
    };

    // Execute the component's definition function.
    // This function receives the component object, its exports, and the loader itself.
    packageContents[unitKey].call(itemInstance.output, itemInstance, itemInstance.output, loadComponent);

    // Mark the component as fully loaded after its definition has run.
    itemInstance.loaded = true;

    // Return the component's exported values.
    return itemInstance.output;
  }

  // Attach the module definitions array for internal reference.
  loadComponent.moduleDefinitions = packageContents;

  // Attach the module cache for internal reference.
  loadComponent.moduleCache = assetStore;

  /**
   * Defines a property on a target object, often used for module exports.
   * It ensures the property is enumerable and uses a getter function.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {Function} propertyGetter - The function that returns the property's value.
   */
  loadComponent.setProp = function (
    targetObject,
    propertyName,
    propertyGetter
  ) {
    if (
      !loadComponent.hasOwn(targetObject, propertyName)
    ) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: propertyGetter
      });
    }
  };

  /**
   * Marks an object as an ECMAScript module.
   * This involves setting `Symbol.toStringTag` and `__isESModule` properties.
   * @param {object} moduleObj - The object to mark as an ES module.
   */
  loadComponent.markAsModule = function (
    moduleObj
  ) {
    if (
      typeof Symbol !== "undefined"
      && Symbol.toStringTag
    ) {
      Object.defineProperty(moduleObj, Symbol.toStringTag, {
        value: "Module"
      });
    }
    Object.defineProperty(moduleObj, "__isESModule", {
      value: true
    });
  };

  /**
   * Creates an interoperability namespace object for a given module or value.
   * This handles various module transformation flags (e.g., default export, commonjs interop).
   * @param {any} sourceValue - The module or value to create a namespace for.
   * @param {number} transformFlags - Flags indicating how to process the source value.
   * @returns {object} The created namespace object.
   */
  loadComponent.makeInterop = function (
    sourceValue,
    transformFlags
  ) {
    // Flag 1: If set, the sourceValue is a module ID and needs to be loaded.
    if (
      1 & transformFlags
    ) {
      sourceValue = loadComponent(sourceValue);
    }

    // Flag 8: If set, directly return the sourceValue.
    if (
      8 & transformFlags
    ) {
      return sourceValue;
    }

    // Flag 4: If set and sourceValue is an object and an ES module, return it directly.
    if (
      4 & transformFlags
      && "object" === typeof sourceValue
      && sourceValue
      && sourceValue.__isESModule
    ) {
      return sourceValue;
    }

    // Create a new plain object to serve as the namespace.
    const namespaceObject = Object.create(null);

    // Mark the new object as an ES module.
    loadComponent.markAsModule(namespaceObject);

    // Define a 'default' export property.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: sourceValue
    });

    // Flag 2: If set and sourceValue is not a string, copy all its properties to the namespace.
    if (
      2 & transformFlags
      && "string" !== typeof sourceValue
    ) {
      for (
        let exportKey in sourceValue
      ) {
        // Ensure the property is not already defined by the default export mechanism.
        loadComponent.setProp(
          namespaceObject,
          exportKey,
          ((keyArg) => sourceValue[keyArg]).bind(null, exportKey)
        );
      }
    }

    // Return the constructed namespace object.
    return namespaceObject;
  };

  /**
   * Creates a getter function for a module's default export.
   * This handles both ES modules (with a `.default` property) and CommonJS modules.
   * @param {object} moduleRef - The module object.
   * @returns {Function} A function that returns the module's primary value.
   */
  loadComponent.getModuleValue = function (
    moduleRef
  ) {
    const valueGetter =
      moduleRef && moduleRef.__isESModule ?
      function () {
        return moduleRef.default;
      } :
      function () {
        return moduleRef;
      };

    // Attach the getter itself as property 'a' for some internal mechanism.
    loadComponent.setProp(valueGetter, "a", valueGetter);

    return valueGetter;
  };

  /**
   * Checks if an object has a specific property using Object.prototype.hasOwnProperty.
   * @param {object} targetObj - The object to check.
   * @param {string} propName - The name of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  loadComponent.hasOwn = function (
    targetObj,
    propName
  ) {
    return Object.prototype.hasOwnProperty.call(targetObj, propName);
  };

  // The public path for loading assets, currently empty.
  loadComponent.publicPath = "";

  // Kick off the application by loading the entry point module (module ID 0).
  // The 'startupModule' property is also set for internal tracking.
  return loadComponent(loadComponent.startupModule = 0);

}(
  // Array containing definitions for all application modules.
  [
    /*
     * Module 0: Main application entry point.
     * It reads input from stdin and passes it to the core processing logic.
     */
    function (
      currentModule,
      moduleExports,
      moduleLoader
    ) {
      "use strict"; // Enforce strict mode for this module.

      // Load the file system access utility (Module 1).
      const fileSystemAccess = moduleLoader(1);

      // Load the primary data processing function (Module 2)
      // and immediately invoke it with the data read from standard input.
      moduleLoader(2)(
        fileSystemAccess.readFileSynchronously(
          "/dev/stdin",
          "utf8"
        )
      );
    },

    /*
     * Module 1: Provides Node.js 'fs' (file system) module functionality.
     * This makes file operations available to other modules.
     */
    function (
      currentModule,
      moduleExports
    ) {
      // Export the native Node.js 'fs' module.
      currentModule.output = require("node:fs");
    },

    /*
     * Module 2: Orchestrates input processing and evaluation.
     * It takes raw input text, initializes an input handler, and then
     * passes the handler to the main evaluation routine.
     */
    function (
      currentModule,
      moduleExports,
      moduleLoader
    ) {
      "use strict"; // Enforce strict mode.

      // Load the InputDataProcessor class (Module 3).
      const inputProcessorClass = moduleLoader(3);

      // Load the core evaluation function (Module 5).
      const evaluationFunction = moduleLoader(5);

      // Export a function that accepts raw data, processes it, and then evaluates.
      currentModule.output = function (
        rawData
      ) {
        // Create an instance of the InputDataProcessor with the provided raw data.
        const dataHandler = new inputProcessorClass(rawData);

        // Execute the main evaluation function using the prepared data handler.
        evaluationFunction(dataHandler);
      };
    },

    /*
     * Module 3: Defines a class for processing input data.
     * It tokenizes input and provides methods to retrieve raw strings or parsed numbers.
     */
    function (
      currentModule,
      moduleExports,
      moduleLoader
    ) {
      "use strict"; // Enforce strict mode.

      // Load the BasicQueue utility class (Module 4) to manage input tokens.
      const queueUtility = moduleLoader(4);

      // Export the InputDataProcessor class.
      currentModule.output = class InputDataProcessor {
        /**
         * Constructs an InputDataProcessor.
         * @param {string} sourceText - The raw text input to process.
         */
        constructor(sourceText) {
          // Trim whitespace and split the text into tokens using one or more spaces.
          const tokenArray = sourceText.trim().split(/\s+/g);

          // Initialize an internal queue with the extracted tokens.
          this.inputQueue = new queueUtility(tokenArray);
        }

        /**
         * Retrieves the next raw string token from the input queue.
         * @returns {string} The next token.
         */
        getNextRaw() {
          return this.inputQueue.dequeueItem();
        }

        /**
         * Retrieves the next token and parses it as an integer.
         * @returns {number} The next token parsed as an integer.
         */
        getNextNumber() {
          return parseInt(this.inputQueue.dequeueItem(), 10);
        }

        /**
         * Resets the internal input queue, clearing all tokens.
         */
        finalizeProcessing() {
          this.inputQueue.resetQueue();
        }
      };
    },

    /*
     * Module 4: Implements a basic queue data structure.
     * It supports enqueuing, dequeuing, and clearing elements.
     */
    function (
      currentModule,
      moduleExports,
      moduleLoader
    ) {
      "use strict"; // Enforce strict mode.

      // Export the BasicQueue class.
      currentModule.output = class BasicQueue {
        /**
         * Constructs a BasicQueue instance.
         * @param {Array<any>} initialContents - Optional array of initial items for the queue.
         */
        constructor(initialContents = []) {
          // Initialize the current count of items.
          this.currentCount = initialContents.length;

          // Store the queue elements.
          this.elements = initialContents;

          // Keep track of the current index for dequeuing.
          this.currentIndex = 0;
        }

        /**
         * Adds an item to the end of the queue.
         * @param {any} itemToAdd - The item to add.
         */
        enqueueItem(itemToAdd) {
          this.currentCount++;
          this.elements.push(itemToAdd);
        }

        /**
         * Removes and returns the item from the front of the queue.
         * @returns {any} The item at the front of the queue.
         */
        dequeueItem() {
          const retrievedItem = this.elements[this.currentIndex];
          this.currentCount--;
          this.currentIndex++;
          return retrievedItem;
        }

        /**
         * Clears all items from the queue and resets its state.
         */
        resetQueue() {
          this.elements = [];
          this.currentCount = 0;
          this.currentIndex = 0;
        }
      };
    },

    /*
     * Module 5: Contains the core logic to evaluate a number for repeating digits.
     * It checks if any digit repeats three or more times consecutively.
     */
    function (
      currentModule,
      moduleExports,
      moduleLoader
    ) {
      "use strict"; // Enforce strict mode.

      // Export the main evaluation function.
      // It takes an input handler object to retrieve the number.
      currentModule.output = function (
        inputHandler
      ) {
        let sequenceLength = 1; // Tracks the length of the current sequence of identical digits.
        let previousDigit = -1; // Stores the previously processed digit.
        let workingNumber = inputHandler.getNextNumber(); // Get the number to evaluate.

        // Loop while there are digits left in the number.
        while (
          workingNumber > 0
        ) {
          // Extract the last digit.
          const currentDigit = workingNumber % 10;

          // Check if the current digit is the same as the previous one.
          if (
            currentDigit === previousDigit
          ) {
            sequenceLength++; // Extend the sequence.
          } else {
            previousDigit = currentDigit; // Start a new sequence.
            sequenceLength = 1;
          }

          // Remove the last digit from the number.
          workingNumber = Math.floor(workingNumber / 10);
        }

        // Output the result based on the maximum sequence length found.
        if (
          sequenceLength >= 3
        ) {
          console.log("Affirmative"); // At least three consecutive identical digits found.
        } else {
          console.log("Negative"); // No three or more consecutive identical digits found.
        }
      };
    }
  ]
);