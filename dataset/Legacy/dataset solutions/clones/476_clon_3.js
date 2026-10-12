function getAbsoluteValue(value) {
  // Optimized absolute value using bitwise operations
  const signMask = value >> 31;
  return (value ^ signMask) - signMask;
}

function encodePosition(xCoord, yCoord) {
  // Encodes (x, y) coordinates into a single integer.
  // Lower 11 bits for y, higher bits for x.
  // Max y is 1023 (2^10 - 1), so 11 bits are sufficient.
  return (xCoord << 11) + yCoord;
}

function calculateDistance(fromEncodedPos, toEncodedPos) {
  // Decodes positions and calculates Manhattan distance.
  // Extract x and y coordinates using bitwise shifts and masks.
  const fromX = fromEncodedPos >> 11;
  const fromY = fromEncodedPos & 2047; // 2047 is 0b011111111111 (11 ones)
  const toX = toEncodedPos >> 11;
  const toY = toEncodedPos & 2047;

  return getAbsoluteValue(fromX - toX) + getAbsoluteValue(fromY - toY);
}

function findMinimum(valA, valB) {
  // Returns the minimum of two values using bitwise operations for speed.
  const difference = valA - valB;
  return valB + (difference & (difference >> 31));
}

function processGameLogic(inputLines) {
  let currentLineIndex = 0;

  // Main loop to process multiple test cases
  for (;;) {
    const currentFieldDimensionsLine = inputLines[currentLineIndex];
    const dimensionTokens = currentFieldDimensionsLine.split(' ');
    const gridWidth = Number(dimensionTokens[0]);
    const gridHeight = Number(dimensionTokens[1]);

    // Termination condition: 0 0 input
    if (gridWidth === 0 && gridHeight === 0) {
      break;
    }

    let startPointEncoded;
    let goalPointEncoded;
    // Stores coordinates for elements 1 through 5.
    // elementCoordinates[0] for '1', elementCoordinates[1] for '2', etc.
    const elementCoordinates = Array.from({ length: 5 }, () => []);

    // Read grid data, iterating from bottom-right to top-left as per original loop structure
    for (let row = gridHeight; row--;) {
      currentLineIndex++; // Move to the next line containing grid row data
      const gridRowString = inputLines[currentLineIndex];

      for (let col = gridWidth; col--;) {
        const cellCharacter = gridRowString[col];

        switch (cellCharacter) {
          case '.':
            // Empty cell, no action needed.
            break;
          case 'S':
            startPointEncoded = encodePosition(col, row);
            break;
          case 'G':
            goalPointEncoded = encodePosition(col, row);
            break;
          default: // Must be an element '1' through '5'
            const elementCategoryIndex = Number(cellCharacter) - 1;
            elementCoordinates[elementCategoryIndex].push(encodePosition(col, row));
            break;
        }
      }
    }

    const INFINITE_DISTANCE_VALUE = 1 << 30; // A large number representing infinity
    let optimalStartingElementCategory = -1;
    let minimumTotalPathDistance = INFINITE_DISTANCE_VALUE;

    // Iterate through each possible element category (0-4) to be the "initial" element
    for (let initialCategoryChoice = 0; initialCategoryChoice < 5; ++initialCategoryChoice) {
      // Dynamic Programming table: dpTable[category][item_index_in_category]
      // Stores the minimum distance to reach a specific item in a specific category.
      const dpTable = Array.from({ length: 5 }, (_, categoryIdx) =>
        Array(elementCoordinates[categoryIdx].length).fill(INFINITE_DISTANCE_VALUE)
      );

      // The first actual category to collect after 'S' is (initialCategoryChoice + 1) % 5
      const firstCollectibleCategory = (initialCategoryChoice + 1) % 5;
      const firstCategoryItemCount = elementCoordinates[firstCollectibleCategory].length;

      // Calculate initial distances from 'S' to all items in the first collectible category
      for (let itemIndex = 0; itemIndex < firstCategoryItemCount; ++itemIndex) {
        dpTable[firstCollectibleCategory][itemIndex] = calculateDistance(
          startPointEncoded,
          elementCoordinates[firstCollectibleCategory][itemIndex]
        );
      }

      // Propagate minimum distances through the sequence of categories (e.g., 1->2, 2->3, 3->4)
      // There are 3 such propagation steps
      for (let propagationStep = 0; propagationStep < 3; ++propagationStep) {
        const currentSourceCategory = (firstCollectibleCategory + propagationStep) % 5;
        const nextTargetCategory = (currentSourceCategory + 1) % 5;

        const currentSourceCategoryItemCount = elementCoordinates[currentSourceCategory].length;
        const nextTargetCategoryItemCount = elementCoordinates[nextTargetCategory].length;

        for (let sourceItemIdx = 0; sourceItemIdx < currentSourceCategoryItemCount; ++sourceItemIdx) {
          // If the current source item is unreachable, skip it
          if (dpTable[currentSourceCategory][sourceItemIdx] === INFINITE_DISTANCE_VALUE) {
            continue;
          }

          for (let targetItemIdx = 0; targetItemIdx < nextTargetCategoryItemCount; ++targetItemIdx) {
            const distanceBetweenItems = calculateDistance(
              elementCoordinates[currentSourceCategory][sourceItemIdx],
              elementCoordinates[nextTargetCategory][targetItemIdx]
            );
            const totalPathToTargetItem = dpTable[currentSourceCategory][sourceItemIdx] + distanceBetweenItems;

            // Update the DP table with the minimum distance found so far
            dpTable[nextTargetCategory][targetItemIdx] = findMinimum(
              dpTable[nextTargetCategory][targetItemIdx],
              totalPathToTargetItem
            );
          }
        }
      }

      // After all propagations, calculate distances from the last category in the sequence to 'G'
      const finalCategoryInSequence = (firstCollectibleCategory + 3) % 5;
      const finalCategoryItemCount = elementCoordinates[finalCategoryInSequence].length;

      for (let finalItemIdx = 0; finalItemIdx < finalCategoryItemCount; ++finalItemIdx) {
        // If the final item in the sequence is unreachable, skip it
        if (dpTable[finalCategoryInSequence][finalItemIdx] === INFINITE_DISTANCE_VALUE) {
            continue;
        }

        const pathFromFinalItemToGoal = dpTable[finalCategoryInSequence][finalItemIdx] +
                                        calculateDistance(elementCoordinates[finalCategoryInSequence][finalItemIdx], goalPointEncoded);

        // Update the overall minimum distance if a shorter path is found
        if (pathFromFinalItemToGoal < minimumTotalPathDistance) {
          minimumTotalPathDistance = pathFromFinalItemToGoal;
          optimalStartingElementCategory = initialCategoryChoice + 1; // Store the 1-indexed category
        }
      }
    }

    // Output the result for the current test case
    if (minimumTotalPathDistance === INFINITE_DISTANCE_VALUE) {
      console.log("NA");
    } else {
      console.log(optimalStartingElementCategory + " " + minimumTotalPathDistance);
    }

    currentLineIndex++; // Prepare for the next test case's dimension line
  }
}

let inputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  inputBuffer += chunk;
});
process.stdin.on('end', function() {
  const processedInputLines = inputBuffer.split('\n');
  processGameLogic(processedInputLines);
});
