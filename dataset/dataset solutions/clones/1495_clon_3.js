function processPointRelationships(rawDataInput) {
  // Parse raw input by splitting into lines, trimming whitespace, and then
  // splitting each line by space. Convert all resulting string parts to numbers.
  // This handles potential empty lines and ensures numeric data.
  const parsedDataLines = rawDataInput.trim().split("\n").map(line => line.split(" ").map(Number));

  // Validate the initial input structure. The first line should contain 'N'.
  if (!parsedDataLines || parsedDataLines.length === 0 || isNaN(parsedDataLines[0][0])) {
    // If the first line is missing or doesn't start with a valid number, log an error and exit.
    console.error("Input processing error: Expected a numeric value for N on the first line.");
    return;
  }

  // Extract the total number of data points from the first element of the first line.
  const numberOfEntities = parsedDataLines[0][0];

  // Prepare an array to store structured coordinate objects.
  // We skip the first line as it contains 'N', and process subsequent lines.
  const entityCoordinates = [];
  for (let k = 1; k <= numberOfEntities; k++) { // Loop from 1 up to N (inclusive, matching input structure)
    const currentLineData = parsedDataLines[k];
    if (currentLineData && currentLineData.length >= 2 && !isNaN(currentLineData[0]) && !isNaN(currentLineData[1])) {
      // Store coordinates as objects for better readability and access.
      entityCoordinates.push({ xCoord: currentLineData[0], yCoord: currentLineData[1] });
    } else {
      // Log a warning for any malformed or missing coordinate data lines.
      console.warn(`Skipping invalid or incomplete coordinate data for entity at input line ${k + 1}.`);
    }
  }

  // Define a utility function to determine if two points exhibit mutual dominance.
  // Mutual dominance means one point is strictly smaller than the other in both X and Y dimensions.
  const arePointsMutuallyDominant = (pointAlpha, pointBeta) => {
    const isAlphaSmallerThanBeta = (pointAlpha.xCoord < pointBeta.xCoord && pointAlpha.yCoord < pointBeta.yCoord);
    const isBetaSmallerThanAlpha = (pointBeta.xCoord < pointAlpha.xCoord && pointBeta.yCoord < pointAlpha.yCoord);
    return isAlphaSmallerThanBeta || isBetaSmallerThanAlpha;
  };

  // This function calculates how many other points are mutually dominant with a given base point.
  // It takes the 0-indexed position and the coordinates of the base point.
  const calculateDominanceConnectionCount = (baseEntityIndex, currentX, currentY) => {
    // The count is initialized to 1. This implies the base entity itself is counted
    // as part of the group or chain, even though it's explicitly skipped in the comparison loop.
    // This behavior aligns with the original code's explicit comment and initialization.
    let connectedEntitiesCount = 1;

    // Iterate through all entities to compare with the base entity.
    // Using 0-indexed loop for direct array access to `entityCoordinates`.
    for (let comparisonIndex = 0; comparisonIndex < numberOfEntities; comparisonIndex++) {
      // If the comparison entity is the same as the base entity, skip to avoid self-comparison.
      if (baseEntityIndex === comparisonIndex) {
        continue;
      }

      // Retrieve the coordinates of the entity being compared.
      const otherEntity = entityCoordinates[comparisonIndex];

      // Add a safety check in case an entity was skipped during initial parsing.
      if (!otherEntity) {
        console.warn(`Skipping comparison for missing entity at index ${comparisonIndex}.`);
        continue;
      }

      // Use the dedicated helper function to check the dominance condition.
      const basePointForComparison = { xCoord: currentX, yCoord: currentY };
      if (arePointsMutuallyDominant(basePointForComparison, otherEntity)) {
        connectedEntitiesCount++; // Increment the count if the condition is met.
      }
    }
    return connectedEntitiesCount; // Return the final tally.
  };

  // Main loop to process each entity and determine its dominance connections.
  // Iterates from 0 to numberOfEntities - 1, using 0-indexed array access.
  for (let entityPos = 0; entityPos < numberOfEntities; entityPos++) {
    const currentEntity = entityCoordinates[entityPos];

    // Ensure the current entity's data is valid before processing.
    if (!currentEntity) {
      console.warn(`Skipping calculations for entity at position ${entityPos + 1} due to missing data.`);
      continue;
    }

    // Call the helper function to get the dominance count for the current entity.
    const resultForThisEntity = calculateDominanceConnectionCount(
      entityPos,
      currentEntity.xCoord,
      currentEntity.yCoord
    );

    // Output the result for the current entity, using 1-based indexing for user-friendliness.
    console.log(`Calculated connections for entity #${entityPos + 1}: ${resultForThisEntity}`);
  }
}

// This section handles the program's entry point, reading input from stdin.
// It uses Node.js 'fs' module to synchronously read the entire file content.
// The read content is then passed to the main processing function.
processPointRelationships(require("fs").readFileSync("/dev/stdin", "utf8"));