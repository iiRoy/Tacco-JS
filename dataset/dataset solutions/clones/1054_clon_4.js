let comparisonCounter = 0;

(function processInputAndSort(){
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalCount = Number(inputLines.shift());
  let inputNumbers = inputLines.shift().split(' ').map(Number);

  recursiveSortAndCombine(inputNumbers, 0, totalCount);

  console.log(inputNumbers.join(' '));
  console.log(comparisonCounter);
})();

function combineSegments(targetArray, startIdx, middleIdx, endIdx) {
  const leftSegmentLength = middleIdx - startIdx;
  const rightSegmentLength = endIdx - middleIdx;

  const leftSegment = Array.from({ length: leftSegmentLength }, (_, i) => targetArray[startIdx + i]);
  const rightSegment = Array.from({ length: rightSegmentLength }, (_, i) => targetArray[middleIdx + i]);

  let leftPointer = 0;
  let rightPointer = 0;

  for (let destinationIndex = startIdx; destinationIndex < endIdx; destinationIndex++) {
    comparisonCounter++;

    if (leftPointer < leftSegmentLength && (rightPointer >= rightSegmentLength || leftSegment[leftPointer] <= rightSegment[rightPointer])) {
      targetArray[destinationIndex] = leftSegment[leftPointer++];
    } else {
      targetArray[destinationIndex] = rightSegment[rightPointer++];
    }
  }
}

function recursiveSortAndCombine(dataCollection, lowerBound, upperBound) {
  if (upperBound - lowerBound > 1) {
    const centralPoint = Math.floor((lowerBound + upperBound) / 2);
    recursiveSortAndCombine(dataCollection, lowerBound, centralPoint);
    recursiveSortAndCombine(dataCollection, centralPoint, upperBound);
    combineSegments(dataCollection, lowerBound, centralPoint, upperBound);
  }
}
