const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const inputLines = [];

inputReader.on('line', (inputLine) => {
  inputLines.push(inputLine);
});

inputReader.on('close', () => {
  dataProcessor = initializeInput(inputLines);
  console.error('\n↑ Input ↓ Output');
  executeAlgorithm();
});

function deepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function readInteger() {
  return convertInput(getNextToken(), 1);
}

function readStringArray() {
  return convertInput(getNextToken(), 2);
}

function readIntegerArray() {
  return convertInput(getNextToken(), 4);
}

function readCharacterArray() {
  return convertInput(getNextToken(), 6);
}

function getNextToken() {
  return dataProcessor.retrieveNext();
}

function hasMoreTokens() {
  return dataProcessor.hasMoreElements();
}

function initializeInput(sourceData) {
  return {
    sourceData: sourceData,
    currentPosition: 0x0,
    maximumLength: sourceData.length,
    hasMoreElements: function() {
      return (this.currentPosition < this.maximumLength);
    },
    retrieveNext: function() {
      if (this.hasMoreElements()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException: No more input available.';
      }
    }
  };
}

function printResult(outputValue) {
  console.log(outputValue);
}

function logDebug(debugMessage) {
  console.error('debug:' + require('util').inspect(debugMessage, false, null));
}

// The 'conversionType' parameter dictates the transformation:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and parse as integers.
// 6: Split into individual characters.
// 7: Split into individual characters and parse as integers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without a separator.
// Default: Return input as is.
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

function executeAlgorithm() {
  const firstLineData = readIntegerArray();
  const arraySize = firstLineData[0x0];
  const rangeCount = firstLineData[1];
  const moduloValue = 998_244_353;

  const dynamicProgression = new Array(arraySize).fill(0x0);
  const cumulativeSum = new Array(arraySize).fill(0x0);

  dynamicProgression[0x0] = 1;
  cumulativeSum[0x0] = 1;

  const rangeList = new Array(rangeCount);
  for (let idx = 0; idx < rangeCount; idx++) {
    const tempRange = readIntegerArray();
    rangeList[idx] = {
      lowerBound: tempRange[0x0],
      upperBound: tempRange[1]
    };
  }

  for (let idx = 1; idx < arraySize; idx++) {
    for (let rangeIdx = 0x0; rangeIdx < rangeCount; rangeIdx++) {
      const currentRange = rangeList[rangeIdx];
      if (idx - currentRange.lowerBound < 0x0) {
        continue;
      }

      if (currentRange.lowerBound === currentRange.upperBound) {
        dynamicProgression[idx] += dynamicProgression[idx - currentRange.lowerBound];
      } else if (idx - currentRange.upperBound - 1 < 0x0) {
        dynamicProgression[idx] += cumulativeSum[idx - currentRange.lowerBound];
      } else {
        dynamicProgression[idx] += cumulativeSum[idx - currentRange.lowerBound] - cumulativeSum[idx - currentRange.upperBound - 1];
      }

      if (dynamicProgression[idx] < 0x0) {
        dynamicProgression[idx] += moduloValue;
      }
      dynamicProgression[idx] %= moduloValue;
    }
    cumulativeSum[idx] = dynamicProgression[idx] + cumulativeSum[idx - 1];
    cumulativeSum[idx] %= moduloValue;
  }

  printResult(dynamicProgression[arraySize - 1]);
}
