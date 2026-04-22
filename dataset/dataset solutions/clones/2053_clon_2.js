/*
  This script processes input data to find the minimum number of cuts
  required to divide a grid into sections, such that the sum of values
  in each section does not exceed a given maximum.
*/

function processGridData(initialInput) {
  // Parse the raw input string into a structured array of numbers
  let parsedInput = initialInput.trim().split("\n").map(function(lineContent) {
    return lineContent.split(" ");
  });

  // Extract grid dimensions and the maximum allowed sum
  const numRows = parseInt(parsedInput[0][0], 10);
  const numCols = parseInt(parsedInput[0][1], 10);
  const maxSumAllowed = parseInt(parsedInput[0][2], 10);

  // Initialize arrays to store the original grid data and its prefix sums
  const valueGrid = [];
  const cumulativeSumsGrid = [];

  let tempRowAccumulator;

  // Populate valueGrid and cumulativeSumsGrid
  for (let rIdx = 0; rIdx < numRows; rIdx++) {
    valueGrid.push(parsedInput[rIdx + 1][0].split("").map(digitChar => parseInt(digitChar, 10)));
    cumulativeSumsGrid.push([0]);
    tempRowAccumulator = 0;
    for (let cIdx = 0; cIdx < numCols; cIdx++) {
      tempRowAccumulator += valueGrid[rIdx][cIdx];
      cumulativeSumsGrid[rIdx].push(tempRowAccumulator);
    }
  }

  // Calculate the number of possible horizontal split patterns
  const horizontalSplitOptions = numRows - 1; 
  let currentHorizontalMap;
  let aggregatedRowTotals;
  let currentGroupRunningSums;
  let horizontalCutsCount;
  let verticalCutsList;
  
  // Initialize the best result with a default high value (max possible cuts)
  let minimumCutsRequired = (numRows - 1) + (numCols - 1);

  // Label for breaking out of the outer loop
  mainCombinationLoop:
  for (let combinationIndex = 0; combinationIndex < Math.pow(2, horizontalSplitOptions); combinationIndex++) {
    
    // Reset horizontal group mapping for each combination
    currentHorizontalMap = [];
    currentHorizontalMap.length = numRows;
    for(let mapInitIdx = 0; mapInitIdx < numRows; mapInitIdx++) {
        currentHorizontalMap[mapInitIdx] = mapInitIdx; // Initialize with distinct groups
    }

    // Start with the first row's cumulative sums as the initial aggregated row
    aggregatedRowTotals = [cumulativeSumsGrid[0].slice()];
    
    // Convert the combination index to its binary string representation
    let binaryPattern = combinationIndex.toString(2);
    // Pad with leading zeros and take the last N characters to ensure correct length
    binaryPattern = ('0'.repeat(horizontalSplitOptions) + binaryPattern).slice(-horizontalSplitOptions);
    
    horizontalCutsCount = 0;

    // Process each bit in the binary pattern to determine horizontal divisions
    for (let bitPosition = 0; bitPosition < binaryPattern.length; bitPosition++) {
      if (binaryPattern.slice(bitPosition, bitPosition + 1) === '0') { // Using slice for single character
        // No cut: merge with the previous row group
        currentHorizontalMap[bitPosition + 1] = currentHorizontalMap[bitPosition];
        aggregatedRowTotals[aggregatedRowTotals.length - 1] = applyVectorOperation(
          aggregatedRowTotals[aggregatedRowTotals.length - 1],
          cumulativeSumsGrid[bitPosition + 1],
          '+'
        );
      } else {
        // Cut: start a new row group
        aggregatedRowTotals.push(cumulativeSumsGrid[bitPosition + 1].slice());
        horizontalCutsCount++;
      }
    }

    // Initialize running sums for each aggregated row group
    currentGroupRunningSums = [];
    currentGroupRunningSums.length = aggregatedRowTotals.length;
    for(let grpInitIdx = 0; grpInitIdx < aggregatedRowTotals.length; grpInitIdx++) {
        currentGroupRunningSums[grpInitIdx] = 0;
    }

    verticalCutsList = [];

    // Iterate through columns to determine vertical cuts
    columnIteration:
    for (let currentColumn = 1; currentColumn <= numCols; currentColumn++) {
      for (let groupIdx = 0; groupIdx < aggregatedRowTotals.length; groupIdx++) {
        // Check if the sum in the current section exceeds the maximum allowed
        if (aggregatedRowTotals[groupIdx][currentColumn] - currentGroupRunningSums[groupIdx] > maxSumAllowed) {
          // If a cut is impossible (first column or last cut was at this column)
          if (currentColumn === 1 || verticalCutsList[verticalCutsList.length - 1] === currentColumn - 1) {
            continue mainCombinationLoop; // This horizontal split pattern is invalid
          }
          // Make a vertical cut before the current column
          verticalCutsList.push(currentColumn - 1);
          // Reset running sums for all groups to the value at the cut point
          for (let resetIdx = 0; resetIdx < aggregatedRowTotals.length; resetIdx++) {
            currentGroupRunningSums[resetIdx] = aggregatedRowTotals[resetIdx][currentColumn - 1];
          }
          currentColumn--; // Re-evaluate the current column after the cut
          break columnIteration; // Break from inner loop, continue outer column loop
        }
      }
    }
    // Update the minimum cuts required
    minimumCutsRequired = Math.min(minimumCutsRequired, horizontalCutsCount + verticalCutsList.length);
  }
  console.log(minimumCutsRequired);
}


/*
  Performs an element-wise operation on two vectors.
  If vectorB has only one element, it's treated as a scalar applied to all elements of vectorA.
*/
function applyVectorOperation(vectorA, vectorB, operationChar) {
  const resultVector = [];
  // Handle cases where vectorB might be a scalar or needs broadcasting
  if (vectorA.length !== vectorB.length) {
    if (vectorB.length === 1) {
      vectorB = Array.from({ length: (vectorA.length) }, () => vectorB[0]); // Broadcast scalar
    } else {
      // Mismatch in dimensions, cannot perform operation
      return null;
    }
  }
  for (let elementIdx = 0; elementIdx < vectorA.length; elementIdx++) {
    if (operationChar === '+') {
      resultVector.push(vectorA[elementIdx] + vectorB[elementIdx]);
    } else if (operationChar === '-') {
      resultVector.push(vectorA[elementIdx] - vectorB[elementIdx]);
    } else if (operationChar === '*') {
      resultVector.push(vectorA[elementIdx] * vectorB[elementIdx]);
    } else if (operationChar === '/') {
      resultVector.push(vectorA[elementIdx] / vectorB[elementIdx]);
    } else if (operationChar === '%') {
      resultVector.push(vectorA[elementIdx] % vectorB[elementIdx]);
    } else if (operationChar === '||') { // Custom operator for max
      resultVector.push(Math.max(vectorA[elementIdx], vectorB[elementIdx]));
    }
  }
  return resultVector;
}

// Read input from standard input and pass it to the main processing function
processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));