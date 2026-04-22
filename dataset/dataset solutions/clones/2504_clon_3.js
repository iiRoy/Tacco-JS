module.exports = (moduleDefinitionsArray) => {
  // Cache for already loaded modules.
  const loadedModuleCache = {};

  /**
   * Custom module loading function.
   * This function acts as the 'require' mechanism within the bundled code.
   * @param {number} requestedModuleId - The ID of the module to load.
   * @returns {object} The exports of the loaded module.
   */
  function customModuleLoader(requestedModuleId) {
    // If the module is already in the cache, return its exports immediately.
    if (loadedModuleCache[requestedModuleId]) {
      return loadedModuleCache[requestedModuleId].exports;
    }

    // If not cached, create a new module entry object.
    const currentModuleEntry = loadedModuleCache[requestedModuleId] = {
      identifier: requestedModuleId, // The unique ID of this module.
      isLoaded: false,               // Flag to indicate if the module's code has been executed.
      exports: {}                    // The object that will hold the module's exports.
    };

    // Ensure that the module definition exists before attempting to execute it.
    // This is a Type III addition for robustness.
    if (!moduleDefinitionsArray[requestedModuleId]) {
        console.error(`Error: Module with ID ${requestedModuleId} not found in definitions.`);
        // In a production bundler, this might throw. For a clone, a warning and empty exports is acceptable.
        currentModuleEntry.isLoaded = true;
        return currentModuleEntry.exports;
    }

    // Execute the module function, populating its exports object.
    // The module function is called with:
    // - 'this' context set to the module's exports object.
    // - The module entry object itself.
    // - The module's exports object.
    // - The custom module loader function (acting as 'require').
    moduleDefinitionsArray[requestedModuleId].call(
      currentModuleEntry.exports,
      currentModuleEntry,
      currentModuleEntry.exports,
      customModuleLoader
    );

    // Mark the module as loaded after its execution.
    currentModuleEntry.isLoaded = true;

    // Return the populated exports object.
    return currentModuleEntry.exports;
  }

  // Attach the module definitions array to the loader for potential debugging or introspection.
  customModuleLoader.moduleDefinitions = moduleDefinitionsArray;

  // Attach the module cache to the loader.
  customModuleLoader.moduleCache = loadedModuleCache;

  /**
   * Defines a getter property on an object for module exports.
   * This is typically used for ES module interop to create read-only views of exports.
   * @param {object} targetObject - The object on which to define the property.
   * @param {string} propertyName - The name of the property to define.
   * @param {function} getterFunction - The function to execute when the property is accessed.
   */
  customModuleLoader.defineExportGetter = function(targetObject, propertyName, getterFunction) {
    // Avoid defining if the property already exists or if the target is not a valid object.
    if (!targetObject || typeof targetObject !== 'object' || customModuleLoader.hasOwnProp(targetObject, propertyName)) {
        return;
    }
    Object.defineProperty(targetObject, propertyName, {
      enumerable: true,
      get: getterFunction
    });
  };

  /**
   * Marks an exports object as an ECMAScript Module (ESM).
   * This adds the `__esModule` property and `Symbol.toStringTag` for module identification.
   * @param {object} exportsObject - The exports object to mark.
   */
  customModuleLoader.markAsEsModule = function(exportsObject) {
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
      Object.defineProperty(exportsObject, Symbol.toStringTag, { value: 'Module' });
    }
    Object.defineProperty(exportsObject, '__esModule', { value: true });
  };

  /**
   * Creates a namespace object for a module, handling various export types and flags.
   * This function helps bridge CommonJS and ES module export patterns.
   * @param {any} moduleContent - The actual module content or its ID.
   * @param {number} flags - Bitmask flags indicating how to resolve the module.
   *   - 1: `moduleContent` is a module ID, load it first.
   *   - 4: If `moduleContent` is an object and an ES module, return it directly.
   *   - 8: Always return `moduleContent` directly.
   *   - 2: If `moduleContent` is not a string, iterate its properties and define getters.
   * @returns {object} A namespace object representing the module's exports.
   */
  customModuleLoader.createModuleNamespace = function(moduleContent, flags) {
    // If flag 1 is set, `moduleContent` is an ID, so load the module.
    if (flags & 1) {
      moduleContent = customModuleLoader(moduleContent);
    }
    // If flag 8 is set, or if flag 4 is set and `moduleContent` is an object and an ES module,
    // return the content as is.
    if (flags & 8 || (flags & 4 && typeof moduleContent === 'object' && moduleContent && moduleContent.__esModule)) {
      return moduleContent;
    }

    // Otherwise, create a new empty object to serve as the namespace.
    const namespaceObject = Object.create(null);
    customModuleLoader.markAsEsModule(namespaceObject); // Mark it as an ES module.

    // Define the 'default' export property.
    Object.defineProperty(namespaceObject, 'default', { enumerable: true, value: moduleContent });

    // If flag 2 is set and the module content is not a string,
    // iterate over its properties and define getters for them on the namespace object.
    if (flags & 2 && typeof moduleContent !== 'string') {
      for (const propName in moduleContent) {
        // Ensure it's an own property and not a special module property to avoid conflicts.
        if (customModuleLoader.hasOwnProp(moduleContent, propName) && propName !== 'default' && propName !== '__esModule') {
            customModuleLoader.defineExportGetter(namespaceObject, propName, () => moduleContent[propName]);
        }
      }
    }
    return namespaceObject;
  };

  /**
   * Provides a getter function for accessing a module's default export.
   * This handles both ES Modules (which have a 'default' property) and CommonJS modules.
   * @param {object} moduleExports - The exports object of a module.
   * @returns {function} A function that, when called, returns the default export.
   */
  customModuleLoader.getDefaultExport = function(moduleExports) {
    const defaultExportResolver = moduleExports && moduleExports.__esModule ?
      () => moduleExports.default : // If it's an ES module, return its 'default' property.
      () => moduleExports;           // Otherwise, the entire exports object is considered the default.

    // Define a special 'a' getter for direct access, common in webpack for convenience.
    customModuleLoader.defineExportGetter(defaultExportResolver, 'a', defaultExportResolver);
    return defaultExportResolver;
  };

  /**
   * Checks if an object has a specified own property.
   * This is a utility function to avoid direct `hasOwnProperty` calls on potentially null/undefined objects.
   * @param {object} targetObject - The object to check.
   * @param {string} propertyKey - The name of the property to look for.
   * @returns {boolean} True if the object has the property as its own, false otherwise.
   */
  customModuleLoader.hasOwnProp = function(targetObject, propertyKey) {
    return Object.prototype.hasOwnProperty.call(targetObject, propertyKey);
  };

  // The original bundler often includes `e.p = ""` for a public path, but it's unused here,
  // so it's removed in this Type III clone.

  // The entry point for the application is module ID 0.
  // Execute the entry module to start the application logic.
  customModuleLoader.entryModuleId = 0;
  return customModuleLoader(customModuleLoader.entryModuleId);

}([
  // Module 0: Application Entry Point
  function(moduleObject, exportsObject, requireFunction) {
    "use strict";
    // This module is the starting point of the application.
    // It is responsible for reading input and initiating the main processing flow.

    const fileSystemModule = requireFunction(1); // Import the file system module.
    const mainApplicationProcessor = requireFunction(2);   // Import the main processing logic.

    const STANDARD_INPUT_FILE_PATH = "/dev/stdin";
    const INPUT_FILE_ENCODING = "utf8";

    let rawInputContent = '';
    try {
        // Attempt to read input from standard input, typically '/dev/stdin' on Unix-like systems.
        // This check ensures 'fs' module is used only in a Node.js environment.
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            rawInputContent = fileSystemModule.readFileSync(STANDARD_INPUT_FILE_PATH, INPUT_FILE_ENCODING);
        } else {
            // Type III change: Provide a fallback/sample input for non-Node.js environments
            // or if /dev/stdin is not directly accessible.
            console.warn("Running in a non-Node.js environment or '/dev/stdin' is unavailable. Using embedded sample input.");
            rawInputContent = `3 3 1
1 2 10
2 3 10
1 3 100
2
1 3
3 1`; // Sample input for demonstration.
        }
    } catch (error) {
        console.error(`Failed to read input from ${STANDARD_INPUT_FILE_PATH}:`, error.message);
        // Type III change: Provide a default input to allow the program to run
        // even if file reading fails, preventing a crash.
        rawInputContent = `4 4 5
1 2 2
2 3 3
3 4 2
4 1 5
2
1 3
2 4`; // Alternative fallback input.
    }

    // Pass the retrieved input content to the main application processor.
    mainApplicationProcessor(rawInputContent);
  },

  // Module 1: File System Abstraction
  function(moduleObject, exportsObject) {
    // This module provides access to file system functionalities, primarily for reading input.
    // It includes a conditional check for Node.js environment.

    if (typeof require !== 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) {
        // In a Node.js environment, export the native 'fs' module.
        moduleObject.exports = require("fs");
    } else {
        // Type III change: For non-Node.js environments (e.g., browser),
        // provide a mock implementation of 'fs.readFileSync' to prevent errors.
        console.warn("Node.js 'fs' module is not detected. A mock 'readFileSync' is provided.");
        moduleObject.exports = {
            readFileSync: (filePath, encoding) => {
                console.log(`Mock readFileSync called for path: ${filePath} with encoding: ${encoding}`);
                // This mock can return a predefined string for testing purposes.
                return `5 5 10
1 2 1
2 3 1
3 4 1
4 5 1
5 1 1
3
1 3
2 4
3 5`; // Another sample input.
            }
        };
    }
  },

  // Module 2: Application Orchestrator and Input Processing Wrapper
  function(moduleObject, exportsObject, requireFunction) {
    "use strict";
    // This module acts as an orchestrator, linking the input parsing with the graph solving logic.

    const InputTokenizer = requireFunction(3); // Import the InputTokenizer class.
    const GraphSolver = requireFunction(5);     // Import the graph solving function.

    /**
     * Main function to process the entire application input.
     * It initializes the input reader and then delegates to the graph solver.
     * @param {string} rawApplicationInput - The raw string input from stdin.
     */
    moduleObject.exports = function processApplicationInput(rawApplicationInput) { // Renamed function.
      // Type III change: Add input validation for the raw application input.
      if (!rawApplicationInput || typeof rawApplicationInput !== 'string' || rawApplicationInput.trim().length === 0) {
        console.error("Invalid or empty input provided to the application processor. Cannot proceed.");
        return; // Exit if input is invalid.
      }

      // Initialize an instance of the InputTokenizer with the raw input data.
      const inputHandler = new InputTokenizer(rawApplicationInput);

      // Pass the initialized input handler to the graph solver.
      // The graph solver will then read all necessary parameters and perform computations.
      GraphSolver(inputHandler);

      // Type III change: Explicitly clear the input handler after processing,
      // which can help with resource management if the handler holds large data.
      inputHandler.resetReader();
    };
  },

  // Module 3: Input Tokenizer Class
  function(moduleObject, exportsObject, requireFunction) {
    "use strict";
    // This module defines a class for parsing and reading tokens (strings and integers)
    // from a raw input string, typically provided line by line or as a block.

    const TokenQueue = requireFunction(4); // Import the TokenQueue data structure.

    const INVALID_INTEGER_PARSE_ERROR = "Input token cannot be parsed as a valid integer.";

    /**
     * @class InputTokenizer
     * Manages sequential reading of string and integer tokens from a pre-processed input string.
     */
    moduleObject.exports = class InputTokenizer {
      /**
       * Creates an instance of InputTokenizer.
       * @param {string} rawText - The raw input string, expected to contain space-separated tokens.
       */
      constructor(rawText) {
        // Trim leading/trailing whitespace, then split the string by one or more whitespace characters.
        // `.filter(Boolean)` removes any empty strings that might result from multiple spaces.
        // This is a Type III change (slightly adjusted regex and added filter).
        const tokenParts = rawText.trim().split(/\s+/g).filter(Boolean);

        // Initialize an internal queue with these parsed tokens.
        this.inputTokensQueue = new TokenQueue(tokenParts); // Renamed internal property.
      }

      /**
       * Reads and returns the next raw string token from the input queue.
       * @returns {string|undefined} The next token string, or `undefined` if the queue is empty.
       */
      readNextString() { // Renamed method.
        if (this.inputTokensQueue.isEmpty()) {
            console.warn("Warning: Attempted to read string from an empty input queue.");
            return undefined;
        }
        return this.inputTokensQueue.removeFromFront(); // Renamed method call.
      }

      /**
       * Reads the next token and attempts to parse it as an integer.
       * Throws an error if the token is not a valid number.
       * @returns {number} The next integer token.
       * @throws {Error} If the token cannot be parsed into an integer.
       */
      readNextInteger() { // Renamed method.
        const token = this.readNextString(); // Get the next raw token.
        if (token === undefined) {
            console.error("Error: Attempted to read integer from an empty input queue.");
            throw new Error("No more tokens to read for integer parsing.");
        }
        const parsedValue = parseInt(token, 10); // Parse the token as a base-10 integer.

        // Type III change: Explicitly check for NaN and throw a descriptive error.
        if (isNaN(parsedValue)) {
          console.error(`${INVALID_INTEGER_PARSE_ERROR} Received: '${token}'`);
          throw new Error(`${INVALID_INTEGER_PARSE_ERROR} Token: '${token}'`);
        }
        return parsedValue;
      }

      /**
       * Checks if there are any more tokens available to be read from the input.
       * @returns {boolean} `true` if tokens are available, `false` otherwise.
       */
      hasMoreTokens() { // Type III addition: new helper method.
          return !this.inputTokensQueue.isEmpty();
      }

      /**
       * Resets the input reader by clearing all tokens from its internal queue.
       */
      resetReader() { // Renamed method.
        this.inputTokensQueue.clearQueue(); // Renamed method call.
      }
    };
  },

  // Module 4: TokenQueue (A Simple Queue Data Structure)
  function(moduleObject, exportsObject) {
    "use strict";
    // This module provides a basic First-In, First-Out (FIFO) queue implementation.

    /**
     * @class TokenQueue
     * A simple queue data structure optimized for sequential removal from the front.
     */
    moduleObject.exports = class TokenQueue {
      /**
       * Creates an instance of TokenQueue.
       * @param {Array<any>} [initialItems=[]] - An optional array of items to pre-populate the queue.
       */
      constructor(initialItems = []) {
        // Store queue elements in an array. Using `.slice()` for a shallow copy of initial items.
        this.queueElements = initialItems.slice(); // Renamed property, ensures initial array isn't mutated externally.
        this.headIndex = 0;                        // Pointer to the front of the queue.
        this.currentSize = this.queueElements.length; // Current number of elements in the queue.
      }

      /**
       * Adds an item to the back (end) of the queue.
       * @param {any} itemToAdd - The item to be enqueued.
       */
      enqueueItem(itemToAdd) { // Renamed method.
        this.queueElements.push(itemToAdd);
        this.currentSize++;
      }

      /**
       * Removes and returns the item from the front (head) of the queue.
       * @returns {any|undefined} The item from the front, or `undefined` if the queue is empty.
       */
      removeFromFront() { // Renamed method.
        if (this.isEmpty()) { // Type III addition: check for empty queue.
            console.warn("Warning: Attempted to dequeue from an empty queue.");
            return undefined;
        }

        const dequeuedItem = this.queueElements[this.headIndex];
        this.headIndex++; // Advance the head pointer.
        this.currentSize--;

        // Type III change: Add an optimization to compact the underlying array.
        // This prevents memory leaks if `headIndex` keeps growing without elements being truly removed.
        const COMPACTION_THRESHOLD_COUNT = 1000; // Compact if headIndex passes this many elements.
        const COMPACTION_RATIO = 0.5;             // Compact if less than this ratio of elements are "live".

        if (this.headIndex > COMPACTION_THRESHOLD_COUNT && this.headIndex > this.queueElements.length * COMPACTION_RATIO) {
            this.queueElements = this.queueElements.slice(this.headIndex); // Create a new array with only live elements.
            this.headIndex = 0; // Reset head pointer to 0.
        }

        return dequeuedItem;
      }

      /**
       * Returns the item at the front of the queue without removing it.
       * @returns {any|undefined} The item at the front, or `undefined` if the queue is empty.
       */
      peekFront() { // Type III addition: new method.
        if (this.isEmpty()) {
          return undefined;
        }
        return this.queueElements[this.headIndex];
      }

      /**
       * Checks if the queue is currently empty.
       * @returns {boolean} `true` if the queue contains no elements, `false` otherwise.
       */
      isEmpty() { // Type III addition: new method.
          return this.currentSize <= 0;
      }

      /**
       * Returns the number of elements currently in the queue.
       * @returns {number} The current count of elements.
       */
      getCurrentSize() { // Type III addition: new method.
          return this.currentSize;
      }

      /**
       * Clears all elements from the queue, resetting it to an empty state.
       */
      clearQueue() { // Renamed method.
        this.queueElements = [];
        this.headIndex = 0;
        this.currentSize = 0;
      }
    };
  },

  // Module 5: Graph Processing and Query Solver
  function(moduleObject, exportsObject, requireFunction) {
    "use strict";
    // This module encapsulates the main logic for processing graph data,
    // applying two phases of shortest path calculations, and answering queries.

    const calculateAllPairsShortestPaths = requireFunction(6); // Import the Floyd-Warshall algorithm.

    // Define a constant for "infinity" in graph distance calculations.
    // This value should be large enough to represent unreachable paths but not cause overflow during addition.
    const GRAPH_UNREACHABLE = 1_000_000_000; // Type III change: named constant, slightly adjusted value.

    /**
     * Initializes an N x N adjacency/distance matrix with a default value.
     * Diagonal elements (self-loops) are set to 0.
     * @param {number} numVertices - The number of vertices (nodes) in the graph.
     * @param {number} defaultValue - The default value for non-diagonal cells (e.g., GRAPH_UNREACHABLE).
     * @returns {Array<Array<number>>} The newly created and initialized matrix.
     */
    function createDistanceMatrix(numVertices, defaultValue) { // Type III addition: helper function.
        if (numVertices <= 0) {
            return []; // Return an empty matrix for invalid input.
        }
        // Use Array.from for cleaner matrix initialization.
        const matrix = Array.from({ length: numVertices }, () =>
            Array.from({ length: numVertices }, () => defaultValue)
        );
        // Set distance from a node to itself to 0.
        for (let i = 0; i < numVertices; i++) {
            matrix[i][i] = 0;
        }
        return matrix;
    }

    /**
     * Processes graph input, performs two phases of shortest path calculations, and answers queries.
     * @param {object} inputReader - An instance of the InputTokenizer class for reading input.
     */
    moduleObject.exports = function solveGraphQueries(inputReader) { // Renamed function.
      // Read initial graph parameters: Number of nodes (N), Number of edges (M), Max direct travel cost (K).
      const numberOfNodes = inputReader.readNextInteger();
      const numberOfEdges = inputReader.readNextInteger();
      const maxAllowedDirectCost = inputReader.readNextInteger();

      // Type III change: Add robust validation for graph parameters.
      if (isNaN(numberOfNodes) || numberOfNodes <= 0 ||
          isNaN(numberOfEdges) || numberOfEdges < 0 ||
          isNaN(maxAllowedDirectCost) || maxAllowedDirectCost < 0) {
          console.error("Critical Error: Invalid initial graph parameters. Ensure N > 0, M >= 0, K >= 0.");
          return; // Abort if parameters are fundamentally invalid.
      }

      // Phase 1: Construct the initial adjacency matrix for the original graph.
      // All paths are initially 'unreachable' except direct edges and self-loops.
      const initialGraphMatrix = createDistanceMatrix(numberOfNodes, GRAPH_UNREACHABLE); // Renamed variable.

      // Populate the initial graph matrix with edge weights from input.
      // Input nodes are 1-indexed, so adjust to 0-indexed for array access.
      for (let edgeIndex = 0; edgeIndex < numberOfEdges; edgeIndex++) { // Renamed loop variable.
        const sourceNode = inputReader.readNextInteger();
        const destinationNode = inputReader.readNextInteger();
        const edgeWeight = inputReader.readNextInteger();

        // Type III change: Add validation for individual edge data.
        if (isNaN(sourceNode) || isNaN(destinationNode) || isNaN(edgeWeight) ||
            sourceNode < 1 || sourceNode > numberOfNodes ||
            destinationNode < 1 || destinationNode > numberOfNodes ||
            edgeWeight < 0) { // Assuming edge weights are non-negative.
            console.warn(`Warning: Skipping invalid edge definition: (${sourceNode}, ${destinationNode}, ${edgeWeight}).`);
            continue; // Skip to the next edge if current one is invalid.
        }

        // Store the edge weight. If multiple edges exist, the last one read overwrites previous.
        // Original code overwrites, so we maintain that behavior.
        initialGraphMatrix[sourceNode - 1][destinationNode - 1] = edgeWeight;
        initialGraphMatrix[destinationNode - 1][sourceNode - 1] = edgeWeight; // Assuming an undirected graph.
      }

      // Calculate all-pairs shortest paths for the original graph.
      const shortestPathsPhase1 = calculateAllPairsShortestPaths(initialGraphMatrix); // Renamed variable.

      // Phase 2: Create a modified graph based on the results from Phase 1.
      // In this new graph, an edge exists (with cost 1) between any two nodes
      // if their shortest path in the original graph was within 'maxAllowedDirectCost'.
      const modifiedConnectivityMatrix = createDistanceMatrix(numberOfNodes, GRAPH_UNREACHABLE); // Renamed variable.

      for (let rowIdx = 0; rowIdx < numberOfNodes; rowIdx++) { // Renamed loop variables.
        for (let colIdx = 0; colIdx < numberOfNodes; colIdx++) {
          if (shortestPathsPhase1[rowIdx][colIdx] <= maxAllowedDirectCost) {
            // If the original shortest path is within the threshold, consider them directly connected with cost 1.
            modifiedConnectivityMatrix[rowIdx][colIdx] = 1;
          }
          // Ensure self-loops remain 0, handled by createDistanceMatrix.
          if (rowIdx === colIdx) {
              modifiedConnectivityMatrix[rowIdx][colIdx] = 0;
          }
        }
      }

      // Calculate all-pairs shortest paths for the modified graph.
      const finalShortestPathsMatrix = calculateAllPairsShortestPaths(modifiedConnectivityMatrix); // Renamed variable.

      // Phase 3: Process and answer queries.
      const numberOfQueries = inputReader.readNextInteger();

      // Type III change: Add validation for the number of queries.
      if (isNaN(numberOfQueries) || numberOfQueries < 0) {
          console.error("Critical Error: Invalid number of queries provided. Must be non-negative.");
          return;
      }

      // Type III addition: Helper function for consistent output formatting.
      const printQueryResult = (distanceValue) => {
          if (distanceValue === GRAPH_UNREACHABLE) {
              console.log(-1); // Output -1 if no path exists.
          } else {
              // Output (distance - 1) as per problem's specific requirement
              // (often means number of segments/edges if each segment costs 1).
              console.log(distanceValue - 1);
          }
      };

      for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) { // Renamed loop variable.
        const queryStartNode = inputReader.readNextInteger();
        const queryEndNode = inputReader.readNextInteger();

        // Type III change: Add validation for query nodes.
        if (isNaN(queryStartNode) || isNaN(queryEndNode) ||
            queryStartNode < 1 || queryStartNode > numberOfNodes ||
            queryEndNode < 1 || queryEndNode > numberOfNodes) {
            console.warn(`Warning: Skipping invalid query: (${queryStartNode}, ${queryEndNode}).`);
            printQueryResult(GRAPH_UNREACHABLE); // Treat invalid queries as unreachable.
            continue;
        }

        // Retrieve the final shortest distance for the current query.
        const computedDistance = finalShortestPathsMatrix[queryStartNode - 1][queryEndNode - 1];

        // Output the result using the helper function.
        printQueryResult(computedDistance);
      }
    };
  },

  // Module 6: Floyd-Warshall Algorithm Implementation
  function(moduleObject, exportsObject) {
    "use strict";
    // This module provides a standalone implementation of the Floyd-Warshall algorithm
    // for finding all-pairs shortest paths in a weighted graph.

    // Constant to represent an infinitely long or unreachable path.
    const PATH_UNREACHABLE_VALUE = 1_000_000_000; // Type III change: named constant, consistent with Module 5.

    /**
     * Computes all-pairs shortest paths for a given weighted graph using the Floyd-Warshall algorithm.
     * @param {Array<Array<number>>} adjacencyInputMatrix - The initial adjacency/distance matrix of the graph.
     *   `adjacencyInputMatrix[i][j]` should be the direct edge weight from i to j,
     *   or `PATH_UNREACHABLE_VALUE` if no direct edge exists. `adjacencyInputMatrix[i][i]` should be 0.
     * @returns {Array<Array<number>>} A new matrix where `resultMatrix[i][j]` is the shortest
     *   distance from node `i` to node `j`. Returns an empty array if input is invalid.
     */
    moduleObject.exports = function floydWarshallShortestPaths(adjacencyInputMatrix) { // Renamed function.
      // Type III change: Add input validation for the matrix.
      if (!adjacencyInputMatrix || !Array.isArray(adjacencyInputMatrix) || adjacencyInputMatrix.length === 0) {
          console.warn("Floyd-Warshall algorithm called with an empty or invalid input matrix. Returning empty result.");
          return [];
      }

      const numberOfVertices = adjacencyInputMatrix.length;

      // Initialize the distance matrix as a deep copy of the input matrix.
      // Using `map` with `slice()` ensures a proper deep copy for a 2D array.
      // This is a Type III change for clarity and robustness in copying.
      const shortestPathDistances = adjacencyInputMatrix.map(row => row.slice()); // Renamed variable, improved copy.

      // The core Floyd-Warshall algorithm logic.
      // The outer loop iterates through all possible intermediate vertices 'k'.
      for (let kIntermediateVertex = 0; kIntermediateVertex < numberOfVertices; kIntermediateVertex++) { // Renamed loop variable.
        // The middle loop iterates through all possible source vertices 'i'.
        for (let iSourceVertex = 0; iSourceVertex < numberOfVertices; iSourceVertex++) { // Renamed loop variable.
          // The inner loop iterates through all possible destination vertices 'j'.
          for (let jDestinationVertex = 0; jDestinationVertex < numberOfVertices; jDestinationVertex++) { // Renamed loop variable.

            // Calculate the potential distance from 'i' to 'j' by going through 'k'.
            // Type III change: Add explicit checks for `PATH_UNREACHABLE_VALUE` before summing.
            // This prevents `Infinity + X` from staying `Infinity` when `X` might be a large number
            // but not `Infinity`, which could lead to incorrect comparisons if not handled.
            if (shortestPathDistances[iSourceVertex][kIntermediateVertex] === PATH_UNREACHABLE_VALUE ||
                shortestPathDistances[kIntermediateVertex][jDestinationVertex] === PATH_UNREACHABLE_VALUE) {
                // If either segment of the path via k is unreachable, this path via k is also unreachable.
                continue;
            }

            const distanceThroughK = shortestPathDistances[iSourceVertex][kIntermediateVertex] + shortestPathDistances[kIntermediateVertex][jDestinationVertex];

            // If the path from 'i' to 'j' through 'k' is shorter than the currently known shortest path, update it.
            if (distanceThroughK < shortestPathDistances[iSourceVertex][jDestinationVertex]) {
              shortestPathDistances[iSourceVertex][jDestinationVertex] = distanceThroughK;
            }
          }
        }
      }

      return shortestPathDistances; // Return the matrix with all-pairs shortest paths.
    };
  }
]));