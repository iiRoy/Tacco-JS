(function () {
  var rawInputBuffer = '';

  function processDataAndOutput () {
    var arraySize, numbersLine, stringTokens, numericElements, finalOutput = '';

    arraySize = +rawInputBuffer[0];
    numbersLine = rawInputBuffer[1];
    stringTokens = numbersLine.split(' ');

    numericElements = stringTokens.map(function(token) {
      return parseInt(token, 10);
    });

    performQuickSort(numericElements, 0, arraySize - 1);

    finalOutput = numericElements.join(' ');
    console.log(finalOutput);
  }

  function performQuickSort (dataArray, lowIdx, highIdx) {
    var rightPtr, leftPtr, pivotVal, swapTemp;

    if (lowIdx < highIdx) {
      leftPtr = lowIdx;
      rightPtr = highIdx;

      const middleIndex = Math.floor((lowIdx + highIdx) / 2);
      pivotVal = determineMedian(dataArray[leftPtr], dataArray[rightPtr], dataArray[middleIndex]);

      do {
        while (dataArray[leftPtr] < pivotVal) {
          leftPtr += 1;
        }

        while (dataArray[rightPtr] > pivotVal) {
          rightPtr -= 1;
        }

        if (leftPtr <= rightPtr) {
          swapTemp = dataArray[leftPtr];
          dataArray[leftPtr] = dataArray[rightPtr];
          dataArray[rightPtr] = swapTemp;

          leftPtr += 1;
          rightPtr -= 1;
        }
      } while (leftPtr <= rightPtr);

      performQuickSort(dataArray, lowIdx, leftPtr - 1);
      performQuickSort(dataArray, rightPtr + 1, highIdx);
    }
  }

  function determineMedian (value1, value2, value3) {
    if (value1 <= value2) {
      if (value2 <= value3) {
        return value2;
      } else {
        if (value1 < value3) {
          return value3;
        } else {
          return value1;
        }
      }
    } else {
      if (value1 <= value3) {
        return value1;
      } else {
        if (value2 < value3) {
          return value3;
        } else {
          return value2;
        }
      }
    }
  }
  
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    rawInputBuffer += chunk;
  });

  process.stdin.on('end', function () {
    rawInputBuffer = rawInputBuffer.split('\n');
    processDataAndOutput();
  });

}());
