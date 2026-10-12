var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputLines = [];

inputReader.on('line', function(lineContent) {
  inputLines.push(lineContent);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(inputLines);
  console.error('\n↑ Input ↓ Output');
  executeLogic();
});

function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger() {
  return performConversion(fetchNextToken(), 1);
}

function retrieveStringArray() {
  return performConversion(fetchNextToken(), 2);
}

function retrieveIntegerArray() {
  return performConversion(fetchNextToken(), 4);
}

function retrieveCharacterArray() {
  return performConversion(fetchNextToken(), 6);
}

function fetchNextToken() {
  return inputProcessor.fetchNextToken();
}

function hasMoreTokens() {
  return inputProcessor.hasMoreTokens();
}

function initializeInputHandler(dataInput) {
  return {
    dataRows: dataInput,
    currentPosition: 0,
    totalRows: dataInput.length,
    hasMoreTokens: function() {
      return (this.currentPosition < this.totalRows);
    },
    fetchNextToken: function() {
      if (this.hasMoreTokens()) {
        return this.dataRows[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
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

function performConversion(inputValue, conversionType) {
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

function executeLogic() {
  var countElements = retrieveInteger();
  var initialState = "S";
  var sequenceData = retrieveCharacterArray();
  var stateTracker = ["S", "S"];

  for (var idx = 1; idx < countElements; idx++) {
    if (sequenceData[idx] === "o") {
      if (stateTracker[idx] === "S") {
        stateTracker.push(stateTracker[idx - 1]);
      } else {
        if (stateTracker[idx - 1] === "S") {
          stateTracker.push("W");
        } else {
          stateTracker.push("S");
        }
      }
    } else {
      if (stateTracker[idx] === "S") {
        if (stateTracker[idx - 1] === "S") {
          stateTracker.push("W");
        } else {
          stateTracker.push("S");
        }
      } else {
        stateTracker.push(stateTracker[idx - 1]);
      }
    }
  }

  logDebug(stateTracker.join(""));

  if (stateTracker[countElements] === initialState) {
    stateTracker.pop();
    printResult(stateTracker.join(""));
  } else {
    printResult(-1);
  }
}
