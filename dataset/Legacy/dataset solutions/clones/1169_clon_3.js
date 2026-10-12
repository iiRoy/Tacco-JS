var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const RADIX_DECIMAL = 10;

function parseIntegerFromString(strValue) {
  return parseInt(strValue, RADIX_DECIMAL);
}

function calculateSquare(numberValue) {
  return numberValue * numberValue;
}

inputHandler.on('line', function (inputLineContent) {
  var coordinateParts = inputLineContent.split(' ');

  var x1Coordinate = parseIntegerFromString(coordinateParts[0]);
  var y1Coordinate = parseIntegerFromString(coordinateParts[1]);
  var x2Coordinate = parseIntegerFromString(coordinateParts[2]);
  var y2Coordinate = parseIntegerFromString(coordinateParts[3]);

  var deltaX = x1Coordinate - x2Coordinate;
  var deltaY = y1Coordinate - y2Coordinate;

  var squaredDeltaX = calculateSquare(deltaX);
  var squaredDeltaY = calculateSquare(deltaY);

  var sumOfSquaredDifferences = squaredDeltaX + squaredDeltaY;

  var finalDistance = Math.sqrt(sumOfSquaredDifferences);

  console.log(finalDistance.toFixed(8));
  process.exit();
});

process.stdin.on('end', function () {
  // This handler remains for structural consistency, though process.exit() prevents it from being reached.
});
