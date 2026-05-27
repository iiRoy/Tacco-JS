function processCoordinates(inputLines) {
  const extractCoordinateValue = (coordStrings, index) => {
    return parseFloat(coordStrings[index]);
  };

  const coordinateStrings = inputLines[0].split(/\s+/);

  const firstX = extractCoordinateValue(coordinateStrings, 0);
  const firstY = extractCoordinateValue(coordinateStrings, 1);
  const secondX = extractCoordinateValue(coordinateStrings, 2);
  const secondY = extractCoordinateValue(coordinateStrings, 3);

  const deltaX = secondX - firstX;
  const deltaY = secondY - firstY;

  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  const sumOfAbsDiffs = absDeltaX + absDeltaY;

  const calculatedDistance = Math.sqrt(sumOfAbsDiffs);

  const outputPrecision = 6;

  console.log(calculatedDistance.toFixed(outputPrecision));
}

function rotateString(inputStr, rotationAmount) {
  const stringLength = inputStr.length;
  const firstPartLength = rotationAmount;
  const secondPartLength = stringLength - firstPartLength;

  const secondPart = inputStr.substr(firstPartLength, secondPartLength);
  const firstPart = inputStr.substr(0, firstPartLength);

  return secondPart + firstPart;
}

const dataParts = [];
process.stdin.on('data', function(dataSegment) {
  dataParts.push(dataSegment);
});
process.stdin.on('end', function() {
  const lineSeparator = '\n';
  const allInputContent = dataParts.join('');
  const inputLines = allInputContent.split(lineSeparator);
  processCoordinates(inputLines);
});
