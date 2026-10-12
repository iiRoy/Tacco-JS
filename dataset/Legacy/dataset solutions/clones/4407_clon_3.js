executeProgram();

function setupInputReader(onLineCallback, onCloseCallback) {
  const inputReaderModule = require('readline');
  const inputHandler = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  inputHandler.on('line', onLineCallback);
  inputHandler.on('close', onCloseCallback);
}

function executeProgram() {
  const inputLines = [];

  setupInputReader(
    (currentLine) => {
      inputLines.push(currentLine);
    },
    () => {
      const totalSticksCount = parseInt(inputLines[0], 10);
      const rawStickLengthStrings = inputLines[1].split(' ');

      const parsedStickLengths = rawStickLengthStrings.map(str => parseInt(str, 10));

      console.log(calculateMaxRectangleArea(totalSticksCount, parsedStickLengths));
    }
  );
}

function calculateMaxRectangleArea(totalSticksCount, stickLengths) {
  stickLengths.sort((a, b) => b - a);

  let firstSideLength = 0;
  let secondSideLength = 0;
  let sidesFoundCount = 0;

  for (let idx = 0; idx < stickLengths.length - 1; idx++) {
    if (sidesFoundCount === 2) {
      break;
    }

    if (stickLengths[idx] === stickLengths[idx + 1]) {
      if (firstSideLength === 0) {
        firstSideLength = stickLengths[idx];
      } else if (secondSideLength === 0) {
        secondSideLength = stickLengths[idx];
      }
      sidesFoundCount++;
      idx++;
    }
  }

  return firstSideLength * secondSideLength;
}
