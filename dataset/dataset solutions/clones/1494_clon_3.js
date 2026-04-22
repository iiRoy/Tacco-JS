const processCityConnections = (rawDataString) => {
  // This program determines, for each starting city, how many other cities
  // it can reach through a chain of 'comparable' cities.
  // A city is 'comparable' if it strictly dominates or is strictly dominated by another
  // in both X and Y coordinates.

  // --- Input Processing and Initial Setup ---

  // Validate raw input string presence.
  if (typeof rawDataString !== 'string' || rawDataString.trim().length === 0) {
    console.error("Error: Input data is missing or not a valid string.");
    // In a production system, one might throw an exception here.
    return;
  }

  // Split the input into individual lines and parse numerical values.
  // The first line should contain the total number of cities (N).
  // Subsequent lines provide city coordinates (x, y).
  const parsedLines = rawDataString.trim().split('\n').map((currentLine, lineIdx) => {
    const values = currentLine.split(/\s+/).map(valStr => {
      const num = parseInt(valStr, 10);
      if (isNaN(num)) {
        // Log a warning or error if non-numeric data is found.
        console.warn(`Warning: Non-numeric value '${valStr}' found on line ${lineIdx + 1}.`);
      }
      return num;
    });
    return values;
  });

  // Extract the total number of cities from the first processed line.
  // Implement robust checks for input structure.
  if (!parsedLines[0] || parsedLines[0].length === 0 || typeof parsedLines[0][0] !== 'number') {
    console.error("Error: First line (city count) is malformed or missing.");
    return;
  }
  const totalCityCount = parsedLines[0][0];

  // Validate the extracted city count.
  // Setting arbitrary reasonable limits for demonstration.
  if (totalCityCount <= 0 || totalCityCount > 100000) {
    console.error(`Error: Invalid city count: ${totalCityCount}. Must be a positive integer within reasonable bounds.`);
    return;
  }

  // Extract the city coordinate data, skipping the first line (which was N).
  const allCityCoordinates = parsedLines.slice(1, totalCityCount + 1);

  // Perform a sanity check to ensure the number of provided city data lines
  // matches the declared totalCityCount.
  if (allCityCoordinates.length !== totalCityCount) {
    console.error(`Error: Mismatch between declared city count (${totalCityCount}) and actual city data provided (${allCityCoordinates.length}).`);
    return;
  }

  // This array will store the final result for each starting city:
  // the total number of unique cities reachable from it.
  const reachabilityResults = new Array(totalCityCount);

  // --- Main Traversal Loop: BFS for each city as a starting point ---
  // Iterate through every city, using each one in turn as the initial node
  // for a Breadth-First Search (BFS) traversal.
  for (let baseCityIndex = 0; baseCityIndex < totalCityCount; ++baseCityIndex) {
    // For the current base city, we'll perform a BFS to find all cities
    // reachable from it based on the defined 'comparable' relationship.

    // `traversalQueue`: Stores city indices to be visited.
    // Using an array and a manual head pointer for efficient queue operations
    // (avoids O(N) `shift()` operations).
    const traversalQueue = [baseCityIndex];
    let queueHeadPointer = 0;

    // `visitedNodes`: A Set to keep track of all unique cities discovered
    // during the current BFS traversal. Sets offer O(1) average time complexity
    // for adding elements and checking for existence, which is crucial for performance.
    const visitedNodes = new Set();
    visitedNodes.add(baseCityIndex); // The starting city is always considered visited.

    // Continue the BFS as long as there are cities in the queue to process.
    while (queueHeadPointer < traversalQueue.length) {
      const currentNodeIndex = traversalQueue[queueHeadPointer++]; // Dequeue the next city.

      // Identify all cities that are directly 'comparable' to the `currentNodeIndex`.
      // This helper function encapsulates the original 'search' logic.
      const directComparables = identifyComparableLocations(currentNodeIndex, allCityCoordinates, totalCityCount);

      // Iterate through the newly found comparable cities.
      for (const comparableCityIdx of directComparables) {
        // If this comparable city has not been visited yet in this BFS traversal:
        if (!visitedNodes.has(comparableCityIdx)) {
          visitedNodes.add(comparableCityIdx);         // Mark it as visited.
          traversalQueue.push(comparableCityIdx);   // Add it to the queue for future processing.
        }
      }
    }
    // Once the BFS for `baseCityIndex` completes, the size of the `visitedNodes` Set
    // represents the total count of unique cities reachable from `baseCityIndex`.
    reachabilityResults[baseCityIndex] = visitedNodes.size;
  }

  // --- Output Generation ---
  // Join the calculated results with newline characters and print to console.
  console.log(reachabilityResults.join('\n'));
};

/**
 * Helper Function: identifyComparableLocations
 *
 * This function determines which cities are 'comparable' to a given source city.
 * A city is comparable if it strictly dominates the source city in both X and Y
 * coordinates, OR if the source city strictly dominates it in both X and Y coordinates.
 *
 * @param {number} sourceNodeIdx - The index of the city from which to find comparables.
 * @param {Array<Array<number>>} allLocationData - An array of [x, y] coordinate pairs for all cities.
 * @param {number} numCities - The total number of cities in `allLocationData`.
 * @returns {Array<number>} An array of indices of cities that are comparable to the source city.
 */
const identifyComparableLocations = (sourceNodeIdx, allLocationData, numCities) => {
  const comparableIndices = []; // Stores the indices of cities that meet the criteria.

  // Guard clause: Ensure the source node index is valid before proceeding.
  if (sourceNodeIdx < 0 || sourceNodeIdx >= numCities) {
    console.warn(`Warning: Invalid source node index (${sourceNodeIdx}) provided to identifyComparableLocations. Skipping.`);
    return comparableIndices;
  }

  // Deconstruct the coordinates of the source city for easier access.
  const [sourceCoordX, sourceCoordY] = allLocationData[sourceNodeIdx];

  // Iterate through all other cities to check for comparability.
  for (let targetNodeIdx = 0; targetNodeIdx < numCities; ++targetNodeIdx) {
    // A city cannot be comparable to itself in this context (as the condition
    // requires strict inequality, e.g., > or <, not >= or <=).
    if (sourceNodeIdx === targetNodeIdx) {
      continue;
    }

    // Deconstruct the coordinates of the target city.
    const [targetCoordX, targetCoordY] = allLocationData[targetNodeIdx];

    // Check for the 'dominance' condition in both dimensions.
    // Condition 1: Source city dominates target city.
    const sourceDominatesTarget = (sourceCoordX > targetCoordX && sourceCoordY > targetCoordY);
    // Condition 2: Target city dominates source city.
    const targetDominatesSource = (sourceCoordX < targetCoordX && sourceCoordY < targetCoordY);

    if (sourceDominatesTarget || targetDominatesSource) {
      comparableIndices.push(targetNodeIdx); // Add the index if the city is comparable.
    }
  }
  return comparableIndices;
};

// --- Execution Entry Point ---
// This block reads input from standard input and initiates the processing.
// It includes error handling for file reading.
try {
  // 'fs' module is part of Node.js for file system operations.
  const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
  processCityConnections(rawInputData);
} catch (error) {
  console.error("Error: Failed to read input from /dev/stdin. Please ensure the file exists and is accessible.");
  console.error("Details:", error.message);
  // Optionally, exit the process with an error code.
  // process.exit(1);
}