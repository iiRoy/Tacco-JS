const parseCoordinates = (lineString) => lineString.split(' ').map(Number);

console.log((inputString => {
  const allInputLines = inputString.trim().split('\n');

  const numPairs = parseCoordinates(allInputLines[0])[0];

  const redPointsCollection = [];
  const bluePointsCollection = [];

  for (let k = 0; k < numPairs; k++) {
    redPointsCollection.push(parseCoordinates(allInputLines[k + 1]));
  }

  for (let k = 0; k < numPairs; k++) {
    bluePointsCollection.push(parseCoordinates(allInputLines[numPairs + 1 + k]));
  }

  bluePointsCollection.sort(([coordAX], [coordBX]) => coordAX - coordBX);

  let totalMatchedPairs = 0;

  const findOptimalRedPointIndex = (currentBlueX, currentBlueY, availableRedPoints) => {
    let candidateRedPointIndex = -1;
    let highestCandidateRedY = -1;

    for (let redPointIdx = 0; redPointIdx < availableRedPoints.length; redPointIdx++) {
      const [redXCoord, redYCoord] = availableRedPoints[redPointIdx];

      if (currentBlueX < redXCoord) {
        continue;
      }

      if (currentBlueY > redYCoord) {
        if (redYCoord > highestCandidateRedY) {
          highestCandidateRedY = redYCoord;
          candidateRedPointIndex = redPointIdx;
        }
      }
    }
    return candidateRedPointIndex;
  };

  for (let blueIdx = 0; blueIdx < numPairs; blueIdx++) {
    const [currentBlueX, currentBlueY] = bluePointsCollection[blueIdx];

    const matchedRedIndex = findOptimalRedPointIndex(currentBlueX, currentBlueY, redPointsCollection);

    if (matchedRedIndex !== -1) {
      redPointsCollection.splice(matchedRedIndex, 1);
      totalMatchedPairs++;
    }
  }

  return `${totalMatchedPairs}`;

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
