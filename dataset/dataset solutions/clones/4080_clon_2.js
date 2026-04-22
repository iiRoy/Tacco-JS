function determineTileType(tileColor, unitSize, firstCoordParam, secondCoordParam) {
  // Check if the coordinates fall within the first specific block
  if (0 <= firstCoordParam && firstCoordParam < unitSize && 0 <= secondCoordParam && secondCoordParam < unitSize) {
    return tileColor;
  }
  // Check if the coordinates fall within the second specific block
  else if (unitSize <= firstCoordParam && firstCoordParam < 2 * unitSize && unitSize <= secondCoordParam && secondCoordParam < 2 * unitSize) {
    return tileColor;
  }
  // Check if the coordinates fall within the third specific block
  else if (2 * unitSize <= firstCoordParam && firstCoordParam < 3 * unitSize && 0 <= secondCoordParam && secondCoordParam < unitSize) {
    return tileColor;
  }
  // If no specific region matches, return the inverted tile color
  return tileColor === "DARK" ? "LIGHT" : "DARK";
}

function ProcessInputData(inputLines) {
  // Parse the initial configuration from the first line of input
  const configTokens = inputLines[0].split(" ");
  const totalEntries = parseInt(configTokens[0], 10);
  const gridDimension = parseInt(configTokens[1], 10);

  // Array to store the transformed coordinate and color records
  const transformedRecords = [];

  // Iterate through each subsequent line of input data
  for (let entryIndex = 1; entryIndex <= totalEntries; ++entryIndex) {
    const currentRecordParts = inputLines[entryIndex].split(" ");
    const originalX = parseInt(currentRecordParts[0], 10);
    const originalY = parseInt(currentRecordParts[1], 10);
    const originalChar = currentRecordParts[2];

    // Calculate the coordinates modulo the grid dimension
    let remainderX = originalX % gridDimension;
    let remainderY = originalY % gridDimension;

    // Determine a pattern based on the parity of integer divisions
    const xDivResult = Math.floor(originalX / gridDimension);
    const yDivResult = Math.floor(originalY / gridDimension);
    const paritySum = (xDivResult % 2) + (yDivResult % 2);
    const shouldFlipColor = (paritySum % 2) === 1; // True if sum of parities is odd

    let adjustedChar = originalChar;

    // Flip the color if the `shouldFlipColor` pattern is active
    if (shouldFlipColor) {
      adjustedChar = (adjustedChar === "DARK") ? "LIGHT" : "DARK";
    }

    // Standardize 'LIGHT' colors to 'DARK' by adjusting coordinates
    if (adjustedChar === "LIGHT") {
      adjustedChar = "DARK";
      // Shift the remainderX coordinate to effectively move it to an equivalent 'DARK' block
      remainderX += gridDimension;
    }

    // Store the processed data point: adjusted coordinates and standardized color
    transformedRecords[entryIndex - 1] = [remainderX, remainderY, adjustedChar];
  }

  let highestMatchCount = 0; // Initialize the maximum number of matches found

  // Iterate through a 2*gridDimension x 2*gridDimension search space for optimal offsets
  for (let yShiftOffset = 0; yShiftOffset < 2 * gridDimension; ++yShiftOffset) {
    for (let xShiftOffset = 0; xShiftOffset < 2 * gridDimension; ++xShiftOffset) {

      let currentDarkMatches = 0; // Counter for matches with "DARK" type in current offset

      // For each possible offset combination, check all transformed records
      for (let recordCursor = 0; recordCursor < totalEntries; ++recordCursor) {
        const recordX = transformedRecords[recordCursor][0];
        const recordY = transformedRecords[recordCursor][1];
        const recordColor = transformedRecords[recordCursor][2];

        // Compare the record's color with the color determined by the tile classification function
        if (recordColor === determineTileType("DARK", gridDimension, yShiftOffset + recordX, xShiftOffset + recordY)) {
          currentDarkMatches++;
        }
      }

      // Update the overall highest match count if the current one is greater
      if (highestMatchCount < currentDarkMatches) {
        highestMatchCount = currentDarkMatches;
      }
      
      // Optimization: If all entries match, we have found the maximum possible, so break early
      if (highestMatchCount === totalEntries) {
        break;
      }
    }
    // Optimization: If all entries match, break from the outer loop as well
    if (highestMatchCount === totalEntries) {
      break;
    }
  }

  // Print the final result to the console
  console.log(highestMatchCount);
}

// Read input from standard input, process it, and then execute the main logic
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));