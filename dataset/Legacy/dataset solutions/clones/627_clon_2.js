var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var dataRows = rawData.split('\n');
var arraySize = Number(dataRows[0]);
var circularArray = [];
var idxA, idxB, idxC;
for (idxA = 0; idxA < arraySize; idxA++) {
  circularArray[idxA] = Number(dataRows[idxA + 1]);
  circularArray[idxA + arraySize] = circularArray[idxA];
  circularArray[idxA + arraySize + arraySize] = circularArray[idxA];
}

var accumulatorFunc = function (previousValue, currentValue) {
  return previousValue + currentValue;
};

function calculateSubarraySum(sourceArray, startIndex, endIndex) {
  var currentSum = 0.0;
  var loopIterator;
  for (loopIterator = startIndex; loopIterator < endIndex; loopIterator++) {
    currentSum += sourceArray[loopIterator];
  }
  return currentSum;
}

var overallMaximum = 0.0;
var currentMinimum = 0.0;
var segmentSum = 0.0;
var unusedArrayRef;
for (idxA = 1; idxA < arraySize - 2; idxA++) {
  for (idxB = 0; idxB < arraySize; idxB++) {
    segmentSum = calculateSubarraySum(circularArray, idxB, idxB + idxA);
    for (idxC = 1; idxC < arraySize - idxA; idxC++) {
      currentMinimum = Math.min(calculateSubarraySum(circularArray, idxA + idxB, idxA + idxB + idxC), calculateSubarraySum(circularArray, idxA + idxB + idxC, idxB + arraySize));

      if (segmentSum <= currentMinimum) {
        overallMaximum = Math.max(overallMaximum, segmentSum);
      }
    }
  }
}
console.log(overallMaximum);
