const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const inputLinesBuffer = [];

inputReader.on('line', function(currentLine) {
  inputLinesBuffer.push(currentLine);
});

inputReader.on('close', function() {
  dataProcessor = initializeInputHandler(inputLinesBuffer);
  console.error('\n'); // Output a newline to stderr for separation

  const startTime = Date.now();
  executePrimaryLogic();
  const elapsedTime = Date.now() - startTime;

  logDebug('time : ' + elapsedTime + 'ms');
  logDebug('memory : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

// Produces a deep copy of the provided object or Set.
function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

// Fetches and converts the next input entry to an integer.
function retrieveInteger() {
  return convertInput(getNextItem(), 1);
}

// Fetches and converts the next input entry to an array of strings.
function retrieveStringArray() {
  return convertInput(getNextItem(), 2);
}

// Fetches and converts the next input entry to an array of integers.
function retrieveIntegerArray() {
  return convertInput(getNextItem(), 4);
}

// Fetches and converts the next input entry to an array of characters.
function retrieveCharacterArray() {
  return convertInput(getNextItem(), 6);
}

// Obtains the subsequent item from the input stream.
function getNextItem() {
  return dataProcessor.next();
}

// Determines if there are additional items available in the input stream.
function hasMoreItems() {
  return dataProcessor.hasNext();
}

// Sets up the handler for processing input data.
function initializeInputHandler(rawInputData) {
  return {
    list: rawInputData,
    index: 0,
    max: rawInputData.length,
    hasNext: function() {
      return (this.index < this.max);
    },
    next: function() {
      if (this.hasNext()) {
        return this.list[this.index++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Outputs a given message to the standard console.
function logResult(messageContent) {
  console.log(messageContent);
}

// Outputs a debug message to the standard error console.
function logDebug(messageContent) {
  console.error('debug:' + require('util').inspect(messageContent, false, null));
}

/*
 * Transforms an input value based on the specified conversion type.
 * conversionType values:
 *   1: Parses the value as an integer.
 *   2: Splits the value by spaces into a string array.
 *   4: Splits the value by spaces and maps to an integer array.
 *   6: Splits the value into a character array.
 *   7: Splits the value into a character array and maps to integers.
 *   8: Joins array elements with a space.
 *   9: Joins array elements with a newline.
 *   0: Joins array elements without any separator.
 *   Any other value: Returns the original value unchanged.
 */
function convertInput(valueToConvert, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(valueToConvert);
      case 2:
        return valueToConvert.split(' ');
      case 4:
        return valueToConvert.split(' ').map(Number);
      case 6:
        return valueToConvert.split('');
      case 7:
        return valueToConvert.split('').map(Number);
      case 8:
        return valueToConvert.join(' ');
      case 9:
        return valueToConvert.join('\n');
      case 0:
        return valueToConvert.join('');
      default:
        return valueToConvert;
    }
  } catch (e) {
    return valueToConvert;
  }
}

// The core algorithm implementation.
function executePrimaryLogic() {
  const dimension = retrieveInteger();
  const initialSequence = retrieveIntegerArray();
  const resultGrid = new Array(dimension * dimension);

  for (let idx = 0; idx < dimension; idx++) {
    resultGrid[initialSequence[idx] - 1] = idx + 1;
  }

  for (let idx = 2; idx <= dimension; idx++) {
    let remainingCount = idx - 1;
    for (let gridIdx = 0; gridIdx < dimension * dimension; gridIdx++) {
      if (resultGrid[gridIdx] == null) {
        remainingCount--;
        resultGrid[gridIdx] = idx;
        if (remainingCount === 0) {
          break;
        }
      } else if (resultGrid[gridIdx] === idx) {
        logResult("No");
        return;
      }
    }
  }

  const fillOrder = new Array(dimension);
  for (let idx = 0; idx < dimension; idx++) {
    fillOrder[idx] = dimension - idx - 1;
  }

  let currentFillValue = 1;
  for (let idx = 0; idx < dimension * dimension; idx++) {
    if (resultGrid[idx] == null) {
      resultGrid[idx] = currentFillValue;
      fillOrder[0]--;
      if (fillOrder[0] === 0) {
        fillOrder.shift();
        currentFillValue++;
      }
    }
  }

  logResult("Yes");
  logResult(convertInput(resultGrid, 8));
}
