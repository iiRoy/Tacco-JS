process.stdin.resume();
process.stdin.setEncoding('utf8');

let collectedInput = [];
const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentLine) => {
  collectedInput.push(currentLine);
});

inputHandler.on('close', () => {
  processInputData(collectedInput);
});

function processInputData(allTextLines) {
  const inputDimensionsRaw = allTextLines[0].split(' ');
  const boundaryValue = parseInt(inputDimensionsRaw[0], 10);
  const markerCount = parseInt(inputDimensionsRaw[1], 10);

  const markerStrings = allTextLines[1].split(' ');
  const markerNumericValues = new Array(markerCount);
  for (let idx = 0; idx < markerCount; ++idx) {
    markerNumericValues[idx] = parseInt(markerStrings[idx], 10);
  }

  let largestGapFound = 0;

  for (let j = 0; j < markerCount - 1; ++j) {
    const currentGap = markerNumericValues[j + 1] - markerNumericValues[j];
    if (currentGap > largestGapFound) {
      largestGapFound = currentGap;
    }
  }

  const finalWrapGap = boundaryValue + markerNumericValues[0] - markerNumericValues[markerCount - 1];
  if (finalWrapGap > largestGapFound) {
    largestGapFound = finalWrapGap;
  }

  console.log(boundaryValue - largestGapFound);
}