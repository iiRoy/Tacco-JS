var INPUT_PARSER = (function() {
  /**
   * Factory function to create an InputDataProcessor instance.
   * @param {string} inputString - The raw input string to be processed.
   * @returns {InputDataProcessor} A new input processor instance.
   */
  function createParser(inputString) {
    return new InputDataProcessor(inputString);
  }

  /**
   * Class responsible for parsing and extracting data from a multi-line string input.
   * It maintains the state of which line is currently being processed.
   * @param {string} inputString - The complete input string.
   */
  function InputDataProcessor(inputString) {
    // Store the input string, split into an array of lines after trimming leading/trailing whitespace.
    this._sourceLines = inputString.trim().split("\n");
    // Initialize the index of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads and extracts a single value from the current line.
   * This method handles splitting the line and advancing the internal line pointer.
   * @param {boolean} [returnAsString=false] - If true, the value is returned as a string; otherwise, it's converted to a number.
   * @returns {string|number} The extracted value.
   */
  InputDataProcessor.prototype.readSingleValue = function(returnAsString) {
    var lineArray = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var extractedValue;

    // If the current line is still a raw string, split it into an array of space-separated values.
    // The original logic reverses the array and then pops, effectively reading from the "front" of the original line.
    if (typeof lineArray[lineIdx] === "string") {
      lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
    }

    // Extract the last element from the (reversed) array.
    extractedValue = lineArray[lineIdx].pop();

    // If the current line (array of values) is now empty, increment the line index to move to the next line.
    if (!lineArray[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, either as a string or converted to a number using the unary plus operator.
    return returnAsString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line, splits it by spaces, and returns an array of values.
   * The internal line index is advanced after reading.
   * @param {boolean} [returnAsString=false] - If true, values are returned as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array containing the values from the line.
   */
  InputDataProcessor.prototype.readLineValues = function(returnAsString) {
    // Get the current line, split it, and then increment the line index.
    var lineContent = this._sourceLines[this._currentLineIndex++].split(" ");
    // Map values to numbers if not requested as strings.
    return returnAsString ? lineContent : lineContent.map(item => +item);
  };

  /**
   * Reads a specified number of lines, treating each as a row in a matrix.
   * Each row is split into values. The line index is advanced by the number of lines read.
   * @param {number} count - The number of lines (rows) to read.
   * @param {boolean} [returnAsString=false] - If true, values are returned as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputDataProcessor.prototype.readMatrixValues = function(count, returnAsString) {
    // Slice the source lines to get the desired number of rows, then update the line index.
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count).map(rowStr => rowStr.split(" "));
    // If not returning as strings, map each inner array's elements to numbers.
    return returnAsString ? matrixRows : matrixRows.map(row => row.map(item => +item));
  };

  /**
   * Reads a specified number of raw lines without splitting them into individual values.
   * The line index is advanced by the number of lines read.
   * @param {number} count - The number of raw lines to read.
   * @param {boolean} [returnAsString=false] - If true, lines are returned as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of raw line contents.
   */
  InputDataProcessor.prototype.readRawLines = function(count, returnAsString) {
    // Slice the source lines to get the desired number of raw lines, then update the line index.
    var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
    // If not returning as strings, map each line to a number.
    return returnAsString ? rawLines : rawLines.map(item => +item);
  };

  return createParser; // Expose the factory function for creating parser instances.
})();

// Initialize the input reader by providing it with the content of standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function is defined in the original code but not utilized in the main problem logic.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - Variable number of arguments specifying the dimensions of the array.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var argCount = args.length;
  // Construct the string for the innermost array creation.
  var arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  // Loop to build up the string for higher dimensions.
  while (--argCount) {
    arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }
  // Use eval to execute the dynamically constructed array creation string.
  return eval(arrayCreationString);
}

// Execute the primary problem-solving function and output its result to the console.
console.log(solveProblem());

/**
 * The main function containing the core logic to solve the problem.
 * It reads input values, performs calculations based on divisors, and determines a specific result.
 * @returns {number} The largest divisor that satisfies the problem's conditions.
 */
function solveProblem() {
  // Read the number of elements (N) and the maximum allowed cost (K) from input.
  var numElements = inputReader.readSingleValue();
  var maxCost = inputReader.readSingleValue();
  // Read the array of element values (A) from input.
  var elementValues = inputReader.readLineValues();

  // Calculate the total sum of all elements in the array.
  var totalSum = elementValues.reduce((accumulator, currentValue) => accumulator + currentValue);

  // Obtain all divisors of the total sum, sorted in descending order.
  var divisors = getDivisors(totalSum);

  // Iterate through each divisor, starting from the largest, to find the one that meets the criteria.
  for (var divisorIndex = 0; divisorIndex < divisors.length; divisorIndex++) {
    // For the current divisor, calculate the remainder of each element when divided by it.
    // Then, sort these remainders in ascending order.
    var remaindersSorted = elementValues.map(val => val % divisors[divisorIndex]).sort((valA, valB) => valA - valB);

    var remainingElements = numElements; // A counter for elements that are still "active" in the adjustment process.
    var currentSum = 0; // Tracks the sum of remainders being considered for adjustment.
    var currentMaxCost = 0; // Accumulates the cost incurred for the current divisor.

    // Iterate through the sorted remainders from smallest to largest.
    // The loop continues as long as there are elements to process and the accumulated cost does not exceed K.
    for (var elementIndex = 0; elementIndex < remainingElements && currentMaxCost <= maxCost; elementIndex++) {
      currentSum += remaindersSorted[elementIndex]; // Add the current remainder to the running sum.
      currentMaxCost += remaindersSorted[elementIndex]; // Add the current remainder to the total cost.

      // This inner loop adjusts the `currentSum` by "compensating" with larger remainders.
      // It simulates making elements multiples of the divisor by adding (divisor - remainder) to them.
      // Subtracting (divisor - remainder) from `currentSum` is equivalent to adding `remainder` and then reducing by `divisor`.
      while (currentSum > 0) {
        // Decrement `remainingElements` to point to the next largest remainder not yet used for compensation.
        // Subtract the "complement" needed to make the element a multiple of the divisor.
        currentSum -= (divisors[divisorIndex] - remaindersSorted[--remainingElements]);
      }
    }

    // If the total cost accumulated for this divisor is within the allowed maximum (K),
    // then this is the largest such divisor (because `divisors` is sorted descending), so return it.
    if (currentMaxCost <= maxCost) {
      return divisors[divisorIndex];
    }
  }

  // If no divisor satisfies the condition, by default, 1 is always a divisor and incurs 0 cost,
  // so it's the fallback answer.
  return 1;
}

/**
 * Computes all positive divisors of a given integer, including 1 and the number itself.
 * The divisors are returned in descending order.
 * @param {number} numberToFactor - The integer for which to find divisors.
 * @returns {Array<number>} An array of the number's divisors, sorted from largest to smallest.
 */
function getDivisors(numberToFactor) {
  var resultDivisors = [numberToFactor]; // Always include the number itself as a divisor.
  var sqrtOfN = Math.sqrt(numberToFactor);
  var intSqrt = sqrtOfN | 0; // Get the integer part of the square root using bitwise OR.

  // If the number is a perfect square, its square root is a divisor.
  if (intSqrt * intSqrt === numberToFactor) {
    resultDivisors.push(intSqrt);
  }

  // Iterate from 2 up to (but not including) the square root of the number.
  for (var factorCandidate = 2; factorCandidate < sqrtOfN; factorCandidate++) {
    // If `factorCandidate` divides `numberToFactor` evenly, then both `factorCandidate`
    // and `numberToFactor / factorCandidate` are divisors.
    if (numberToFactor % factorCandidate === 0) {
      resultDivisors.push(factorCandidate, numberToFactor / factorCandidate);
    }
  }

  // Sort the collected divisors in descending order.
  return resultDivisors.sort((valA, valB) => valB - valA);
}
