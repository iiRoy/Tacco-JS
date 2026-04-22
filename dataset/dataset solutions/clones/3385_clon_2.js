pkgExporter = function (bundleComponents) {
  // This object acts as a cache for loaded modules.
  // When a component is requested, we first check if it's already in the cache.
  var moduleCache = {};

  /**
   * Fetches a component from the bundle. If it's already in the cache,
   * it returns the cached instance. Otherwise, it loads the component,
   * executes its definition, and then caches it.
   * @param {number} componentId The identifier for the component to fetch.
   * @returns {object} The exported members of the requested component.
   */
  function fetchComponent(componentId) {
    if (moduleCache[componentId]) {
      return moduleCache[componentId].exportedMembers;
    }

    // Initialize a new component instance and add it to the cache.
    // The 'identity' property stores its ID, 'isLoaded' tracks its loading status,
    // and 'exportedMembers' will hold its exports.
    var componentInstance = (moduleCache[componentId] = {
      identity: componentId,
      isLoaded: false,
      exportedMembers: {},
    });

    // Execute the component's definition function.
    // The definition function is expected to populate componentInstance.exportedMembers.
    // It receives the module's exports, the module instance itself,
    // and the fetchComponent function (for internal requires).
    bundleComponents[componentId].call(
      componentInstance.exportedMembers,
      componentInstance,
      componentInstance.exportedMembers,
      fetchComponent
    );

    // Mark the component as loaded.
    componentInstance.isLoaded = true;

    // Return the exports of the newly loaded component.
    return componentInstance.exportedMembers;
  }

  // Attach the bundle components definition list to the fetcher for internal use.
  fetchComponent.componentDefinitions = bundleComponents;
  // Attach the module cache to the fetcher.
  fetchComponent.componentCache = moduleCache;

  /**
   * Defines a getter property on an object, making it enumerable.
   * This is used for lazy loading or exposing properties.
   * @param {object} targetObject The object on which to define the property.
   * @param {string} propertyName The name of the property.
   * @param {Function} getterFunction The function that returns the property's value.
   */
  fetchComponent.addPropertyAccessor = function (
    targetObject,
    propertyName,
    getterFunction
  ) {
    // Check if the property already exists to avoid overwriting.
    if (!fetchComponent.ownPropertyCheck(targetObject, propertyName)) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true, // Make the property visible during enumeration.
        get: getterFunction, // Use the provided function as a getter.
      });
    }
  };

  /**
   * Marks an object as an ES Module by setting specific properties.
   * This helps JavaScript environments correctly interpret its export structure.
   * @param {object} targetModule The module object to mark.
   */
  fetchComponent.setEsModuleFlag = function (targetModule) {
    // If Symbol and Symbol.toStringTag are available, set the toStringTag for better debugging.
    if (
      typeof Symbol !== "undefined" &&
      Symbol.toStringTag &&
      Symbol.toStringTag instanceof Symbol
    ) {
      Object.defineProperty(targetModule, Symbol.toStringTag, {
        value: "Module",
      });
    }
    // Set the __esModule flag to true, indicating it's an ES module.
    Object.defineProperty(targetModule, "__esModule", { value: true });
  };

  /**
   * Creates a module namespace object for interop compatibility,
   * especially when dealing with CommonJS modules in an ES module context.
   * @param {*} valueToWrap The module's exports or value to wrap.
   * @param {number} wrappingFlags Flags indicating how to wrap the value.
   * @returns {object} The created namespace object.
   */
  fetchComponent.createNamespaceProxy = function (valueToWrap, wrappingFlags) {
    // If flag 1 is set, it means valueToWrap is a module ID, so resolve it first.
    if (1 & wrappingFlags) {
      valueToWrap = fetchComponent(valueToWrap);
    }
    // If flag 8 is set, return the value as is (it's already a namespace).
    if (8 & wrappingFlags) {
      return valueToWrap;
    }
    // If flag 4 is set and it's an object with __esModule, it's already an ES module.
    if (
      4 & wrappingFlags &&
      typeof valueToWrap === "object" &&
      valueToWrap &&
      valueToWrap.__esModule
    ) {
      return valueToWrap;
    }

    // Create a new empty object to serve as the namespace.
    var namespaceObject = Object.create(null);
    // Mark this new object as an ES module.
    fetchComponent.setEsModuleFlag(namespaceObject);
    // Define a 'default' export property pointing to the wrapped value.
    Object.defineProperty(namespaceObject, "default", {
      enumerable: true,
      value: valueToWrap,
    });

    // If flag 2 is set and the wrapped value is not a string,
    // iterate over its properties and add them as getters to the namespace.
    if (2 & wrappingFlags && typeof valueToWrap !== "string") {
      for (var propKey in valueToWrap) {
        // Use bind to capture propKey for the getter function.
        fetchComponent.addPropertyAccessor(
          namespaceObject,
          propKey,
          ((prop) => {
            return valueToWrap[prop];
          }).bind(null, propKey)
        );
      }
    }
    return namespaceObject;
  };

  /**
   * Retrieves the default export of a module.
   * Handles both ES modules (with a .default property) and CommonJS modules.
   * @param {object} sourceObject The module's exports object.
   * @returns {*} The default export or the entire module object.
   */
  fetchComponent.retrieveDefaultExport = function (sourceObject) {
    var defaultGetter =
      sourceObject && sourceObject.__esModule
        ? // If it's an ES module, return its .default property.
          function () {
            return sourceObject.default;
          }
        : // Otherwise, return the entire object as its "default".
          function () {
            return sourceObject;
          };
    // Add an 'a' property (common webpack convention) as a getter for the default export.
    fetchComponent.addPropertyAccessor(defaultGetter, "a", defaultGetter);
    return defaultGetter;
  };

  /**
   * Checks if an object has a specified property directly on itself (not inherited).
   * @param {object} objectToCheck The object to inspect.
   * @param {string} propertyKey The name of the property to check.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  fetchComponent.ownPropertyCheck = function (objectToCheck, propertyKey) {
    return Object.prototype.hasOwnProperty.call(objectToCheck, propertyKey);
  };

  // Set the public path for assets (empty in this case).
  fetchComponent.assetBasePath = "";

  // Execute the entry component (module 0) to start the application logic.
  return fetchComponent((fetchComponent.startupModule = 0));
})(
  [
    // Module 0: Main application logic
    function (currentExportModule, moduleExportObject, moduleLoaderFn) {
      "use strict"; // Enforce strict mode for this module.

      // Load the 'fs' (file system) utility module.
      var fileSystemUtil = moduleLoaderFn(1);

      // Create an input processing unit.
      // It reads from /dev/stdin, decodes as UTF-8, trims whitespace,
      // and splits by any whitespace character to get individual tokens.
      var inputProcessor = new (moduleLoaderFn(2))(
        fileSystemUtil.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/g)
      );

      // Pass the initialized input processor to the main processing function (module 4).
      moduleLoaderFn(4)(inputProcessor);
    },

    // Module 1: Node.js 'fs' module export
    function (currentExportModule, moduleExportObject) {
      // Export the native Node.js 'fs' module.
      currentExportModule.exports = require("node:fs");
    },

    // Module 2: Input processing unit class definition
    function (currentExportModule, moduleExportObject, moduleLoaderFn) {
      "use strict";

      // Load the data structure (SimpleQueue) module.
      var dataStructure = moduleLoaderFn(3);

      // Define and export the ProcessingUnit class.
      currentExportModule.exports = class ProcessingUnit {
        /**
         * Constructs a ProcessingUnit with initial data.
         * @param {Array<string>} initialData An array of strings to initialize the internal buffer.
         */
        constructor(initialData) {
          // The internal buffer is a SimpleQueue instance.
          this.inputBuffer = new dataStructure(initialData);
        }

        /**
         * Dequeues and returns the next raw string from the input buffer.
         * @returns {string} The next string item.
         */
        readNextRaw() {
          return this.inputBuffer.dequeueItem();
        }

        /**
         * Dequeues the next string from the input buffer and parses it as an integer.
         * @returns {number} The next integer value.
         */
        readNextInt() {
          return Number.parseInt(this.inputBuffer.dequeueItem(), 10);
        }

        /**
         * Enqueues an item into the input buffer.
         * @param {*} item The item to add to the buffer.
         */
        appendData(item) {
          this.inputBuffer.enqueueItem(item);
        }
      };
    },

    // Module 3: SimpleQueue data structure class definition
    function (currentExportModule, moduleExportObject, moduleLoaderFn) {
      "use strict";

      // Define and export the SimpleQueue class.
      currentExportModule.exports = class SimpleQueue {
        /**
         * Constructs a SimpleQueue, optionally initialized with an array of elements.
         * @param {Array} [initialElements=[]] An array of elements to pre-populate the queue.
         */
        constructor() {
          var initialElements =
            arguments.length > 0 && arguments[0] !== undefined
              ? arguments[0]
              : [];

          // Current number of items in the queue.
          this.currentCount = initialElements.length;
          // The underlying array storing the elements.
          this.elementList = initialElements;
          // The index of the next element to be dequeued.
          this.readIndex = 0;
        }

        /**
         * Adds an item to the end of the queue.
         * @param {*} itemToAdd The item to enqueue.
         */
        enqueueItem(itemToAdd) {
          this.currentCount += 1;
          this.elementList.push(itemToAdd);
        }

        /**
         * Removes and returns the item from the front of the queue.
         * @returns {*} The dequeued item.
         */
        dequeueItem() {
          var extractedItem = this.elementList[this.readIndex];
          this.currentCount -= 1;
          this.readIndex += 1;
          return extractedItem;
        }
      };
    },

    // Module 4: Core logic to process input and print results
    function (currentExportModule, moduleExportObject, moduleLoaderFn) {
      "use strict";

      // Export a function that takes an input handler (ProcessingUnit instance).
      currentExportModule.exports = function (inputHandler) {
        // Read the first integer as the loop limit.
        // Then iterate 'loopLimit' times.
        for (
          var loopLimit = inputHandler.readNextInt(), iterationCounter = 0;
          iterationCounter < loopLimit;
          iterationCounter++
        ) {
          // In each iteration, read another integer.
          // If it's odd, print "first output" and exit the function.
          if (inputHandler.readNextInt() % 2 === 1) {
            return void console.log("first output");
          }
        }
        // If the loop completes without finding an odd number, print "second output".
        console.log("second output");
      };
    },
  ]
);