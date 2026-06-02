(function () {
  var rawInput = '';

  function processInputData () {
    var elementCount, numberLine, stringNumbers, numericValues;

    const inputLines = rawInput.split('\n');
    elementCount = Number(inputLines[0]);
    numberLine = inputLines[1];
    stringNumbers = numberLine.split(' ');

    numericValues = stringNumbers.map(val => Number(val));

    const sortedValues = performMergeSort(numericValues);

    console.log(sortedValues.join(' '));
  }

  function performMergeSort (arrToSort) {
    if (arrToSort.length <= 1) {
      return arrToSort;
    }

    const midPoint = Math.floor(arrToSort.length / 2);
    const leftHalf = arrToSort.slice(0, midPoint);
    const rightHalf = arrToSort.slice(midPoint);

    const sortedLeft = performMergeSort(leftHalf);
    const sortedRight = performMergeSort(rightHalf);

    return combineSortedArrays(sortedLeft, sortedRight);
  }

  function combineSortedArrays (leftArr, rightArr) {
    let combinedResult = [];
    let leftIndex = 0;
    let rightIndex = 0;

    while (leftIndex < leftArr.length && rightIndex < rightArr.length) {
      if (leftArr[leftIndex] < rightArr[rightIndex]) {
        combinedResult.push(leftArr[leftIndex]);
        leftIndex++;
      } else {
        combinedResult.push(rightArr[rightIndex]);
        rightIndex++;
      }
    }

    return combinedResult.concat(leftArr.slice(leftIndex)).concat(rightArr.slice(rightIndex));
  }
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    rawInput += chunk;
  });

  process.stdin.on('end', function () {
    processInputData();
  });

}());
