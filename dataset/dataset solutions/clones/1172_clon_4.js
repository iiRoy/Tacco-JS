var collectedSegments = [];
var inputSource = process.stdin;

inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', function(dataFragment) {
  collectedSegments.push(dataFragment);
});

inputSource.on('end', function() {
  const fullInputString = collectedSegments.join('');
  const stringParts = fullInputString.split(' ');

  const numericCoordinates = [];
  for (let i = 0; i < stringParts.length; i++) {
    numericCoordinates.push(Number(stringParts[i]));
  }

  const xCoord1 = numericCoordinates[0];
  const yCoord1 = numericCoordinates[1];
  const xCoord2 = numericCoordinates[2];
  const yCoord2 = numericCoordinates[3];

  const squareValue = (val) => val * val;

  const deltaX = xCoord1 - xCoord2;
  const deltaY = yCoord1 - yCoord2;

  const squaredDeltaX = squareValue(deltaX);
  const squaredDeltaY = squareValue(deltaY);

  const sumOfSquares = squaredDeltaX + squaredDeltaY;

  const distanceResult = Math.sqrt(sumOfSquares);

  console.log(distanceResult);
});
