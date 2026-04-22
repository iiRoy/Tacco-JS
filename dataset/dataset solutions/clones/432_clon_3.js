// This module orchestrates operations on a character sequence based on incoming commands.
// Each command modifies the sequence according to specific rules, aiming to fill empty slots (represented by 0).

// A utility function to determine if a given character is one of the special placement types.
const isDesignatedMarker = (charValue) => {
  if (typeof charValue !== 'string' || charValue.length !== 1) {
    return false; // Only single-character strings are considered markers
  }
  const knownMarkers = new Set(['A', 'B', 'C', 'D']);
  return knownMarkers.has(charValue);
};

// Renamed and refactored function from AA.
// Locates the first available (empty) position in the `workingCollection` and inserts `markerSymbol`.
// Returns true if a placement occurred, false otherwise.
function insertAtFirstEmptySlot(markerSymbol, workingCollection) {
  let itemHasBeenPlaced = false;
  // Iterate through the internal elements, skipping the 'X' boundary markers.
  for (let currentPosition = 1; currentPosition < workingCollection.length - 1; ++currentPosition) {
    // If an empty slot (0) is found, place the marker and exit.
    if (workingCollection[currentPosition] === 0) {
      workingCollection[currentPosition] = markerSymbol;
      itemHasBeenPlaced = true;
      break;
    }
  }
  return itemHasBeenPlaced;
}

// Renamed and refactored function from BB.
// Attempts to place 'B' based on specific adjacency rules. If no such spot is found,
// it falls back to placing 'B' in the first available empty slot.
function executeBPlacementStrategy(workingCollection) {
  // A sequence must have at least 3 elements (X 0 X) for internal checks.
  const minLengthForContextualPlacement = 3;
  if (workingCollection.length < minLengthForContextualPlacement) {
    // Fallback if the sequence is too short for specific rules.
    insertAtFirstEmptySlot("B", workingCollection);
    return;
  }

  let bSuccessfullyLocated = false;
  // Iterate backwards to find the rightmost suitable spot.
  for (let checkIndex = workingCollection.length - 2; checkIndex >= 1; --checkIndex) {
    const precedingElement = workingCollection[checkIndex - 1];
    const currentElement = workingCollection[checkIndex];
    const succeedingElement = workingCollection[checkIndex + 1];

    // Condition: previous element is not 'A', current is empty (0), and next is not 'A'.
    if (precedingElement !== "A" && currentElement === 0 && succeedingElement !== "A") {
      workingCollection[checkIndex] = "B"; // Place 'B'
      bSuccessfullyLocated = true;
      break; // Stop after the first suitable spot is found (rightmost due to reverse loop).
    }
  }

  // If no spot met the specific criteria, use the general placement strategy.
  if (!bSuccessfullyLocated) {
    insertAtFirstEmptySlot("B", workingCollection);
  }
}

// Renamed and refactored function from CC.
// Places 'C' adjacent to an existing non-empty element. If no such adjacency is found,
// it places 'C' at a calculated middle position.
function applyCProximityRule(sequenceData, originalSequenceLength) {
  let cHasBeenPositioned = false;
  const minimumInternalSpots = 1; // Need at least one 0 for proximity or middle placement

  // Check if there are enough internal spots to even consider placement.
  if (originalSequenceLength < minimumInternalSpots) {
    // If original length is 0, no placement is possible.
    // If original length is 1, only the single spot exists, which might be handled by middle logic.
    // For extreme cases, we could fall back to insertAtFirstEmptySlot, but the original
    // CC logic specifically targets `n%2==1 ? (n-1)/2+1 : n/2+1`, which might be invalid.
    // Let's ensure the middle placement fallback is robust.
  } else {
    // First, attempt to place 'C' adjacent to an existing non-zero element.
    for (let currentIdx = 1; currentIdx < sequenceData.length - 1; ++currentIdx) {
      const currentElement = sequenceData[currentIdx];
      const nextElement = sequenceData[currentIdx + 1];
      const previousElement = sequenceData[currentIdx - 1];

      // If current element is not empty (0) and the next is empty (0)
      if (currentElement !== 0 && nextElement === 0) {
        sequenceData[currentIdx + 1] = "C";
        cHasBeenPositioned = true;
        break;
      }
      // If current element is not empty (0) and the previous is empty (0)
      if (currentElement !== 0 && previousElement === 0) {
        sequenceData[currentIdx - 1] = "C";
        cHasBeenPositioned = true;
        break;
      }
    }
  }

  // If 'C' wasn't placed by proximity, apply the middle-based rule.
  if (!cHasBeenPositioned) {
    let calculatedMidIndex;
    // Calculate the target index based on the original total number of elements.
    // Adjust for the 'X' boundaries in `sequenceData`.
    if (originalSequenceLength % 2 === 1) { // Odd length
      calculatedMidIndex = Math.floor(originalSequenceLength / 2) + 1;
    } else { // Even length
      calculatedMidIndex = originalSequenceLength / 2 + 1;
    }

    // Ensure the calculated index is valid within the bounds of the actual sequence (excluding 'X's).
    if (calculatedMidIndex >= 1 && calculatedMidIndex < sequenceData.length - 1) {
      sequenceData[calculatedMidIndex] = "C";
      cHasBeenPositioned = true;
    } else {
      // Final fallback if even the middle placement logic fails (e.g., due to originalSequenceLength being 0 or 1).
      insertAtFirstEmptySlot("C", sequenceData);
    }
  }
}

// Renamed and refactored function from DD.
// Identifies the largest contiguous gap of '0's bounded by 'X's, and places 'D' in its center.
// If no such gap is found, it falls back to placing 'D' in the first available empty slot.
function processLargestGapForD(targetCollection) {
  const minimumLengthForGapSearch = 3; // Need at least X 0 X for a meaningful gap.

  if (targetCollection.length < minimumLengthForGapSearch) {
    insertAtFirstEmptySlot("D", targetCollection); // Fallback if sequence is too short.
    return;
  }

  // Stores information about the best gap found: { centerIndex, radiusFromCenter }.
  let optimalGapMetrics = {
    centerIndex: -1,
    reach: 0
  };

  // Iterate through each potential center point for a gap (excluding 'X' boundaries).
  for (let potentialCenter = 1; potentialCenter < targetCollection.length - 1; ++potentialCenter) {
    // Skip if the current position is already filled.
    if (targetCollection[potentialCenter] !== 0) {
      continue;
    }

    let leftCursor = potentialCenter;
    let rightCursor = potentialCenter;
    let currentReach = 0; // Corresponds to the 'cnt' variable in the original DD.
    let gapIsValid = false;

    // Expand outwards from the potentialCenter to determine the gap's extent.
    while (true) {
      let leftBoundaryHit = false;
      let rightBoundaryHit = false;

      // Check the element to the left of `leftCursor`.
      if (leftCursor - 1 >= 0) { // Ensure we stay within array bounds.
        const charToLeft = targetCollection[leftCursor - 1];
        if (charToLeft === "X") {
          leftBoundaryHit = true;
        } else if (isDesignatedMarker(charToLeft)) {
          // If we hit an already placed A, B, C, or D, this is not a valid 'X'-bounded gap.
          currentReach = -1; // Mark as invalid.
          break;
        }
      } else { // If `leftCursor - 1` goes out of bounds, it implies hitting the implicit 'X'.
        leftBoundaryHit = true;
      }

      // Check the element to the right of `rightCursor`.
      if (rightCursor + 1 < targetCollection.length) { // Ensure we stay within array bounds.
        const charToRight = targetCollection[rightCursor + 1];
        if (charToRight === "X") {
          rightBoundaryHit = true;
        } else if (isDesignatedMarker(charToRight)) {
          // If we hit an already placed A, B, C, or D, this is not a valid 'X'-bounded gap.
          currentReach = -1; // Mark as invalid.
          break;
        }
      } else { // If `rightCursor + 1` goes out of bounds, it implies hitting the implicit 'X'.
        rightBoundaryHit = true;
      }

      // If both sides have hit 'X' boundaries (or array edges that function as 'X'), the expansion is complete.
      if (leftBoundaryHit && rightBoundaryHit) {
        gapIsValid = true;
        break;
      }

      // If not both boundaries are hit, continue expanding.
      if (!leftBoundaryHit) {
        leftCursor--;
      }
      if (!rightBoundaryHit) {
        rightCursor++;
      }
      currentReach++; // Increment the "reach" or radius from the center.
    } // End of while(true) for gap expansion.

    // If a valid 'X'-bounded gap was found and its reach is greater than the current best.
    if (gapIsValid && currentReach !== -1 && currentReach > optimalGapMetrics.reach) {
      optimalGapMetrics.reach = currentReach;
      optimalGapMetrics.centerIndex = potentialCenter;
    }
  } // End of for loop iterating potential centers.

  // If a valid optimal gap was identified, place 'D' at its center.
  if (optimalGapMetrics.reach > 0) {
    targetCollection[optimalGapMetrics.centerIndex] = "D";
  } else {
    // Fallback if no suitable gap was found.
    insertAtFirstEmptySlot("D", targetCollection);
  }
}

// Module for file system operations.
const fileSystemInterface = require('fs');
const standardInputDevice = '/dev/stdin'; // Constant for the standard input path.

let rawInputContent;
try {
  rawInputContent = fileSystemInterface.readFileSync(standardInputDevice, 'utf8');
} catch (error) {
  console.error("Error reading from standard input:", error.message);
  // Provide fallback data for local testing or if standard input is unavailable.
  rawInputContent = `5 3\nA\nB\nC\n0 0`;
  console.log("Using example fallback input data.");
}

// Prepare input lines for processing. Filter out any empty lines.
let commandQueue = rawInputContent.trim().split('\n').filter(line => line.length > 0);

// A map to dispatch commands to their respective handler functions.
const commandHandlers = {
  "A": (sequence, length) => insertAtFirstEmptySlot("A", sequence),
  "B": (sequence, length) => executeBPlacementStrategy(sequence),
  "C": (sequence, length) => applyCProximityRule(sequence, length),
  "D": (sequence, length) => processLargestGapForD(sequence),
  // Handler for unrecognized commands.
  "UNKNOWN_COMMAND": (sequence, length, cmd) => console.warn(`Unrecognized command received: ${cmd}. Skipping.`)
};

// Main loop for processing multiple test cases (sequences and operations).
while (commandQueue.length > 0) {
  const currentTestLine = commandQueue.shift();
  // If the line is unexpectedly empty, skip it.
  if (!currentTestLine) continue;

  const sequenceDimensions = currentTestLine.split(' ').map(Number);
  const totalSequenceElements = sequenceDimensions[0]; // Corresponds to original 'n'.
  const numberOfOperations = sequenceDimensions[1]; // Corresponds to original 'm'.

  // Termination condition: 0 0 indicates end of input.
  if (totalSequenceElements === 0 && numberOfOperations === 0) {
    break;
  }

  // Initialize the mutable sequence with '0's, flanked by 'X' boundary markers.
  let currentMutableSequence = Array(totalSequenceElements).fill(0);
  currentMutableSequence.unshift("X"); // Add left boundary.
  currentMutableSequence.push("X"); // Add right boundary.

  // Execute the specified number of operations for the current sequence.
  for (let opCounter = 0; opCounter < numberOfOperations; ++opCounter) {
    const operationInstruction = commandQueue.shift();
    if (!operationInstruction) {
      console.error("Error: Ran out of operation instructions prematurely.");
      break; // Exit inner loop if no more commands.
    }

    // Retrieve the appropriate handler or use the 'UNKNOWN_COMMAND' handler.
    const executeHandler = commandHandlers[operationInstruction] || commandHandlers["UNKNOWN_COMMAND"];
    executeHandler(currentMutableSequence, totalSequenceElements, operationInstruction);
  }

  // Remove the 'X' boundary markers before final output.
  currentMutableSequence.shift();
  currentMutableSequence.pop();

  // Transform '0's to '#' and join the elements for the final output string.
  const formattedResult = currentMutableSequence
    .map(element => (element === 0 ? '#' : element))
    .join('');

  console.log(formattedResult);
}