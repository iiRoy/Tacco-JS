console.log((inputData => {
  const inputLines = inputData.trim().split('\n');
  const pointQuantity = parseInt(inputLines[0], 10);

  const redPointCollection = [];
  const bluePointCollection = [];

  for (let k = 1; k <= pointQuantity; k++) {
    const [coordX, coordY] = inputLines[k].split(' ').map(Number);
    redPointCollection.push({ x: coordX, y: coordY });
  }

  for (let k = pointQuantity + 1; k <= 2 * pointQuantity; k++) {
    const [coordX, coordY] = inputLines[k].split(' ').map(Number);
    bluePointCollection.push({ x: coordX, y: coordY });
  }

  bluePointCollection.sort((ptA, ptB) => ptA.x - ptB.x);

  let totalMatches = 0;
  const availableRedIndices = new Set(Array.from({ length: pointQuantity }, (_, i) => i));

  for (const currentBluePoint of bluePointCollection) {
    let bestRedYValue = -1;
    let bestRedPointIndex = -1;

    for (const redIndexCandidate of availableRedIndices) {
      const candidateRedPoint = redPointCollection[redIndexCandidate];

      // The original code's 'continue' condition:
      // if ( bp[i][0] < rp[j][0] && bp[i][1] < rp[j][1] ) continue;
      // This means a red point is considered eligible if it's NOT strictly
      // to the top-right of the blue point.
      // Equivalently, if (blueX >= redX OR blueY >= redY).
      if (currentBluePoint.x >= candidateRedPoint.x || currentBluePoint.y >= candidateRedPoint.y) {
        // Among eligible red points, select the one with the highest Y-coordinate.
        if (candidateRedPoint.y > bestRedYValue) {
          bestRedYValue = candidateRedPoint.y;
          bestRedPointIndex = redIndexCandidate;
        }
      }
    }

    if (bestRedPointIndex !== -1) {
      availableRedIndices.delete(bestRedPointIndex);
      totalMatches++;
    }
  }

  return `${totalMatches}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
