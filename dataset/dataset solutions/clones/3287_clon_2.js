function ProcessInput(rawData) {
  // Process raw input data: trim whitespace, split by newlines, then split each line by spaces.
  rawData = rawData.trim().split("\n").map(function(lineSegment) {
    return lineSegment.split(" ");
  });

  // Extract grid dimensions from the first line of input.
  var gridHeight = parseInt(rawData[0][0], 10);
  var gridWidth = parseInt(rawData[0][1], 10);

  // Initialize data structures for grid processing.
  var inputGridRows = []; // Stores the actual grid characters.
  var patternMatchGrid = []; // Stores 1 if character matches checkerboard pattern, 0 otherwise.
  var islandIdentifierMap = []; // Stores the ID of the island each cell belongs to.

  // Populate initial data structures based on grid dimensions.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    inputGridRows.push(rawData[rowIdx + 1]); // Add grid row from input.
    patternMatchGrid.push(Array.from({
      length: gridWidth
    }, () => 0)); // Initialize pattern match grid row with zeros.
    islandIdentifierMap.push(Array.from({
      length: gridWidth
    }, () => -1)); // Initialize island map row with -1 (unassigned).
  }

  // Determine pattern matches for each cell.
  var tempChar = '';
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      // Calculate expected checkerboard pattern character.
      if ((rowIdx + colIdx) % 2 === 0) {
        tempChar = '#';
      } else {
        tempChar = '.';
      }
      // If the actual character matches the pattern, mark it in the patternMatchGrid.
      if (inputGridRows[rowIdx][0].substr(colIdx, 1) === tempChar) {
        patternMatchGrid[rowIdx][colIdx] = 1;
      }
    }
  }

  // Initialize variables for island detection and merging.
  var currentIslandId = 0; // Counter for new island IDs.
  var adjacentIslandIds = []; // Stores IDs of adjacent islands.
  var islandColorTallies = []; // Stores [count_color0, count_color1] for each island.
  var islandCoordinateLists = []; // Stores lists of [row, col] for each island.
  var coordsToMerge; // Temporary list for merging coordinates.

  // Iterate through the grid to identify and merge islands.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      adjacentIslandIds = []; // Reset adjacent island IDs for current cell.

      // Check cell above.
      if ((rowIdx - 1) >= 0) {
        if (patternMatchGrid[rowIdx - 1][colIdx] === patternMatchGrid[rowIdx][colIdx]) {
          adjacentIslandIds.push(islandIdentifierMap[rowIdx - 1][colIdx]);
        }
      }
      // Check cell to the left.
      if ((colIdx - 1) >= 0) {
        if (patternMatchGrid[rowIdx][colIdx - 1] === patternMatchGrid[rowIdx][colIdx]) {
          adjacentIslandIds.push(islandIdentifierMap[rowIdx][colIdx - 1]);
        }
      }

      // Handle cases based on the number of adjacent islands.
      if (adjacentIslandIds.length > 1) {
        // If two different islands are adjacent, merge them.
        if (adjacentIslandIds[0] !== adjacentIslandIds[1]) {
          // Get coordinates of the larger ID island to merge into the smaller ID island.
          coordsToMerge = islandCoordinateLists[Math.max(adjacentIslandIds[0], adjacentIslandIds[1])];
          for (var coordIdx = 0; coordIdx < coordsToMerge.length; coordIdx++) {
            // Reassign island ID for merged coordinates.
            islandIdentifierMap[coordsToMerge[coordIdx][0]][coordsToMerge[coordIdx][1]] = Math.min(adjacentIslandIds[0], adjacentIslandIds[1]);
            // Add merged coordinates to the smaller ID island's list.
            islandCoordinateLists[Math.min(adjacentIslandIds[0], adjacentIslandIds[1])].push([coordsToMerge[coordIdx][0], coordsToMerge[coordIdx][1]]);
          }
          // Merge color counts using the VectorOperation function.
          islandColorTallies[Math.min(adjacentIslandIds[0], adjacentIslandIds[1])] = VectorOperation(
            islandColorTallies[Math.min(adjacentIslandIds[0], adjacentIslandIds[1])],
            islandColorTallies[Math.max(adjacentIslandIds[0], adjacentIslandIds[1])],
            '+'
          );
          // Nullify the merged (larger ID) island's color count.
          islandColorTallies[Math.max(adjacentIslandIds[0], adjacentIslandIds[1])] = null;
        }
        // Assign current cell to the smallest adjacent island ID.
        islandIdentifierMap[rowIdx][colIdx] = Math.min(adjacentIslandIds[0], adjacentIslandIds[1]);
        // Increment color count for the assigned island.
        islandColorTallies[islandIdentifierMap[rowIdx][colIdx]][(rowIdx + colIdx) % 2]++;
        // Add current cell's coordinates to the assigned island's list.
        islandCoordinateLists[islandIdentifierMap[rowIdx][colIdx]].push([rowIdx, colIdx]);
      } else if (adjacentIslandIds.length === 1) {
        // If only one island is adjacent, assign current cell to that island.
        islandIdentifierMap[rowIdx][colIdx] = adjacentIslandIds[0];
        // Increment color count for the assigned island.
        islandColorTallies[adjacentIslandIds[0]][(rowIdx + colIdx) % 2]++;
        // Add current cell's coordinates to the assigned island's list.
        islandCoordinateLists[adjacentIslandIds[0]].push([rowIdx, colIdx]);
      } else {
        // If no adjacent islands, create a new island.
        islandIdentifierMap[rowIdx][colIdx] = currentIslandId;
        islandColorTallies[currentIslandId] = [0, 0]; // Initialize color counts for new island.
        islandColorTallies[currentIslandId][(rowIdx + colIdx) % 2]++; // Increment count for current cell's color.
        islandCoordinateLists[currentIslandId] = [
          [rowIdx, colIdx]
        ]; // Add current cell's coordinates to new island's list.
        currentIslandId++; // Increment island ID counter.
      }
    }
  }

  // Calculate the final result by summing products of color counts for each valid island.
  var finalResult = 0;
  for (var islandTally of islandColorTallies) {
    if (islandTally !== null) { // Only consider islands that haven't been merged away.
      finalResult += islandTally[0] * islandTally[1];
    }
  }

  // Output the final calculated result.
  console.log(finalResult);
}

// Helper function for vector operations (addition, subtraction, etc.).
function VectorOperation(vectorA, vectorB, operationType) {
  var resultVector = []; // Initialize an empty array for the result.

  // Handle cases where vector lengths differ.
  if (vectorA.length !== vectorB.length) {
    if (vectorB.length === 1) {
      // If vectorB has only one element, broadcast it to match vectorA's length.
      // Note: This specific implementation might lead to unexpected behavior if vectorB is an array like [X]
      // as it would create an array of [X] arrays. However, this is a direct clone of the original logic.
      vectorB = Array.from({
        length: (vectorA.length)
      }, () => vectorB);
    } else {
      // If lengths differ and vectorB is not a single element, return null.
      return null;
    }
  }

  // Perform the specified operation element-wise.
  for (var elementIndex = 0; elementIndex < vectorA.length; elementIndex++) {
    if (operationType === '+') {
      resultVector.push(vectorA[elementIndex] + vectorB[elementIndex]);
    }
    if (operationType === '-') {
      resultVector.push(vectorA[elementIndex] - vectorB[elementIndex]);
    }
    if (operationType === '*') {
      resultVector.push(vectorA[elementIndex] * vectorB[elementIndex]);
    }
    if (operationType === '/') {
      resultVector.push(vectorA[elementIndex] / vectorB[elementIndex]);
    }
    if (operationType === '%') {
      resultVector.push(vectorA[elementIndex] % vectorB[elementIndex]);
    }
    if (operationType === '||') { // Custom operation for maximum.
      resultVector.push(Math.max(vectorA[elementIndex], vectorB[elementIndex]));
    }
  }
  return resultVector; // Return the resulting vector.
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
