// This module wrapper acts as a simplified runtime environment,
// managing the loading and caching of application components.
// It simulates a basic module system by defining and executing modules
// based on their numeric identifiers.
module.exports = function(applicationComponents) {
  // A lookup table to store the exports of modules once they have been loaded.
  const componentCache = {};

  /**
   * The central function responsible for retrieving and executing modules.
   * If a module has been previously loaded, its cached exports are returned.
   * Otherwise, the module's definition is executed, its exports are stored,
   * and then returned.
   * @param {number} componentId - The unique numeric identifier for the module.
   * @returns {object} The public interface (exports) of the requested module.
   */
  function retrieveAndExecuteComponent(componentId) {
    // Check if the component is already present in our cache.
    if (componentCache[componentId]) {
      return componentCache[componentId].exportedData;
    }

    // If not cached, prepare a new component entry.
    // 'identifier': The component's unique ID.
    // 'isInitialized': A flag indicating if the component's code has run.
    // 'exportedData': The object that will hold the component's public API.
    const currentComponent = componentCache[componentId] = {
      identifier: componentId,
      isInitialized: false,
      exportedData: {}
    };

    // Execute the component's definition function.
    // This function receives its `exportedData` object, the `currentComponent` object itself,
    // and a reference to `retrieveAndExecuteComponent` (allowing nested module imports).
    applicationComponents[componentId].call(
      currentComponent.exportedData,
      currentComponent.exportedData,
      currentComponent,
      retrieveAndExecuteComponent
    );

    // Mark the component as fully initialized after its execution.
    currentComponent.isInitialized = true;

    // Return the exports of the newly loaded component.
    return currentComponent.exportedData;
  }

  // Attach the full collection of component definitions for internal referencing.
  retrieveAndExecuteComponent.allDefinitions = applicationComponents;
  // Attach the component cache for internal referencing.
  retrieveAndExecuteComponent.currentCache = componentCache;
  // Define the designated starting component's ID.
  retrieveAndExecuteComponent.initialComponentID = 0;

  // Initiate the application by executing the primary entry point component.
  return retrieveAndExecuteComponent(retrieveAndExecuteComponent.initialComponentID);
}([
  // --- Component 0: Main Application Starter ---
  // This module handles reading input, basic validation, and delegates processing.
  function(componentExports, componentContext, getComponent) {
    // Define the standard input stream path for POSIX-like systems.
    const SYSTEM_INPUT_FILE_PATH = "/dev/stdin";

    // Obtain the native Node.js 'fs' (file system) module.
    const fileSystemModule = getComponent(3);

    let rawInputContent;
    try {
      // Attempt to synchronously read all content from the standard input.
      rawInputContent = fileSystemModule.readFileSync(SYSTEM_INPUT_FILE_PATH, "UTF-8");
    } catch (inputReadError) {
      // Log any errors encountered during input reading.
      console.error(`Failed to read from standard input at '${SYSTEM_INPUT_FILE_PATH}':`, inputReadError.message);
      // Provide an empty string as fallback to prevent subsequent processing errors.
      rawInputContent = "";
    }

    // Split the entire input content into an array of individual lines.
    // The regex handles both Unix-style (\n) and Windows-style (\r\n) line endings.
    const allInputTextLines = rawInputContent.split(/\r?\n/);

    // Perform a check for empty or effectively empty input.
    if (allInputTextLines.length === 0 || (allInputTextLines.length === 1 && allInputTextLines[0].trim() === '')) {
      console.warn("Warning: Standard input was empty or contained only whitespace. No data to process.");
      return; // Terminate execution if no meaningful input is provided.
    }

    // Pass the array of input lines to the primary data processing component (Component 1).
    getComponent(1)(allInputTextLines);
  },

  // --- Component 1: Data Parsing and Path Cost Aggregation ---
  // This component interprets structured input, computes shortest paths,
  // and aggregates costs based on defined traversal sequences.
  function(componentExports, componentContext, getComponent) {
    // Utility function to convert a string of space-separated numbers into an array of integers.
    const convertStringToNumberArray = (textLine) => {
      if (typeof textLine !== 'string' || textLine.trim() === '') {
        return []; // Return an empty array for invalid or empty input strings.
      }
      return textLine.split(" ").map(val => parseInt(val, 10));
    };

    // Constant defining the expected number of initial cost configuration rows.
    const NUM_INITIAL_COST_ROWS = 10;
    // Constant defining the line offset from the beginning of input where path definitions start.
    const PATH_DATA_START_LINE_OFFSET = NUM_INITIAL_COST_ROWS + 1; // After dimension line and initial costs.

    // The main function exposed by this module to process a collection of input lines.
    componentContext.exports = function(rawInputLines) {
      // Basic validation for the input array.
      if (!Array.isArray(rawInputLines) || rawInputLines.length < PATH_DATA_START_LINE_OFFSET) {
        console.error("Error: Insufficient input lines provided for complete processing.");
        return;
      }

      // Parse the first line to extract two primary dimensions (e.g., matrix size, counts).
      const parsedDimensions = convertStringToNumberArray(rawInputLines[0]);
      if (parsedDimensions.length !== 2 || isNaN(parsedDimensions[0]) || isNaN(parsedDimensions[1])) {
        console.error("Error: First input line must contain exactly two valid numbers for dimensions.");
        return;
      }
      const primaryCount = parsedDimensions[0]; // Corresponds to 'e' in original
      const secondaryCount = parsedDimensions[1]; // Corresponds to 'u' in original

      // Collect and parse the initial cost configurations from the subsequent lines.
      const initialCostConfigurations = [];
      for (let currentLineIdx = 0; currentLineIdx < NUM_INITIAL_COST_ROWS; currentLineIdx++) {
        const lineContent = rawInputLines[currentLineIdx + 1]; // +1 to skip the dimension line.
        if (!lineContent) {
          console.error(`Error: Missing initial cost configuration line at expected index ${currentLineIdx + 1}.`);
          return;
        }
        initialCostConfigurations.push(convertStringToNumberArray(lineContent));
      }

      // Load the shortest path computation algorithm (Floyd-Warshall) from Component 2.
      const calculateShortestPaths = getComponent(2);

      // Compute the all-pairs shortest paths using the collected initial cost data.
      const computedShortestPathMatrix = calculateShortestPaths(initialCostConfigurations);

      // Initialize a variable to accumulate the final calculated cost.
      let finalAccumulatedCost = 0;

      // Process the remaining input lines, which define specific paths to traverse.
      // These lines start after the initial dimensions and cost configurations.
      for (let pathSegmentIdx = 0; pathSegmentIdx < primaryCount; pathSegmentIdx++) {
        const pathLineContent = rawInputLines[pathSegmentIdx + PATH_DATA_START_LINE_OFFSET];
        if (!pathLineContent) {
          console.error(`Error: Missing path definition line at expected index ${pathSegmentIdx + PATH_DATA_START_LINE_OFFSET}.`);
          return;
        }
        const currentPathNodes = convertStringToNumberArray(pathLineContent);

        // Iterate through each node in the current path definition.
        for (let nodeInPathIdx = 0; nodeInPathIdx < secondaryCount; nodeInPathIdx++) {
          const currentNodeIdentifier = currentPathNodes[nodeInPathIdx];

          // Check if the node identifier is valid (not -1, which is often used as a sentinel for invalid/skipped nodes).
          if (currentNodeIdentifier !== -1) {
            // Retrieve the relevant cost from the computed shortest path matrix.
            // The original code used `l[s[d]][1]`, implying `computedShortestPathMatrix[currentNodeIdentifier][1]`.
            // This suggests that the matrix's rows represent nodes, and the column at index 1 holds a specific cost component.
            // This interpretation is maintained for functional equivalence.
            if (computedShortestPathMatrix[currentNodeIdentifier] &&
                computedShortestPathMatrix[currentNodeIdentifier][1] !== undefined) {
                 finalAccumulatedCost += computedShortestPathMatrix[currentNodeIdentifier][1];
            } else {
                 console.warn(`Warning: Could not find valid cost data for node ID ${currentNodeIdentifier} at index 1.`);
            }
          }
        }
      }

      // Output the final accumulated cost to the console.
      console.log(finalAccumulatedCost);
    };
  },

  // --- Component 2: Floyd-Warshall All-Pairs Shortest Path Algorithm ---
  // This module provides an implementation of the Floyd-Warshall algorithm
  // to find the shortest paths between all pairs of nodes in a graph.
  function(componentExports, componentContext, getComponent) {
    /**
     * Calculates the all-pairs shortest paths for a given graph.
     * @param {Array<Array<number>>} graphAdjacencyMatrix - A 2D array representing the graph's direct edge costs.
     *                                                        graphAdjacencyMatrix[i][j] is the cost from node i to node j.
     * @returns {Array<Array<number>>} A new 2D array where result[i][j] is the shortest path cost from i to j.
     */
    componentContext.exports = function(graphAdjacencyMatrix) {
      // Validate the input matrix.
      if (!Array.isArray(graphAdjacencyMatrix) || graphAdjacencyMatrix.length === 0) {
        console.warn("Floyd-Warshall: Input graph matrix is empty or invalid. Returning an empty matrix.");
        return [];
      }

      const numberOfNodes = graphAdjacencyMatrix.length;
      // Initialize the distance matrix as a deep copy of the input adjacency matrix.
      // This is crucial to avoid modifying the original data and to ensure each element
      // is a distinct number, not a reference to the original.
      const shortestPathDistances = Array.from({ length: numberOfNodes }, (_, rowIdx) =>
        Array.from(graphAdjacencyMatrix[rowIdx])
      );

      // The core Floyd-Warshall algorithm:
      // Iterate through all possible nodes to be an intermediate point ('k').
      for (let intermediateVertex = 0; intermediateVertex < numberOfNodes; intermediateVertex++) {
        // Iterate through all possible source nodes ('i').
        for (let sourceVertex = 0; sourceVertex < numberOfNodes; sourceVertex++) {
          // Iterate through all possible destination nodes ('j').
          for (let destinationVertex = 0; destinationVertex < numberOfNodes; destinationVertex++) {
            // Calculate the potential new path distance from source to destination
            // by going through the current intermediate vertex.
            const pathCostThroughIntermediate = shortestPathDistances[sourceVertex][intermediateVertex] +
                                                shortestPathDistances[intermediateVertex][destinationVertex];

            // If this new path is shorter than the currently known shortest path
            // from source to destination, update the shortestPathDistances matrix.
            if (shortestPathDistances[sourceVertex][destinationVertex] > pathCostThroughIntermediate) {
              shortestPathDistances[sourceVertex][destinationVertex] = pathCostThroughIntermediate;
            }
          }
        }
      }

      return shortestPathDistances;
    };
  },

  // --- Component 3: Node.js File System (FS) Module Exporter ---
  // This small component simply exports the native 'fs' module from the Node.js runtime,
  // making it available to other components within this custom module system.
  function(componentExports, componentContext, getComponent) {
    // Directly expose the built-in 'fs' module.
    componentContext.exports = require("fs");
  }
]);