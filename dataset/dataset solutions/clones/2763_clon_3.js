((rawData) => {
  const lines = rawData.split('\n');
  const firstLineParts = lines[0].split(' ');
  const numPoints = +firstLineParts[0];
  const dimensions = +firstLineParts[1];

  const parseCoordinateLine = (lineStr) => {
    return lineStr.replace(/\s\s+/g, ' ').trim().split(' ').filter(Boolean).map(Number);
  };

  const pointCoordinates = lines.slice(1, numPoints + 1).map(parseCoordinateLine);

  const isIntegerDistance = (point1, point2, dims) => {
    const calculatedDistance = calculateEuclideanDistance(point1, point2, dims);
    return Number.isInteger(calculatedDistance);
  };

  const totalIntegerDistancePairs = pointCoordinates.reduce((pairCount, currentPoint, idx1) => {
    const remainingPoints = pointCoordinates.slice(idx1 + 1);
    const pairsFromCurrentPoint = remainingPoints.reduce((integerDistancePairs, otherPoint) => {
      return isIntegerDistance(currentPoint, otherPoint, dimensions) ? integerDistancePairs + 1 : integerDistancePairs;
    }, 0);
    return pairCount + pairsFromCurrentPoint;
  }, 0);

  console.log(totalIntegerDistancePairs);

})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

function calculateEuclideanDistance(point1, point2, dims) {
  let sumOfSquaredDifferences = 0;
  for (let k = 0; k < dims; k++) {
    const difference = point1[k] - point2[k];
    sumOfSquaredDifferences += difference * difference;
  }
  return Math.sqrt(sumOfSquaredDifferences);
}
