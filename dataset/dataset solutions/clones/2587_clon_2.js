var dataStreamer = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var lineBuffer = [];
dataStreamer.on('line', function(textLine) {
  lineBuffer.push(textLine);
});
dataStreamer.on('close', function() {
  inputProcessor = configureInput(lineBuffer);
  console.error('\n↑ Input Data ↓ Processed Output');
  runAlgorithm();
});

/**
 * Creates a deep copy of an object or a Set.
 * @param {object} sourceObj The object to duplicate.
 * @returns {object} A new object with copied values.
 */
function replicateEntity(sourceObj) {
  return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
}

function parseNumber() {
  return processData(readNext(), 1);
}

function parseStringList() {
  return processData(readNext(), 2);
}

function parseNumberList() {
  return processData(readNext(), 4);
}

function parseCharList() {
  return processData(readNext(), 6);
}

function readNext() {
  return inputProcessor.fetchItem();
}

function isInputAvailable() {
  return inputProcessor.checkAvailability();
}

/**
 * Initializes the input processing mechanism.
 * @param {Array<string>} dataLines An array of raw input strings.
 * @returns {object} An object with methods to access input.
 */
function configureInput(dataLines) {
  return {
    entryList: dataLines,
    readPointer: 0,
    totalEntries: dataLines.length,
    checkAvailability: function() {
      return (this.readPointer < this.totalEntries);
    },
    fetchItem: function() {
      if (this.checkAvailability()) {
        return this.entryList[this.readPointer++];
      } else {
        throw 'InputOutOfBoundsException - No further data to read';
      }
    }
  };
}

function displayOutput(resultString) {
  console.log(resultString);
}

function errorLog(message) {
  console.error('debug_info: ' + require('util').inspect(message, false, null));
}

// Helper for converting various input formats.
// 'formatCode' determines the conversion type:
// 1: parseInt, 2: split by space, 4: split by space and map to Number,
// 6: split by char, 7: split by char and map to Number,
// 8: join by space, 9: join by newline, 0: join without separator.
function processData(rawItem, formatCode) {
  try {
    switch (formatCode) {
      case 1:
        return parseInt(rawItem);
      case 2:
        return rawItem.split(' ');
      case 4:
        return rawItem.split(' ').map(Number);
      case 6:
        return rawItem.split('');
      case 7:
        return rawItem.split('').map(Number);
      case 8:
        return rawItem.join(' ');
      case 9:
        return rawItem.join('\n');
      case 0:
        return rawItem.join('');
      default:
        return rawItem;
    }
  } catch (err) {
    return rawItem;
  }
}

// Core algorithm execution starts here.
function runAlgorithm() {
  var elementCount = parseNumber();
  var inputValues = parseNumberList();
  inputValues.sort(function(item1, item2) {
    return item1 - item2;
  });

  var currentElements = [];
  currentElements.push(inputValues.pop());

  for (var levelIndex = 1; levelIndex <= elementCount; levelIndex++) {
    var nextElements = [];
    for (var elementIndex = 0; elementIndex < (1 << levelIndex); elementIndex++) {
      nextElements.push(inputValues.pop());
    }

    for (var elementIndex = 0; elementIndex < nextElements.length; elementIndex++) {
      if (currentElements[elementIndex] <= nextElements[elementIndex]) {
        displayOutput("No");
        return;
      }
    }
    currentElements = currentElements.concat(nextElements);
  }
  displayOutput("Yes");
}