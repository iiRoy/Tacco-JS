mainEntry();

function mainEntry() {
  var ioHandler = require('readline');
  var inputReader = ioHandler.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  var collectedLines = [];
  inputReader.on('line', function (currentLine) {
    collectedLines.push(currentLine);
  });
  inputReader.on('close', function () {
    var countValue = parseInt(collectedLines[0]);
    var dimensionStrings = collectedLines[1].split(/ /);
    console.log(computeArea(countValue, dimensionStrings));
  });
}

function computeArea(countValue, dimensionStrings) {
  const numericDimensions = dimensionStrings.map(Number);

  const frequencyMap = {};
  numericDimensions.forEach(dim => {
    frequencyMap[dim] = (frequencyMap[dim] || 0) + 1;
  });

  const availableSides = [];
  Object.keys(frequencyMap).forEach(dimKey => {
    const dim = Number(dimKey);
    const count = frequencyMap[dim];
    if (count >= 2) {
      availableSides.push(dim);
    }
    if (count >= 4) { // If a length appears 4 or more times, it can form two sides of a rectangle
      availableSides.push(dim);
    }
  });

  availableSides.sort((a, b) => b - a);

  const firstSide = availableSides[0] || 0;
  const secondSide = availableSides[1] || 0;

  return firstSide * secondSide;
}
