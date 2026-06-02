var comparisonCount = 0;

(function executeSortingProcess() {
  const standardInputPath = '/dev/stdin';
  const fileSystemModule = require('fs');
  const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
  const inputLines = rawInputContent.trim().split('\n');

  const extractArraySize = (linesSource) => Number(linesSource.shift());
  const arraySize = extractArraySize(inputLines);

  const extractDataArray = (linesSource) => linesSource.shift().split(' ').map(Number);
  let dataArray = extractDataArray(inputLines);

  recursiveMergeSort(dataArray, 0, arraySize);

  const displayResults = (sortedArray, totalComparisons) => {
    console.log(sortedArray.join(' '));
    console.log(totalComparisons);
  };
  displayResults(dataArray, comparisonCount);
})();

function performMergeOperation(targetArray, startIndex, middleIndex, endIndex) {
  const sentinelValue = Number.POSITIVE_INFINITY;

  const leftSegmentLength = middleIndex - startIndex;
  const rightSegmentLength = endIndex - middleIndex;

  let leftSubArray = targetArray.slice(startIndex, middleIndex);
  let rightSubArray = targetArray.slice(middleIndex, endIndex);

  leftSubArray.push(sentinelValue);
  rightSubArray.push(sentinelValue);

  let leftPointer = 0;
  let rightPointer = 0;

  for (let currentTargetIndex = startIndex; currentTargetIndex < endIndex; currentTargetIndex++) {
    let elementToPlace;
    if (leftSubArray[leftPointer] <= rightSubArray[rightPointer]) {
      elementToPlace = leftSubArray[leftPointer++];
    } else {
      elementToPlace = rightSubArray[rightPointer++];
    }
    targetArray[currentTargetIndex] = elementToPlace;
    comparisonCount++;
  }
}

function recursiveMergeSort(targetArray, startIndex, endIndex) {
  if (startIndex + 1 < endIndex) {
    let middleIndex = startIndex + Math.floor((endIndex - startIndex) / 2);
    recursiveMergeSort(targetArray, startIndex, middleIndex);
    recursiveMergeSort(targetArray, middleIndex, endIndex);
    performMergeOperation(targetArray, startIndex, middleIndex, endIndex);
  }
}
