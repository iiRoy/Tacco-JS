// Helper function to compute the Manhattan distance between two packed coordinate values.
// Coordinates are encoded as (x << 11) | y, where y occupies the lower 11 bits.
// This utility extracts x and y components, then calculates the sum of their absolute differences.
function calculateManhattanDistance(coordA, coordB) {
  // Extract x-coordinate from the higher bits.
  const xA = coordA >>> 11;
  const xB = coordB >>> 11;

  // Extract y-coordinate from the lower 11 bits (masking with 2^11 - 1 = 2047).
  const yA = coordA & 2047;
  const yB = coordB & 2047;

  // Return the sum of absolute differences in x and y.
  return Math.abs(xA - xB) + Math.abs(yA - yB);
}

// Helper function to determine the smaller of two numerical values.
// This is a direct replacement for the bitwise fmin optimization, prioritizing clarity.
function retrieveMinimum(val1, val2) {
  return Math.min(val1, val2);
}

// Helper function to pack x and y coordinates into a single integer.
// The x-coordinate is shifted left by 11 bits, and the y-coordinate is then bitwise OR-ed into the lower 11 bits.
// This allows storing a 2D position efficiently in a single number.
function packCoordinates(xVal, yVal) {
  // Add an optional warning for coordinates that might exceed expected packing range.
  // This is a robustness addition, as the original problem constraints might not strictly require it.
  if (xVal < 0 || xVal > 2047 || yVal < 0 || yVal > 2047) {
      console.warn(`Coordinate values (${xVal}, ${yVal}) are outside the typical 0-2047 range for packing.`);
  }
  return (xVal << 11) | yVal;
}

// The primary function orchestrating the puzzle-solving logic for multiple test cases.
// It reads grid data, identifies key locations, and employs dynamic programming to find
// the shortest path through a sequence of categorized elements.
function processPuzzleSolutions() {
  // A large constant representing an unreachable path cost (effectively infinity).
  // Chosen to be smaller than 1 << 30 to prevent potential overflow during additions.
  const UNREACHABLE_PATH_COST = 1 << 29;
  // Defines the fixed number of distinct element categories (1 through 5).
  const NUMBER_OF_ELEMENT_TYPES = 5;

  let currentInputLinePointer = 0; // Index to keep track of the current line being processed from inputDataLines.

  // Main loop to process multiple grid configurations until a termination signal is received.
  while (true) {
    // Parse the grid's width and height from the current input line.
    const dimensionTokens = inputDataLines[currentInputLinePointer].split(' ');
    const boardCols = parseInt(dimensionTokens[0], 10);
    const boardRows = parseInt(dimensionTokens[1], 10);
    currentInputLinePointer++; // Advance the pointer immediately after reading dimensions.

    // Termination condition: If both dimensions are zero, no more test cases remain.
    if (boardCols === 0 && boardRows === 0) {
      break;
    }

    let startingPointPacked; // Stores the packed coordinates of the 'S' (start) position.
    let endingPointPacked;   // Stores the packed coordinates of the 'G' (goal) position.

    // An array of arrays to store the packed coordinates for each element type.
    // categorizedItemLocations[0] holds items of type '1', categorizedItemLocations[1] for '2', etc.
    const categorizedItemLocations = Array.from({ length: NUMBER_OF_ELEMENT_TYPES }, () => []);

    // Loop through each row of the grid, starting from the last row (bottom) and moving upwards.
    for (let gridY = boardRows - 1; gridY >= 0; gridY--) {
      const currentRowContent = inputDataLines[currentInputLinePointer];
      // Loop through each column in the current row, starting from the last column (right) and moving left.
      for (let gridX = boardCols - 1; gridX >= 0; gridX--) {
        const cellIdentifier = currentRowContent[gridX];

        // Process the character found in the current cell.
        switch (cellIdentifier) {
          case '.': // Empty space, no action required.
            break;
          case 'S': // Denotes the starting position.
            startingPointPacked = packCoordinates(gridX, gridY);
            break;
          case 'G': // Denotes the goal position.
            endingPointPacked = packCoordinates(gridX, gridY);
            break;
          default: // Assumed to be an element type (1-5).
            const elementCategory = parseInt(cellIdentifier, 10);
            // Basic validation to ensure the element category is within the expected range.
            if (elementCategory >= 1 && elementCategory <= NUMBER_OF_ELEMENT_TYPES) {
              // Store the packed coordinates in the corresponding category array.
              categorizedItemLocations[elementCategory - 1].push(packCoordinates(gridX, gridY));
            } else {
              // Log an error if an unidentifiable symbol is encountered.
              console.error(`Error: Unrecognized map symbol '${cellIdentifier}' at grid position (${gridX}, ${gridY}).`);
            }
            break;
        }
      }
      currentInputLinePointer++; // Advance the pointer after processing all cells in a row.
    }

    let minimumOverallPathCost = UNREACHABLE_PATH_COST; // Stores the shortest path found across all starting element choices.
    let bestStartingElementType = -1; // Stores the 1-based index of the element type that yields the minimum path.

    // Iterate through each possible element category (0-4) to consider it as the 'initial' element type
    // that effectively starts the cyclic collection sequence.
    for (let initialCategoryIndex = 0; initialCategoryIndex < NUMBER_OF_ELEMENT_TYPES; initialCategoryIndex++) {
      // Initialize the dynamic programming table for the current 'initialCategoryIndex' choice.
      // dpTable[category][itemIndex] will store the minimum cost to reach 'itemIndex' within 'category'.
      const dpTable = Array.from({ length: NUMBER_OF_ELEMENT_TYPES }, () => []);

      // Pre-fill each sub-array in dpTable with the UNREACHABLE_PATH_COST.
      for (let categoryIdx = 0; categoryIdx < NUMBER_OF_ELEMENT_TYPES; categoryIdx++) {
        const categoryItemsCount = categorizedItemLocations[categoryIdx].length;
        dpTable[categoryIdx] = new Array(categoryItemsCount).fill(UNREACHABLE_PATH_COST);
      }

      // Determine the first actual collectible element category in the sequence (e.g., if initial is '1', first collectible is '2').
      const firstTargetCategoryIndex = (initialCategoryIndex + 1) % NUMBER_OF_ELEMENT_TYPES;

      // Calculate initial distances from 'S' (startingPointPacked) to all items in the 'firstTargetCategoryIndex'.
      const firstItemsCount = categorizedItemLocations[firstTargetCategoryIndex].length;
      for (let itemIdx = 0; itemIdx < firstItemsCount; itemIdx++) {
        const itemCoord = categorizedItemLocations[firstTargetCategoryIndex][itemIdx];
        dpTable[firstTargetCategoryIndex][itemIdx] = calculateManhattanDistance(startingPointPacked, itemCoord);
      }

      // Propagate minimum distances through the sequence of element categories.
      // The path structure is S -> (first) -> (first+1) -> (first+2) -> (first+3) -> G.
      // This loop handles the three intermediate transitions between element categories.
      for (let pathSegmentStep = 0; pathSegmentStep < 3; pathSegmentStep++) {
        const currentPathCategoryIndex = (firstTargetCategoryIndex + pathSegmentStep) % NUMBER_OF_ELEMENT_TYPES;
        const nextPathCategoryIndex = (currentPathCategoryIndex + 1) % NUMBER_OF_ELEMENT_TYPES;

        const currentCategoryItemCount = categorizedItemLocations[currentPathCategoryIndex].length;
        const nextCategoryItemCount = categorizedItemLocations[nextPathCategoryIndex].length;

        // Optimization: If either the current or next category has no items, no path can be formed through them.
        if (currentCategoryItemCount === 0 || nextCategoryItemCount === 0) {
            continue;
        }

        for (let fromItemIdx = 0; fromItemIdx < currentCategoryItemCount; fromItemIdx++) {
          // Optimization: Skip if the current item itself is unreachable.
          if (dpTable[currentPathCategoryIndex][fromItemIdx] === UNREACHABLE_PATH_COST) {
            continue;
          }

          const fromCoord = categorizedItemLocations[currentPathCategoryIndex][fromItemIdx];

          for (let toItemIdx = 0; toItemIdx < nextCategoryItemCount; toItemIdx++) {
            const toCoord = categorizedItemLocations[nextPathCategoryIndex][toItemIdx];
            const travelCost = calculateManhattanDistance(fromCoord, toCoord);
            const totalCostThroughCurrent = dpTable[currentPathCategoryIndex][fromItemIdx] + travelCost;

            // Update the minimum cost to reach 'toItemIdx' in 'nextPathCategoryIndex'.
            dpTable[nextPathCategoryIndex][toItemIdx] = retrieveMinimum(
              dpTable[nextPathCategoryIndex][toItemIdx],
              totalCostThroughCurrent
            );
          }
        }
      }

      // After calculating costs to all intermediate elements, compute the final costs from the last collectible
      // element category to the 'G' (goal) position.
      const finalCollectibleCategoryIndex = (firstTargetCategoryIndex + 3) % NUMBER_OF_ELEMENT_TYPES;
      const finalCategoryItemsCount = categorizedItemLocations[finalCollectibleCategoryIndex].length;

      for (let itemIdx = 0; itemIdx < finalCategoryItemsCount; itemIdx++) {
        // Optimization: Skip if the item in the final category is unreachable.
        if (dpTable[finalCollectibleCategoryIndex][itemIdx] === UNREACHABLE_PATH_COST) {
            continue;
        }

        const itemCoord = categorizedItemLocations[finalCollectibleCategoryIndex][itemIdx];
        const costToGoal = calculateManhattanDistance(itemCoord, endingPointPacked);
        const totalPathCost = dpTable[finalCollectibleCategoryIndex][itemIdx] + costToGoal;

        // If the current path is shorter than the previously recorded minimum, update it.
        if (totalPathCost < minimumOverallPathCost) {
          minimumOverallPathCost = totalPathCost;
          // Store the 1-based index of the element type that started this optimal path.
          bestStartingElementType = initialCategoryIndex + 1;
        }
      }
    } // End of loop for initialCategoryIndex.

    // Output the result for the current test case.
    if (minimumOverallPathCost === UNREACHABLE_PATH_COST) {
      console.log("NA"); // "Not Available" if no path was found.
    } else {
      // Output the 1-based index of the best starting element and the minimum path cost.
      console.log(`${bestStartingElementType} ${minimumOverallPathCost}`);
    }
  } // End of while loop for processing test cases.
}

// Global variable to accumulate all input data.
let inputDataLines = '';

// Configure standard input stream.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener to append incoming data chunks to inputDataLines.
process.stdin.on('data', function(dataChunk) {
  inputDataLines += dataChunk;
});

// Event listener triggered when the entire input stream has been received.
process.stdin.on('end', function() {
  // Split the accumulated input into an array of individual lines.
  inputDataLines = inputDataLines.split('\n');
  // Initiate the main puzzle-solving process.
  processPuzzleSolutions();
});