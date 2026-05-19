((rawInputData) => {
  const inputLines = rawInputData.split('\n');

  const firstLineParts = inputLines[0].trim().split(/\s+/);
  const pointCount = +firstLineParts[0];
  const dimensionCount = +firstLineParts[1];

  const allPoints = [];
  for (let pointIndex = 1; pointIndex <= pointCount; pointIndex++) {
    const currentLineContent = inputLines[pointIndex];
    const parsedCoordinates = currentLineContent.trim().split(/\s+/).map(Number);
    allPoints.push(parsedCoordinates);
  }

  let integerDistancePairs = 0;

  for (let outerIndex = 0; outerIndex < pointCount; outerIndex++) {
    const currentPoint = allPoints[outerIndex];
    for (let innerIndex = outerIndex + 1; innerIndex < pointCount; innerIndex++) {
      const comparedPoint = allPoints[innerIndex];
      const calculatedDistance = calculateEuclideanDistance(currentPoint, comparedPoint, dimensionCount);
      if (Number.isInteger(calculatedDistance)) {
        integerDistancePairs++;
      }
    }
  }

  console.log(integerDistancePairs);

})(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

function calculateEuclideanDistance(pointOne, pointTwo, dimCount) {
  const sumOfSquaredDifferences = pointOne.reduce((accumulator, valA, index) => {
    const difference = valA - pointTwo[index];
    return accumulator + (difference * difference);
  }, 0);
  return Math.sqrt(sumOfSquaredDifferences);
}
