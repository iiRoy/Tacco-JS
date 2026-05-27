var INPUT_PARSER_FACTORY = (function () {
  /**
   * Creates an input parser instance.
   * @param {string} rawInputText - The raw input string, typically from stdin.
   * @returns {InputDataStream} An instance of InputDataStream.
   */
  function createInputParser(rawInputText) {
    return new InputDataStream(rawInputText);
  }

  /**
   * Represents a stream of input data, allowing sequential reading.
   * @param {string} sourceContent - The string content to parse.
   * @constructor
   */
  function InputDataStream(sourceContent) {
    // Split the input content into lines and store them.
    this._inputLines = sourceContent.trim().split("\n");
    // Initialize a pointer to the current line being processed.
    this._currentLinePointer = 0;
  }

  /**
   * Reads the next token from the current line. If the current line is exhausted,
   * it moves to the next line. Tokens are space-separated.
   * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The next token.
   */
  InputDataStream.prototype.readNextToken = function (returnAsString) {
    var currentLines = this._inputLines;
    var lineIndex = this._currentLinePointer;
    var extractedToken;

    // If the current line hasn't been split into tokens yet, do so.
    // Tokens are read from right to left (popped from the end of the array).
    if (typeof currentLines[lineIndex] === "string") {
      currentLines[lineIndex] = currentLines[lineIndex].split(" ").reverse();
    }

    // Extract the last token from the current line's token array.
    extractedToken = currentLines[lineIndex].pop();

    // If the current line is now empty of tokens, advance to the next line.
    if (!currentLines[lineIndex].length) {
      this._currentLinePointer++;
    }

    // Return the token, either as a string or parsed as a number.
    return returnAsString ? extractedToken : +extractedToken;
  };

  /**
   * Reads an entire line and splits it into tokens.
   * @param {boolean} [returnStringsOnly=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of tokens from the line.
   */
  InputDataStream.prototype.readFullLine = function (returnStringsOnly) {
    // Get the current line, split it by spaces, and advance the line pointer.
    var lineTokensArray = this._inputLines[this._currentLinePointer++].split(" ");
    // Return tokens as strings or parsed as numbers.
    return returnStringsOnly ? lineTokensArray : lineTokensArray.map((tokenStr) => +tokenStr);
  };

  /**
   * Reads a specified number of lines as a matrix (array of arrays).
   * @param {number} numberOfRows - The number of rows to read.
   * @param {boolean} [asStringArrayOfArrays=false] - If true, returns matrix elements as strings; otherwise, as numbers.
   * @returns {string[][]|number[][]} The matrix data.
   */
  InputDataStream.prototype.readMatrixData = function (numberOfRows, asStringArrayOfArrays) {
    // Extract the specified number of lines and advance the line pointer.
    var matrixRowsData = this._inputLines.slice(
      this._currentLinePointer,
      (this._currentLinePointer += numberOfRows)
    ).map((rowString) => rowString.split(" "));

    // Return matrix elements as strings or parsed as numbers.
    return asStringArrayOfArrays
      ? matrixRowsData
      : matrixRowsData.map((row) => row.map((element) => +element));
  };

  /**
   * Reads a specified number of lines as a simple array.
   * @param {number} lineCount - The number of lines to read.
   * @param {boolean} [returnAsStrings=false] - If true, returns line contents as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of line contents.
   */
  InputDataStream.prototype.readLinesAsNumericArray = function (lineCount, returnAsStrings) {
    // Extract the specified number of lines and advance the line pointer.
    var linesExtracted = this._inputLines.slice(
      this._currentLinePointer,
      (this._currentLinePointer += lineCount)
    );

    // Return line contents as strings or parsed as numbers.
    return returnAsStrings ? linesExtracted : linesExtracted.map((lineContent) => +lineContent);
  };

  return createInputParser;
})();

// Initialize the input handler by reading from standard input.
var inputHandler = INPUT_PARSER_FACTORY(require("node:fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function is not used in the main problem-solving logic but is part of the original utility set.
 * @param {*} initialElementValue - The value to initialize array elements with.
 * @param {...number} dimensionArguments - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimensionalArray(initialElementValue) {
  var dimensionArguments = arguments;
  var argLength = dimensionArguments.length;
  // Start building the array creation expression from the innermost dimension.
  var arrayCreationExpression = `Array(${dimensionArguments[--argLength]}).fill(0).map(_ignored => { return ${initialElementValue}; })`;

  // Build up the expression for outer dimensions.
  while (--argLength) {
    arrayCreationExpression = `Array(${dimensionArguments[argLength]}).fill(0).map(_ignored => ${arrayCreationExpression})`;
  }

  // Evaluate the dynamically constructed string to create the array.
  return eval(arrayCreationExpression);
}

/**
 * Main function to process the input and solve the problem.
 * @returns {number} The result of the problem.
 */
function processInputAndSolve() {
  // Read the main string 's' and the search pattern 't'.
  var mainString = inputHandler.readNextToken(true);
  var searchPattern = inputHandler.readNextToken(true);

  // Calculate the repetition factor of the search pattern.
  var patternRepeatFactor = calculatePatternRepetition(searchPattern);

  // If the pattern has a repetition factor greater than 1,
  // reduce the pattern to its smallest repeating unit.
  if (patternRepeatFactor > 1) {
    searchPattern = searchPattern.slice(0, searchPattern.length / patternRepeatFactor);
  }

  // Create doubled and tripled versions of the main string for searching.
  var mainStringDoubled = mainString + mainString;
  var mainStringTripled = mainStringDoubled + mainString;

  // Get the length of the (potentially reduced) search pattern.
  var patternLength = searchPattern.length;

  // Initialize variables for tracking consecutive matches.
  var maximumConsecutiveMatches = 0;
  var currentConsecutiveMatches = 1;

  // Find the first occurrence of the pattern in the doubled main string.
  var currentSearchPosition = mainStringDoubled.indexOf(searchPattern);

  // If the pattern is not found at all, return 0.
  if (currentSearchPosition === -1) {
    return 0;
  }

  // Advance the search position past the first match.
  currentSearchPosition += patternLength;

  // Loop through the doubled string to find consecutive matches.
  while (currentSearchPosition < mainStringDoubled.length) {
    // Find the next occurrence of the pattern starting from the current search position.
    var nextMatchPosition = mainStringDoubled.indexOf(searchPattern, currentSearchPosition);

    // If no more matches are found, break the loop.
    if (nextMatchPosition === -1) {
      break;
    }

    // If the current match immediately follows the previous one, increment consecutive count.
    if (currentSearchPosition === nextMatchPosition) {
      currentConsecutiveMatches++;
    } else {
      // If there's a gap, update the maximum consecutive count if current is higher, then reset.
      if (maximumConsecutiveMatches < currentConsecutiveMatches) {
        maximumConsecutiveMatches = currentConsecutiveMatches;
      }
      currentConsecutiveMatches = 1; // Reset count for a new sequence.
    }
    // Advance the search position past the current match.
    currentSearchPosition = nextMatchPosition + patternLength;
  }

  // After the loop, update maximumConsecutiveMatches one last time for the final sequence.
  if (maximumConsecutiveMatches < currentConsecutiveMatches) {
    maximumConsecutiveMatches = currentConsecutiveMatches;
  }

  // Check for a special case: if the pattern continues into the tripled string
  // exactly where the doubled string ended, it implies infinite repetition.
  nextMatchPosition = mainStringTripled.indexOf(searchPattern, currentSearchPosition);
  if (nextMatchPosition === currentSearchPosition) {
    currentConsecutiveMatches++;
    // If this extended sequence is greater than the current maximum, it means infinite matches.
    if (maximumConsecutiveMatches < currentConsecutiveMatches) {
      return -1; // Indicate infinite repetition.
    }
  }

  // Return the maximum consecutive matches divided by the pattern's repetition factor, floored.
  return (maximumConsecutiveMatches / patternRepeatFactor) | 0;
}

/**
 * Calculates the smallest repetition factor for a given string.
 * E.g., "abcabc" has a factor of 2 (repeats "abc"). "aaaa" has a factor of 4 (repeats "a").
 * "abc" has a factor of 1.
 * @param {string} inputPattern - The string to analyze.
 * @returns {number} The repetition factor.
 */
function calculatePatternRepetition(inputPattern) {
  var patternLength = inputPattern.length;
  // A single character string always has a repetition factor of 1.
  if (patternLength === 1) {
    return 1;
  }

  // Get all positive divisors of the string's length.
  var patternDivisors = getPositiveDivisors(patternLength);

  // Iterate through the divisors to find the smallest repeating unit.
  for (var divisorIndex = 0; divisorIndex < patternDivisors.length; divisorIndex++) {
    var repetitionFactor = patternLength / patternDivisors[divisorIndex];
    // Construct a regex to check if the string is formed by repeating a prefix.
    // Example: for "abcabc", divisor is 3, prefix is "abc", factor is 2. Regex: "(abc){2}"
    if (
      inputPattern.match(
        new RegExp(
          `(${inputPattern.slice(0, patternDivisors[divisorIndex])}){${repetitionFactor}}`
        )
      )
    ) {
      return repetitionFactor;
    }
  }
  // If no repetition is found, the factor is 1 (the string itself is the smallest unit).
  return 1;
}

/**
 * Finds all positive divisors of a given integer, including 1 and the number itself.
 * The divisors are returned in ascending order.
 * @param {number} inputNumber - The integer for which to find divisors.
 * @returns {number[]} An array of positive divisors.
 */
function getPositiveDivisors(inputNumber) {
  var foundDivisors = [1]; // 1 is always a divisor.
  var sqrtInteger = Math.sqrt(inputNumber) | 0; // Integer part of the square root.

  // If the number is a perfect square, its square root is a divisor.
  if (sqrtInteger * sqrtInteger === inputNumber) {
    foundDivisors.push(sqrtInteger);
  }

  // Iterate from 2 up to (but not including) the square root.
  for (var loopCounter = 2; loopCounter < sqrtInteger; loopCounter++) {
    if (inputNumber % loopCounter === 0) {
      // If 'loopCounter' is a divisor, then 'inputNumber / loopCounter' is also a divisor.
      foundDivisors.push(loopCounter, inputNumber / loopCounter);
    }
  }

  // Sort the divisors in ascending order.
  return foundDivisors.sort((valOne, valTwo) => valOne - valTwo);
}

// This block handles execution based on command-line arguments.
// It's typically used for competitive programming environments to manage stack size.
if (process.argv.length <= 2) {
  // If no arguments (or only node executable and script name), fork a new process
  // with an increased stack size to prevent stack overflow for deep recursions.
  require("child_process").fork("SolutionRunner.js", ["1"], {
    execArgv: ["--stack-size=" + 256 * 1024], // Set stack size to 256KB
  });
} else {
  // If arguments are present (e.g., from the forked process), execute the main logic.
  console.log(processInputAndSolve());
}
