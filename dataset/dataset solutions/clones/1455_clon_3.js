(function () {
  var rawData = '';

  function parseNumbersFromString(strArray, count) {
    const RADIX_DECIMAL = 10;
    let parsedNumbers = [];
    for (let idx = 0; idx < count; idx += 1) {
      parsedNumbers.push(parseInt(strArray[idx], RADIX_DECIMAL));
    }
    return parsedNumbers;
  }

  function swapElements(arr, index1, index2) {
    let tempVal = arr[index1];
    arr[index1] = arr[index2];
    arr[index2] = tempVal;
  }

  function processInputAndSort () {
    var idx, dataLength, numbersString, stringNumbers, numericArray = [], sortedOutput = '';

    dataLength = +rawData[0];
    numbersString = rawData[1];
    stringNumbers = numbersString.split(' ');

    numericArray = parseNumbersFromString(stringNumbers, dataLength);

    performQuickSort(numericArray, 0, dataLength - 1);

    for (idx = 0; idx < numericArray.length; idx += 1) {
      sortedOutput += numericArray[idx] + ' ';
    }
    console.log(sortedOutput);
  }

  function performQuickSort (targetArray, startIndex, endIndex) {
    var leftPointer, rightPointer, pivotValue;

    if (startIndex >= endIndex) {
      return;
    }

    leftPointer = startIndex;
    rightPointer = endIndex;
    
    pivotValue = findMedianOfThree(targetArray[leftPointer], targetArray[rightPointer], targetArray[(startIndex + endIndex) / 2]);

    do {
      while (targetArray[leftPointer] < pivotValue) {
        leftPointer += 1;
      }

      while (targetArray[rightPointer] > pivotValue) {
        rightPointer -= 1;
      }

      if (leftPointer <= rightPointer) {
        swapElements(targetArray, leftPointer, rightPointer);
        leftPointer += 1;
        rightPointer -= 1;
      }
    } while (leftPointer <= rightPointer);

    if (startIndex < rightPointer) {
      performQuickSort(targetArray, startIndex, rightPointer);
    }
    if (leftPointer < endIndex) {
      performQuickSort(targetArray, leftPointer, endIndex);
    }
  }

  function findMedianOfThree (valA, valB, valC) {
    if (valA <= valB) {
      if (valB <= valC) {
        return valB;
      } else {
        if (valA < valC) {
          return valC;
        } else {
          return valA;
        }
      }
    } else {
      if (valA <= valC) {
        return valA;
      } else {
        if (valB < valC) {
          return valC;
        } else {
          return valB;
        }
      }
    }
  }
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    rawData += chunk;
  });

  process.stdin.on('end', function () {
    rawData = rawData.split('\n');
    processInputAndSort();
  });

}());
