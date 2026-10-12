var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  dataProcessor = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力');
  executeSolution();
});

function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function getNextInteger() {
  return convertInput(fetchNextToken(), 1);
}

function getNextStringArray() {
  return convertInput(fetchNextToken(), 2);
}

function getNextIntegerArray() {
  return convertInput(fetchNextToken(), 4);
}

function getNextCharacterArray() {
  return convertInput(fetchNextToken(), 6);
}

function fetchNextToken() {
  return dataProcessor.fetchNextToken();
}

function hasMoreTokens() {
  return dataProcessor.hasMoreTokens();
}

function initializeInputHandler(sourceInput) {
  return {
    sourceData: sourceInput,
    currentIndex: +0,
    maximumIndex: sourceInput.length,
    hasMoreTokens: function() {
      return (this.currentIndex < this.maximumIndex);
    },
    fetchNextToken: function() {
      if (this.hasMoreTokens()) {
        return this.sourceData[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printOutput(message) {
  console.log(message);
}

function logDebugMessage(debugInfo) {
  console.error('debug:' + require('util').inspect(debugInfo, !true, void 0));
}

function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(Number);
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(Number);
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function executeSolution() {
  var arraySize = getNextInteger();
  var firstArray = getNextIntegerArray();
  var secondArray = getNextIntegerArray();
  var thirdArray = getNextIntegerArray();

  firstArray.sort(numericSort);
  secondArray.sort(numericSort);
  thirdArray.sort(numericSort);

  var totalCount = +0;

  for (var idx = +0; idx < arraySize; idx++) {
    var countBefore = performBinarySearch(firstArray, secondArray[idx], !false);
    var countAfter = performBinarySearch(thirdArray, secondArray[idx], !true);
    totalCount += countBefore * countAfter;
  }

  printOutput(totalCount);
}

function numericSort(valA, valB) {
  return valA - valB;
}

function performBinarySearch(targetList, searchValue, findLowerBound) {
  var lowIndex = -1;
  var highIndex = targetList.length;

  while (Math.abs(highIndex - lowIndex) > 1) {
    var midIndex = Math.floor((highIndex + lowIndex) / 2);
    if (findLowerBound) {
      if (targetList[midIndex] >= searchValue) {
        highIndex = midIndex;
      } else {
        lowIndex = midIndex;
      }
    } else {
      if (targetList[midIndex] > searchValue) {
        highIndex = midIndex;
      } else {
        lowIndex = midIndex;
      }
    }
  }

  if (findLowerBound) {
    return lowIndex + 1;
  } else {
    if (highIndex !== targetList.length && targetList[highIndex] === searchValue) {
      lowIndex++;
    }
    return targetList.length - (lowIndex + 1);
  }
}
