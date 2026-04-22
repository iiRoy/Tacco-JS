module.exports = (
  function initializeModuleSystem(moduleDefinitions) {
    // A cache for loaded modules to prevent redundant execution.
    const _loadedModulesCache = {};

    /**
     * The core function to load and execute a module by its identifier.
     * @param {number} moduleId - The unique identifier for the module.
     * @returns {object} The exports object of the requested module.
     */
    function _resolveAndLoadModule(moduleId) {
      // Check if the module is already in the cache.
      if (_loadedModulesCache[moduleId]) {
        return _loadedModulesCache[moduleId].exports;
      }

      // If not cached, prepare a new module entry.
      const moduleEntry = (_loadedModulesCache[moduleId] = {
        id: moduleId,
        isLoaded: false, // Flag to indicate if the module's function has been executed.
        exports: {}, // The object that will hold the module's exports.
      });

      // Execute the module's definition function.
      // The function receives `module.exports`, `module`, `module.exports`, and the `_resolveAndLoadModule` function itself.
      moduleDefinitions[moduleId].call(
        moduleEntry.exports,
        moduleEntry,
        moduleEntry.exports,
        _resolveAndLoadModule
      );

      // Mark the module as loaded.
      moduleEntry.isLoaded = true;
      return moduleEntry.exports;
    }

    // Expose module definitions and cache for debugging or advanced usage.
    _resolveAndLoadModule.allModuleDefs = moduleDefinitions; // Raw module definitions array.
    _resolveAndLoadModule.moduleCache = _loadedModulesCache; // The cache for loaded modules.

    /**
     * Defines a getter property on an object for ES module compatibility.
     * @param {object} target - The object to define the property on.
     * @param {string} propertyName - The name of the property.
     * @param {function} getterFunction - The function to call when the property is accessed.
     */
    _resolveAndLoadModule.defineGetter = (target, propertyName, getterFunction) => {
      // Only define if the property doesn't already exist.
      if (!_resolveAndLoadModule.hasOwnProp(target, propertyName)) {
        Object.defineProperty(target, propertyName, {
          enumerable: true, // Make it enumerable so it shows up in `for...in`.
          get: getterFunction,
        });
      }
    };

    /**
     * Marks an object as an ES module for interop purposes.
     * @param {object} targetObject - The object to mark.
     */
    _resolveAndLoadModule.markAsESModule = (targetObject) => {
      if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
        Object.defineProperty(targetObject, Symbol.toStringTag, { value: "Module" });
      }
      Object.defineProperty(targetObject, "__esModule", { value: true });
    };

    /**
     * Handles interop for various module formats (e.g., CommonJS to ES module).
     * @param {*} valueToWrap - The module's export value.
     * @param {number} flags - Bitmask indicating the type of interop needed.
     * @returns {*} The wrapped value.
     */
    _resolveAndLoadModule.interopNamespace = (valueToWrap, flags) => {
      // Flag 1: If it's a direct module ID, load it first.
      if (flags & 1) {
        valueToWrap = _resolveAndLoadModule(valueToWrap);
      }
      // Flag 8: Return the value as is.
      if (flags & 8) {
        return valueToWrap;
      }
      // Flag 4: If it's already an ES module, return it.
      if (flags & 4 && typeof valueToWrap === "object" && valueToWrap && valueToWrap.__esModule) {
        return valueToWrap;
      }

      // Default interop: Create a new object, mark it as an ES module,
      // and set the original value as its 'default' export.
      const interopObject = Object.create(null);
      _resolveAndLoadModule.markAsESModule(interopObject);
      Object.defineProperty(interopObject, "default", {
        enumerable: true,
        value: valueToWrap,
      });

      // Flag 2: If it's not a string, copy all properties from the original to the interop object.
      if (flags & 2 && typeof valueToWrap !== "string") {
        for (const propName in valueToWrap) {
          // Use a bound function to capture `propName` correctly.
          _resolveAndLoadModule.defineGetter(
            interopObject,
            propName,
            ((key) => valueToWrap[key]).bind(null, propName)
          );
        }
      }
      return interopObject;
    };

    /**
     * Helper for `_resolveAndLoadModule.interopNamespace` specifically for default exports.
     * @param {*} moduleExports - The exports object from a module.
     * @returns {function} A getter function for the default export.
     */
    _resolveAndLoadModule.interopDefault = (moduleExports) => {
      const getDefault =
        moduleExports && moduleExports.__esModule
          ? () => moduleExports.default
          : () => moduleExports;
      _resolveAndLoadModule.defineGetter(getDefault, "a", getDefault); // Add a synthetic 'a' getter pointing to the default.
      return getDefault;
    };

    /**
     * Checks if an object has a specific property as its own property.
     * @param {object} target - The object to check.
     * @param {string} property - The property name.
     * @returns {boolean} True if the object has the property, false otherwise.
     */
    _resolveAndLoadModule.hasOwnProp = (target, property) =>
      Object.prototype.hasOwnProperty.call(target, property);

    // This property is often used for the public path in web environments.
    // Here it's empty, suggesting a relative or no specific base path.
    _resolveAndLoadModule.publicPath = "";

    // Set the entry point for the application. Module 0 will be loaded first.
    _resolveAndLoadModule.entryModuleId = 0;
    return _resolveAndLoadModule(_resolveAndLoadModule.entryModuleId);
  }
)([
  /* Module 0: Application Entry Point */
  function (module, exports, localRequire) {
    "use strict";
    // For robust file operations, we first load the 'fs' (file system) module.
    const fileSystemOps = localRequire(1);

    // A constant for the standard input file path, enhancing maintainability.
    const STANDARD_INPUT_PATH = "/dev/stdin";

    try {
      // Read the entire content of standard input synchronously,
      // assuming UTF-8 encoding for text processing.
      const rawInputContent = fileSystemOps.readFileSync(STANDARD_INPUT_PATH, "utf8");

      // Pass the raw content to the main processing module (module 2).
      localRequire(2)(rawInputContent);
    } catch (readError) {
      console.error(`Failed to read input from ${STANDARD_INPUT_PATH}:`, readError.message);
      // Exit gracefully or handle error further.
      process.exit(1);
    }
  },

  /* Module 1: Node.js File System Module */
  function (module, exports) {
    // This module simply re-exports the native Node.js 'fs' module.
    module.exports = require("fs");
  },

  /* Module 2: Graph Problem Orchestrator */
  function (module, exports, localRequire) {
    "use strict";
    // Load the custom InputParser and the main graph processing logic.
    const InputParserClass = localRequire(3);
    const processGraphLogic = localRequire(5);

    /**
     * Exports a function to initiate the graph problem solving process.
     * It takes the raw input string, parses it, and then executes the graph logic.
     * @param {string} fullInputString - The complete input data as a single string.
     */
    module.exports = (fullInputString) => {
      // Create an instance of the InputParser to handle tokenizing and type conversion.
      const dataReader = new InputParserClass(fullInputString);

      // Execute the primary graph processing function with the data reader.
      processGraphLogic(dataReader);

      // Optionally, clear the reader's buffer after processing is complete.
      // dataReader.resetParser(); // This method doesn't exist in original, but could be added.
    };
  },

  /* Module 3: Input Parsing Utility (Reader) */
  function (module, exports, localRequire) {
    "use strict";
    // Load the custom TokenBuffer (Queue) module.
    const TokenBuffer = localRequire(4);

    /**
     * InputReader: A class designed to streamline reading numerical and string tokens
     * from a pre-processed input string.
     */
    module.exports = class InputReader {
      /**
       * Constructs an InputReader instance.
       * @param {string} rawInputText - The entire input string, typically from stdin.
       */
      constructor(rawInputText) {
        // Pre-process the input: trim whitespace and split into tokens by any whitespace.
        // Using match(/\S+/g) is an alternative to split(/\s+/g) that handles multiple spaces
        // and leading/trailing spaces slightly differently, often resulting in cleaner token arrays.
        const tokens = rawInputText.trim().match(/\S+/g) || [];
        // Initialize an internal buffer (queue) with these tokens.
        this.tokenQueue = new TokenBuffer(tokens);

        // Add a safety check for empty input.
        if (this.tokenQueue.isEmpty()) {
            console.warn("InputReader initialized with no tokens.");
        }
      }

      /**
       * Retrieves the next raw string token from the input.
       * @returns {string} The next token.
       */
      getNextRawToken() {
        if (this.tokenQueue.isEmpty()) {
          console.error("Attempted to read raw token from empty input queue.");
          return null; // Or throw an error, depending on desired behavior.
        }
        return this.tokenQueue.dequeueItem();
      }

      /**
       * Retrieves the next token and attempts to parse it as an integer.
       * @returns {number} The parsed integer.
       * @throws {Error} If the token is not a valid integer.
       */
      readInteger() {
        const token = this.getNextRawToken();
        if (token === null) {
            // Error already logged by getNextRawToken
            return NaN;
        }
        const parsedValue = parseInt(token, 10);
        if (isNaN(parsedValue)) {
          console.error(`Invalid integer format encountered: "${token}"`);
          throw new Error(`Expected an integer, but received "${token}"`);
        }
        return parsedValue;
      }

      /**
       * Clears all tokens from the internal buffer, effectively resetting the reader.
       */
      resetParser() {
        this.tokenQueue.clearBuffer();
      }
    };
  },

  /* Module 4: Simple Token Buffer (Queue) */
  function (module, exports) {
    "use strict";
    /**
     * TokenBuffer: A custom queue implementation optimized for sequential token access.
     * It avoids `shift()` for performance by using an internal index.
     */
    module.exports = class TokenBuffer {
      /**
       * Constructs a TokenBuffer.
       * @param {Array<string>} [initialItems=[]] - An optional array of items to pre-populate the buffer.
       */
      constructor(initialItems = []) {
        // Ensure initialItems is an array.
        if (!Array.isArray(initialItems)) {
            console.warn("TokenBuffer constructor received non-array initial items. Initializing empty.");
            initialItems = [];
        }
        this.bufferItems = [...initialItems]; // Deep copy to prevent external modification issues.
        this.currentIndex = 0; // Points to the next item to be dequeued.
        this.currentSize = this.bufferItems.length; // Tracks effective size.
      }

      /**
       * Adds an item to the end of the buffer (enqueue operation).
       * @param {*} item - The item to add.
       */
      enqueueItem(item) {
        this.bufferItems.push(item);
        this.currentSize++;
      }

      /**
       * Removes and returns the item at the front of the buffer (dequeue operation).
       * @returns {*} The item at the front of the buffer, or undefined if empty.
       */
      dequeueItem() {
        if (this.isEmpty()) {
          return undefined; // Or throw an error.
        }
        const item = this.bufferItems[this.currentIndex];
        // Increment index, but don't remove from array for performance (GC will handle later).
        this.currentIndex++;
        this.currentSize--;
        return item;
      }

      /**
       * Checks if the buffer is currently empty.
       * @returns {boolean} True if the buffer contains no more items, false otherwise.
       */
      isEmpty() {
        return this.currentIndex >= this.bufferItems.length;
      }

      /**
       * Returns the number of items currently available in the buffer.
       * @returns {number} The current size of the buffer.
       */
      getRemainingSize() {
        return this.currentSize;
      }

      /**
       * Clears all items from the buffer and resets its state.
       */
      clearBuffer() {
        this.bufferItems = [];
        this.currentIndex = 0;
        this.currentSize = 0;
      }
    };
  },

  /* Module 5: Graph Processing Core Logic */
  function (module, exports, localRequire) {
    "use strict";
    // Define a large constant to represent infinity for path calculations.
    // Using a named constant improves readability and maintainability.
    const PATH_INFINITY = 1_000_000_000_000; // 1 Trillion, sufficiently large.

    // Load the Floyd-Warshall algorithm implementation.
    const calculateAllPairsShortestPaths = localRequire(6);

    /**
     * Processes graph data from an InputReader, applies two stages of Floyd-Warshall,
     * and outputs query results.
     * @param {object} inputSource - An instance of InputReader to get graph data from.
     */
    module.exports = (inputSource) => {
      // Read initial graph parameters: number of nodes, number of edges, and threshold.
      const numNodes = inputSource.readInteger();
      const numEdges = inputSource.readInteger();
      const distanceThreshold = inputSource.readInteger();

      // Basic input validation.
      if (numNodes <= 0 || numEdges < 0) {
        console.error("Invalid graph dimensions: numNodes must be > 0, numEdges >= 0.");
        return;
      }

      // Initialize the adjacency matrix for the graph.
      // All nodes are initially considered unreachable from each other (infinity distance).
      // A node to itself has distance 0.
      const initialAdjacencyMatrix = Array.from({ length: numNodes }, (_, i) =>
        Array.from({ length: numNodes }, (_, j) => (i === j ? 0 : PATH_INFINITY))
      );

      // Populate the adjacency matrix with direct edge weights.
      // Graph is undirected, so update both (u, v) and (v, u).
      for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const nodeU = inputSource.readInteger();
        const nodeV = inputSource.readInteger();
        const edgeWeight = inputSource.readInteger();

        // Adjust to 0-indexed values.
        const uIdx = nodeU - 1;
        const vIdx = nodeV - 1;

        // Ensure indices are within bounds.
        if (uIdx < 0 || uIdx >= numNodes || vIdx < 0 || vIdx >= numNodes) {
            console.error(`Edge definition includes out-of-bounds node index: (${nodeU}, ${nodeV}).`);
            continue;
        }

        // For multiple edges between same nodes, take the minimum weight.
        initialAdjacencyMatrix[uIdx][vIdx] = Math.min(initialAdjacencyMatrix[uIdx][vIdx], edgeWeight);
        initialAdjacencyMatrix[vIdx][uIdx] = Math.min(initialAdjacencyMatrix[vIdx][uIdx], edgeWeight);
      }

      // --- First Stage Floyd-Warshall: Find all-pairs shortest paths based on initial edge weights. ---
      const shortestPathsStage1 = calculateAllPairsShortestPaths(initialAdjacencyMatrix);

      // --- Re-evaluate graph connectivity based on distance threshold. ---
      // If the shortest path between two nodes is less than or equal to the threshold,
      // consider them directly connected with a "cost" of 1 for the second stage.
      // Otherwise, they remain effectively unreachable for this new interpretation.
      const reweightedAdjacencyMatrix = Array.from({ length: numNodes }, (_, i) =>
        Array.from({ length: numNodes }, (_, j) => (i === j ? 0 : PATH_INFINITY))
      );

      for (let row = 0; row < numNodes; row++) {
        for (let col = 0; col < numNodes; col++) {
          if (shortestPathsStage1[row][col] <= distanceThreshold) {
            reweightedAdjacencyMatrix[row][col] = 1; // Direct connection if within threshold.
          }
          // If not within threshold, it remains PATH_INFINITY (implicitly handled by initialization).
        }
      }

      // --- Second Stage Floyd-Warshall: Find shortest paths in the reweighted graph. ---
      // This effectively counts the minimum number of "hops" needed, where a hop means
      // traversing a path that satisfies the initial distance threshold.
      const finalShortestHops = calculateAllPairsShortestPaths(reweightedAdjacencyMatrix);

      // --- Process Queries ---
      const numQueries = inputSource.readInteger();

      if (numQueries < 0) {
          console.warn("Number of queries cannot be negative. Skipping queries.");
          return;
      }

      for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        const startNode = inputSource.readInteger();
        const endNode = inputSource.readInteger();

        const startIdx = startNode - 1;
        const endIdx = endNode - 1;

        // Ensure query nodes are valid.
        if (startIdx < 0 || startIdx >= numNodes || endIdx < 0 || endIdx >= numNodes) {
            console.error(`Query includes out-of-bounds node index: (${startNode}, ${endNode}).`);
            console.log(-1); // Output -1 for invalid queries.
            continue;
        }

        const calculatedHops = finalShortestHops[startIdx][endIdx];

        // If the path is still infinity, it means no path exists under the given threshold criteria.
        // Otherwise, print the number of hops minus one (as per problem statement, likely 0-indexed hops).
        if (calculatedHops >= PATH_INFINITY) {
          console.log(-1); // Indicate no path.
        } else {
          // The problem statement implies that a path of 'm' hops should output 'm-1'.
          // This often means the number of edges to traverse, where `m` includes start and end nodes.
          console.log(calculatedHops - 1);
        }
      }

      // Clear the input buffer after all processing.
      inputSource.resetParser();
    };
  },

  /* Module 6: Floyd-Warshall Algorithm Implementation */
  function (module, exports) {
    "use strict";
    /**
     * Implements the Floyd-Warshall algorithm to find all-pairs shortest paths
     * in a given weighted graph represented by an adjacency matrix.
     * @param {Array<Array<number>>} adjacencyMatrix - The input adjacency matrix.
     *                                                  Assumes matrix[i][j] is the weight
     *                                                  of the edge from i to j, or infinity
     *                                                  if no direct edge.
     * @returns {Array<Array<number>>} A new matrix where result[i][j] is the shortest
     *                                  path distance from node i to node j.
     */
    module.exports = (adjacencyMatrix) => {
      const numVertices = adjacencyMatrix.length;

      // Guard clause: Handle empty or invalid input matrix.
      if (numVertices === 0 || !Array.isArray(adjacencyMatrix[0])) {
          console.warn("Floyd-Warshall received an empty or invalid adjacency matrix. Returning empty.");
          return [];
      }

      // Create a deep copy of the input matrix. This ensures the original
      // matrix is not modified and allows for iterative updates.
      // Using map with spread operator for robust deep copy of 2D array.
      const distanceMatrix = adjacencyMatrix.map((row) => [...row]);

      // The core Floyd-Warshall triple loop.
      // k: Intermediate vertex (the 'pivot' node for paths).
      // i: Starting vertex.
      // j: Ending vertex.
      for (let k = 0; k < numVertices; k++) {
        for (let i = 0; i < numVertices; i++) {
          for (let j = 0; j < numVertices; j++) {
            // Check if path through k is shorter than the current direct or indirect path.
            // Ensure intermediate paths are not 'infinity' to prevent overflow issues
            // if adding two infinities, although in JS it might result in Infinity.
            // Explicitly checking prevents `Infinity + Infinity` from being `Infinity`
            // and potentially hiding a valid path if `distanceMatrix[i][k]` or `distanceMatrix[k][j]`
            // were truly unreachable.
            const pathThroughK = distanceMatrix[i][k] + distanceMatrix[k][j];

            if (distanceMatrix[i][j] > pathThroughK) {
              distanceMatrix[i][j] = pathThroughK;
            }
          }
        }
      }

      return distanceMatrix;
    };
  },
]);