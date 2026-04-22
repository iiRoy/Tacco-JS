// Function to perform a 90-degree clockwise rotation on a given square 2D array
function rotateMatrix(subGrid) {
  const gridDim = subGrid.length;
  // Declare a new array to store the rotated version
  let rotatedGrid = [];

  // Initialize each row of the new grid as an empty array
  for (let r = 0; r < gridDim; r++) {
    rotatedGrid[r] = [];
  }

  // Iterate through the original grid to populate the rotated one
  for (let r = 0; r < gridDim; r++) {
    for (let c = 0; c < gridDim; c++) {
      // Apply the rotation transformation
      rotatedGrid[r][gridDim - c - 1] = subGrid[c][r];
    }
  }

  return rotatedGrid;
}

// Main function to handle input, process data, and find patterns
function processInputAndSearch() {
  var
    sourceMatrix, currentPattern, patternVariants,
    isMatchFound,
    mainRowOffset, mainColOffset,
    foundXCoord, foundYCoord, bestXCoord, bestYCoord,
    rotationIdx, patternRowIdx, patternColIdx,
    sourceRowsCount, patternSize, parsedLineData;

  // Outer loop that continuously reads input until a specific termination condition is met
  for (;;) {
    // Read and parse the first line of input, which contains matrix dimensions
    parsedLineData = rawInputData.shift().split(/\s+/).map(parseFloat);
    sourceRowsCount = parsedLineData[0];
    patternSize = parsedLineData[1];

    // Check if both dimensions are zero, indicating end of input
    if (sourceRowsCount === 0 && patternSize === 0) break;

    // Read the main source matrix data based on sourceRowsCount
    sourceMatrix = [];
    for (mainRowOffset = 0; mainRowOffset < sourceRowsCount; mainRowOffset++) {
      sourceMatrix.push(rawInputData.shift().split(/ +/).map(parseFloat));
    }

    // Read the initial pattern matrix data based on patternSize
    currentPattern = [];
    for (mainRowOffset = 0; mainRowOffset < patternSize; mainRowOffset++) {
      currentPattern.push(rawInputData.shift().split(/ +/).map(parseFloat));
    }

    // Generate and store all four 90-degree rotations of the pattern
    patternVariants = [];
    for (rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
      patternVariants.push(currentPattern);
      currentPattern = rotateMatrix(currentPattern); // Rotate for the next iteration
    }

    // Initialize best match coordinates to an impossibly large value
    bestXCoord = bestYCoord = 99999999;

    // Begin the comprehensive search across the source matrix
    overallScan:
    for (mainRowOffset = 0; mainRowOffset < sourceRowsCount - patternSize; mainRowOffset++) {
      for (mainColOffset = 0; mainColOffset < sourceRowsCount - patternSize; mainColOffset++) {
        for (rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
          isMatchFound = true; // Assume a match for the current position and rotation
          foundXCoord = foundYCoord = 0; // Reset match coordinates

          // Inner loops to compare the pattern variant with the current sub-matrix in the source
          segmentCheck:
          for (patternRowIdx = 0; patternRowIdx < patternSize; patternRowIdx++) {
            for (patternColIdx = 0; patternColIdx < patternSize; patternColIdx++) {
              // If the pattern element is a wildcard (-1), skip comparison
              if (patternVariants[rotationIdx][patternRowIdx][patternColIdx] === -1) continue;

              // If a non-wildcard element does not match, set flag and break
              if (patternVariants[rotationIdx][patternRowIdx][patternColIdx] !== sourceMatrix[mainRowOffset + patternRowIdx][mainColOffset + patternColIdx]) {
                isMatchFound = false;
                break segmentCheck;
              }

              // Record the 1-based coordinates of the first non-wildcard match
              if (foundXCoord === 0 && foundYCoord === 0) {
                foundXCoord = mainColOffset + patternColIdx + 1;
                foundYCoord = mainRowOffset + patternRowIdx + 1;
              }
            }
          }

          // If a complete match was found for this pattern variant
          if (isMatchFound) {
            // Update the best found coordinates if the current match is superior
            if (foundYCoord < bestYCoord) {
              bestYCoord = foundYCoord;
              bestXCoord = foundXCoord;
            }
            // If Y coordinates are equal, prefer the smaller X coordinate
            if (foundYCoord === bestYCoord && foundXCoord < bestXCoord) {
              bestXCoord = foundXCoord;
            }
          }
        }
      }
    }

    // Output the results: coordinates if found, otherwise 'NA'
    if (bestXCoord !== 99999999 && bestYCoord !== 99999999) {
      console.log(bestXCoord + ' ' + bestYCoord);
    } else {
      console.log('NA'); // No match was located
    }
  }
}

// Global variable to accumulate all incoming standard input data
let rawInputData = '';

// Activate standard input stream and set encoding
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks
process.stdin.on('data', function(incomingChunk) {
  rawInputData += incomingChunk;
});

// Event listener for the end of the input stream
process.stdin.on('end', function() {
  rawInputData = rawInputData.split('\n'); // Split the accumulated input into individual lines
  processInputAndSearch(); // Initiate the main program logic
});