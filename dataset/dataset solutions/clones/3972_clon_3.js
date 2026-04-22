const parseNumericLine = (lineStr) => {
  if (typeof lineStr !== 'string' || lineStr.trim() === '') {
    return [];
  }
  return lineStr.trim().split(' ').map(val => {
    const numericValue = parseInt(val, 10);
    // Include a basic check for non-numeric input.
    if (isNaN(numericValue)) {
      // In a real application, one might throw an error or handle this more robustly.
      // For this cloning exercise, we'll default to 0 and log a warning.
      console.warn(`Non-numeric value detected: '${val}'. Defaulting to 0.`);
      return 0;
    }
    return numericValue;
  });
};

const executeMatchingAlgorithm = (rawInputContent) => {
  // Normalize input string by trimming whitespace and splitting into lines.
  const allInputLines = rawInputContent.trim().split('\n');

  // Initial validation: check if any input lines are provided.
  if (!allInputLines || allInputLines.length === 0) {
    return '0'; // No input implies no possible matches.
  }

  // The first line contains the integer N, representing the number of red and blue points.
  const configurationData = parseNumericLine(allInputLines[0]);
  const numberOfPointPairs = configurationData[0];

  // Validate N: it must be a positive integer.
  if (numberOfPointPairs <= 0 || !Number.isInteger(numberOfPointPairs)) {
    return '0'; // Invalid N means no valid problem instance.
  }

  // Ensure that the total number of lines matches the expected count:
  // 1 line for N + (2 * N) lines for the points themselves.
  const minimumExpectedLines = 1 + (2 * numberOfPointPairs);
  if (allInputLines.length < minimumExpectedLines) {
    // This is an additional validation step not present in the original code.
    console.error(`Input error: Expected at least ${minimumExpectedLines} lines, but received ${allInputLines.length}.`);
    return '0';
  }

  // Parse all point coordinates from the remaining lines.
  // We slice from index 1 (skipping N) up to the expected end of point data.
  const parsedCoordinateSets = allInputLines.slice(1, minimumExpectedLines).map(line => parseNumericLine(line));

  // Separate the parsed points into red and blue point collections.
  // The first N sets are red points, the next N sets are blue points.
  const redPointCollection = parsedCoordinateSets.slice(0, numberOfPointPairs);
  const bluePointCollection = parsedCoordinateSets.slice(numberOfPointPairs, 2 * numberOfPointPairs);

  // Apply the greedy strategy: Sort blue points by their x-coordinate in ascending order.
  // This is crucial for the algorithm's specific matching behavior.
  bluePointCollection.sort((firstPoint, secondPoint) => firstPoint[0] - secondPoint[0]);

  let totalSuccessfulMatches = 0; // Counter for matched pairs.
  let currentBluePointCursor = 0; // Index for iterating through the blue points.

  // Main matching loop: Continues as long as there are blue points left to process.
  // The loop's cursor management handles dynamic array changes due to `splice`.
  while (currentBluePointCursor < bluePointCollection.length) {
    const activeBluePoint = bluePointCollection[currentBluePointCursor];
    const [blueX, blueY] = activeBluePoint; // Destructuring for clearer access.

    let bestRedYCoordinateFound = -1; // Tracks the highest y-coordinate of an eligible red point.
    let bestRedPointOverallIndex = -1; // Stores the array index of the best eligible red point.

    // Inner loop: Iterate through all currently available red points
    // to find the most suitable match for the 'activeBluePoint'.
    for (let currentRedPointIndex = 0; currentRedPointIndex < redPointCollection.length; currentRedPointIndex++) {
      const candidateRedPoint = redPointCollection[currentRedPointIndex];
      const [redX, redY] = candidateRedPoint; // Destructuring for clearer access.

      // The original code's specific condition:
      // `if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;`
      // This means a red point is skipped if it's strictly "above and to the right"
      // of the blue point in both dimensions.
      // We are interested in red points for which this condition is FALSE.
      const isRedPointStrictlyLargerThanBlue = (blueX < redX) && (blueY < redY);

      if (isRedPointStrictlyLargerThanBlue) {
        continue; // This red point is not a candidate according to the algorithm's rule.
      }

      // Among the red points that are NOT strictly larger than the blue point,
      // select the one with the highest y-coordinate.
      if (redY > bestRedYCoordinateFound) {
        bestRedYCoordinateFound = redY;
        bestRedPointOverallIndex = currentRedPointIndex;
      }
    }

    // After checking all red points for the current blue point:
    if (bestRedPointOverallIndex !== -1) {
      // A match has been successfully identified!
      // Remove both matched points from their respective collections.
      // This alters the array sizes and shifts subsequent elements.
      bluePointCollection.splice(currentBluePointCursor, 1);
      redPointCollection.splice(bestRedPointOverallIndex, 1);
      totalSuccessfulMatches++; // Increment the global match counter.

      // IMPORTANT: The `currentBluePointCursor` is NOT incremented here.
      // This is because removing an element at `currentBluePointCursor`
      // causes the *next* blue point to shift into the same index.
      // The loop will re-evaluate this new element in the next iteration.
    } else {
      // No suitable red point was found for the 'activeBluePoint'.
      // Therefore, this blue point cannot be matched, and we move to the next one.
      currentBluePointCursor++;
    }
  }

  // The final count of successful matches is converted to a string for output.
  return String(totalSuccessfulMatches);
};

// This is the entry point for the script.
// It reads all input from '/dev/stdin' (standard input),
// passes it to the matching algorithm, and prints the result to standard output.
console.log(executeMatchingAlgorithm(require('fs').readFileSync('/dev/stdin', 'utf8')));