process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (lineContent) => {
  inputLines.push(lineContent);
});

inputHandler.on('close', () => {
  const numElements = parseInt(inputLines[0], 10);

  const dataStringArray = inputLines[1].split(' ');
  const parsedNumericData = dataStringArray.map(valStr => parseInt(valStr, 10));

  var totalAccumulatedDifference = 0;
  var currentRunningMaximum = 0;

  for (let currentIndex = 0; currentIndex < numElements; currentIndex++) {
    const currentElementValue = parsedNumericData[currentIndex];

    const potentialNewMax = Math.max(currentRunningMaximum, currentElementValue);
    currentRunningMaximum = potentialNewMax;

    const currentDifference = currentRunningMaximum - currentElementValue;
    totalAccumulatedDifference += currentDifference;
  }

  console.log(totalAccumulatedDifference);
});
