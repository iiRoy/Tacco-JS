function determineTileType(blockSize, coordI, coordJ) {
  // Check if the coordinates fall within the first 'B' (black) block region
  if (0 <= coordI && coordI < blockSize && 0 <= coordJ && coordJ < blockSize) {
    return "B";
  }
  // Check if the coordinates fall within the second 'B' (black) block region,
  // which is offset by 'blockSize' in both dimensions
  else if (blockSize <= coordI && coordI < 2 * blockSize && blockSize <= coordJ && coordJ < 2 * blockSize) {
    return "B";
  }
  // If neither of the 'B' conditions are met, the tile is 'W' (white)
  return "W";
}

// The primary function to process the input data
function ProcessInputData(inputLines) {
  // Parse the first line of input to get the number of points and the block size
  const firstLineParts = inputLines[0].split(" ");
  const numPoints = parseInt(firstLineParts[0], 10);
  const blockSize = parseInt(firstLineParts[1], 10);

  // An array to store the transformed coordinates and colors of the points
  const transformedPoints = [];

  // Iterate through each point provided in the input
  for (let pointIndex = 1; pointIndex <= numPoints; pointIndex++) {
    const currentPointParts = inputLines[pointIndex].split(" ");
    const originalX = parseInt(currentPointParts[0], 10);
    const originalY = parseInt(currentPointParts[1], 10);
    const originalColor = currentPointParts[2];

    // Calculate the coordinates relative to the current block (modulo blockSize)
    const normalizedX = originalX % blockSize;
    const normalizedY = originalY % blockSize;

    // Determine if a color shift is needed based on the "checkerboard" pattern of blocks.
    // This involves checking the parity of the block's row and column indices.
    // If the sum of parities is odd, the color needs to be reversed ("R").
    const colorShiftPattern = (
      (Math.floor((originalX - normalizedX) / blockSize) % 2) +
      (Math.floor((originalY - normalizedY) / blockSize) % 2)
    ) % 2 === 1 ? "R" : "N"; // "N" means No change

    let adjustedColor = originalColor;

    // Apply the color adjustment if the pattern indicates a reversal
    if (colorShiftPattern === "R") {
      adjustedColor = (adjustedColor === "B") ? "W" : "B";
    }

    // Store the transformed point data.
    // If the adjusted color is 'W', its x-coordinate is effectively shifted by 'blockSize'
    // to align with the 'B' block logic in 'determineTileType'.
    transformedPoints[pointIndex - 1] = [];
    transformedPoints[pointIndex - 1][0] = (adjustedColor === "W") ? normalizedX + blockSize : normalizedX;
    transformedPoints[pointIndex - 1][1] = normalizedY;
  }

  let highestMatchCount = 0; // Variable to keep track of the maximum number of matches found

  // Iterate through all possible horizontal offsets (offsetX) and vertical offsets (offsetY)
  // to find the configuration that yields the most 'B' matches.
  // The offsetY ranges from 0 to 2*blockSize - 1, and offsetX from 0 to blockSize - 1.
  for (let offsetY = 0; offsetY < 2 * blockSize; offsetY++) {
    for (let offsetX = 0; offsetX < blockSize; offsetX++) {

      let currentMatchCount = 0; // Counter for matches in the current offset configuration

      // For each offset combination, check all transformed points
      for (let pointIdx = 0; pointIdx < numPoints; pointIdx++) {
        const pointCoordI = transformedPoints[pointIdx][0];
        const pointCoordJ = transformedPoints[pointIdx][1];

        // Call the tile type determination function with the current point's coordinates
        // and the applied offsets.
        if ("B" === determineTileType(blockSize, offsetX + pointCoordI, offsetY + pointCoordJ)) {
          currentMatchCount++; // Increment if the point falls on a 'B' tile
        }
      }

      // Update the highest match count if the current configuration is better
      if (highestMatchCount < currentMatchCount) {
        highestMatchCount = currentMatchCount;
      }

      // Optimization: If all points already match, no further checks are needed
      if (highestMatchCount === numPoints) {
        break;
      }
    }
    // Optimization: If all points already match, exit the outer loop as well
    if (highestMatchCount === numPoints) {
      break;
    }
  }

  // Output the final highest match count to the console
  console.log('%s', highestMatchCount);
}

// Read the input from standard input, decode it as UTF-8, split by newlines,
// and then pass it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
