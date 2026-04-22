/*
 * This file implements a custom module bundling and loading system.
 * It takes an array of module definitions and provides mechanisms
 * to load, define, and expose module exports.
 */
module.exports = function(assetMap) {
  // A cache for already loaded components/modules.
  var loadedComponents = {};

  /**
   * Fetches and executes a component by its identifier.
   * If the component is already loaded, its exports are returned from cache.
   * @param {number} componentId The unique identifier of the component to load.
   * @returns {object} The exports object of the loaded component.
   */
  function fetchComponent(componentId) {
    // Check if the component is already in our cache.
    if (loadedComponents[componentId]) {
      return loadedComponents[componentId].outputPayload;
    }

    // If not, initialize a new component instance and store it in the cache.
    // The 'identifier' property stores the component's ID.
    // 'isLoaded' tracks if the component's definition has been executed.
    // 'outputPayload' will hold the component's exports.
    var componentInstance = loadedComponents[componentId] = {
      identifier: componentId,
      isLoaded: false,
      outputPayload: {}
    };

    // Execute the component's definition function.
    // The definition function receives (module, exports, require) arguments.
    // Here, 'outputPayload' acts as 'exports', 'componentInstance' as 'module',
    // and 'fetchComponent' as the local 'require' function.
    assetMap[componentId].call(componentInstance.outputPayload, componentInstance, componentInstance.outputPayload, fetchComponent);

    // Mark the component as loaded.
    componentInstance.isLoaded = true;

    // Return the exports of the component.
    return componentInstance.outputPayload;
  }

  // Store the original module definitions for later use by the loader.
  fetchComponent.moduleDefinitions = assetMap;

  // Store the component registry (cache) for external access if needed.
  fetchComponent.componentRegistry = loadedComponents;

  /**
   * Defines a getter function for a property on an object.
   * This is used for lazy loading or exposing properties.
   * @param {object} targetObject The object on which to define the property.
   * @param {string} keyName The name of the property to define.
   * @param {Function} valueProvider The getter function for the property.
   */
  fetchComponent.exposeProperty = function(targetObject, keyName, valueProvider) {
    // Only define the property if it doesn't already exist on the target.
    if (!fetchComponent.objectHasProperty(targetObject, keyName)) {
      Object.defineProperty(targetObject, keyName, {
        enumerable: true, // Make the property enumerable.
        get: valueProvider // Assign the getter function.
      });
    }
  };

  /**
   * Marks an export object as an ES Module.
   * This adds '__esModule: true' and optionally 'Symbol.toStringTag: "Module"'.
   * @param {object} exportObject The object to mark.
   */
  fetchComponent.markAsESModule = function(exportObject) {
    // Set Symbol.toStringTag for better module identification in some environments.
    if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      Object.defineProperty(exportObject, Symbol.toStringTag, {
        value: "Module"
      });
    }
    // Standard ES Module flag.
    Object.defineProperty(exportObject, "__esModule", {
      value: true
    });
  };

  /**
   * Normalizes an export value based on conversion flags,
   * handling default exports and interop.
   * @param {any} sourceObject The value to normalize.
   * @param {number} conversionFlags Flags indicating conversion type (e.g., 1 for direct, 4 for object, 8 for default).
   * @returns {object} The normalized export object.
   */
  fetchComponent.normalizeExport = function(sourceObject, conversionFlags) {
    // If flag 1 is set, treat sourceObject as a module ID and resolve it.
    if (conversionFlags & 1) {
      sourceObject = fetchComponent(sourceObject);
    }
    // If flag 8 is set, return the sourceObject directly.
    if (conversionFlags & 8) {
      return sourceObject;
    }
    // If flag 4 is set and sourceObject is an object and an ES Module, return it directly.
    if (conversionFlags & 4 && typeof sourceObject === "object" && sourceObject && sourceObject.__esModule) {
      return sourceObject;
    }

    // Otherwise, create a new object to hold the normalized exports.
    var defaultExportContainer = Object.create(null);
    // Mark it as an ES Module.
    fetchComponent.markAsESModule(defaultExportContainer);
    // Define a 'default' property pointing to the original sourceObject.
    Object.defineProperty(defaultExportContainer, "default", {
      enumerable: true,
      value: sourceObject
    });

    // If flag 2 is set and sourceObject is not a string,
    // iterate over its properties and expose them as getters on the new object.
    if (conversionFlags & 2 && typeof sourceObject !== "string") {
      for (var propName in sourceObject) {
        fetchComponent.exposeProperty(defaultExportContainer, propName, function(lookupKey) {
          return sourceObject[lookupKey];
        }.bind(null, propName));
      }
    }
    return defaultExportContainer;
  };

  /**
   * Creates a getter function for a module's default export.
   * @param {object} targetModule The module object.
   * @returns {Function} A getter that returns the default export.
   */
  fetchComponent.getDefaultExport = function(targetModule) {
    // Determine the appropriate getter: 'default' property if ES Module, otherwise the module itself.
    var getterFn = targetModule && targetModule.__esModule ? function() {
      return targetModule.default;
    } : function() {
      return targetModule;
    };
    // Expose this getter as property 'a' (common webpack convention).
    fetchComponent.exposeProperty(getterFn, "a", getterFn);
    return getterFn;
  };

  /**
   * Checks if an object has a specific property using Object.prototype.hasOwnProperty.
   * @param {object} targetObj The object to check.
   * @param {string} propertyKey The name of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  fetchComponent.objectHasProperty = function(targetObj, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObj, propertyKey);
  };

  // Set the public path for asset loading (empty string by default).
  fetchComponent.publicPath = "";

  // Start the module loading process by fetching the entry point module (ID 0).
  // The 'startupModule' property is set as a side effect before calling fetchComponent.
  return fetchComponent(fetchComponent.startupModule = 0);
}(
  // Array of component definitions.
  [
    /* Component 0: Main entry point */
    function(entryExports, entryModule, componentLoader) {
      "use strict"; // Ensure strict mode for this component.

      // Load File System utility component (ID 1).
      var fileSystemUtil = componentLoader(1);

      // Load and execute the main processing component (ID 2).
      // Pass the content of /dev/stdin to it after reading synchronously.
      componentLoader(2)(fileSystemUtil.readFileSynchronously("/dev/stdin", "utf8"));
    },

    /* Component 1: Node.js 'fs' module wrapper */
    function(fileSystemExports, fileSystemModule) {
      // Export the Node.js built-in 'fs' module.
      fileSystemExports.output = global.require("fs");
    },

    /* Component 2: Input processing orchestrator */
    function(processorExports, processorModule, componentLoader) {
      "use strict"; // Strict mode.

      // Load the InputProcessor class (ID 3).
      var dataParserConstructor = componentLoader(3);
      // Load the core solution algorithm (ID 5).
      var solutionAlgorithm = componentLoader(5);

      // Export a function to process raw input text.
      processorExports.processInput = function(rawText) {
        // Create an instance of the input parser with the provided text.
        var inputReaderInstance = new dataParserConstructor(rawText);
        // Execute the solution algorithm using the input reader.
        solutionAlgorithm(inputReaderInstance);
      };
    },

    /* Component 3: Input parsing utility class */
    function(parserExports, parserModule, componentLoader) {
      "use strict"; // Strict mode.

      // Load the QueueHandler class (ID 4).
      var queueManager = componentLoader(4);

      // Define and export the InputProcessor class.
      parserExports.InputProcessor = class {
        /**
         * Constructor for InputProcessor.
         * @param {string} rawData The raw string data to be processed.
         */
        constructor(rawData) {
          // Trim whitespace and split the raw data into tokens.
          var tokenizedData = rawData.trim().split(/\s+/g);
          // Initialize an internal queue with these tokens.
          this.tokenQueue = new queueManager(tokenizedData);
        }

        /**
         * Reads and returns the next string token from the input.
         * @returns {string} The next string token.
         */
        readNextString() {
          return this.tokenQueue.dequeueItem();
        }

        /**
         * Reads the next token and parses it as an integer.
         * @returns {number} The next token as an integer.
         */
        readNextInteger() {
          return Number.parseInt(this.tokenQueue.dequeueItem(), 10);
        }

        /**
         * Clears all tokens from the input reader, resetting its state.
         */
        resetReader() {
          this.tokenQueue.clearAll();
        }
      };
    },

    /* Component 4: Generic Queue data structure */
    function(queueExports, queueModule, componentLoader) {
      "use strict"; // Strict mode.

      // Define and export the QueueHandler class.
      queueExports.QueueHandler = class {
        /**
         * Constructor for QueueHandler.
         * @param {Array} initialElements An optional array of elements to initialize the queue.
         */
        constructor() {
          // Handle default parameter for initialElements.
          var initialElements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
          this.currentSize = initialElements.length; // Current number of items in the queue.
          this.elementList = initialElements; // The underlying array storing elements.
          this.currentIndex = 0; // Index of the next element to dequeue.
        }

        /**
         * Adds an item to the end of the queue.
         * @param {any} itemToAdd The item to enqueue.
         */
        enqueueItem(itemToAdd) {
          this.currentSize += 1;
          this.elementList.push(itemToAdd);
        }

        /**
         * Removes and returns the item at the front of the queue.
         * @returns {any} The dequeued item.
         */
        dequeueItem() {
          var retrievedItem = this.elementList[this.currentIndex];
          this.currentSize -= 1;
          this.currentIndex += 1;
          return retrievedItem;
        }

        /**
         * Clears all elements from the queue, resetting its state.
         */
        clearAll() {
          this.elementList = [];
          this.currentSize = 0;
          this.currentIndex = 0;
        }
      };
    },

    /* Component 5: Core problem-solving logic */
    function(solverExports, solverModule, componentLoader) {
      "use strict"; // Strict mode.

      // Export the main problem-solving function.
      solverExports.solveProblem = function(inputReader) {
        // Read two sequences of characters from the input.
        var firstSequence = inputReader.readNextString();
        var secondSequence = inputReader.readNextString();

        // Get the length of the sequences.
        var sequenceLength = firstSequence.length;

        // Create two mappings:
        // charToCharMap: maps characters from firstSequence to secondSequence.
        // reverseCharMap: maps characters from secondSequence back to firstSequence.
        var charToCharMap = {};
        var reverseCharMap = {};

        // Iterate through the characters of the sequences.
        for (var charIndex = 0; charIndex < sequenceLength; charIndex++) {
          var charA = firstSequence[charIndex];
          var charB = secondSequence[charIndex];

          // Check for consistency in charToCharMap.
          if (charToCharMap[charA]) {
            // If charA already has a mapping, ensure it maps to charB.
            if (charToCharMap[charA] !== charB) {
              return void console.log("No"); // Inconsistent mapping.
            }
          } else {
            // If no mapping exists for charA, create one.
            charToCharMap[charA] = charB;
            // Also create the reverse mapping.
            reverseCharMap[charB] = charA;
          }
        }

        // After initial pass, verify the mappings for validity.
        for (var charKey in charToCharMap) {
          // If a character maps to itself (e.g., 'a' -> 'a').
          if (charKey === charToCharMap[charKey]) {
            // Ensure its reverse mapping is also to itself.
            if (reverseCharMap[charKey] !== charKey) {
              return void console.log("No"); // Mismatch in self-mapping.
            }
          }
          // If a character maps to another (e.g., 'a' -> 'b', where a != b),
          // AND that target character maps back to itself (b -> b), then it's invalid.
          // This ensures that if A maps to B (A!=B), then B must map back to A, not to B.
          else if (charToCharMap[charKey] === reverseCharMap[charToCharMap[charKey]]) {
            return void console.log("No");
          }
        }

        // If all checks pass, the mappings are consistent.
        console.log("Yes");
      };
    }
  ]
);