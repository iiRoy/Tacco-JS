const main = (inputData) => {
  const dataLines = inputData.split('\n');
  const totalPoints = Number(dataLines[0]);

  const coordinateSet = Array.from({ length: totalPoints }, (_, index) =>
    dataLines[index + 1].split(' ').map(Number)
  );

  const { minXVal, maxXVal, minYVal, maxYVal } = coordinateSet.reduce(
    (accumulator, currentCoords) => ({
      minXVal: Math.min(accumulator.minXVal, currentCoords[0]),
      maxXVal: Math.max(accumulator.maxXVal, currentCoords[0]),
      minYVal: Math.min(accumulator.minYVal, currentCoords[1]),
      maxYVal: Math.max(accumulator.maxYVal, currentCoords[1]),
    }),
    {
      minXVal: Infinity,
      maxXVal: -Infinity,
      minYVal: Infinity,
      maxYVal: -Infinity,
    }
  );

  const boundaryIndices = new Set();
  coordinateSet.forEach((currentCoords, coordIndex) => {
    const [xComponent, yComponent] = currentCoords;
    if (
      xComponent === minXVal ||
      xComponent === maxXVal ||
      yComponent === minYVal ||
      yComponent === maxYVal
    ) {
      boundaryIndices.add(coordIndex);
    }
  });

  const selectedPoints = Array.from(boundaryIndices).map(
    (idx) => coordinateSet[idx]
  );

  const allCalculatedDistances = selectedPoints.flatMap((firstPoint, i) =>
    selectedPoints.slice(i + 1).map((secondPoint) => {
      const [x1, y1] = firstPoint;
      const [x2, y2] = secondPoint;
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    })
  );

  const finalMaximumDistance = allCalculatedDistances.length > 0 ? Math.max(...allCalculatedDistances) : undefined;

  console.log(finalMaximumDistance);
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
