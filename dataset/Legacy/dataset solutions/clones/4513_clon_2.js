var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputData;
var inputLines = [];

// Collect all input lines
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Once input is complete, initialize the data processor and run the main logic
inputReader.on('close', function() {
  inputData = initializeInputProcessor(inputLines);
  console.error('\n↑Input ↓Output'); // Informative message for competitive programming setup
  executeMainLogic();
});

/**
 * Creates a deep copy of an object or a Set.
 * @param {any} sourceObject The object to clone.
 * @returns {any} A deep copy of the source object.
 */
function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Fetches the next token from the input and parses it as an integer.
 * @returns {number} The next integer from the input.
 */
function getNextInteger() {
  return convertInputToken(fetchNextToken(), 1);
}

/**
 * Fetches the next token from the input and splits it into a string array.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return convertInputToken(fetchNextToken(), 2);
}

/**
 * Fetches the next token from the input, splits it, and parses elements as integers.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return convertInputToken(fetchNextToken(), 4);
}

/**
 * Fetches the next token from the input and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return convertInputToken(fetchNextToken(), 6);
}

/**
 * Retrieves the next available input token (line).
 * @returns {string} The next input line.
 */
function fetchNextToken() {
  return inputData.next();
}

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreTokens() {
  return inputData.hasMoreTokens();
}

/**
 * Initializes an object to process input lines sequentially.
 * @param {string[]} rawInputLines An array of raw input strings.
 * @returns {object} An object with methods to navigate input.
 */
function initializeInputProcessor(rawInputLines) {
  return {
    dataList: rawInputLines,
    currentPosition: 0,
    maximumLength: rawInputLines.length,
    hasMoreTokens: function() {
      return (this.currentPosition < this.maximumLength);
    },
    next: function() {
      if (this.hasMoreTokens()) {
        return this.dataList[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Prints a message to standard output.
 * @param {any} messageContent The content to print.
 */
function printResult(messageContent) {
  console.log(messageContent);
}

/**
 * Prints a debug message to standard error.
 * @param {any} messageContent The content to print for debugging.
 */
function logDebugMessage(messageContent) {
  console.error('debug:' + require('util').inspect(messageContent, false, null));
}

/**
 * Converts an input token based on the specified type.
 * @param {string|string[]} tokenValue The input token or array of tokens.
 * @param {number} conversionType The type of conversion to apply.
 *   1: parseInt
 *   2: split by space
 *   4: split by space and map to Number
 *   6: split by character
 *   7: split by character and map to Number
 *   8: join by space
 *   9: join by newline
 *   0: join without separator
 * @returns {any} The converted value.
 */
function convertInputToken(tokenValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(tokenValue);
      case 2:
        return tokenValue.split(' ');
      case 4:
        return tokenValue.split(' ').map(Number);
      case 6:
        return tokenValue.split('');
      case 7:
        return tokenValue.split('').map(Number);
      case 8:
        return tokenValue.join(' ');
      case 9:
        return tokenValue.join('\n');
      case 0:
        return tokenValue.join('');
      default:
        return tokenValue;
    }
  } catch (error) {
    return tokenValue; // Return original value on error
  }
}

/**
 * The primary execution logic of the program.
 * Calculates a factorial-based product with modulo.
 */
function executeMainLogic() {
  var firstLineNumbers = getNextIntegerArray();
  var firstNumber = firstLineNumbers[0];
  var secondNumber = firstLineNumbers[1];
  var moduloValue = 1000000007;
  var calculatedProduct = 1;

  // Check if the absolute difference between N and M is too large
  if (Math.abs(firstNumber - secondNumber) >= 2) {
    printResult(0); // Output 0 if difference is 2 or more
  } else {
    // Calculate factorial of N
    for (var loopCounter = 1; loopCounter <= firstNumber; loopCounter++) {
      calculatedProduct *= loopCounter;
      calculatedProduct %= moduloValue;
    }
    // Calculate factorial of M
    for (var loopCounter = 1; loopCounter <= secondNumber; loopCounter++) {
      calculatedProduct *= loopCounter;
      calculatedProduct %= moduloValue;
    }

    // If N and M are equal, multiply by 2
    if (secondNumber === firstNumber) {
      calculatedProduct *= 2;
      calculatedProduct %= moduloValue;
    }
    printResult(calculatedProduct); // Output the final calculated product
  }
}
