'use strict'; /* Enforce stricter parsing and error handling for cleaner code. */

class ComputationEngine { /* Core class responsible for executing the main logic. */
  executeCalculation() {
    // Acquire numerical parameters from the input source.
    const initialParams = source.fetchNextIntegerArray();
    // Retrieve the sequence of data values.
    const dataSequence = source.fetchNextIntegerArray();

    /*
     * Calculate the sum of transformed differences.
     * First, compute differences between consecutive elements in the data sequence.
     * Then, for each difference, apply a transformation:
     *   - Multiply the difference by the second initial parameter.
     *   - Take the minimum of this product and the third initial parameter.
     * Finally, sum up all these transformed values.
     */
    return utility.aggregate(
      utility.calculateDifferences(dataSequence).map(elementVal =>
        Math.min(elementVal * initialParams[1], initialParams[2])
      )
    );
  }
} // End of ComputationEngine class definition.

class UtilityKit { /* Provides a collection of general-purpose utility functions for array manipulation and calculations. */

  /**
   * Sums all numeric elements in a given array.
   * @param {Array<number>} collection The array of numbers to sum.
   * @returns {number} The total sum.
   */
  aggregate(collection) { return collection.reduce((accumulator, currentVal) => accumulator + currentVal); }

  /**
   * Finds the minimum element in an array based on a comparison function.
   * @param {Array<any>} collection The array to search.
   * @param {Function} [comparisonFn] Optional comparison function. Defaults to numerical difference.
   * @returns {any} The minimum element.
   */
  findMinimum(collection, comparisonFn) {
    if (comparisonFn == null) { /* Default numeric comparison if none provided. */ comparisonFn = (valA, valB) => valA - valB; }
    return collection.reduce((valA, valB) => comparisonFn(valA, valB) < 0 ? valA : valB);
  }

  /**
   * Finds the maximum element in an array based on a comparison function.
   * @param {Array<any>} collection The array to search.
   * @param {Function} [comparisonFn] Optional comparison function. Defaults to numerical difference.
   * @returns {any} The maximum element.
   */
  findMaximum(collection, comparisonFn) {
    if (comparisonFn == null) { /* Default numeric comparison if none provided. */ comparisonFn = (valA, valB) => valA - valB; }
    return collection.reduce((valA, valB) => comparisonFn(valA, valB) > 0 ? valA : valB);
  }

  /**
   * Sorts an array using a specified comparison function.
   * @param {Array<any>} collection The array to sort.
   * @param {Function} [comparisonFn] Optional comparison function. Defaults to numerical difference.
   * @returns {Array<any>} The sorted array.
   */
  orderElements(collection, comparisonFn) {
    if (comparisonFn == null) { /* Use default comparison for numbers. */ comparisonFn = (valA, valB) => valA - valB; }
    return collection.sort(comparisonFn);
  }

  /**
   * Generates a sequence of numbers within a specified range.
   * @param {number} begin The starting number of the sequence.
   * @param {number} [end] The ending number of the sequence (exclusive). If omitted, 'begin' becomes 'end' and 'start' is 0.
   * @param {number} [increment] The step value between numbers. Defaults to 1 or -1 based on start/end.
   * @returns {Array<number>} An array containing the generated sequence.
   */
  generateSequence(begin, end, increment) {
    if (end == null) { end = begin || 0; begin = 0; } // Handle single argument case.
    if (!increment) { increment = end < begin ? -1 : 1; } // Determine default step direction.
    const sequenceLength = Math.max(Math.ceil((end - begin) / increment), 0);
    const resultArray = Array(sequenceLength);
    for (var indexCounter = 0; indexCounter < sequenceLength; indexCounter++, begin += increment) {
      resultArray[indexCounter] = begin;
    }
    return resultArray;
  }

  /**
   * Retrieves the first 'count' elements of an array.
   * @param {Array<any>} dataList The array to retrieve elements from.
   * @param {number} [count] The number of elements to retrieve. If null, returns the first element.
   * @returns {any|Array<any>} The first element or an array of the first 'count' elements.
   */
  retrieveFirst(dataList, count) {
    if (dataList == null || dataList.length < 1) return count == null ? void 0 : [];
    if (count == null) return dataList[0];
    return this.getInitialElements(dataList, dataList.length - count);
  }

  /**
   * Extracts a slice from the beginning of an array.
   * @param {Array<any>} dataList The array.
   * @param {number} [count] The number of elements to exclude from the end. Defaults to 1.
   * @returns {Array<any>} A new array containing initial elements.
   */
  getInitialElements(dataList, count) {
    return dataList.slice.call(dataList, 0, Math.max(0, dataList.length - (count == null ? 1 : count)));
  }

  /**
   * Retrieves elements from an array starting from a specific index.
   * @param {Array<any>} dataList The array.
   * @param {number} [count] The starting index. Defaults to 1 (second element).
   * @returns {Array<any>} A new array containing the remaining elements.
   */
  getRemainingElements(dataList, count) {
    return dataList.slice.call(dataList, count == null ? 1 : count);
  }

  /**
   * Retrieves the last 'count' elements of an array.
   * @param {Array<any>} dataList The array to retrieve elements from.
   * @param {number} [count] The number of elements to retrieve. If null, returns the last element.
   * @returns {any|Array<any>} The last element or an array of the last 'count' elements.
   */
  retrieveLast(dataList, count) {
    if (count == null) return dataList[dataList.length - 1];
    return this.getRemainingElements(dataList, Math.max(0, dataList.length - count));
  }

  /**
   * Computes a cumulative sum array.
   * @param {Array<number>} dataList The array of numbers.
   * @returns {Array<number>} An array where each element is the sum of all preceding elements plus itself.
   */
  computeCumulativeSum(dataList) {
    return this.getRemainingElements(dataList.reduce(((sumAcc, currentItem, currentIndex) => {
      sumAcc.push(currentItem + sumAcc[currentIndex]);
      return sumAcc;
    }), [0]));
  }

  /**
   * Calculates the differences between consecutive elements in an array.
   * @param {Array<number>} dataList The array of numbers.
   * @returns {Array<number>} A new array containing the differences.
   */
  calculateDifferences(dataList) {
    const diffs = []; // Array to store calculated differences.
    for (let index = 1; index < dataList.length; ++index) {
      diffs.push(dataList[index] - dataList[index - 1]);
    }
    return diffs;
  }

  /**
   * Performs a binary search on a sorted array.
   * @param {Array<any>} sortedArray The array to search, assumed to be sorted.
   * @param {any} targetValue The value to search for.
   * @param {string|Function} [propertyAccessor] A key string or function to extract the comparable value from array elements.
   * @returns {number} The index where the targetValue should be inserted to maintain sorted order, or the index of the first occurrence.
   */
  performBinarySearch(sortedArray, targetValue, propertyAccessor) {
    // Helper function to extract comparable value.
    const accessFn = (item) => (typeof item === 'object' && propertyAccessor) ? item[propertyAccessor] : item;
    const searchKey = accessFn(targetValue); // The value we are actually searching for.

    let lowerBound = 0, upperBound = sortedArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessFn(sortedArray[middleIndex]) < searchKey) {
        lowerBound = middleIndex + 1;
      } else {
        upperBound = middleIndex;
      }
    }
    return lowerBound; // Returns the insertion point.
  }
} // End of UtilityKit class.

// Instantiate the utility library for common operations.
const utility = new UtilityKit();

class DataAcquirer { /* Handles reading and parsing input data from various sources. */
  constructor() {
    this.readPointer = 0; // Current position in the input data.
    this.loadAllData(); // Initialize by loading all input at once.
  }

  /**
   * Reads all input data from stdin and splits it into lines.
   * @returns {Array<string>} An array of input lines.
   */
  loadAllData() {
    this.rawDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines;
  }

  /**
   * Fetches one or more lines of input.
   * @param {number} [lineCount] The number of lines to fetch. If omitted, fetches a single line.
   * @returns {string|Array<string>} A single line or an array of lines.
   */
  fetchNextLine(lineCount) {
    if (lineCount) {
      const resultLines = this.rawDataLines.slice(this.readPointer, this.readPointer + lineCount);
      this.readPointer += lineCount;
      return resultLines;
    }
    return this.rawDataLines[this.readPointer++];
  }

  /**
   * Fetches the next line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  fetchNextInteger() { return parseInt(this.fetchNextLine()); }

  /**
   * Fetches the next line, splits it by space, and returns a string array.
   * @returns {Array<string>} An array of strings.
   */
  fetchNextStringArray() { return this.fetchNextLine().split(' '); }

  /**
   * Fetches the next line, splits it, and parses elements as integers.
   * @returns {Array<number>} An array of integers.
   */
  fetchNextIntegerArray() { return this.fetchNextStringArray().map((elementStr) => parseInt(elementStr)); }

  /**
   * Fetches the next line, splits it, and parses elements as floating-point numbers.
   * @returns {Array<number>} An array of floats.
   */
  fetchNextFloatArray() { return this.fetchNextStringArray().map((elementStr) => parseFloat(elementStr)); }

  /**
   * Fetches multiple lines and parses each as an integer.
   * @param {number} lineCount The number of lines to fetch.
   * @returns {Array<number>} An array of integers, one for each line.
   */
  fetchIntegerLines(lineCount) { return this.fetchNextLine(lineCount).map((currentLine) => parseInt(currentLine)) }

  /**
   * Fetches multiple lines and parses each as a floating-point number.
   * @param {number} lineCount The number of lines to fetch.
   * @returns {Array<number>} An array of floats, one for each line.
   */
  fetchFloatLines(lineCount) { return this.fetchNextLine(lineCount).map((currentLine) => parseFloat(currentLine)) }

  /**
   * Fetches multiple lines and returns a 2D array of strings.
   * @param {number} rows The number of rows (lines) to fetch.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  fetchStringMatrix(rows) { return this.fetchNextLine(rows).map((currentLine) => currentLine.split(' ')); }

  /**
   * Fetches multiple lines and returns a 2D array of integers.
   * @param {number} rows The number of rows (lines) to fetch.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  fetchIntegerMatrix(rows) {
    return this.fetchNextLine(rows).map((currentLine) => currentLine.split(' ').map((elementStr) => parseInt(elementStr)));
  }

  /**
   * Fetches multiple lines and returns a 2D array of floating-point numbers.
   * @param {number} rows The number of rows (lines) to fetch.
   * @returns {Array<Array<number>>} A 2D array of floats.
   */
  fetchFloatMatrix(rows) {
    return this.fetchNextLine(rows).map((currentLine) => currentLine.split(' ').map((elementStr) => parseFloat(elementStr)));
  }
} // End of DataAcquirer class.

// Create an instance of the data input handler.
const source = new DataAcquirer();

/**
 * Displays the final calculated result to the console.
 * Handles boolean true/false by converting them to 'Yes'/'No'.
 * @param {any} finalOutput The value to be displayed.
 */
const DisplayResult = (finalOutput) => {
  let displayValue;
  if (finalOutput == null) return; // Do nothing if output is null or undefined.
  if (finalOutput === true) { displayValue = 'Yes'; }
  else if (finalOutput === false) { displayValue = 'No'; }
  else { displayValue = finalOutput; }
  console.log(displayValue);
};

// Execute the main computation and display its result.
DisplayResult(new ComputationEngine().executeCalculation());