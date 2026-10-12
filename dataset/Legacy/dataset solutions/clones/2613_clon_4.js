var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

var inputHandler;
var receivedLines = [];

inputReader.on('line', function(currentLine) {
  receivedLines.push(currentLine);
});

inputReader.on('close', function() {
  inputHandler = initializeInputProcessor(receivedLines);
  console.error('\n↑入力 ↓出力');
  processInputData();
});

function deepCopyStructure(sourceObject) {
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

function retrieveInteger() {
  return transformInput(getNextItem(), 1);
}

function retrieveStringArray() {
  return transformInput(getNextItem(), 2);
}

function retrieveIntegerArray() {
  return transformInput(getNextItem(), 4);
}

function retrieveCharacterArray() {
  return transformInput(getNextItem(), 6);
}

function getNextItem() {
  return inputHandler.fetchNext();
}

function hasMoreItems() {
  return inputHandler.checkAvailability();
}

function initializeInputProcessor(inputData) {
  return {
    sourceLines: inputData,
    currentPosition: 0,
    totalLines: inputData.length,

    checkAvailability: function() {
      return this.currentPosition < this.totalLines;
    },

    fetchNext: function() {
      if (this.checkAvailability()) {
        return this.sourceLines[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function displayResult(outputValue) {
  console.log(outputValue);
}

function logDebugInfo(debugContent) {
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

function transformInput(inputValue, conversionType) {
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
  } catch (e) {
    return inputValue;
  }
}

function getMonthGeneratedByDay(dayValue) {
  var leftPart = Math.floor(dayValue / 10);
  var rightPart = dayValue % 10;

  if (leftPart < 2 || rightPart < 2) {
    return 0;
  }

  return leftPart * rightPart;
}

function isGeneratedMonthInsideRange(generatedMonth, maxMonth) {
  return generatedMonth >= 1 && generatedMonth <= maxMonth;
}

function countValidDaysByGeneratedMonth(maxMonth, maxDay) {
  var totalValidDates = 0;

  for (var dayValue = 22; dayValue <= maxDay; dayValue++) {
    var generatedMonth = getMonthGeneratedByDay(dayValue);

    if (isGeneratedMonthInsideRange(generatedMonth, maxMonth)) {
      totalValidDates++;
    }
  }

  return totalValidDates;
}

function processInputData() {
  var initialParams = retrieveIntegerArray();
  var maxMonth = initialParams[0];
  var maxDay = initialParams[1];

  var answer = countValidDaysByGeneratedMonth(maxMonth, maxDay);

  displayResult(answer);
}