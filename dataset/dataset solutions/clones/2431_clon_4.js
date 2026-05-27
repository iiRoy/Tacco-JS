function processCoordinates(rawInput) {
  const lines = rawInput.split('\n');
  const pointQuantity = Number(lines[0]);

  const coordinateSet = lines.slice(1, pointQuantity + 1).map(lineSegment => {
    const [xVal, yVal] = lineSegment.split(' ').map(Number);
    return { xVal, yVal };
  });

  const computeDistance = (pointAlpha, pointBeta) => {
    const deltaX = pointAlpha.xVal - pointBeta.xVal;
    const deltaY = pointAlpha.yVal - pointBeta.yVal;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  };

  const totalDistanceSum = coordinateSet.reduce((accumulator, currentPoint, currentIndex) => {
    const distancesFromCurrent = coordinateSet.slice(currentIndex + 1).map(subsequentPoint =>
      computeDistance(currentPoint, subsequentPoint)
    );
    return accumulator + distancesFromCurrent.reduce((sum, dist) => sum + dist, 0);
  }, 0);

  console.log(totalDistanceSum * 2 / pointQuantity);
}

processCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
