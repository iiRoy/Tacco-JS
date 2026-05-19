function rotateMatrix(inputMatrix) {
  // Determine the dimension of the square matrix.
  let matrixDimension = inputMatrix.length;
  let rowIterator, colIterator;
  // Initialize a new matrix to store the rotated result.
  const rotatedResult = [];
  
  // Allocate inner arrays for the rotated matrix.
  for (rowIterator = 0; rowIterator < matrixDimension; rowIterator++) {
    rotatedResult[rowIterator] = [];
  }
  
  // Perform the 90-degree clockwise rotation.
  // The element at (j, i) in the original matrix moves to (i, m - j - 1) in the rotated matrix.
  for (rowIterator = 0; rowIterator < matrixDimension; rowIterator++) {
    for (colIterator = 0; colIterator < matrixDimension; colIterator++) {
      rotatedResult[rowIterator][matrixDimension - colIterator - 1] = inputMatrix[colIterator][rowIterator];
    }
  }
  
  return rotatedResult;
}

function executeSearch() {
  let
  mainImage, patternPiece, allRotations,
  searchInitiated, currentMatchStatus,
  outerRow, outerCol, currentXCoord, currentYCoord, bestXCoord, bestYCoord, rotationIndex, innerRow, innerCol, imageRows, patternRows, inputLineData;
  
  // Loop indefinitely until a termination condition is met.
  for (;;) {
    // Process input data for the current test case.
    inputLineData = rawDataBuffer.shift().split(/\s+/).map(parseFloat);
    imageRows = inputLineData[0];
    patternRows = inputLineData[1];
    
    // Check for termination condition (N=0, M=0).
    if (imageRows === 0 && patternRows === 0) {
      break;
    }
    
    // Read the main image matrix.
    mainImage = [];
    for (outerRow = 0; outerRow < imageRows; outerRow++) {
      mainImage.push(rawDataBuffer.shift().split(/ +/).map(parseFloat));
    }
    
    // Read the initial pattern piece matrix.
    patternPiece = [];
    for (outerRow = 0; outerRow < patternRows; outerRow++) {
      patternPiece.push(rawDataBuffer.shift().split(/ +/).map(parseFloat));
    }
    
    // Generate all four 90-degree rotations of the pattern piece.
    allRotations = [];
    for (outerRow = 0; outerRow < 4; outerRow++) {
      allRotations.push(patternPiece);
      patternPiece = rotateMatrix(patternPiece); // Apply rotation for the next iteration.
    }
    
    // Initialize search parameters for finding the best match.
    searchInitiated = true; // This variable is not strictly used for control flow, but kept for structural similarity.
    bestXCoord = 99999999; // Initialize with a large value to find minimum X.
    bestYCoord = 99999999; // Initialize with a large value to find minimum Y.
    
    // Begin the exhaustive search for the pattern within the image.
    searchLoop: // Label for breaking out of outer loops if needed (though not used here).
    for (outerRow = 0; outerRow <= imageRows - patternRows; outerRow++) {
      for (outerCol = 0; outerCol <= imageRows - patternRows; outerCol++) {
        for (rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
          currentMatchStatus = true; // Assume a match until a mismatch is found.
          currentXCoord = 0; // Reset current match coordinates.
          currentYCoord = 0;
          
          // Check if the current rotated pattern matches the sub-image.
          checkLoop: // Label for breaking out of inner loops.
          for (innerRow = 0; innerRow < patternRows; innerRow++) {
            for (innerCol = 0; innerCol < patternRows; innerCol++) {
              // Skip comparison if the pattern element is a wildcard (-1).
              if (allRotations[rotationIndex][innerRow][innerCol] === -1) {
                continue;
              }
              // If a non-wildcard pattern element does not match the image element.
              if (allRotations[rotationIndex][innerRow][innerCol] !== mainImage[outerRow + innerRow][outerCol + innerCol]) {
                currentMatchStatus = false; // Mismatch found.
                break checkLoop; // Exit inner loops for this pattern orientation.
              }
              // If this is the first matching non-wildcard element, record its coordinates.
              if (currentXCoord === 0 && currentYCoord === 0) {
                currentXCoord = outerCol + innerCol + 1; // 1-based indexing for output.
                currentYCoord = outerRow + innerRow + 1; // 1-based indexing for output.
              }
            }
          }
          
          // If a full match was found for the current pattern orientation.
          if (currentMatchStatus) {
            // Update the best match coordinates if the current match is better.
            if (currentXCoord < bestXCoord) {
              bestXCoord = currentXCoord;
              bestYCoord = currentYCoord;
            }
            // If X coordinates are equal, choose the one with the smaller Y coordinate.
            if (currentXCoord === bestXCoord && currentYCoord < bestYCoord) {
              bestYCoord = currentYCoord;
            }
          }
        }
      }
    }
    
    // Output the result based on whether a match was found.
    if (bestXCoord !== 99999999 && bestYCoord !== 99999999) {
      console.log(bestXCoord + ' ' + bestYCoord);
    } else {
      console.log('NA'); // No match found.
    }
  }
}

let
rawDataBuffer = ''; // Renamed 'input' to 'rawDataBuffer'

// Start reading from standard input.
process.stdin.resume();
// Set the encoding for input data.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function(dataChunk) {
  rawDataBuffer += dataChunk; // Append the received chunk to the buffer.
});

// Event listener for the end of input stream.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines.
  rawDataBuffer = rawDataBuffer.split('\n');
  // Invoke the main processing function.
  executeSearch(); // Call the renamed main function.
});
