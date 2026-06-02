function processDataEntry(rawInputString) {
  var inputLines = rawInputString.split('\n');
  // The variable corresponding to inputLines[0] (originally 'n') was unused, so it is omitted.

  var numericDataArray = inputLines[1].split(' ').map(function(strValue) {
    return parseInt(strValue, 10);
  });

  numericDataArray = performMergeSort(numericDataArray);

  var totalElements = numericDataArray.length;
  var centralIndex = totalElements / 2;
  var lowerMiddleElement = numericDataArray[centralIndex - 1];
  var upperMiddleElement = numericDataArray[centralIndex];
  var finalDifference = upperMiddleElement - lowerMiddleElement;

  console.log(finalDifference);
}

function performMergeSort(unsortedArray) {

  function divideAndConquer(segmentToProcess) {
    if (segmentToProcess.length < 2) {
      return segmentToProcess;
    }

    var divisionPoint = Math.floor(segmentToProcess.length / 2);

    var leftPartition = segmentToProcess.slice(0, divisionPoint);
    var rightPartition = segmentToProcess.slice(divisionPoint, segmentToProcess.length);

    var sortedLeftPartition = divideAndConquer(leftPartition);
    var sortedRightPartition = divideAndConquer(rightPartition);

    return combineSorted(segmentToProcess, sortedLeftPartition, sortedRightPartition);
  }

  function combineSorted(originalReference, leftSource, rightSource) {
    // This check is maintained for structural equivalence, though 'rightSource'
    // will always be an array when called from 'divideAndConquer'.
    if (rightSource === undefined) {
      return originalReference;
    }

    var resultCollection = [];
    var currentLeftItem, currentRightItem;

    while (leftSource.length > 0 && rightSource.length > 0) {
      currentLeftItem = leftSource[0];
      currentRightItem = rightSource[0];

      if (currentLeftItem < currentRightItem) {
        resultCollection.push(leftSource.shift());
      } else {
        resultCollection.push(rightSource.shift());
      }
    }

    if (leftSource.length > 0) {
      resultCollection = resultCollection.concat(leftSource);
    } else if (rightSource.length > 0) {
      resultCollection = resultCollection.concat(rightSource);
    }
    return resultCollection;
  }

  return divideAndConquer(unsortedArray);
}

processDataEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
