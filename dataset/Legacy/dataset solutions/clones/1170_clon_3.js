function computeEuclideanDistance(point1X, point1Y, point2X, point2Y) {
  const deltaXCoordinate = point1X - point2X;
  const deltaYCoordinate = point1Y - point2Y;

  const squaredDeltaX = Math.pow(deltaXCoordinate, 2);
  const squaredDeltaY = Math.pow(deltaYCoordinate, 2);

  const sumOfSquaredDifferences = squaredDeltaX + squaredDeltaY;

  return Math.sqrt(sumOfSquaredDifferences);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (inputDataSegment) {
  const coordinateStringArray = inputDataSegment.split(" ");

  const firstPointX = parseFloat(coordinateStringArray[0]);
  const firstPointY = parseFloat(coordinateStringArray[1]);
  const secondPointX = parseFloat(coordinateStringArray[2]);
  const secondPointY = parseFloat(coordinateStringArray[3]);

  const calculatedDistance = computeEuclideanDistance(firstPointX, firstPointY, secondPointX, secondPointY);

  console.log(calculatedDistance);
});
