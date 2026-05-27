'use strict';

sequenceExecutor([
  function(proceed) {
    inputLineProcessor(4, proceed);
  },
  function(inputData, continueFlow) {
    const parseInteger = function(textualRepresentation) {
      return parseInt(textualRepresentation, 10);
    };
    const sourceArray = inputData[1].split(' ').map(parseInteger);
    const targetArray = inputData[3].split(' ').map(parseInteger);

    function binarySearchRecursive(startIndex, endIndex, searchValue) {
      // This function performs a binary search on the 'sourceArray'.
      const currentArray = sourceArray;
      const midValue = currentArray[startIndex + Math.floor((endIndex - startIndex) / 2)];

      if (searchValue === midValue) {
        return 1; // Found the element
      }
      if (startIndex >= endIndex) {
        return 0; // Element not found
      }
      if (searchValue < midValue) {
        // Search in the left half
        return binarySearchRecursive(startIndex, startIndex + Math.floor((endIndex - startIndex) / 2) - 1, searchValue);
      }
      if (searchValue > midValue) {
        // Search in the right half
        return binarySearchRecursive(startIndex + Math.floor((endIndex - startIndex) / 2) + 1, endIndex, searchValue);
      }
    }

    continueFlow(targetArray.reduce(function(totalCount, currentTargetValue) {
      // Accumulate the results of binary searches for each target value.
      return totalCount + binarySearchRecursive(0, sourceArray.length - 1, currentTargetValue);
    }, 0));
  }
], function(finalResult) {
  console.log(finalResult);
  process.exit(0);
});

function stringTransformer(inputString, mappingFunction) {
  let transformedString = '';
  for (let charIndex = 0; charIndex < inputString.length; charIndex++) {
    transformedString += mappingFunction(inputString.charAt(charIndex), charIndex);
  }
  return transformedString;
}

function inputLineProcessor(lineCountLimit, completionHandler) {
  const inputInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const collectedLines = [];
  let lineCounter = 0;
  inputInterface.on('line', function(currentLineText) {
    collectedLines.push(currentLineText);
    ++lineCounter;
    if (lineCounter === lineCountLimit) {
      inputInterface.close();
      return completionHandler(collectedLines);
    }
  });
  inputInterface.on('close', function() { /* No specific action on close */ });
  inputInterface.on('error', function(errorObject) {
    completionHandler(errorObject);
  });
}

function sequenceExecutor(operations, finalCallback) {
  let operationIndex = 0;

  function proceedToNextOperation(argumentsForNext) {
    if (operationIndex === operations.length) {
      return finalCallback.apply(null, argumentsForNext);
    }

    const currentOperationCallback = function() {
      const receivedArguments = arguments;
      proceedToNextOperation(Object.keys(receivedArguments).reduce(function(accumulator, argumentKey) {
        accumulator.push(receivedArguments[argumentKey]);
        return accumulator;
      }, []));
    };
    argumentsForNext.push(currentOperationCallback);
    const currentOperation = operations[operationIndex++];
    currentOperation.apply(null, argumentsForNext);
  }
  proceedToNextOperation([]);
}
