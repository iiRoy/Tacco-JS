'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Primary application logic handler.
 * This class orchestrates the main computation.
 */
class PrimaryProcessor {
  /**
   * Executes the core problem-solving algorithm.
   * @returns {number} The computed result.
   */
  processSolution() {
    // Acquire initial parameters: an array containing N, A, and B.
    const paramsArray = dataSource.fetchIntegerArray();
    // Acquire the sequence of numbers for processing.
    const sequenceData = dataSource.fetchIntegerArray();

    // Calculate the sum of minimum costs for each difference in the sequence.
    // First, compute differences between consecutive elements.
    // Then, for each difference, calculate the cost (difference * A) and cap it at B.
    // Finally, sum up all these capped costs.
    return _util.calculateSum(
      _util.calculateDifferences(sequenceData).map(
        (currentElement) => Math.min(currentElement * paramsArray[1], paramsArray[2])
      )
    );
  }
}

/**
 * A collection of general-purpose utility functions,
 * similar to a simplified Underscore.js or Lodash.
 */
class UtilityToolkit {
  /**
   * Calculates the sum of all numbers in an array.
   * @param {number[]} inputArray - The array of numbers.
   * @returns {number} The total sum.
   */
  calculateSum(inputArray) {
    return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  /**
   * Finds the minimum element in an array.
   * @param {Array} inputArray - The array to search.
   * @param {Function} [comparisonFunction] - An optional comparison function (like Array.prototype.sort).
   * @returns {*} The minimum element.
   */
  findMinimum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (elementA, elementB) => elementA - elementB;
    }
    return inputArray.reduce((elementA, elementB) =>
      comparisonFunction(elementA, elementB) < 0 ? elementA : elementB
    );
  }

  /**
   * Finds the maximum element in an array.
   * @param {Array} inputArray - The array to search.
   * @param {Function} [comparisonFunction] - An optional comparison function.
   * @returns {*} The maximum element.
   */
  findMaximum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (elementA, elementB) => elementA - elementB;
    }
    return inputArray.reduce((elementA, elementB) =>
      comparisonFunction(elementA, elementB) > 0 ? elementA : elementB
    );
  }

  /**
   * Sorts an array in place.
   * @param {Array} inputArray - The array to sort.
   * @param {Function} [comparisonFunction] - An optional comparison function.
   * @returns {Array} The sorted array.
   */
  arrangeElements(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (elementA, elementB) => elementA - elementB;
    }
    return inputArray.sort(comparisonFunction);
  }

  /**
   * Generates an array of numbers within a specified range.
   * @param {number} startIndex - The starting number (inclusive).
   * @param {number} [endIndex] - The ending number (exclusive). If omitted, startIndex becomes endIndex and 0 is startIndex.
   * @param {number} [stepValue] - The increment or decrement value.
   * @returns {number[]} An array of numbers.
   */
  generateSequence(startIndex, endIndex, stepValue) {
    if (endIndex == null) {
      endIndex = startIndex || 0;
      startIndex = 0;
    }
    if (!stepValue) {
      stepValue = endIndex < startIndex ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((endIndex - startIndex) / stepValue), 0);
    const generatedRange = Array(sequenceLength);
    for (var currentIndex = 0; currentIndex < sequenceLength; currentIndex++, startIndex += stepValue) {
      generatedRange[currentIndex] = startIndex;
    }
    return generatedRange;
  }

  /**
   * Retrieves the first element(s) of an array.
   * @param {Array} targetArray - The array.
   * @param {number} [count] - The number of elements to retrieve.
   * @returns {*} The first element or an array of first elements.
   */
  retrieveFirst(targetArray, count) {
    if (targetArray == null || targetArray.length < 1)
      return count == null ? void 0 : [];
    if (count == null) return targetArray[0];
    return this.getInitialSegment(targetArray, targetArray.length - count);
  }

  /**
   * Returns all but the last `count` elements of an array.
   * @param {Array} targetArray - The array.
   * @param {number} [count] - The number of elements to exclude from the end.
   * @returns {Array} The initial segment of the array.
   */
  getInitialSegment(targetArray, count) {
    return targetArray.slice.call(
      targetArray,
      0,
      Math.max(0, targetArray.length - (count == null ? 1 : count))
    );
  }

  /**
   * Returns all but the first `count` elements of an array.
   * @param {Array} targetArray - The array.
   * @param {number} [count] - The number of elements to exclude from the beginning.
   * @returns {Array} The remaining elements of the array.
   */
  getRemainingElements(targetArray, count) {
    return targetArray.slice.call(targetArray, count == null ? 1 : count);
  }

  /**
   * Retrieves the last element(s) of an array.
   * @param {Array} targetArray - The array.
   * @param {number} [count] - The number of elements to retrieve.
   * @returns {*} The last element or an array of last elements.
   */
  retrieveLast(targetArray, count) {
    if (count == null) return targetArray[targetArray.length - 1];
    return this.getRemainingElements(targetArray, Math.max(0, targetArray.length - count));
  }

  /**
   * Computes the cumulative sum (prefix sum) of an array.
   * @param {number[]} inputArray - The array of numbers.
   * @returns {number[]} An array where each element is the sum of all preceding elements plus itself.
   */
  computeCumulativeSum(inputArray) {
    return this.getRemainingElements(
      inputArray.reduce(
        (accumulator, currentValue, loopIndex) => {
          accumulator.push(currentValue + accumulator[loopIndex]);
          return accumulator;
        },
        [0]
      )
    );
  }

  /**
   * Calculates the differences between consecutive elements in an array.
   * @param {number[]} inputArray - The array of numbers.
   * @returns {number[]} An array of differences (arr[i] - arr[i-1]).
   */
  calculateDifferences(inputArray) {
    const resultArray = [];
    for (let loopIndex = 1; loopIndex < inputArray.length; ++loopIndex) {
      resultArray.push(inputArray[loopIndex] - inputArray[loopIndex - 1]);
    }
    return resultArray;
  }

  /**
   * Performs a binary search on a sorted array.
   * @param {Array} targetArray - The sorted array.
   * @param {*} searchKey - The value to search for.
   * @param {string} [iteratorKey] - The property name to use for comparison if array elements are objects.
   * @returns {number} The index where the key should be inserted to maintain sorted order.
   */
  performBinarySearch(targetArray, searchKey, iteratorKey) {
    const iteratorFunction = (currentObject) =>
      typeof currentObject === 'object' ? currentObject[iteratorKey] : currentObject;
    const targetValue = iteratorFunction(searchKey);
    let lowerBound = 0,
      upperBound = targetArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (iteratorFunction(targetArray[middleIndex]) < targetValue)
        lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
const _util = new UtilityToolkit(); // Instantiate the utility toolkit

/**
 * Handles input acquisition from standard input.
 */
class DataAcquirer {
  /**
   * Initializes the input reader.
   */
  constructor() {
    this.readPointer = 0; // Current position in the input data array.
    this.readAllInput(); // Load all input data upon instantiation.
  }

  /**
   * Reads all data from stdin and splits it into lines.
   * @returns {string[]} An array of input lines.
   */
  readAllInput() {
    this.rawData = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');
    return this.rawData;
  }

  /**
   * Fetches one or more lines from the input data.
   * @param {number} [count] - The number of lines to fetch.
   * @returns {string|string[]} A single line string or an array of line strings.
   */
  fetchNextLine(count) {
    if (count) {
      const returnValue = this.rawData.slice(this.readPointer, this.readPointer + count);
      this.readPointer += count;
      return returnValue;
    }
    return this.rawData[this.readPointer++];
  }

  /**
   * Fetches the next line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  fetchNextInteger() {
    return parseInt(this.fetchNextLine());
  }

  /**
   * Fetches the next line and splits it into an array of strings.
   * @returns {string[]} An array of strings.
   */
  fetchStringArray() {
    return this.fetchNextLine().split(' ');
  }

  /**
   * Fetches the next line, splits it, and parses elements as integers.
   * @returns {number[]} An array of integers.
   */
  fetchIntegerArray() {
    return this.fetchStringArray().map((currentElement) => parseInt(currentElement));
  }

  /**
   * Fetches the next line, splits it, and parses elements as floats.
   * @returns {number[]} An array of floating-point numbers.
   */
  fetchFloatArray() {
    return this.fetchStringArray().map((currentElement) => parseFloat(currentElement));
  }

  /**
   * Fetches `count` lines and parses each as an integer.
   * @param {number} count - The number of lines to fetch.
   * @returns {number[]} An array of integers.
   */
  fetchIntegerLines(count) {
    return this.fetchNextLine(count).map((currentElement) => parseInt(currentElement));
  }

  /**
   * Fetches `count` lines and parses each as a float.
   * @param {number} count - The number of lines to fetch.
   * @returns {number[]} An array of floating-point numbers.
   */
  fetchFloatLines(count) {
    return this.fetchNextLine(count).map((currentElement) => parseFloat(currentElement));
  }

  /**
   * Fetches `count` lines and splits each into an array of strings, forming a 2D array.
   * @param {number} count - The number of lines to fetch.
   * @returns {string[][]} A 2D array of strings.
   */
  fetchStringMatrix(count) {
    return this.fetchNextLine(count).map((currentLine) => currentLine.split(' '));
  }

  /**
   * Fetches `count` lines, splits each, and parses elements as integers, forming a 2D array.
   * @param {number} count - The number of lines to fetch.
   * @returns {number[][]} A 2D array of integers.
   */
  fetchIntegerMatrix(count) {
    return this.fetchNextLine(count).map((currentLine) =>
      currentLine.split(' ').map((currentElement) => parseInt(currentElement))
    );
  }

  /**
   * Fetches `count` lines, splits each, and parses elements as floats, forming a 2D array.
   * @param {number} count - The number of lines to fetch.
   * @returns {number[][]} A 2D array of floating-point numbers.
   */
  fetchFloatMatrix(count) {
    return this.fetchNextLine(count).map((currentLine) =>
      currentLine.split(' ').map((currentElement) => parseFloat(currentElement))
    );
  }
}
const dataSource = new DataAcquirer(); // Instantiate the input data acquirer

/**
 * Handles outputting the final result to the console.
 * @param {*} resultToOutput - The value to be printed.
 */
const OutputHandler = (resultToOutput) => {
  let returnValue;
  if (resultToOutput == null) return; // Do nothing if output is null or undefined.

  // Convert boolean results to "Yes" or "No" strings.
  if (resultToOutput === true) {
    returnValue = 'Yes';
  } else if (resultToOutput === false) {
    returnValue = 'No';
  } else {
    returnValue = resultToOutput; // Otherwise, use the value as is.
  }
  console.log(returnValue); // Print the final result.
};

// Execute the main processing logic and output its result.
OutputHandler(new PrimaryProcessor().processSolution());
