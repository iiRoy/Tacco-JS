var inputBuffer = '';
var inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', function(receivedChunk) {
  inputBuffer += receivedChunk;
});

function computeEuclideanDistance(coord1X, coord1Y, coord2X, coord2Y) {
  const deltaX = coord1X - coord2X;
  const deltaY = coord1Y - coord2Y;

  const squaredDeltaX = deltaX * deltaX;
  const squaredDeltaY = deltaY * deltaY;

  const sumOfSquaredDifferences = squaredDeltaX + squaredDeltaY;

  return Math.sqrt(sumOfSquaredDifferences);
}

inputSource.on('end', function() {
  var parsedNumbers = inputBuffer.split(" ").map(Number);

  const x1Coordinate = parsedNumbers[0];
  const y1Coordinate = parsedNumbers[1];
  const x2Coordinate = parsedNumbers[2];
  const y2Coordinate = parsedNumbers[3];

  var calculatedDistance = computeEuclideanDistance(x1Coordinate, y1Coordinate, x2Coordinate, y2Coordinate);
  console.log(calculatedDistance);
});
