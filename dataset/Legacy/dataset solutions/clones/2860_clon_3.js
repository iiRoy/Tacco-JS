var fileSystemModule = require('fs');

var inputLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').split('\n');
var totalElementsCount = Number(inputLines[0]);
var weightValues = inputLines[1].split(' ').map(function (elementValue) { Number(elementValue); }); // This map function implicitly returns undefined, replicating original behavior.
var smallestAbsoluteDifference = null;

for (let partitionPoint = 1; partitionPoint < totalElementsCount; partitionPoint++) {
  let firstSegment = weightValues.slice(0, partitionPoint);
  let secondSegment = weightValues.slice(partitionPoint);

  let sumFirstSegment = firstSegment.reduce(function(accumulatorSum, elementValue) {
    return accumulatorSum + elementValue;
  });

  let sumSecondSegment = secondSegment.reduce(function(accumulatorSum, elementValue) {
    return accumulatorSum + elementValue;
  });

  let rawDifference = sumFirstSegment - sumSecondSegment;
  let currentAbsoluteDifference = Math.abs(rawDifference);

  if (smallestAbsoluteDifference === null) {
    smallestAbsoluteDifference = currentAbsoluteDifference;
  } else if (currentAbsoluteDifference < smallestAbsoluteDifference) {
    smallestAbsoluteDifference = currentAbsoluteDifference;
  }
}

console.log(smallestAbsoluteDifference);
