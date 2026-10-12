'use strict';

flowSeries([
  function(proceedCallback) {
    inputLineProcessor(4, proceedCallback);
  },
  function(inputLines, proceedCallback) {
    const parseInteger = (strValue) => parseInt(strValue, 10);

    const firstLineData = inputLines[1];
    const sortedArray = firstLineData.split(' ').map(parseInteger);

    const thirdLineData = inputLines[3];
    const targetValues = thirdLineData.split(' ').map(parseInteger);

    function findValueInSortedArray(searchSpace, searchStart, searchEnd, valueToFind) {
      if (searchStart > searchEnd) {
        return 0;
      }

      const rangeLength = searchEnd - searchStart;
      const midOffset = Math.floor(rangeLength / 2);
      const midIndex = searchStart + midOffset;
      const midValue = searchSpace[midIndex];

      if (valueToFind === midValue) {
        return 1;
      }

      if (valueToFind < midValue) {
        return findValueInSortedArray(searchSpace, searchStart, midIndex - 1, valueToFind);
      } else {
        return findValueInSortedArray(searchSpace, midIndex + 1, searchEnd, valueToFind);
      }
    }

    const countReducer = (totalCount, currentValue) => {
      const found = findValueInSortedArray(sortedArray, 0, sortedArray.length - 1, currentValue);
      return totalCount + found;
    };

    const finalCount = targetValues.reduce(countReducer, 0);

    proceedCallback(finalCount);
  }
], function(finalResult) {
  console.log(finalResult);
  process.exit(0);
});

function stringTransformer(inputString, transformationFunction) {
  let transformedString = '';
  transformedString = Array.from(inputString).map((char, index) => transformationFunction(char, index)).join('');
  return transformedString;
}

function inputLineProcessor(maxLines, callbackFn) {
  const readlineModule = require('readline');
  const inputInterface = readlineModule.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const collectedLines = [];
  let lineCount = 0;

  inputInterface.on('line', function(currentLine) {
    collectedLines.push(currentLine);
    lineCount++;

    const isLimitReached = (lineCount === maxLines);
    if (isLimitReached) {
      inputInterface.close();
      return callbackFn(collectedLines);
    }
  });

  inputInterface.on('close', () => {});

  inputInterface.on('error', function(err) {
    callbackFn(err);
  });
}

function flowSeries(operationSequence, callbackFn) {
  let currentOpIndex = 0;
  const totalOperations = operationSequence.length;

  if (totalOperations === 0) {
    return callbackFn();
  }

  function executeNextOperation(operationArguments) {
    if (currentOpIndex === totalOperations) {
      return callbackFn.apply(null, operationArguments);
    }

    const prepareNextArgs = function() {
      const invocationArgs = arguments;
      const collectedArgs = Array.from(invocationArgs);
      executeNextOperation(collectedArgs);
    };

    operationArguments.push(prepareNextArgs);

    const currentOperation = operationSequence[currentOpIndex++];
    currentOperation.apply(null, operationArguments);
  }
  executeNextOperation([]);
}
