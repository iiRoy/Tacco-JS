const subtractPoints = (firstPoint, secondPoint) => ({
  x: secondPoint.x - firstPoint.x,
  y: secondPoint.y - firstPoint.y,
});

const computeCrossProductZ = (vectorOne, vectorTwo) =>
  vectorOne.x * vectorTwo.y - vectorOne.y * vectorTwo.x;

(function(sourceData) {
  const allInputLines = sourceData.replace(/\n$/, '').split('\n');

  for (const currentInputEntry of allInputLines) {
    const coordinateSet = currentInputEntry.split(' ').map(Number);

    const pointA = { x: coordinateSet[0], y: coordinateSet[1] };
    const pointB = { x: coordinateSet[2], y: coordinateSet[3] };
    const pointC = { x: coordinateSet[4], y: coordinateSet[5] };
    const pointTest = { x: coordinateSet[6], y: coordinateSet[7] };

    const vectorAB = subtractPoints(pointA, pointB);
    const vectorAC = subtractPoints(pointA, pointC);
    const vectorAP = subtractPoints(pointA, pointTest);

    const areaDivisor = computeCrossProductZ(vectorAB, vectorAC);

    if (areaDivisor === 0) {
      console.log('NO');
      continue;
    }

    const lambdaV = computeCrossProductZ(vectorAP, vectorAC) / areaDivisor;
    const lambdaW = computeCrossProductZ(vectorAB, vectorAP) / areaDivisor;
    const lambdaU = 1 - lambdaV - lambdaW;

    if (lambdaU > 0 && lambdaV > 0 && lambdaW > 0) {
      console.log('YES');
    } else {
      console.log('NO');
    }
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
