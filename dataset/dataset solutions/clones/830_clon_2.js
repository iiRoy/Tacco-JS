var getFileSysModule = require('fs');
var rawContent = getFileSysModule.readFileSync('/dev/stdin', 'UTF-8');

Object.prototype.stripSpaces = function () {
  return this.trim();
};

Object.prototype.divideByNewline = function () {
  return this.split('\n');
};

Object.prototype.extractFirst = function () {
  return this.shift();
};

for (;;) {

  var dimensions = processedText.extractFirst().split(' ');

  if (dimensions.join(' ') === '0 0') {
    break;
  }

  var numItems = parseInt(dimensions[0], 10);
  var numOperations = parseInt(dimensions[1], 10);

  var effectArray = [];
  for (let loopCounterA = 0; loopCounterA < numOperations; loopCounterA++) {
    effectArray.push(parseInt(processedText.extractFirst(), 10));
  }

  var dataPoints = [];
  for (let loopCounterA = 0; loopCounterA < numItems; loopCounterA++) {
    dataPoints.push(parseInt(processedText.extractFirst(), 10));
  }

  var memoTable = [];
  for (let loopCounterA = 0; loopCounterA <= numItems; loopCounterA++) {
    memoTable[loopCounterA] = [];
    for (let loopCounterB = 0; loopCounterB <= 255; loopCounterB++) {
      memoTable[loopCounterA][loopCounterB] = Number.POSITIVE_INFINITY;
    }
  }

  memoTable[0][128] = 0;

  for (let loopCounterA = 1; loopCounterA <= numItems; loopCounterA++) {
    for (let loopCounterB = 0; loopCounterB <= 255; loopCounterB++) {
      for (let loopCounterC = 0; loopCounterC < numOperations; loopCounterC++) {

        let adjustedValue = loopCounterB + effectArray[loopCounterC];

        if (adjustedValue < 0) {
          adjustedValue = 0;
        }
        if (adjustedValue > 255) {
          adjustedValue = 255;
        }

        if (memoTable[loopCounterA - 1][loopCounterB] !== Number.POSITIVE_INFINITY) {
          memoTable[loopCounterA][adjustedValue] = Math.min(
            memoTable[loopCounterA][adjustedValue],
            memoTable[loopCounterA - 1][loopCounterB] + Math.pow(dataPoints[loopCounterA - 1] - adjustedValue, 2)
          );
        }
      }
    }
  }

  let finalCost = Number.POSITIVE_INFINITY;
  memoTable[numItems].forEach((elementCost) => {
    finalCost = Math.min(finalCost, elementCost);
  });

  console.log(finalCost);
}