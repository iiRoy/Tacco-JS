function executeProgram() {
  let lineIndex = 0; // Current line number in the input array
  while (true) {
    // Parse grid dimensions from the current input line
    const dimensionData = rawInputData[lineIndex].split(' ');
    const gridWidth = parseInt(dimensionData[0], 10); // Convert to integer
    const gridHeight = parseInt(dimensionData[1], 10); // Convert to integer

    // Check for termination condition (0 0 input)
    if (gridWidth === 0 && gridHeight === 0) {
      break; // Exit the main loop
    }

    let initialPosition; // Starting point coordinates
    let finalPosition;   // Goal point coordinates

    // Initialize a 2D array to store locations of elements by category (0-4)
    // Each sub-array will hold encoded coordinates for elements of that type.
    const elementLocations = [[], [], [], [], []];
    for (let elemArrIdx = 0; elemArrIdx < 0x5; elemArrIdx++) {
      elementLocations[elemArrIdx].length = 0; // Ensure sub-arrays are empty
    }

    // Process the grid map, row by row, from bottom to top (as per original loop `height; y--`)
    for (let rowCoord = gridHeight; rowCoord--;) {
      lineIndex++; // Move to the next line of input for the current row
      for (let colCoord = gridWidth; colCoord--;) {
        const charSymbol = rawInputData[lineIndex][colCoord]; // Get character at (col, row)

        // Determine the type of character and store its position
        switch (charSymbol) {
          case '.': // Empty space, no action needed
            break;
          case 'S': // Starting point
            initialPosition = encodeCoordinates(colCoord, rowCoord);
            break;
          case 'G': // Goal point
            finalPosition = encodeCoordinates(colCoord, rowCoord);
            break;
          default: // Must be an element '1' through '5'
            // Convert char '1' to 0, '2' to 1, etc., then store position
            elementLocations[parseInt(charSymbol, 10) - 1].push(encodeCoordinates(colCoord, rowCoord));
            break;
        }
      }
    }

    // Initialize variables for pathfinding
    const MAX_DISTANCE = 1 << 30; // Represents infinity for distance calculations
    let optimalElementCategory = -1; // Stores the 1-indexed category of the first element collected
    let minTotalDistance = MAX_DISTANCE; // Stores the shortest path found so far

    // Iterate through all possible starting element categories (0 to 4)
    // This determines which element type '1' (index 0) we start collecting first.
    for (let currentStartCategory = 0; currentStartCategory < 0x5; currentStartCategory++) {
      // Initialize the dynamic programming table for this starting category
      // dp[category_idx][item_idx_within_category] stores min distance to reach that item.
      const dynamicProgrammingTable = [[], [], [], [], []];
      for (let dpRowIdx = 0; dpRowIdx < 0x5; dpRowIdx++) {
        const categoryLength = elementLocations[dpRowIdx].length;
        dynamicProgrammingTable[dpRowIdx].length = categoryLength;
        for (let categoryItemIdx = 0; categoryItemIdx < categoryLength; categoryItemIdx++) {
          dynamicProgrammingTable[dpRowIdx][categoryItemIdx] = MAX_DISTANCE; // Initialize with infinity
        }
      }

      // Determine the actual first category to collect based on `currentStartCategory`
      // (e.g., if currentStartCategory is 0, we collect element type '1' first, which is index 0)
      const firstCategoryToCollect = (currentStartCategory + 1) % 0x5; // The first actual element type to target

      const firstCategoryCount = elementLocations[firstCategoryToCollect].length;
      for (let currentCategoryItemIdx = 0; currentCategoryItemIdx < firstCategoryCount; currentCategoryItemIdx++) {
        // Calculate distance from initial position 'S' to each item in the first category
        dynamicProgrammingTable[firstCategoryToCollect][currentCategoryItemIdx] = calculateManhattanDistance(
          initialPosition,
          elementLocations[firstCategoryToCollect][currentCategoryItemIdx]
        );
      }

      // Iterate through the intermediate path segments (e.g., 1->2, 2->3, 3->4)
      // There are 3 such segments to connect 4 elements.
      for (let pathSegmentIdx = 0; pathSegmentIdx < 0x3; pathSegmentIdx++) {
        const currentCategory = (firstCategoryToCollect + pathSegmentIdx) % 0x5; // Source category
        const nextCategory = (currentCategory + 1) % 0x5; // Destination category

        const currentCategoryCount = elementLocations[currentCategory].length;
        const nextCategoryCount = elementLocations[nextCategory].length;

        // For each item in the current category...
        for (let currentCategoryItemIdx = 0; currentCategoryItemIdx < currentCategoryCount; currentCategoryItemIdx++) {
          // If we haven't found a path to this item yet, skip it
          if (dynamicProgrammingTable[currentCategory][currentCategoryItemIdx] === MAX_DISTANCE) {
            continue;
          }
          // ...calculate path to each item in the next category
          for (let nextCategoryItemIdx = 0; nextCategoryItemIdx < nextCategoryCount; nextCategoryItemIdx++) {
            dynamicProgrammingTable[nextCategory][nextCategoryItemIdx] = findMinimum(
              dynamicProgrammingTable[nextCategory][nextCategoryItemIdx], // Current best distance to next item
              dynamicProgrammingTable[currentCategory][currentCategoryItemIdx] + // Distance to current item
              calculateManhattanDistance(
                elementLocations[currentCategory][currentCategoryItemIdx],
                elementLocations[nextCategory][nextCategoryItemIdx]
              ) // Distance from current item to next item
            );
          }
        }
      }

      // After connecting 4 elements, calculate distance from the last collected element to the goal 'G'
      const lastCategoryToCollect = (firstCategoryToCollect + 0x3) % 0x5; // The fourth element category
      const lastCategoryCount = elementLocations[lastCategoryToCollect].length;

      for (let currentCategoryItemIdx = 0; currentCategoryItemIdx < lastCategoryCount; currentCategoryItemIdx++) {
        // If no path was found to this last item, skip it
        if (dynamicProgrammingTable[lastCategoryToCollect][currentCategoryItemIdx] === MAX_DISTANCE) {
          continue;
        }

        // Calculate the total path distance: S -> E1 -> E2 -> E3 -> E4 -> G
        const calculatedPathDistance = dynamicProgrammingTable[lastCategoryToCollect][currentCategoryItemIdx] +
          calculateManhattanDistance(
            elementLocations[lastCategoryToCollect][currentCategoryItemIdx],
            finalPosition
          );

        // Update the overall minimum distance if a shorter path is found
        if (calculatedPathDistance < minTotalDistance) {
          minTotalDistance = calculatedPathDistance;
          optimalElementCategory = currentStartCategory + 0x1; // Store the 1-indexed category
        }
      }
    }

    // Output the result
    if (minTotalDistance === MAX_DISTANCE) {
      console.log("NA"); // No path found
    } else {
      console.log(optimalElementCategory + " " + minTotalDistance); // Output category and distance
    }

    lineIndex++; // Move to the next line for the next grid definition
  }
}

// Calculates Manhattan distance between two encoded points
function calculateManhattanDistance(originPoint, destinationPoint) {
  // Extract x and y coordinates from encoded integers
  // x is in higher bits (shifted right by 11), y is in lower 11 bits (AND with 2047)
  const originX = originPoint >> 0xb;
  const originY = originPoint & 0x7ff; // 2047 is 0b11111111111

  const destX = destinationPoint >> 0xb;
  const destY = destinationPoint & 0x7ff;

  return absoluteValue(originX - destX) + absoluteValue(originY - destY);
}

// Finds the minimum of two numbers using bitwise operations for potential speedup
function findMinimum(valA, valB) {
  const tempDiff = valA - valB;
  // If tempDiff is negative, (tempDiff >> 31) is -1 (all ones).
  // If tempDiff is positive or zero, (tempDiff >> 31) is 0.
  // This effectively returns valB if valA > valB, and valA otherwise.
  return valB + (tempDiff & (tempDiff >> 0x1f)); // 31 is 0x1f
}

// Encodes (x, y) coordinates into a single integer
// x is stored in higher bits, y in lower 11 bits (max y = 2047)
function encodeCoordinates(colCoord, rowCoord) {
  return (colCoord << 0xb) + rowCoord; // 11 is 0xb
}

// Calculates the absolute value of an integer using bitwise operations
function absoluteValue(valA) {
  const signMask = valA >> 0x1f; // 31 is 0x1f. If valA is negative, mask is -1 (all ones). If positive/zero, mask is 0.
  return (valA ^ signMask) - signMask; // XOR with mask flips bits if negative, then subtract mask to add 1 (two's complement negation)
}

// Global variable to store raw input data
let rawInputData = '';

// Set up standard input processing
process.stdin.resume(); // Keep the process alive
process.stdin.setEncoding('utf8'); // Read input as UTF-8 strings

// Accumulate data chunks as they arrive
process.stdin.on('data', function(chunk) {
  rawInputData += chunk;
});

// When all input has been received
process.stdin.on('end', function() {
  rawInputData = rawInputData.split('\n'); // Split input into an array of lines
  executeProgram(); // Start the main program logic
});
