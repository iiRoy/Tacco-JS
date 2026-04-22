const obtainModule = require;

let lineProcessor = obtainModule('readline').createInterface({
  sourceStream: process.stdin,
  destinationStream: process.stdout
});

let inputParser;
let rawInputBuffer = [];

lineProcessor.on('line', function(currentLineText) {
  rawInputBuffer.push(currentLineText);
});

lineProcessor.on('close', function() {
  inputParser = setupInputStructure(rawInputBuffer);
  console.error('\n↑Input ↓Output');
  runApplication();
});

function createCopy(originalEntity) {
  return (originalEntity instanceof Set) ? new Set(Array.from(originalEntity)) : JSON.parse(JSON.stringify(originalEntity));
}

function fetchNextInteger() {
  return convertValue(advanceAndFetch(), 1);
}

function fetchNextStringGroup() {
  return convertValue(advanceAndFetch(), 2);
}

function fetchNextIntegerGroup() {
  return convertValue(advanceAndFetch(), 4);
}

function fetchNextCharacterGroup() {
  return convertValue(advanceAndFetch(), 6);
}

function advanceAndFetch() {
  return inputParser.retrieveNext();
}

function checkAvailability() {
  return inputParser.checkNextAvailability();
}

function setupInputStructure(sourceDataLines) {
  return {
    dataList: sourceDataLines,
    currentPosition: 0,
    maximumLength: sourceDataLines.length,

    checkNextAvailability: function() {
      return (this.currentPosition < this.maximumLength);
    },

    retrieveNext: function() {
      if (this.checkNextAvailability()) {
        return this.dataList[this.currentPosition++];
      } else {
        throw new Error('InputBufferExhaustedException: No additional input elements remaining.');
      }
    }
  };
}

function displayResult(outputValue) {
  console.log(outputValue);
}

function reportDebugInfo(debugTarget) {
  console.error('debugging-info:' + obtainModule('util').inspect(debugTarget, false, null));
}

function convertValue(inputValue, conversionType) {
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
  } catch (conversionError) {
    return inputValue;
  }
}

function runApplication() {
  let itemQuantity = fetchNextInteger();
  let resultCollector = [];

  for (let outerIndex = 0; outerIndex < itemQuantity - 1; outerIndex++) {
    for (let innerIndex = outerIndex + 1; innerIndex < itemQuantity; innerIndex++) {
      for (let bitPosition = 0; bitPosition < 10; bitPosition++) {
        if ((outerIndex >> bitPosition & 1) !== (innerIndex >> bitPosition & bitPosition)) {
          displayResult(bitPosition + 1);
        }
      }
    }
  }
}