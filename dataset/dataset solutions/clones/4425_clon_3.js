exports.initModuleSystem = function (moduleDefinitions) {
  // A cache for already loaded modules.
  const loadedModulesCache = {};

  /**
   * Resolves and loads a module.
   * @param {number} moduleId - The ID of the module to load.
   * @returns {object} The exports of the loaded module.
   */
  function moduleResolver(moduleId) {
    // Check if the module is already in cache.
    if (loadedModulesCache[moduleId]) {
      return loadedModulesCache[moduleId].exports;
    }

    // Prepare a new module entry in the cache.
    const moduleEntry = (loadedModulesCache[moduleId] = {
      id: moduleId,
      initialized: false, // Flag to indicate if the module has been executed.
      exports: {},
    });

    // Execute the module function, passing necessary parameters.
    // The module function is expected to populate `moduleEntry.exports`.
    moduleDefinitions[moduleId].call(
      moduleEntry.exports,
      moduleEntry,
      moduleEntry.exports,
      moduleResolver
    );

    // Mark the module as initialized.
    moduleEntry.initialized = true;
    return moduleEntry.exports;
  }

  // --- Utility functions for module handling (mimicking webpack helpers) ---

  // Store module definitions and cache reference on the resolver for debugging/introspection.
  moduleResolver.allModuleDefs = moduleDefinitions;
  moduleResolver.moduleCacheRef = loadedModulesCache;

  /**
   * Defines a getter property on an object.
   * @param {object} targetObject - The object to define the property on.
   * @param {string} propertyName - The name of the property.
   * @param {function} getterFunction - The getter function for the property.
   */
  moduleResolver.defineGetter = function (targetObject, propertyName, getterFunction) {
    // Ensure property doesn't already exist or is enumerable.
    if (!Object.prototype.hasOwnProperty.call(targetObject, propertyName) || !Object.getOwnPropertyDescriptor(targetObject, propertyName).enumerable) {
      Object.defineProperty(targetObject, propertyName, {
        enumerable: true,
        get: getterFunction,
      });
    }
  };

  /**
   * Marks an object as an ES module.
   * @param {object} targetModule - The module object to mark.
   */
  moduleResolver.markAsESModule = function (targetModule) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(targetModule, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(targetModule, '__esModule', { value: true });
  };

  /**
   * Creates a namespace object for a module.
   * Handles various module export formats (commonjs, esm, etc.).
   * @param {any} moduleValue - The raw module value.
   * @param {number} moduleFlags - Flags indicating module type.
   * @returns {object} The namespace object.
   */
  moduleResolver.createNamespace = function (moduleValue, moduleFlags) {
    let processedModule = moduleValue;

    // Flag 1: If it's a direct module ID, resolve it first.
    if (moduleFlags & 1) {
      processedModule = moduleResolver(moduleValue);
    }

    // Flag 8: Return the processed module directly.
    if (moduleFlags & 8) {
      return processedModule;
    }

    // Flag 4: If it's an ES module, return it directly.
    if (moduleFlags & 4 && typeof processedModule === 'object' && processedModule && processedModule.__esModule) {
      return processedModule;
    }

    // Create a new namespace object.
    const namespaceObject = Object.create(null);
    moduleResolver.markAsESModule(namespaceObject);

    // Define 'default' export.
    Object.defineProperty(namespaceObject, 'default', {
      enumerable: true,
      value: processedModule,
    });

    // Flag 2: Copy all properties from the original module to the namespace.
    if (moduleFlags & 2 && typeof processedModule !== 'string') {
      for (const propKey in processedModule) {
        // Use a self-invoking function to capture `propKey` for the getter.
        ((currentKey) => {
          moduleResolver.defineGetter(namespaceObject, currentKey, () => processedModule[currentKey]);
        })(propKey);
      }
    }
    return namespaceObject;
  };

  /**
   * Gets a function that returns the default export of a module.
   * @param {object} moduleObject - The module object.
   * @returns {function} A function returning the default export.
   */
  moduleResolver.getDefaultExport = function (moduleObject) {
    // Check if it's an ES module and has a default export.
    const defaultExportGetter =
      moduleObject && moduleObject.__esModule ?
      () => moduleObject.default :
      () => moduleObject; // Fallback for CommonJS or non-ES modules.

    // Define a special 'a' getter for compatibility (webpack specific).
    moduleResolver.defineGetter(defaultExportGetter, 'a', defaultExportGetter);
    return defaultExportGetter;
  };

  /**
   * Checks if an object has a specific property.
   * @param {object} targetObject - The object to check.
   * @param {string} propertyKey - The property name.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  moduleResolver.hasProperty = function (targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  // Public path for assets (not used in this specific app, but part of runtime).
  moduleResolver.publicPath = '';

  // Initialize the application by loading the entry module (ID 0).
  // The entry module ID is also stored for reference.
  moduleResolver.entryModuleId = 0;
  return moduleResolver(moduleResolver.entryModuleId);
}(
  // --- Module Definitions Array ---
  [
    // Module 0: Main Application Entry Point
    function (module, exports, localRequire) {
      'use strict';

      // Constants for input/output.
      const STD_IN_PATH = '/dev/stdin';
      const ENCODING_UTF8 = 'utf8';
      const WHITESPACE_DELIMITER = /\s+/g;

      // Import the Node.js 'fs' (File System) module.
      const fileAccessUtil = localRequire(1);

      // Validate file system utility is available.
      if (!fileAccessUtil || typeof fileAccessUtil.readFileSync !== 'function') {
        throw new Error('File system utility (fs) is not available or corrupted.');
      }

      // Read all input from standard input, decode, and split into tokens.
      let rawInputData;
      try {
        rawInputData = fileAccessUtil.readFileSync(STD_IN_PATH, ENCODING_UTF8);
      } catch (readError) {
        console.error(`Error reading from ${STD_IN_PATH}:`, readError.message);
        // Provide a mock empty input to prevent crashing, or rethrow.
        // For this clone, let's rethrow to maintain original behavior upon error.
        throw readError;
      }

      const inputTokens = rawInputData.split(WHITESPACE_DELIMITER);

      // Initialize the data processing utility with the parsed tokens.
      const dataParser = new (localRequire(2))(inputTokens);

      // Execute the primary graph processing logic.
      // The result of this operation is typically side-effectual (e.g., printing to console).
      localRequire(4)(dataParser);
    },

    // Module 1: Node.js File System (fs) Module
    function (module, exports) {
      // Directly expose the Node.js 'fs' module.
      // No structural changes possible here without altering core functionality.
      module.exports = require('fs');
    },

    // Module 2: Input Data Processing Class (Wrapper for TokenQueue)
    function (module, exports, localRequire) {
      'use strict';

      // Import the internal TokenQueue class.
      const TokenQueueClass = localRequire(3);

      // Define the InputProcessor class.
      module.exports = class InputProcessor {
        /**
         * Creates an instance of InputProcessor.
         * @param {Array<string>} initialTokens - An array of string tokens to process.
         */
        constructor(initialTokens) {
          if (!Array.isArray(initialTokens)) {
            console.warn('InputProcessor received non-array tokens. Initializing with empty queue.');
            this.inputBuffer = new TokenQueueClass([]);
          } else {
            this.inputBuffer = new TokenQueueClass(initialTokens);
          }
          // Add a property to track if there are more tokens.
          this.hasMore = this.inputBuffer.getCurrentSize() > 0;
        }

        /**
         * Retrieves the next string token from the input buffer.
         * @returns {string|undefined} The next token, or undefined if no more tokens.
         */
        getNextToken() {
          const token = this.inputBuffer.dequeueElement();
          this.hasMore = this.inputBuffer.getCurrentSize() > 0; // Update status
          return token;
        }

        /**
         * Retrieves the next token and parses it as an integer.
         * @returns {number|NaN} The parsed integer, or NaN if parsing fails.
         */
        getNextInteger() {
          const token = this.getNextToken();
          if (token === undefined) {
            console.error('Attempted to read integer from empty input stream.');
            return NaN;
          }
          const parsedValue = parseInt(token, 10); // Always specify radix.
          if (isNaN(parsedValue)) {
            console.warn(`Failed to parse "${token}" as an integer. Returning NaN.`);
          }
          return parsedValue;
        }

        /**
         * Enqueues a new token into the input buffer.
         * @param {string} newToken - The token to add.
         */
        enqueueToken(newToken) {
          this.inputBuffer.enqueueElement(newToken);
          this.hasMore = true; // Always true after enqueuing
        }

        /**
         * Checks if there are any remaining tokens in the buffer.
         * @returns {boolean} True if there are tokens, false otherwise.
         */
        hasRemainingTokens() {
          return this.inputBuffer.getCurrentSize() > 0;
        }

        /**
         * Returns the number of remaining tokens.
         * @returns {number}
         */
        getRemainingTokenCount() {
          return this.inputBuffer.getCurrentSize();
        }
      };
    },

    // Module 3: Custom Token Queue Implementation
    function (module, exports) {
      'use strict';

      // A simple queue data structure for managing input tokens.
      module.exports = class TokenQueue {
        /**
         * Creates a TokenQueue instance.
         * @param {Array<any>} [initialElements=[]] - Optional array of initial elements.
         */
        constructor(initialElements = []) {
          // Internal buffer storing the queue elements.
          this.internalStorage = Array.isArray(initialElements) ? [...initialElements] : [];
          // Pointer to the next element to be dequeued.
          this.readHeadPointer = 0;
        }

        /**
         * Adds an element to the end of the queue.
         * @param {any} elementToAdd - The element to enqueue.
         */
        enqueueElement(elementToAdd) {
          this.internalStorage.push(elementToAdd);
        }

        /**
         * Removes and returns the element at the front of the queue.
         * @returns {any|undefined} The dequeued element, or undefined if the queue is empty.
         */
        dequeueElement() {
          // Check if there are elements available to dequeue.
          if (this.readHeadPointer >= this.internalStorage.length) {
            // Optional: Reset buffer if fully consumed to reclaim memory.
            this.clearConsumedElements();
            return undefined; // Queue is logically empty.
          }

          const dequeuedItem = this.internalStorage[this.readHeadPointer];
          this.readHeadPointer++; // Advance the read pointer.

          // Optimization: If a significant portion of the array is consumed,
          // shift elements to reclaim memory and keep `readHeadPointer` small.
          // This prevents the `internalStorage` from growing indefinitely for long-running processes.
          if (this.readHeadPointer > 1000 && this.readHeadPointer * 2 > this.internalStorage.length) {
             this.clearConsumedElements();
          }
          return dequeuedItem;
        }

        /**
         * Returns the element at the front of the queue without removing it.
         * @returns {any|undefined} The element, or undefined if empty.
         */
        peekFront() {
            if (this.readHeadPointer >= this.internalStorage.length) {
                return undefined;
            }
            return this.internalStorage[this.readHeadPointer];
        }

        /**
         * Checks if the queue is empty.
         * @returns {boolean} True if empty, false otherwise.
         */
        isEmpty() {
          return this.readHeadPointer >= this.internalStorage.length;
        }

        /**
         * Returns the current number of elements in the queue.
         * @returns {number} The count of elements.
         */
        getCurrentSize() {
          return this.internalStorage.length - this.readHeadPointer;
        }

        /**
         * Clears elements that have already been dequeued from the internal storage.
         * This helps in memory management for long-lived queues.
         */
        clearConsumedElements() {
            if (this.readHeadPointer > 0) {
                this.internalStorage = this.internalStorage.slice(this.readHeadPointer);
                this.readHeadPointer = 0;
            }
        }
      };
    },

    // Module 4: Graph Processing and Shortest Path Logic
    function (module, exports) {
      'use strict';

      // Main function to execute the graph algorithm.
      // It takes an InputProcessor instance to read data.
      module.exports = function (dataStreamProcessor) {
        // --- Input Validation and Reading ---

        // Ensure the data stream processor is valid.
        if (!dataStreamProcessor || typeof dataStreamProcessor.getNextInteger !== 'function') {
          console.error('Invalid data stream processor provided to graph algorithm.');
          return; // Exit if input is invalid.
        }

        // Read the number of nodes in the graph.
        const numberOfNodes = dataStreamProcessor.getNextInteger();
        if (isNaN(numberOfNodes) || numberOfNodes <= 0) {
            console.error('Invalid number of nodes provided. Must be a positive integer.');
            return;
        }

        // Initialize adjacency list for the graph.
        // Each node's entry will be an array of [neighborIndex, edgeWeight] pairs.
        const graphAdjacencyList = Array.from({ length: numberOfNodes }, () => []);

        // Read and construct the graph edges.
        // The problem typically implies a tree or a connected graph where edges = nodes - 1.
        const numEdgesToRead = numberOfNodes - 1;
        for (let i = 0; i < numEdgesToRead; i++) {
          const nodeOneIdx = dataStreamProcessor.getNextInteger() - 1; // Adjust to 0-indexed
          const nodeTwoIdx = dataStreamProcessor.getNextInteger() - 1; // Adjust to 0-indexed
          const edgeCost = dataStreamProcessor.getNextInteger();

          // Basic input validation for edge data.
          if ([nodeOneIdx, nodeTwoIdx, edgeCost].some(val => isNaN(val))) {
            console.error(`Error reading edge data at iteration ${i}. Skipping this edge.`);
            continue;
          }
          if (nodeOneIdx < 0 || nodeOneIdx >= numberOfNodes || nodeTwoIdx < 0 || nodeTwoIdx >= numberOfNodes) {
              console.warn(`Edge connects to invalid node index (${nodeOneIdx}, ${nodeTwoIdx}). Skipping.`);
              continue;
          }
          if (edgeCost < 0) {
              console.warn(`Negative edge cost (${edgeCost}) found. Dijkstra might not work correctly. Proceeding.`);
          }

          // Add edges to the adjacency list (undirected graph).
          graphAdjacencyList[nodeOneIdx].push([nodeTwoIdx, edgeCost]);
          graphAdjacencyList[nodeTwoIdx].push([nodeOneIdx, edgeCost]);
        }

        // Read the number of queries and the starting node for shortest path calculation.
        const numberOfQueries = dataStreamProcessor.getNextInteger();
        const initialSourceNode = dataStreamProcessor.getNextInteger() - 1; // Adjust to 0-indexed

        if (isNaN(numberOfQueries) || numberOfQueries < 0) {
            console.error('Invalid number of queries. Must be a non-negative integer.');
            return;
        }
        if (isNaN(initialSourceNode) || initialSourceNode < 0 || initialSourceNode >= numberOfNodes) {
            console.error('Invalid initial source node index.');
            return;
        }

        // --- Dijkstra's Algorithm for Shortest Paths from a Single Source ---

        // Array to store minimum distances from `initialSourceNode` to all other nodes.
        // Initialize all distances to infinity, except for the source node which is 0.
        // Using `Number.MAX_SAFE_INTEGER` to represent "infinity" for distances.
        const shortestDistances = Array(numberOfNodes).fill(Number.MAX_SAFE_INTEGER);
        shortestDistances[initialSourceNode] = 0;

        // A simple Min-Priority Queue for Dijkstra's algorithm.
        // Stores elements as [distance, nodeIndex].
        // For simplicity, we'll use a basic array and linear scan for `extractMin`.
        // For larger graphs, a binary heap would be more efficient.
        const priorityQueue = [[0, initialSourceNode]]; // [distance, nodeIndex]

        // Process nodes until the priority queue is empty.
        while (priorityQueue.length > 0) {
          // Find the node with the smallest distance that has not been processed yet.
          // This is a linear scan, making this a O(V^2) implementation of Dijkstra.
          // A real priority queue (e.g., binary heap) would make it O(E log V).
          let minDistance = Number.MAX_SAFE_INTEGER;
          let minIndex = -1;
          let queuePositionToRemove = -1;

          // Search for the minimum distance node in the current priority queue.
          for (let k = 0; k < priorityQueue.length; k++) {
            if (priorityQueue[k][0] < minDistance) {
              minDistance = priorityQueue[k][0];
              minIndex = priorityQueue[k][1];
              queuePositionToRemove = k;
            }
          }

          // If no valid node found (shouldn't happen if queue isn't empty), break.
          if (minIndex === -1) {
            break;
          }

          // Remove the extracted minimum node from the priority queue.
          priorityQueue.splice(queuePositionToRemove, 1);

          const currentNode = minIndex;
          const currentDistance = minDistance;

          // If we found a shorter path to this node already, skip processing.
          // This check is important because we don't 'remove' nodes from the queue
          // when a shorter path is found; we just add the shorter path.
          if (currentDistance > shortestDistances[currentNode]) {
            continue;
          }

          // Explore neighbors of the current node.
          for (const [neighborNode, weightToNeighbor] of graphAdjacencyList[currentNode]) {
            const potentialNewDistance = currentDistance + weightToNeighbor;

            // If a shorter path to the neighbor is found, update its distance
            // and add it to the priority queue.
            if (potentialNewDistance < shortestDistances[neighborNode]) {
              shortestDistances[neighborNode] = potentialNewDistance;
              priorityQueue.push([potentialNewDistance, neighborNode]);
            }
          }
        }

        // --- Process Queries ---

        // Iterate through each query.
        for (let q = 0; q < numberOfQueries; q++) {
          const queryNodeAIndex = dataStreamProcessor.getNextInteger() - 1;
          const queryNodeBIndex = dataStreamProcessor.getNextInteger() - 1;

          // Validate query node indices.
          if ([queryNodeAIndex, queryNodeBIndex].some(val => isNaN(val))) {
            console.error(`Error reading query node data at iteration ${q}. Skipping this query.`);
            continue;
          }
          if (queryNodeAIndex < 0 || queryNodeAIndex >= numberOfNodes ||
              queryNodeBIndex < 0 || queryNodeBIndex >= numberOfNodes) {
              console.warn(`Query involves invalid node index (${queryNodeAIndex}, ${queryNodeBIndex}). Skipping.`);
              console.log('-1'); // Output -1 for invalid queries.
              continue;
          }

          // Retrieve distances for the query nodes.
          const distA = shortestDistances[queryNodeAIndex];
          const distB = shortestDistances[queryNodeBIndex];

          // Check if either node is unreachable from the source.
          if (distA === Number.MAX_SAFE_INTEGER || distB === Number.MAX_SAFE_INTEGER) {
            console.warn(`One or both query nodes (${queryNodeAIndex}, ${queryNodeBIndex}) are unreachable from source node ${initialSourceNode}.`);
            console.log('-1'); // Indicate unreachable.
            continue;
          }

          // Calculate and print the sum of distances.
          const combinedPathLength = distA + distB;
          console.log(combinedPathLength);
        }
      };
    },
  ]
);