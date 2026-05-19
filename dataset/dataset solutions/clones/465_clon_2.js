function rotateMatrix(subMatrix) {
  // Get the dimension of the square sub-matrix
  let dim = subMatrix.length;
  let rowIdx, colIdx;
  // Initialize a new matrix to store the rotated version
  let rotatedSubMatrix = [];

  // Create empty rows for the rotated matrix
  for (rowIdx = 0; rowIdx < dim; rowIdx++) {
    rotatedSubMatrix[rowIdx] = [];
  }

  // Perform the 90-degree clockwise rotation
  // The element at subMatrix[colIdx][rowIdx] moves to rotatedSubMatrix[rowIdx][dim - colIdx - 1]
  for (rowIdx = 0; rowIdx < dim; rowIdx++) {
    for (colIdx = 0; colIdx < dim; colIdx++) {
      rotatedSubMatrix[rowIdx][dim - colIdx - 1] = subMatrix[colIdx][rowIdx];
    }
  }

  return rotatedSubMatrix;
}

function processInputData() {
  let
    mainImage, currentSubMatrix, allRotations,
    matchFound,
    outerRow, outerCol, matchX, matchY, bestX, bestY, rotationIdx, innerRow, innerCol, imageRows, subMatrixDim, inputLineData;

  // Main loop to process multiple test cases
  for (;;) {
    // Read the first line for image dimensions (N, M)
    inputLineData = rawDataBuffer.shift().split(/\s+/).map(parseFloat);
    imageRows = inputLineData[0];
    subMatrixDim = inputLineData[1];

    // Termination condition: N=0 and M=0
    if (imageRows === 0 && subMatrixDim === 0) break;

    // Read the main image data
    mainImage = [];
    for (outerRow = 0; outerRow < imageRows; outerRow++) {
      mainImage.push(rawDataBuffer.shift().split(/ +/).map(parseFloat));
    }

    // Read the initial sub-matrix (pattern)
    currentSubMatrix = [];
    for (outerRow = 0; outerRow < subMatrixDim; outerRow++) {
      currentSubMatrix.push(rawDataBuffer.shift().split(/ +/).map(parseFloat));
    }

    // Generate all 4 rotations of the sub-matrix
    allRotations = [];
    for (rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
      allRotations.push(currentSubMatrix);
      currentSubMatrix = rotateMatrix(currentSubMatrix); // Rotate for the next iteration
    }

    // Initialize best match coordinates to a very large value
    bestX = 99999999;
    bestY = 99999999;

    // Iterate through all possible top-left positions in the main image
    globalSearch:
    for (outerRow = 0; outerRow <= imageRows - subMatrixDim; outerRow++) {
      for (outerCol = 0; outerCol <= imageRows - subMatrixDim; outerCol++) {
        // Check each of the four rotations
        for (rotationIdx = 0; rotationIdx < 4; rotationIdx++) {
          matchFound = true;
          matchX = 0;
          matchY = 0;

          // Compare the current sub-matrix rotation with the image segment
          subMatrixCheck:
          for (innerRow = 0; innerRow < subMatrixDim; innerRow++) {
            for (innerCol = 0; innerCol < subMatrixDim; innerCol++) {
              // Skip if the sub-matrix element is a wildcard (-1)
              if (allRotations[rotationIdx][innerRow][innerCol] === -1) continue;

              // If elements don't match, this rotation doesn't fit here
              if (allRotations[rotationIdx][innerRow][innerCol] !== mainImage[outerRow + innerRow][outerCol + innerCol]) {
                matchFound = false;
                break subMatrixCheck; // Exit inner loops for this rotation
              }

              // Record the first non-wildcard match's coordinates (1-indexed)
              if (matchX === 0 && matchY === 0) {
                matchX = outerCol + innerCol + 1;
                matchY = outerRow + innerRow + 1;
              }
            }
          }

          // If a match was found for this rotation
          if (matchFound) {
            // Update best match if current match is better (smaller Y, then smaller X)
            if (matchY < bestY) {
              bestY = matchY;
              bestX = matchX;
            }
            if (matchY === bestY && matchX < bestX) {
              bestX = matchX;
            }
          }
        }
      }
    }

    // Output the result
    if (bestX !== 99999999 && bestY !== 99999999) {
      console.log(bestX + ' ' + bestY);
    } else {
      console.log('NA'); // No match found
    }
  }
}

let
  rawDataBuffer = ''; // Buffer to accumulate input data

// Set up standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawDataBuffer += dataChunk;
});
process.stdin.on('end', function() {
  rawDataBuffer = rawDataBuffer.split('\n'); // Split input into lines
  processInputData(); // Start processing the data
});
