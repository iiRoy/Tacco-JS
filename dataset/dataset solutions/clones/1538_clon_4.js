const processInputData = (rawData) => {
  const lineSegments = rawData.split("\n");
  const totalPointsCount = Number(lineSegments[0]);

  const pointCoordinates = lineSegments.slice(1, totalPointsCount + 1).map(segment => {
    const [xValue, yValue] = segment.split(" ").map(Number);
    return { x: xValue, y: yValue };
  });

  const greatestManhattanSeparation = pointCoordinates.reduce((currentMaximum, primaryPoint, primaryIndex) => {
    const separationsFromPrimary = pointCoordinates.slice(primaryIndex + 1).map(secondaryPoint => {
      return Math.abs(primaryPoint.x - secondaryPoint.x) + Math.abs(primaryPoint.y - secondaryPoint.y);
    });

    if (separationsFromPrimary.length > 0) {
      const maxFromCurrent = Math.max(...separationsFromPrimary);
      return Math.max(currentMaximum, maxFromCurrent);
    }

    return currentMaximum;
  }, 0);

  console.log(greatestManhattanSeparation);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
