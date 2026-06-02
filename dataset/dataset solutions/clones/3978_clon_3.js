console.log((function(rawInputString) {
  const inputLines = rawInputString.trim().split('\n');
  const numericDataLines = inputLines.map(lineSegment => lineSegment.split(' ').map(valueString => parseInt(valueString, 10)));

  const totalPointsCount = numericDataLines[0][0];
  const allPointsCoordinates = numericDataLines.slice(1);

  // Populate red points and blue points arrays
  const redPointsCollection = Array.from({ length: totalPointsCount }, (_, index) => allPointsCoordinates[index]);
  const bluePointsCollection = Array.from({ length: totalPointsCount }, (_, index) => allPointsCoordinates[totalPointsCount + index]);

  // Sort points by their X-coordinate in descending order
  redPointsCollection.sort((pointA, pointB) => pointB[0] - pointA[0]);
  bluePointsCollection.sort((pointA, pointB) => pointB[0] - pointA[0]);

  let matchedPairsCounter = 0;

  // Helper function to find the best matching red point for a given blue point
  const locateBestRedPointIndex = (currentBlueXCoord, currentBlueYCoord, availableRedPointsList) => {
    let bestCandidateRedPointIndex = -1;

    // Iterate through available red points. Since they are sorted by X-descending,
    // the first one satisfying the conditions will have the largest X.
    for (let redPointIterationIndex = 0; redPointIterationIndex < availableRedPointsList.length; redPointIterationIndex++) {
      const [redXValue, redYValue] = availableRedPointsList[redPointIterationIndex];

      // Guard clause: Red point's X must be strictly less than blue point's X
      if (currentBlueXCoord <= redXValue) {
        continue; // Skip if red point is to the right or at the same X
      }

      // Condition: Red point's Y must be strictly less than blue point's Y
      if (currentBlueYCoord > redYValue) {
        bestCandidateRedPointIndex = redPointIterationIndex;
        // The original logic effectively picks the first valid match due to the `by > max[1]` condition
        // and the descending X-sort. A `break` here achieves the same behavior.
        break;
      }
    }
    return bestCandidateRedPointIndex;
  };

  // Main loop to find matches for each blue point
  for (let bluePointIterationIndex = 0; bluePointIterationIndex < totalPointsCount; bluePointIterationIndex++) {
    const [currentBlueXCoord, currentBlueYCoord] = bluePointsCollection[bluePointIterationIndex];

    const foundMatchIndex = locateBestRedPointIndex(currentBlueXCoord, currentBlueYCoord, redPointsCollection);

    if (foundMatchIndex !== -1) {
      redPointsCollection.splice(foundMatchIndex, 1); // Remove the matched red point
      matchedPairsCounter++;
    }
  }

  return `${matchedPairsCounter}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
