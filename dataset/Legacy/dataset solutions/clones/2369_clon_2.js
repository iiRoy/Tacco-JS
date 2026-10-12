/*
 * This section handles input/output setup and utility functions.
 * It's generally boilerplate for competitive programming environments.
 */
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor; // Global object for managing input tokens
var inputLines = []; // Array to store all lines read from stdin

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputReader(inputLines);
  console.error('\n'); // Print a newline to stderr for visual separation

  var startTime = Date.now(); // Record start time for performance measurement
  executeMainLogic(); // Execute the primary application logic
  var elapsedTime = Date.now() - startTime; // Calculate elapsed time

  logDebug('execution time : ' + elapsedTime + 'ms'); // Log execution time
  logDebug('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB'); // Log memory usage
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} sourceObject The object to clone.
 * @returns {any} A deep copy of the source object.
 */
function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Reads the next token from input and parses it as an integer.
 * @returns {number} The parsed integer.
 */
function readInteger() {
  return convertInput(getNextToken(), 1);
}

/**
 * Reads the next token from input and splits it into a string array by spaces.
 * @returns {string[]} An array of strings.
 */
function readStringArray() {
  return convertInput(getNextToken(), 2);
}

/**
 * Reads the next token from input, splits it by spaces, and parses elements as numbers.
 * @returns {number[]} An array of numbers.
 */
function readIntArray() {
  return convertInput(getNextToken(), 4);
}

/**
 * Reads the next token from input and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function readCharacterArray() {
  return convertInput(getNextToken(), 6);
}

/**
 * Retrieves the next available input token.
 * @returns {string} The next input token.
 */
function getNextToken() {
  return inputProcessor.retrieveNext();
}

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more tokens exist, false otherwise.
 */
function hasMoreTokens() {
  return inputProcessor.checkNext();
}

/**
 * Initializes an input reader object from an array of input lines.
 * @param {string[]} lines The array of input lines.
 * @returns {object} An object with methods to navigate input.
 */
function initializeInputReader(lines) {
  return {
    dataList: lines,
    currentIndex: 0,
    maximumIndex: lines.length,
    checkNext: function() {
      return (this.currentIndex < this.maximumIndex);
    },
    retrieveNext: function() {
      if (this.checkNext()) {
        return this.dataList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Prints a value to standard output.
 * @param {any} value The value to print.
 */
function printOutput(value) {
  console.log(value);
}

/**
 * Prints a debug message to standard error.
 * @param {any} message The message to print.
 */
function logDebug(message) {
  console.error('debug:' + require('util').inspect(message, false, null));
}

/**
 * Converts an input string based on a specified format code.
 * @param {string|string[]} inputItem The item to convert.
 * @param {number} formatCode The conversion format code.
 * @returns {any} The converted item.
 */
function convertInput(inputItem, formatCode) {
  try {
    switch (formatCode) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(' ');
      case 4:
        return inputItem.split(' ').map(Number);
      case 6:
        return inputItem.split('');
      case 7:
        return inputItem.split('').map(Number);
      case 8:
        return inputItem.join(' ');
      case 9:
        return inputItem.join('\n');
      case 0:
        return inputItem.join('');
      default:
        return inputItem;
    }
  } catch (error) {
    return inputItem; // Return original on error
  }
}

/*
 * Main application logic starts here.
 * This part contains the core algorithm.
 */
function executeMainLogic() {
  var inputNumber = readInteger(); // Read the main input number
  var hundredsPart = Math.floor(inputNumber / 100); // Calculate the number of hundreds
  var remainderPart = inputNumber % 100; // Calculate the remainder after dividing by 100

  if (inputNumber < 100) {
    printOutput(0); // If the number is less than 100, output 0
    return;
  }

  if (remainderPart !== 0) {
    var requiredHundreds = Math.ceil(remainderPart / 5); // Calculate required hundreds for the remainder
    if (hundredsPart >= requiredHundreds) {
      printOutput(1); // If available hundreds are sufficient, output 1
    } else {
      printOutput(0); // Otherwise, output 0
    }
  } else {
    printOutput(1); // If remainder is 0, output 1
  }
}
