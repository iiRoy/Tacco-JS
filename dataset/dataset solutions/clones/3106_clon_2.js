'use strict';

/**
 * Main class responsible for solving the problem.
 * This class encapsulates the core logic for the dynamic programming solution.
 */
class ProblemSolver {
  /**
   * Executes the main problem-solving algorithm.
   * It calculates the number of valid DNA sequences of a given length 'n'.
   */
  executeSolution() {
    // Define a large prime modulus for arithmetic operations to prevent overflow.
    const primeModulus = 1000000007;

    // Read the input integer 'n' which represents the desired sequence length.
    const sequenceSize = parseInt(dataStream.retrieveLine());

    // Define the set of valid DNA nucleotide bases.
    const nucleotideBases = ['A', 'T', 'G', 'C'];

    // Define an array of regular expressions for forbidden patterns.
    // These patterns represent invalid subsequences that should not appear.
    const invalidSequences = [
      new RegExp('.AGC'),
      new RegExp('AG.C'),
      new RegExp('A.GC'),
      new RegExp('.GAC'),
      new RegExp('.ACG')
    ];

    // Initialize a 2D array (or map of maps) for dynamic programming.
    // memoizationGrid[i][sequence] will store the count of valid sequences of length 'i' ending with 'sequence'.
    const memoizationGrid = [];
    for (let currentLength = 0; currentLength <= sequenceSize; ++currentLength) {
      memoizationGrid[currentLength] = {}; // Use an object (map) for string keys
    }

    // Base case: For length 0, an empty sequence (represented as 'TTT' for convenience) has 1 way.
    // 'TTT' is chosen as a placeholder for the initial state, effectively representing no previous characters.
    memoizationGrid[0]['TTT'] = 1;

    // Iterate from length 1 up to 'n'.
    for (let currentLength = 1; currentLength <= sequenceSize; ++currentLength) {
      // Iterate through each possible last character for the current sequence.
      for (const nextChar of nucleotideBases) {
        // Iterate through all valid previous 3-character sequences from the previous length.
        for (const previousSequence in memoizationGrid[currentLength - 1]) {
          // Construct a potential 4-character sequence by appending the nextChar to the previous 3-char sequence.
          // We check the last 4 characters for forbidden patterns.
          // The previousSequence is 'TTT' for length 0, so previousSequence + nextChar will be 'TTT' + 'A' for example.
          // The regexes are designed to check patterns like XAGC, AGXC, AXGC, XGAC, XACG.
          // The 'TTT' prefix ensures that for the first few characters, the regexes still work correctly
          // by effectively padding the beginning.
          if (invalidSequences.some((pattern) => pattern.test(previousSequence + nextChar))) {
            continue; // Skip if the current combination forms a forbidden pattern.
          }

          // Form the new 3-character suffix for the current length.
          // This takes the last two characters of the previous sequence and appends the nextChar.
          // For example, if previousSequence is 'TTA' and nextChar is 'G', newSequence becomes 'TAG'.
          const newSequence = previousSequence.substring(1) + nextChar;

          // Initialize the count for the new sequence if it hasn't been encountered yet.
          memoizationGrid[currentLength][newSequence] = memoizationGrid[currentLength][newSequence] || 0;

          // Add the count from the previous state to the current state.
          memoizationGrid[currentLength][newSequence] = (memoizationGrid[currentLength][newSequence] + memoizationGrid[currentLength - 1][previousSequence]) % primeModulus;
        }
      }
    }

    // After filling the DP table up to length 'n', sum all counts for sequences of length 'n'.
    const finalCounts = [];
    for (let sequenceKey in memoizationGrid[sequenceSize]) {
      finalCounts.push(memoizationGrid[sequenceSize][sequenceKey]);
    }

    // Calculate the total sum of valid sequences modulo primeModulus and print it.
    console.log(finalCounts.reduce((total, current) => (total + current) % primeModulus));
  }
}

/**
 * A collection of general-purpose utility functions,
 * inspired by the Underscore.js library.
 */
class CollectionHelpers {
  /**
   * Calculates the sum of all numbers in an array.
   * @param {Array<number>} numberArray - The array of numbers.
   * @returns {number} The sum of the numbers.
   */
  calculateSum(numberArray) {
    return numberArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  /**
   * Finds the minimum element in an array.
   * An optional comparator function can be provided.
   * @param {Array<any>} dataArray - The array to search.
   * @param {Function} [comparatorFn] - Optional function (a, b) => a - b.
   * @returns {any} The minimum element.
   */
  findMinimum(dataArray, comparatorFn) {
    if (comparatorFn == null) {
      comparatorFn = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((minVal, currentVal) => comparatorFn(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  /**
   * Finds the maximum element in an array.
   * An optional comparator function can be provided.
   * @param {Array<any>} dataArray - The array to search.
   * @param {Function} [comparatorFn] - Optional function (a, b) => a - b.
   * @returns {any} The maximum element.
   */
  findMaximum(dataArray, comparatorFn) {
    if (comparatorFn == null) {
      comparatorFn = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((maxVal, currentVal) => comparatorFn(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  /**
   * Generates an array of numbers within a specified range.
   * @param {number} startValue - The starting number of the range.
   * @param {number} [endValue] - The ending number of the range (exclusive).
   * @param {number} [stepValue] - The increment or decrement step.
   * @returns {Array<number>} An array of numbers in the specified range.
   */
  generateRange(startValue, endValue, stepValue) {
    if (endValue == null) {
      endValue = startValue || 0;
      startValue = 0;
    }
    if (!stepValue) {
      stepValue = endValue < startValue ? -1 : 1;
    }
    const rangeLength = Math.max(Math.ceil((endValue - startValue) / stepValue), 0);
    const generatedArray = Array(rangeLength);

    for (let currentIdx = 0; currentIdx < rangeLength; currentIdx++, startValue += stepValue) {
      generatedArray[currentIdx] = startValue;
    }
    return generatedArray;
  }

  /**
   * Retrieves the first 'count' elements of an array.
   * @param {Array<any>} sourceArray - The array to process.
   * @param {number} [count] - The number of elements to retrieve from the beginning.
   * @returns {any|Array<any>} The first element or an array of first 'count' elements.
   */
  getHeadElements(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) {
      return count == null ? undefined : [];
    }
    if (count == null) {
      return sourceArray[0];
    }
    return this.getInitialElements(sourceArray, sourceArray.length - count);
  }

  /**
   * Retrieves all but the last 'count' elements of an array.
   * @param {Array<any>} sourceArray - The array to process.
   * @param {number} [count] - The number of elements to exclude from the end.
   * @returns {Array<any>} An array containing the initial elements.
   */
  getInitialElements(sourceArray, count) {
    return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (count == null ? 1 : count)));
  }

  /**
   * Retrieves all but the first 'count' elements of an array.
   * @param {Array<any>} sourceArray - The array to process.
   * @param {number} [count] - The number of elements to exclude from the beginning.
   * @returns {Array<any>} An array containing the tail elements.
   */
  getTailElements(sourceArray, count) {
    return sourceArray.slice.call(sourceArray, count == null ? 1 : count);
  }

  /**
   * Retrieves the last 'count' elements of an array.
   * @param {Array<any>} sourceArray - The array to process.
   * @param {number} [count] - The number of elements to retrieve from the end.
   * @returns {any|Array<any>} The last element or an array of last 'count' elements.
   */
  getEndElements(sourceArray, count) {
    if (count == null) {
      return sourceArray[sourceArray.length - 1];
    }
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - count));
  }

  /**
   * Calculates the cumulative sum of elements in an array.
   * Returns an array where each element is the sum of all preceding elements plus itself.
   * @param {Array<number>} numberArray - The array of numbers.
   * @returns {Array<number>} An array of cumulative sums.
   */
  getCumulativeSums(numberArray) {
    return this.getTailElements(numberArray.reduce(((accumulatedSums, currentVal, index) => {
      accumulatedSums.push(currentVal + accumulatedSums[index]);
      return accumulatedSums;
    }), [0]));
  }

  /**
   * Performs a binary search on a sorted array.
   * @param {Array<any>} sortedArray - The array to search within.
   * @param {any} searchKey - The value to search for.
   * @param {string} [propertyKey] - Optional property name if array elements are objects.
   * @returns {number} The index where the key should be inserted to maintain sorted order.
   */
  performBinarySearch(sortedArray, searchKey, propertyKey) {
    const valueExtractor = (item) => (typeof item === 'object') ? item[propertyKey] : item;
    const targetValue = valueExtractor(searchKey);
    let lowIndex = 0,
      highIndex = sortedArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (valueExtractor(sortedArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
// Create an instance of the utility functions.
const helperTools = new CollectionHelpers();

/**
 * Class for handling input operations, reading from stdin.
 */
class StreamReader {
  /**
   * Constructor initializes the input stream.
   */
  constructor() {
    this.readPointer = 0; // Pointer to the current line being read.
    this.loadAllData(); // Load all input data upon instantiation.
  }

  /**
   * Reads all lines from standard input and stores them.
   * @returns {Array<string>} An array of all input lines.
   */
  loadAllData() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  /**
   * Retrieves one or more lines from the input data.
   * @param {number} [numLines] - The number of lines to retrieve.
   * @returns {string|Array<string>} A single line or an array of lines.
   */
  retrieveLine(numLines) {
    if (numLines) {
      const fetchedLines = this.inputLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return fetchedLines;
    }
    return this.inputLines[this.readPointer++];
  }

  /**
   * Retrieves a single line as an array of strings, split by space.
   * @returns {Array<string>} An array of strings.
   */
  fetchStringArray() {
    return this.retrieveLine().split(' ');
  }

  /**
   * Retrieves a single line as an array of integers.
   * @returns {Array<number>} An array of integers.
   */
  fetchIntArray() {
    return this.fetchStringArray().map((element) => parseInt(element));
  }

  /**
   * Retrieves a single line as an array of floating-point numbers.
   * @returns {Array<number>} An array of floats.
   */
  fetchFloatArray() {
    return this.fetchStringArray().map((element) => parseFloat(element));
  }

  /**
   * Retrieves multiple lines as an array of integers.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<number>} An array of integers.
   */
  fetchIntLines(numLines) {
    return this.retrieveLine(numLines).map((lineElement) => parseInt(lineElement));
  }

  /**
   * Retrieves multiple lines as an array of floating-point numbers.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<number>} An array of floats.
   */
  fetchFloatLines(numLines) {
    return this.retrieveLine(numLines).map((lineElement) => parseFloat(lineElement));
  }

  /**
   * Retrieves multiple lines as a 2D array of strings.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<Array<string>>} A 2D array of strings.
   */
  fetchStringMatrix(numLines) {
    return this.retrieveLine(numLines).map((currentLine) => currentLine.split(' '));
  }

  /**
   * Retrieves multiple lines as a 2D array of integers.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<Array<number>>} A 2D array of integers.
   */
  fetchIntMatrix(numLines) {
    return this.retrieveLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }

  /**
   * Retrieves multiple lines as a 2D array of floating-point numbers.
   * @param {number} numLines - The number of lines to retrieve.
   * @returns {Array<Array<number>>} A 2D array of floats.
   */
  fetchFloatMatrix(numLines) {
    return this.retrieveLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}

// Create a global instance of the input reader.
const dataStream = new StreamReader();

// Instantiate the main problem solver and execute its solution method.
(new ProblemSolver()).executeSolution();
