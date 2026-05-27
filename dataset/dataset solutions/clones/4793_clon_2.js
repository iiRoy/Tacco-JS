var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  dataHandler = initializeInput(inputLines);
  console.error('\n↑入力 ↓出力');
  executeLogic();
});

function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function getNextInteger() {
  return convertInput(fetchNextLine(), 1);
}

function getNextStringArray() {
  return convertInput(fetchNextLine(), 2);
}

function getNextIntegerArray() {
  return convertInput(fetchNextLine(), 4);
}

function getNextCharacterArray() {
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine() {
  return dataHandler.next();
}

function hasMoreLines() {
  return dataHandler.hasMoreLines();
}

function initializeInput(linesArray) {
  return {
    lineList: linesArray,
    currentIndex: 0,
    maxLines: linesArray.length,
    hasMoreLines: function() {
      return (this.currentIndex < this.maxLines);
    },
    next: function() {
      if (this.hasMoreLines()) {
        return this.lineList[this.currentIndex++];
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

function executeLogic() {
  var firstLineData = getNextIntegerArray();

  var countI = firstLineData[0];
  var countO = firstLineData[1];
  var countT = firstLineData[2];
  var countJ = firstLineData[3];
  var countL = firstLineData[4];
  var countS = firstLineData[5];
  var countZ = firstLineData[6];

  var resultOptionA = Math.floor(countI / 2) * 2 + Math.floor(countJ / 2) * 2 + Math.floor(countL / 2) * 2;
  var resultOptionB = Math.floor((countI - 1) / 2) * 2 + Math.floor((countJ - 1) / 2) * 2 + Math.floor((countL - 1) / 2) * 2 + 6;

  printResult(Math.max(resultOptionA, resultOptionB) + countO);
}
