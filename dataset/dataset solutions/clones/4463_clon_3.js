(function() {
  'use strict';

  /**
   * Orchestrates the entire data processing and reachability check.
   * This function serves as the primary entry point for the application logic.
   * @param {string} rawData - The raw input string containing configuration and route details.
   */
  function processInputData(rawData) {
    // Step 1: Extract initial configuration parameters and route data from the raw input.
    let configurationElements;
    try {
      configurationElements = extractInitialParams(rawData);
    } catch (error) {
      console.error("Error during initial parameter extraction:", error.message);
      outputVerdict(false); // Indicate failure due to parsing error
      return;
    }

    // Basic validation for the parsed configuration.
    if (!Array.isArray(configurationElements) || configurationElements.length !== 2) {
      console.error("Error: Invalid configuration elements parsed (expected array of 2).");
      outputVerdict(false); // Indicate failure due to parsing error
      return;
    }

    // Deconstruct the parsed data for clarity.
    const [allFerryRoutes, finalTargetNode] = configurationElements;

    // Additional validation for the extracted data
    if (!allFerryRoutes || !Array.isArray(allFerryRoutes) || typeof finalTargetNode !== 'number') {
      console.error("Error: Malformed ferry routes or target node after extraction.");
      outputVerdict(false);
      return;
    }

    // Step 2: Determine if the final target node is reachable from the starting node (assumed 1).
    const reachabilityStatus = determineConnectivity(allFerryRoutes, finalTargetNode);

    // Step 3: Display the final outcome to the user.
    outputVerdict(reachabilityStatus);
  }

  /**
   * Parses the raw input string to extract initial configuration values.
   * This includes the destination island identifier and the list of ferry routes.
   * @param {string} rawInputText - The complete input string.
   * @returns {Array<Array<string[]>, number>} An array containing the parsed ferry routes and the target island ID.
   * @throws {Error} If input is malformed or missing.
   */
  const extractInitialParams = (rawInputText) => {
    const inputLines = rawInputText.trim().split("\n"); // Trim to handle empty lines at end

    if (inputLines.length === 0) {
      throw new Error("No input lines provided for parsing.");
    }

    const firstLineContent = inputLines[0];
    if (!firstLineContent) {
      throw new Error("First line of input is empty.");
    }
    const firstLineTokens = firstLineContent.split(" ");

    if (firstLineTokens.length < 2) {
      throw new Error("First line of input is malformed; expected at least two tokens (goal island, ferry count).");
    }

    // Convert the first token to an integer, representing the goal island.
    const destinationIslandId = parseInt(firstLineTokens[0], 10);
    // Convert the second token to an integer, representing the total number of ferry connections.
    const numFerryConnections = parseInt(firstLineTokens[1], 10);

    if (isNaN(destinationIslandId) || isNaN(numFerryConnections)) {
      throw new Error("First line contains non-numeric values for island ID or ferry count.");
    }
    if (numFerryConnections < 0) {
        throw new Error("Number of ferry connections cannot be negative.");
    }

    // Delegate to a helper function to parse the detailed ferry connections.
    const ferryConnectionList = parseFerryConnections(numFerryConnections, inputLines);

    // Return both the processed ferry routes and the destination island.
    // This fixes the original code's logical error where it only returned the last element.
    return [ferryConnectionList, destinationIslandId];
  };

  /**
   * Parses specific lines from the input to create a list of ferry connections.
   * Each connection is represented as an array of two strings: [startNode, endNode].
   * @param {number} numFerryRoutes - The expected number of ferry routes to parse.
   * @param {string[]} allInputLines - All lines of the input data.
   * @returns {string[][]} An array where each element is an array representing a ferry route.
   */
  const parseFerryConnections = (numFerryRoutes, allInputLines) => {
    const ferryConnectionList = []; // Using array literal for initialization

    // Loop through the lines that contain ferry route definitions.
    // These start from the second line of input (index 1).
    for (let routeIndex = 0; routeIndex < numFerryRoutes; routeIndex++) {
      const currentLineDataIndex = routeIndex + 1;
      if (currentLineDataIndex >= allInputLines.length) {
        console.warn(`Warning: Expected ${numFerryRoutes} routes but ran out of input lines after ${routeIndex} routes.`);
        break; // Stop if we run out of input lines prematurely
      }

      const routeLine = allInputLines[currentLineDataIndex];
      if (!routeLine) {
         console.warn(`Warning: Empty line found for route ${currentLineDataIndex}. Skipping.`);
         continue;
      }
      const routeTokens = routeLine.split(" ");

      // A valid route must have exactly two components: a start and an end node.
      if (routeTokens.length === 2) {
        ferryConnectionList.push(routeTokens);
      } else {
        console.warn(`Warning: Malformed route data on line ${currentLineDataIndex + 1}: "${routeLine}". Expected 2 tokens, found ${routeTokens.length}. Skipping.`);
      }
    }
    return ferryConnectionList;
  };

  /**
   * Determines if the final destination island is reachable from the starting island (node '1')
   * via a sequence of exactly two ferry connections.
   * This directly mirrors the logic of the original 'canReachCheck' function.
   * @param {string[][]} connectionDetails - An array of ferry routes, e.g., [["1","2"], ["2","3"]].
   * @param {number} finalDestination - The integer ID of the target island.
   * @returns {boolean} True if the destination is reachable via a 2-hop path, false otherwise.
   */
  const determineConnectivity = (connectionDetails, finalDestination) => {
    // If there are no connections, or not enough for a 2-hop path, it's not reachable.
    if (!connectionDetails || connectionDetails.length < 2) {
      return false;
    }

    // Outer loop: Find a first hop starting from island '1'.
    for (let currentRouteIdx = 0; currentRouteIdx < connectionDetails.length; currentRouteIdx++) {
      const firstHopRaw = connectionDetails[currentRouteIdx];

      // Validate the first hop route data.
      if (!firstHopRaw || firstHopRaw.length !== 2) {
        continue; // Skip malformed route
      }

      const firstHopStartNode = parseInt(firstHopRaw[0], 10);
      const firstHopEndNode = parseInt(firstHopRaw[1], 10);

      // Check if the first hop starts at island '1'.
      if (firstHopStartNode === 1) { // Original logic: `shipVariations[variationIndex1][0]=== "1"`
        // Inner loop: Find a second hop that connects from the end of the first hop to the final destination.
        for (let nextRouteIdx = 0; nextRouteIdx < connectionDetails.length; nextRouteIdx++) {
          const secondHopRaw = connectionDetails[nextRouteIdx];

          // Validate the second hop route data.
          if (!secondHopRaw || secondHopRaw.length !== 2) {
            continue; // Skip malformed route
          }

          const secondHopStartNode = parseInt(secondHopRaw[0], 10);
          const secondHopEndNode = parseInt(secondHopRaw[1], 10);

          // Check if the second hop starts where the first hop ended.
          if (secondHopStartNode === firstHopEndNode) {
            // Check if the second hop reaches the final destination.
            if (secondHopEndNode === finalDestination) {
              return true; // Path 1 -> firstHopEndNode -> finalDestination found!
            }
          }
        }
      }
    }

    return false; // No 2-hop path found from island 1 to the final destination.
  };

  /**
   * Prints the outcome of the reachability check to the console.
   * @param {boolean} isReachable - True if the destination is reachable, false otherwise.
   */
  const outputVerdict = (isReachable) => {
    // Use a ternary operator for a slightly different structure.
    const message = isReachable ? 'POSSIBLE' : 'IMPOSSIBLE';
    console.log(message);
  };

  // --- Application Entry Point ---
  // Define the standard input path.
  const stdInputFilePath = "/dev/stdin";
  try {
    // Attempt to read the entire content of the standard input file.
    const fileContent = require("fs").readFileSync(stdInputFilePath, "utf8");
    // Process the read content.
    processInputData(fileContent);
  } catch (error) {
    // If an error occurs during file reading or processing, log it and output 'IMPOSSIBLE'.
    console.error(`An error occurred during input processing: ${error.message}`);
    outputVerdict(false); // Indicate failure if input cannot be read or processed
  }

})();