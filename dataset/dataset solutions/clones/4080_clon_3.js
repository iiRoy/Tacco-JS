function determineTileColor(baseColorIdentifier, tileDimension, verticalPosition, horizontalPosition) {
  // Calculate common multiples of tileDimension for boundary checks
  const doubleDimension = 2 * tileDimension;
  const tripleDimension = 3 * tileDimension;

  // Determine if the given coordinates fall within specific regions that should retain the base color
  // Region 1: Top-left KxK block (0 <= row < K, 0 <= col < K)
  const isInFirstDefinedArea = (verticalPosition >= 0 && verticalPosition < tileDimension &&
                                horizontalPosition >= 0 && horizontalPosition < tileDimension);

  // Region 2: Middle-right KxK block (K <= row < 2K, K <= col < 2K)
  const isInSecondDefinedArea = (verticalPosition >= tileDimension && verticalPosition < doubleDimension &&
                                 horizontalPosition >= tileDimension && horizontalPosition < doubleDimension);

  // Region 3: Bottom-left KxK block (2K <= row < 3K, 0 <= col < K)
  const isInThirdDefinedArea = (verticalPosition >= doubleDimension && verticalPosition < tripleDimension &&
                                horizontalPosition >= 0 && horizontalPosition < tileDimension);

  // If the coordinates match any of these three specific areas, the tile's color is the base color.
  if (isInFirstDefinedArea || isInSecondDefinedArea || isInThirdDefinedArea) {
    return baseColorIdentifier;
  }

  // Otherwise, the tile's color is the inverse of the base color.
  const invertedColor = (baseColorIdentifier === "B") ? "W" : "B";
  return invertedColor;
}

function processGridData(rawDataLines) {
  // Ensure input data is valid and not empty
  if (!rawDataLines || rawDataLines.length < 1) {
    console.error("No input data provided or input is malformed.");
    return;
  }

  // Parse configuration parameters from the first line of input
  const configurationParts = rawDataLines[0].split(" ");
  const totalPointCount = Number.parseInt(configurationParts[0], 10);
  const gridUnitDimension = Number.parseInt(configurationParts[1], 10);

  // Array to hold all processed and normalized point details
  const transformedPointDetails = [];

  // Iterate through each data point line, starting from the second line of input
  for (let pointIndex = 0; pointIndex < totalPointCount; pointIndex++) {
    const currentDataLine = rawDataLines[pointIndex + 1];

    // Skip processing if a line is unexpectedly missing or empty
    if (!currentDataLine || currentDataLine.trim() === "") {
        continue;
    }

    const pointComponents = currentDataLine.split(" ");
    const originalXCoord = Number.parseInt(pointComponents[0], 10);
    const originalYCoord = Number.parseInt(pointComponents[1], 10);
    let initialColorChar = pointComponents[2]; // 'let' as it might be modified

    // Calculate normalized coordinates within a single grid unit (0 to K-1)
    let normalizedXPosition = originalXCoord % gridUnitDimension;
    let normalizedYPosition = originalYCoord % gridUnitDimension;

    // Determine the block coordinates for parity checking
    const blockXIndex = Math.floor(originalXCoord / gridUnitDimension);
    const blockYIndex = Math.floor(originalYCoord / gridUnitDimension);

    // Check if the sum of block coordinate parities is odd (X_block % 2 + Y_block % 2) % 2 == 1
    // This determines if a color inversion is needed based on the region
    const requiresColorInversion = ((blockXIndex % 2) + (blockYIndex % 2)) % 2 === 1;

    // Apply color transformation based on region parity
    let finalProcessedColor = initialColorChar;
    if (requiresColorInversion) {
      finalProcessedColor = (initialColorChar === "B") ? "W" : "B";
    }

    // Critical transformation: If the point's final color is 'W',
    // convert it to 'B' and shift its X coordinate by 'gridUnitDimension'.
    // This allows the `determineTileColor` function to always be called with "B"
    // in the matching phase, simplifying the logic.
    if (finalProcessedColor === "W") {
      finalProcessedColor = "B"; // Treat as a black tile
      normalizedXPosition += gridUnitDimension; // Shift its effective position
    }

    // Store the fully processed point data as an object
    transformedPointDetails.push({
      xPosition: normalizedXPosition,
      yPosition: normalizedYPosition,
      processedColor: finalProcessedColor
    });
  }

  // Initialize the maximum match count found so far
  let highestAchievedMatches = 0;

  // Define the search range for offsets (0 to 2K-1 for both X and Y)
  const offsetSearchRange = 2 * gridUnitDimension;

  // Iterate through all possible X and Y offsets within a 2K x 2K search space
  for (let currentXOffset = 0; currentXOffset < offsetSearchRange; currentXOffset++) {
    for (let currentYOffset = 0; currentYOffset < offsetSearchRange; currentYOffset++) {

      // Counter for matches in the current (xOffset, yOffset) configuration
      let matchesForCurrentOffset = 0;

      // Check each transformed point against the current offset configuration
      for (let pIdx = 0; pIdx < transformedPointDetails.length; pIdx++) {
        const pointData = transformedPointDetails[pIdx];
        const pointLocalX = pointData.xPosition;
        const pointLocalY = pointData.yPosition;
        const pointTargetColor = pointData.processedColor;

        // Calculate the effective coordinates for the `determineTileColor` function
        const effectiveRow = currentXOffset + pointLocalX;
        const effectiveCol = currentYOffset + pointLocalY;

        // Determine the expected color at the effective position.
        // Always use "B" as the base color due to the earlier 'W' to 'B' transformation.
        const expectedGridColor = determineTileColor("B", gridUnitDimension, effectiveRow, effectiveCol);

        // If the point's target color matches the expected grid color, increment match count
        if (pointTargetColor === expectedGridColor) {
          matchesForCurrentOffset++;
        }
      }

      // Update the overall highest match count if current configuration is better
      if (matchesForCurrentOffset > highestAchievedMatches) {
        highestAchievedMatches = matchesForCurrentOffset;
      }

      // Optimization: If all points have matched, no further searching is necessary
      if (highestAchievedMatches === totalPointCount) {
        break; // Exit inner loop (Y offset)
      }
    }
    // Optimization: If all points have matched, no further searching is necessary
    if (highestAchievedMatches === totalPointCount) {
      break; // Exit outer loop (X offset)
    }
  }

  // Output the final maximum number of matches found
  console.log(highestAchievedMatches);
}

// Entry point: Read input from standard input and pass to the main processing function
processGridData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));