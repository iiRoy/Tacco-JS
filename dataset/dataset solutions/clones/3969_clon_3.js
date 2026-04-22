(function processInputAndFindMatches(incomingData) {
  // Perform an initial check for valid input. If the input is not a string
  // or is empty after trimming whitespace, there are no points to process.
  if (typeof incomingData !== 'string' || incomingData.trim() === '') {
    return '0'; // Return "0" as no matches can be found.
  }

  // Helper utility to safely parse a string segment into an integer.
  // Uses the bitwise OR 0 trick for fast integer conversion, similar to the original.
  const convertSegmentToInteger = (segmentString) => (segmentString | 0);

  // Defines the custom sorting logic for point coordinates.
  // This function determines the value used for comparison during sorting.
  // It specifically returns the minimum of a point's X and Y coordinates.
  const calculatePointSortKey = (coordinatePair) => {
    // Defensive check: ensure the input is an array and has at least two elements.
    // If not, return Infinity to push malformed points to the end of a sorted list.
    if (!Array.isArray(coordinatePair) || coordinatePair.length < 2) {
      console.error("Encountered an invalid coordinate pair during sorting. Skipping or handling defensively.");
      return Infinity;
    }
    return Math.min(coordinatePair[0], coordinatePair[1]);
  };

  // --- Input Processing Phase ---
  // Split the entire raw input string into an array of individual lines.
  const allInputLines = incomingData.trim().split('\n');

  // The very first line of the input contains the count 'N',
  // which represents the number of red points and blue points.
  const totalPointSetSize = convertSegmentToInteger(allInputLines[0]);

  // Validate the extracted size. If it's not a positive number,
  // there are no valid points to process, so we exit early.
  if (isNaN(totalPointSetSize) || totalPointSetSize <= 0) {
    return '0';
  }

  // Discard the first line (which contained 'N') as it has been processed.
  // The remaining lines contain the actual point coordinates.
  const coordinateDataLines = allInputLines.slice(1);

  // Initialize two distinct arrays to hold the red and blue point data.
  const arrayOfRedPoints = [];
  const arrayOfBluePoints = [];

  // Iterate through the data lines to populate the point arrays.
  // The first 'N' lines after the initial 'N' are red points,
  // and the subsequent 'N' lines are blue points.
  for (let currentLineIdx = 0; currentLineIdx < totalPointSetSize * 2; currentLineIdx++) {
    const lineContent = coordinateDataLines[currentLineIdx];

    // Split each line by space to get X and Y coordinates, then convert them to integers.
    const processedCoordinates = lineContent.split(' ').map(convertSegmentToInteger);

    // Additional validation: ensure each point has at least two coordinates (X and Y).
    if (processedCoordinates.length < 2) {
      console.warn(`Skipping malformed point data on line ${currentLineIdx + 2}: "${lineContent}". Expected X Y.`);
      continue; // Move to the next line if the current one is malformed.
    }

    // Distribute the parsed point into the correct collection (red or blue).
    if (currentLineIdx < totalPointSetSize) {
      arrayOfRedPoints.push(processedCoordinates);
    } else {
      arrayOfBluePoints.push(processedCoordinates);
    }
  }

  // --- Sorting Phase ---
  // Sort the collection of red points using our custom `calculatePointSortKey` function.
  // The sort order is ascending based on the minimum of X and Y.
  arrayOfRedPoints.sort((pointA, pointB) => calculatePointSortKey(pointA) - calculatePointSortKey(pointB));

  // Similarly, sort the collection of blue points.
  arrayOfBluePoints.sort((pointA, pointB) => calculatePointSortKey(pointA) - calculatePointSortKey(pointB));

  // --- Matching Algorithm Phase ---
  let totalSuccessfulMatches = 0; // Keeps track of how many red points found a blue point.
  let bluePointSearchCursor = 0; // An optimization: indicates the starting index for searching in blue points.
                                 // This prevents re-checking blue points that have already been considered.

  // Loop through each red point available.
  for (let redPointIterator = 0; redPointIterator < totalPointSetSize; redPointIterator++) {
    const currentRedPoint = arrayOfRedPoints[redPointIterator];
    const redXCoordinate = currentRedPoint[0];
    const redYCoordinate = currentRedPoint[1];

    // For the current red point, search for a suitable blue point.
    // The search starts from `bluePointSearchCursor` to maintain the greedy approach
    // and ensure each blue point is used at most once.
    for (let bluePointIterator = bluePointSearchCursor; bluePointIterator < totalPointSetSize; bluePointIterator++) {
      const currentBluePoint = arrayOfBluePoints[bluePointIterator];
      const blueXCoordinate = currentBluePoint[0];
      const blueYCoordinate = currentBluePoint[1];

      // The core matching condition: A red point (rx, ry) matches a blue point (bx, by)
      // if rx < bx AND ry < by.
      if (redXCoordinate < blueXCoordinate && redYCoordinate < blueYCoordinate) {
        // If a match is found:
        totalSuccessfulMatches++; // Increment the count of matches.
        bluePointSearchCursor = bluePointIterator + 1; // Advance the cursor for the next red point's search.
        break; // Exit the inner loop, as this red point has found its match.
      }
    }
  }

  // The problem typically expects the output as a string.
  return String(totalSuccessfulMatches);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));