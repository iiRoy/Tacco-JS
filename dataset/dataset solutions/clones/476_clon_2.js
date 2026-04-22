function executeProgram() {
  let lineIndex = 0; // Initialize input line counter
  for (;;) { // Loop indefinitely until termination condition
    const dimensionsData = rawData[lineIndex].split(' '); // Parse map dimensions from current line
    const mazeWidth = dimensionsData[0] - 0; // Convert width string to integer (using - 0 idiom)
    const mazeHeight = dimensionsData[1] - 0; // Convert height string to integer (using - 0 idiom)

    // If both width and height are zero, it's the termination signal
    if (!mazeWidth && !mazeHeight) {
      break; // Exit the main processing loop
    }

    let startPoint; // Stores the encoded starting position
    let endPoint; // Stores the encoded goal position
    const itemSpots = [[], [], [], [], []]; // Array to hold locations of different item types (0-4)
    for (let elementIndex = 0; elementIndex < 5; elementIndex++) {
      itemSpots[elementIndex].length = 0; // Ensure each item category array is empty
    }

    // Iterate through map rows in reverse order (from bottom to top)
    for (let rowCoord = mazeHeight; rowCoord--;) {
      lineIndex++; // Advance to the next line of input (map row data)
      // Iterate through map columns in reverse order (from right to left)
      for (let colCoord = mazeWidth; colCoord--;) {
        const charSymbol = rawData[lineIndex][colCoord]; // Get character at current map coordinate

        switch (charSymbol) {
          case '.': // Empty space, most common, so check first
            break; // No action needed for empty spaces
          case 'S': // Starting position found
            startPoint = encodeCoordinates(colCoord, rowCoord); // Encode and store start
            break;
          case 'G': // Goal position found
            endPoint = encodeCoordinates(colCoord, rowCoord); // Encode and store goal
            break;
          default: // Assuming valid input, must be an item attribute (1-5)
            // Convert character to number (e.g., '1' -> 1, then subtract 1 for 0-indexed array)
            itemSpots[charSymbol - 1][itemSpots[charSymbol - 1].length] = encodeCoordinates(colCoord, rowCoord);
            break;
        }
      }
    }

    const MAX_DIST_VAL = 1 << 30; // Represents an impossibly large distance (infinity)
    let optimalElement = -1; // Stores the index of the best starting element type
    let minPathLength = MAX_DIST_VAL; // Stores the shortest path found so far

    // Iterate through each possible starting element type (0 to 4)
    for (let initialAttribute = 0; initialAttribute < 5; initialAttribute++) {
      // Initialize dynamic programming table: pathCosts[attribute_type][item_index_within_type]
      const pathCosts = [[], [], [], [], []];
      for (let attrGroup = 0; attrGroup < 5; attrGroup++) {
        const groupSize = itemSpots[attrGroup].length; // Get number of items for this attribute
        pathCosts[attrGroup].length = groupSize; // Set array length
        for (let groupItemIndex = 0; groupItemIndex < groupSize; groupItemIndex++) {
          pathCosts[attrGroup][groupItemIndex] = MAX_DIST_VAL; // Initialize with infinity
        }
      }

      // Determine the first attribute group to visit after 'S'
      const nextAttrGroup = (initialAttribute + 1) % 5;

      const nextGroupSize = itemSpots[nextAttrGroup].length;
      for (let itemIdx1 = 0; itemIdx1 < nextGroupSize; itemIdx1++) {
        // Calculate direct distance from 'S' to each item in the first target group
        pathCosts[nextAttrGroup][itemIdx1] = calculateManhattanDistance(startPoint, itemSpots[nextAttrGroup][itemIdx1]);
      }

      // Calculate paths for intermediate steps: S -> Attr1 -> Attr2 -> Attr3 -> Attr4 -> G
      // This loop handles the 3 intermediate transitions (Attr1->Attr2, Attr2->Attr3, Attr3->Attr4)
      for (let pathStep = 0; pathStep < 3; pathStep++) {
        const currentAttr = (nextAttrGroup + pathStep) % 5; // Current attribute group index
        const targetAttr = (currentAttr + 1) % 5; // Next attribute group index
        const currentGroupSize = itemSpots[currentAttr].length;
        const targetGroupSize = itemSpots[targetAttr].length;

        for (let itemIdx1 = 0; itemIdx1 < currentGroupSize; itemIdx1++) {
          for (let itemIdx2 = 0; itemIdx2 < targetGroupSize; itemIdx2++) {
            // Update the minimum cost to reach itemIdx2 in targetAttr group
            // via itemIdx1 in currentAttr group
            pathCosts[targetAttr][itemIdx2] = findMinimumValue(
              pathCosts[targetAttr][itemIdx2],
              pathCosts[currentAttr][itemIdx1] +
              calculateManhattanDistance(itemSpots[currentAttr][itemIdx1], itemSpots[targetAttr][itemIdx2])
            );
          }
        }
      }

      // Determine the final attribute group to visit before 'G'
      const finalAttrGroup = (nextAttrGroup + 3) % 5;
      const finalGroupSize = itemSpots[finalAttrGroup].length;
      for (let itemIdx1 = 0; itemIdx1 < finalGroupSize; itemIdx1++) {
        // Calculate the total path from S -> ... -> last_item -> G
        const currentPathTotal = pathCosts[finalAttrGroup][itemIdx1] +
          calculateManhattanDistance(itemSpots[finalAttrGroup][itemIdx1], endPoint);

        // If this path is shorter than the best found so far
        if (currentPathTotal < minPathLength) {
          minPathLength = currentPathTotal; // Update the minimum path length
          optimalElement = initialAttribute + 1; // Store the 1-based index of the optimal starting element
        }
      }
    }

    // Output results based on whether a path was found
    if (minPathLength === MAX_DIST_VAL) {
      console.log("NA"); // No path found
    } else {
      console.log(optimalElement + " " + minPathLength); // Output optimal element and path length
    }

    lineIndex++; // Move to the next input line (for the next maze description)
  }
}

function calculateManhattanDistance(origin, destination) {
  // Extract x and y coordinates from encoded values
  // x is upper 11 bits (shift right by 11), y is lower 11 bits (AND with 2047)
  return getAbsoluteValue((origin >> 11) - (destination >> 11)) +
         getAbsoluteValue((origin & 2047) - (destination & 2047));
}

function findMinimumValue(val1, val2) {
  // Optimized minimum calculation using bitwise operations
  const tempDiff = val1 - val2;
  return val2 + (tempDiff & (tempDiff >> 31));
}

function encodeCoordinates(coordX, coordY) {
  // Encode (x, y) coordinates into a single integer.
  // Y uses the lower 11 bits (max 1023), X uses higher bits.
  return (coordX << 11) + coordY;
}

function getAbsoluteValue(val) {
  // Optimized absolute value calculation using bitwise operations
  const signMask = val >> 31; // For negative numbers, this will be -1 (all 1s)
  return (val ^ signMask) - signMask; // Equivalent to (val + signMask) ^ signMask for positive/negative
}

let rawData = ''; // Global variable to store all input data

process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding('utf8'); // Set input encoding to UTF-8
process.stdin.on('data', function(dataSegment) {
  rawData += dataSegment; // Append incoming data chunks
});
process.stdin.on('end', function() {
  rawData = rawData.split('\n'); // Split the accumulated input into lines
  executeProgram(); // Start the main program logic
});