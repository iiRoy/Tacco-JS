// This section handles input and basic utilities.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(inputLines);
  console.error('\n'); // Preserve exact output
  var startTime = Date.now();
  executeCalculation(); // Call the main logic
  var duration = Date.now() - startTime;
  logDebugMessage('execution time : ' + duration + 'ms'); // Preserve string literal
  logDebugMessage('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB'); // Preserve string literal
});

// Creates a deep copy of an object or Set.
function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

// Retrieves the next integer from input.
function retrieveInteger() {
  return performConversion(fetchNextToken(), 1);
}

// Retrieves the next string array from input.
function retrieveStringArray() {
  return performConversion(fetchNextToken(), 2);
}

// Retrieves the next integer array from input.
function retrieveIntegerArray() {
  return performConversion(fetchNextToken(), 4);
}

// Retrieves the next character array from input.
function retrieveCharacterArray() {
  return performConversion(fetchNextToken(), 6);
}

// Fetches the next token from the input stream.
function fetchNextToken() {
  return inputProcessor.getNext();
}

// Checks if there are more tokens in the input stream.
function hasMoreTokens() {
  return inputProcessor.checkMore();
}

// Initializes the input handling mechanism.
function initializeInputHandler(incomingData) {
  return {
    dataList: incomingData,
    currentPosition: 0,
    totalEntries: incomingData.length,
    checkMore: function() {
      return (this.currentPosition < this.totalEntries);
    },
    getNext: function() {
      if (this.checkMore()) {
        return this.dataList[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Preserve exact error message
      }
    }
  };
}

// Displays a result to standard output.
function displayResult(content) {
  console.log(content);
}

// Logs a debug message to standard error.
function logDebugMessage(messageContent) {
  console.error('debug:' + require('util').inspect(messageContent, false, null)); // Preserve 'debug:' prefix
}

// Handles various data type conversions based on a specified type code.
// Type codes:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and parse as numbers.
// 6: Split into characters.
// 7: Split into characters and parse as numbers.
// 8: Join with space.
// 9: Join with newline.
// 0: Join without separator.
function performConversion(item, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(item);
      case 2:
        return item.split(' ');
      case 4:
        return item.split(' ').map(Number);
      case 6:
        return item.split('');
      case 7:
        return item.split('').map(Number);
      case 8:
        return item.join(' ');
      case 9:
        return item.join('\n');
      case 0:
        return item.join('');
      default:
        return item;
    }
  } catch (error) {
    return item; // Return original item on conversion error
  }
}

// Main program logic starts here.
function executeCalculation() {
  var firstInputRow = retrieveIntegerArray();
  var upperBound = firstInputRow[0];
  var lowerBound = firstInputRow[1];
  var moduloValue = 1000000007; // A large prime number for modulo operations.
  var finalSum = 0;

  // Iterate from lowerBound up to upperBound + 1.
  for (var loopCounter = lowerBound; loopCounter <= upperBound + 1; loopCounter++) {
    var minimumValue = loopCounter * (loopCounter - 1) / 2;
    var maximumValue = upperBound * loopCounter - minimumValue;
    finalSum += maximumValue - minimumValue + 1;
    finalSum %= moduloValue; // Apply modulo to keep the sum within bounds.
  }

  displayResult(finalSum); // Output the computed result.
}
