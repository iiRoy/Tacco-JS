'use strict';

/**
 * Handles the primary logic for processing input and generating a solution.
 */
class PrimaryProcessor {
  /**
   * Executes the main solution algorithm.
   */
  processSolution() {
    // Reads a line of input, converts it into an array of individual characters,
    // and then reverses the order of these characters. This prepares the digits
    // for processing from right to left (least significant to most significant).
    const charSequence = Array.from(dataInput.fetchNextLine()).reverse();
    let totalValue = 0; // This variable accumulates the sum of all possible number combinations.

    // The outer loop iterates through all possible ways to insert '+' signs into the number string.
    // For a number with N digits, there are N-1 potential positions where a '+' sign can be placed.
    // Each iteration 'outerIndex' represents a unique combination of these '+' placements,
    // ranging from 0 to 2^(N-1) - 1.
    for (let outerIndex = 0; outerIndex < (1 << (charSequence.length - 1)); ++outerIndex) {
      let tempCounter = outerIndex; // A temporary variable used to track the current combination of splits.
      let digitMultiplier = 1; // Represents the current place value (e.g., 1, 10, 100) for the digit being processed.

      // The inner loop processes each character (digit) from the reversed sequence.
      // This means it processes the digits starting from the original number's rightmost digit
      // and moving towards its leftmost digit.
      for (const currentElement of charSequence) {
        // Adds the current digit (converted to a number) multiplied by its current place value
        // to the running total.
        totalValue += Number(currentElement) * digitMultiplier;

        // This conditional logic determines if the next digit (which is to the left in the original number)
        // should be concatenated with the current number segment or if it should start a new number segment.
        // If the least significant bit of 'tempCounter' is 1, it implies there is no '+' sign at this position,
        // so the next digit is considered part of the same number, and the multiplier increases (e.g., 1 -> 10, 10 -> 100).
        // If the bit is 0, it means a '+' sign is effectively inserted, and the next digit will start a new number,
        // so the multiplier resets to 1.
        digitMultiplier = (tempCounter & 1) ? (digitMultiplier * 10) : 1;
        tempCounter >>= 1; // Shifts 'tempCounter' to the right by one bit to check the next position's split decision.
      }
    }
    // After iterating through all combinations and summing them, the final total is printed to the console.
    console.log(totalValue);
  }
}

/**
 * A collection of general-purpose utility functions, providing common array and data manipulation methods.
 * It is designed to offer functionality similar to libraries like Lodash or Underscore.js.
 */
class UtilityBelt {
  /**
   * Calculates the sum of all numeric elements within an array.
   * @param {number[]} inputArray - The array of numbers to sum.
   * @returns {number} The total sum of the array elements.
   */
  calculateSum(inputArray) {
    return inputArray.reduce((valA, valB) => valA + valB);
  }

  /**
   * Identifies and returns the minimum element from an array.
   * An optional comparison function can be provided to define custom sorting logic.
   * @param {Array} inputArray - The array from which to find the minimum element.
   * @param {Function} [comparisonFunction] - An optional function that defines the sort order.
   * @returns {*} The smallest element found in the array.
   */
  findMinimum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB;
    }
    return inputArray.reduce((valA, valB) => comparisonFunction(valA, valB) < 0 ? valA : valB);
  }

  /**
   * Identifies and returns the maximum element from an array.
   * An optional comparison function can be provided to define custom sorting logic.
   * @param {Array} inputArray - The array from which to find the maximum element.
   * @param {Function} [comparisonFunction] - An optional function that defines the sort order.
   * @returns {*} The largest element found in the array.
   */
  findMaximum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB;
    }
    return inputArray.reduce((valA, valB) => comparisonFunction(valA, valB) > 0 ? valA : valB);
  }

  /**
   * Sorts an array in place and returns the sorted array.
   * An optional comparison function can be provided for custom sorting.
   * @param {Array} inputArray - The array to be sorted.
   * @param {Function} [comparisonFunction] - An optional function that defines the sort order.
   * @returns {Array} The sorted array.
   */
  arrangeElements(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB;
    }
    return inputArray.sort(comparisonFunction);
  }

  /**
   * Generates an array of numbers within a specified range.
   * Similar to Python's `range()` function.
   * @param {number} begin - The starting value of the sequence (inclusive).
   * @param {number} [end] - The stopping value of the sequence (exclusive).
   * @param {number} [increment] - The step value between numbers.
   * @returns {number[]} An array containing the generated sequence of numbers.
   */
  generateSequence(begin, end, increment) {
    if (end == null) {
      end = begin || 0;
      begin = 0;
    }
    if (!increment) {
      increment = end < begin ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((end - begin) / increment), 0);
    const resultSequence = Array(sequenceLength);

    for (var loopIndex = 0; loopIndex < sequenceLength; loopIndex++, begin += increment) {
      resultSequence[loopIndex] = begin;
    }
    return resultSequence;
  }

  /**
   * Retrieves the first N elements from an array. If N is not specified, returns the first element.
   * @param {Array} targetArray - The array from which to retrieve elements.
   * @param {number} [count] - The number of elements to retrieve from the beginning.
   * @returns {*} The first element or an array of the first N elements.
   */
  getLeadingElements(targetArray, count) {
    if (targetArray == null || targetArray.length < 1) return count == null ? undefined : [];
    if (count == null) return targetArray[0];
    return this.getInitialSegment(targetArray, targetArray.length - count);
  }

  /**
   * Extracts an initial segment of an array, excluding a specified number of elements from the end.
   * @param {Array} targetArray - The array to segment.
   * @param {number} count - The number of elements to exclude from the end of the array.
   * @returns {Array} A new array containing the initial segment.
   */
  getInitialSegment(targetArray, count) {
    return targetArray.slice.call(targetArray, 0, Math.max(0, targetArray.length - (count == null ? 1 : count)));
  }

  /**
   * Extracts the trailing elements of an array, skipping a specified number of elements from the beginning.
   * @param {Array} targetArray - The array to segment.
   * @param {number} [count] - The number of elements to skip from the beginning. Defaults to 1.
   * @returns {Array} A new array containing the trailing elements.
   */
  getTrailingElements(targetArray, count) {
    return targetArray.slice.call(targetArray, count == null ? 1 : count);
  }

  /**
   * Retrieves the last N elements from an array. If N is not specified, returns the last element.
   * @param {Array} targetArray - The array from which to retrieve elements.
   * @param {number} [count] - The number of elements to retrieve from the end.
   * @returns {*} The last element or an array of the last N elements.
   */
  getFinalElements(targetArray, count) {
    if (count == null) return targetArray[targetArray.length - 1];
    return this.getTrailingElements(targetArray, Math.max(0, targetArray.length - count));
  }

  /**
   * Computes the cumulative sum (prefix sum) of an array of numbers.
   * The result array contains the sum of elements up to each index.
   * @param {number[]} inputArray - The array of numbers for which to compute cumulative sums.
   * @returns {number[]} An array containing the cumulative sums.
   */
  computeCumulativeSum(inputArray) {
    return this.getTrailingElements(inputArray.reduce(((accumulator, currentVal, index) => {
      accumulator.push(currentVal + accumulator[index]);
      return accumulator;
    }), [0]));
  }

  /**
   * Performs a binary search on a sorted array to find the insertion point for a given value.
   * It returns the index where the value should be inserted to maintain the sorted order.
   * @param {Array} targetArray - The sorted array to search within.
   * @param {*} searchValue - The value to search for.
   * @param {string} [iteratorProperty] - If the array contains objects, this is the property name to compare.
   * @returns {number} The index where the value should be inserted.
   */
  performBinarySearch(targetArray, searchValue, iteratorProperty) {
    const iteratorFunction = (dataObject) => (typeof dataObject === 'object') ? dataObject[iteratorProperty] : dataObject;
    const valueToFind = iteratorFunction(searchValue);
    let lowerBound = 0,
      upperBound = targetArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (iteratorFunction(targetArray[middleIndex]) < valueToFind) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
// Instantiate the utility belt for global access.
const util = new UtilityBelt();

/**
 * Manages input operations, primarily reading data from standard input (stdin).
 */
class DataFeeder {
  /**
   * Initializes the DataFeeder by reading all available input from stdin.
   */
  constructor() {
    this.currentPosition = 0; // Keeps track of the current line being read from the input data.
    this.readAllData(); // Calls a method to populate the internal data array upon instantiation.
  }

  /**
   * Reads all lines from standard input into an internal array.
   * This method uses Node.js's 'fs' module to synchronously read from '/dev/stdin'.
   * @returns {string[]} An array of strings, where each string represents a line from the input.
   */
  readAllData() {
    this.rawData = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawData;
  }

  /**
   * Fetches one or more lines from the input data based on the current position.
   * @param {number} [numLines] - The number of lines to fetch. If omitted, fetches a single line.
   * @returns {string|string[]} A single string if `numLines` is not provided, or an array of strings otherwise.
   */
  fetchNextLine(numLines) {
    if (numLines) {
      const returnValue = this.rawData.slice(this.currentPosition, this.currentPosition + numLines);
      this.currentPosition += numLines;
      return returnValue;
    }
    return this.rawData[this.currentPosition++];
  }

  /**
   * Fetches the next line from input and attempts to parse it as an integer.
   * @returns {number} The parsed integer value.
   */
  fetchNextInt() {
    return parseInt(this.fetchNextLine());
  }

  /**
   * Fetches the next line, splits it by spaces, and returns the parts as an array of strings.
   * @returns {string[]} An array of strings, representing words or tokens from the line.
   */
  fetchNextStringArray() {
    return this.fetchNextLine().split(' ');
  }

  /**
   * Fetches the next line, splits it by spaces, and then parses each part as an integer.
   * @returns {number[]} An array of integers.
   */
  fetchNextIntArray() {
    return this.fetchNextStringArray().map((element) => parseInt(element));
  }

  /**
   * Fetches the next line, splits it by spaces, and then parses each part as a floating-point number.
   * @returns {number[]} An array of floating-point numbers.
   */
  fetchNextFloatArray() {
    return this.fetchNextStringArray().map((element) => parseFloat(element));
  }

  /**
   * Fetches a specified number of lines and parses each line as an integer.
   * @param {number} numLines - The number of lines to fetch and parse.
   * @returns {number[]} An array of integers, one for each fetched line.
   */
  fetchIntLines(numLines) {
    return this.fetchNextLine(numLines).map((element) => parseInt(element));
  }

  /**
   * Fetches a specified number of lines and parses each line as a floating-point number.
   * @param {number} numLines - The number of lines to fetch and parse.
   * @returns {number[]} An array of floating-point numbers, one for each fetched line.
   */
  fetchFloatLines(numLines) {
    return this.fetchNextLine(numLines).map((element) => parseFloat(element));
  }

  /**
   * Fetches a specified number of lines and splits each line into an array of strings.
   * This results in a 2D array (matrix) of strings.
   * @param {number} numLines - The number of lines to fetch and process.
   * @returns {string[][]} A 2D array where each inner array represents a line split by spaces.
   */
  fetchStringMatrix(numLines) {
    return this.fetchNextLine(numLines).map((currentLine) => currentLine.split(' '));
  }

  /**
   * Fetches a specified number of lines, splits each line by spaces, and parses each part as an integer.
   * This results in a 2D array (matrix) of integers.
   * @param {number} numLines - The number of lines to fetch and process.
   * @returns {number[][]} A 2D array where each inner array contains integers from a line.
   */
  fetchIntMatrix(numLines) {
    return this.fetchNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }

  /**
   * Fetches a specified number of lines, splits each line by spaces, and parses each part as a floating-point number.
   * This results in a 2D array (matrix) of floating-point numbers.
   * @param {number} numLines - The number of lines to fetch and process.
   * @returns {number[][]} A 2D array where each inner array contains floats from a line.
   */
  fetchFloatMatrix(numLines) {
    return this.fetchNextLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}
// Instantiate the input feeder for global access.
const dataInput = new DataFeeder();

/**
 * A utility function responsible for handling output formatting and printing to the console.
 * It converts boolean values to "Yes" or "No" strings before logging.
 * @param {*} dataToOutput - The data to be processed and outputted.
 */
const OutputHandler = (dataToOutput) => {
  let formattedOutput; // Variable to store the final string representation for output.
  if (dataToOutput == null) return; // If the input data is null or undefined, the function exits without outputting.

  // Checks if the output is a boolean and formats it to "Yes" or "No".
  if (dataToOutput === true) {
    formattedOutput = 'Yes';
  } else if (dataToOutput === false) {
    formattedOutput = 'No';
  } else {
    // For any other data type, the value is used directly for output.
    formattedOutput = dataToOutput;
  }
  // Prints the formatted output to the standard console.
  console.log(formattedOutput);
};

// Creates a new instance of the PrimaryProcessor, executes its main solution method,
// and then passes the result (which is undefined, as the solution logs directly)
// to the OutputHandler. The OutputHandler will then correctly ignore the undefined result.
OutputHandler(new PrimaryProcessor().processSolution());
