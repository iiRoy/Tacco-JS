(function() {
  const processInputAndSolve = (rawInputString) => {
    // Helper function to convert a space-separated string of numbers into an array of numbers.
    const parseNumericLine = (lineContent) => lineContent.split(' ').map(Number);

    // Step 1: Parse the entire input string into an array of number arrays.
    const allParsedLines = rawInputString.trim().split('\n').map(parseNumericLine);

    const numberOfPairs = allParsedLines[0][0]; // Extract N from the first line.

    // Helper function to distribute the parsed lines into red and blue point sets.
    const distributePoints = (dataLines, count) => {
      const redCoordinates = [];
      const blueCoordinates = [];
      for (let currentIdx = 0; currentIdx < count; ++currentIdx) {
        redCoordinates.push(dataLines[currentIdx + 1]); // Red points start after N
        blueCoordinates.push(dataLines[count + currentIdx + 1]); // Blue points start after N + red points
      }
      return { reds: redCoordinates, blues: blueCoordinates };
    };

    const { reds: redPoints, blues: bluePoints } = distributePoints(allParsedLines, numberOfPairs);

    // Define a comparison function for sorting points by their X-coordinate in descending order.
    const comparePointsByXDesc = (pointOne, pointTwo) => pointTwo[0] - pointOne[0];

    // Step 2: Sort both red and blue points by their X-coordinate in descending order.
    redPoints.sort(comparePointsByXDesc);
    bluePoints.sort(comparePointsByXDesc);

    let successfulMatchesCount = 0;

    // Helper function to find the best matching red point for a given blue point.
    // A "best" match is a red point with the highest Y-coordinate that satisfies the conditions.
    const findBestRedPointCandidate = (targetBlueX, targetBlueY, availableRedPoints) => {
      let bestCandidateIndex = -1;
      let highestYFound = -1; // Initialize with a value that no valid Y-coordinate will be less than.

      const currentRedPointsLength = availableRedPoints.length; // Cache length for performance.

      for (let redPointIndex = 0; redPointIndex < currentRedPointsLength; ++redPointIndex) {
        const [currentRedX, currentRedY] = availableRedPoints[redPointIndex];

        // Condition 1: Red point's X-coordinate must be less than blue point's X-coordinate.
        if (targetBlueX <= currentRedX) {
          continue; // Skip if red point is not to the left of the blue point.
        }

        // Condition 2: Red point's Y-coordinate must be less than blue point's Y-coordinate.
        // Condition 3: Among valid red points, choose the one with the largest Y-coordinate.
        if (currentRedY < targetBlueY && currentRedY > highestYFound) {
          highestYFound = currentRedY;
          bestCandidateIndex = redPointIndex;
        }
      }
      return { index: bestCandidateIndex, yCoordinate: highestYFound };
    };

    // Step 3: Iterate through each blue point to find a matching red point.
    for (let bluePointIterator = 0; bluePointIterator < numberOfPairs; ++bluePointIterator) {
      const [currentBlueX, currentBlueY] = bluePoints[bluePointIterator];

      const { index: matchedRedPointIdx, yCoordinate: matchedRedPointY } = findBestRedPointCandidate(
        currentBlueX,
        currentBlueY,
        redPoints
      );

      // If a valid red point was found (i.e., its Y-coordinate is not the initial -1).
      if (matchedRedPointY >= 0) {
        redPoints.splice(matchedRedPointIdx, 1); // Remove the matched red point to prevent reuse.
        successfulMatchesCount++;
      }
    }

    // Step 4: Return the total count of successful matches as a string.
    return `${successfulMatchesCount}`;
  };

  console.log(processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8')));
})();
