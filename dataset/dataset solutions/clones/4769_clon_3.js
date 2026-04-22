'use strict'; // Ensure strict mode for robust code execution

/**
 * @class SolutionProcessor
 * @description Main class responsible for orchestrating the problem-solving logic.
 */
class SolutionProcessor {
  /**
   * Computes the final result based on input data.
   * @returns {number} The calculated aggregate value.
   */
  processInputData() {
    // Acquire the initial configuration parameters.
    // This array holds [N, A, B] from the problem description.
    const configurationValues = dataStreamHandler.readIntegerArray();
    // Fetch the sequence of numerical values for processing.
    const numericalSequence = dataStreamHandler.readIntegerArray();

    // Check if the numerical sequence is empty or too short.
    // The difference calculation requires at least two elements.
    if (!numericalSequence || numericalSequence.length < 2) {
        // If the sequence has less than 2 elements, differences cannot be computed meaningfully.
        // An empty difference array results in a sum of 0.
        return 0; 
    }

    // Utilize a helper utility for array operations.
    const currentUtility = arrayOpHelper;

    // Calculate the differences between adjacent elements in the sequence.
    // For example, if sequence is [10, 20, 15], differences would be [10, -5].
    const adjacentDifferences = currentUtility.calculateAdjacentDifferences(numericalSequence);

    // Transform each difference value according to specific rules:
    // 1. Multiply the difference by the second configuration value (configurationValues[1]).
    // 2. Cap the result at the third configuration value (configurationValues[2]) using Math.min.
    const transformedValues = adjacentDifferences.map(diffElement => {
      const multipliedValue = diffElement * configurationValues[1]; // Apply the 'A' factor
      const cappedValue = Math.min(multipliedValue, configurationValues[2]); // Apply the 'B' limit
      return cappedValue;
    });

    // Sum up all the transformed values to get the final result.
    const finalSummation = currentUtility.sumAllElements(transformedValues);

    return finalSummation;
  }
}

/**
 * @class ArrayOperationHelper
 * @description Provides a collection of utility functions for array manipulation and aggregation.
 */
class ArrayOperationHelper {
  /**
   * Computes the sum of all numeric elements in an array.
   * @param {number[]} numberCollection - The array of numbers to sum.
   * @returns {number} The total sum. Returns 0 for an empty or invalid array.
   */
  sumAllElements(numberCollection) {
    let runningTotal = 0; // Initialize accumulator for the sum.
    // Early exit for empty or non-array inputs.
    if (!Array.isArray(numberCollection) || numberCollection.length === 0) {
        return runningTotal; 
    }
    // Iterate through each item and add it to the running total.
    for (const item of numberCollection) {
      if (typeof item === 'number' && !isNaN(item)) { // Ensure element is a valid number.
        runningTotal += item; 
      }
    }
    return runningTotal;
  }

  /**
   * Finds the minimum element in an array using an optional comparison function.
   * @param {Array<any>} elements - The array to search.
   * @param {Function} [comparisonLogic] - Optional function (a, b) => a - b for numbers.
   * @returns {any|undefined} The minimum element or undefined if the array is empty.
   */
  findSmallestElement(elements, comparisonLogic) {
    // Set a default numerical comparison logic if none is provided.
    const effectiveComparator = comparisonLogic || ((elemA, elemB) => elemA - elemB);

    if (!Array.isArray(elements) || elements.length === 0) {
      return undefined; // No minimum in an empty or invalid array.
    }

    let currentMinimum = elements[0]; // Assume the first element is initially the minimum.
    // Iterate through the rest of the array to find the true minimum.
    for (let i = 1; i < elements.length; i++) {
      // If the current element is "smaller" according to the comparator, update the minimum.
      if (effectiveComparator(elements[i], currentMinimum) < 0) {
        currentMinimum = elements[i]; 
      }
    }
    return currentMinimum;
  }

  /**
   * Finds the maximum element in an array using an optional comparison function.
   * @param {Array<any>} elements - The array to search.
   * @param {Function} [comparisonLogic] - Optional function (a, b) => a - b for numbers.
   * @returns {any|undefined} The maximum element or undefined if the array is empty.
   */
  findLargestElement(elements, comparisonLogic) {
    // Set a default numerical comparison logic if none is provided.
    const effectiveComparator = comparisonLogic || ((elemA, elemB) => elemA - elemB);

    if (!Array.isArray(elements) || elements.length === 0) {
      return undefined; // No maximum in an empty or invalid array.
    }

    let currentMaximum = elements[0]; // Assume the first element is initially the maximum.
    // Iterate through the rest of the array to find the true maximum.
    for (let i = 1; i < elements.length; i++) {
      // If the current element is "larger" according to the comparator, update the maximum.
      if (effectiveComparator(elements[i], currentMaximum) > 0) {
        currentMaximum = elements[i]; 
      }
    }
    return currentMaximum;
  }

  /**
   * Sorts an array based on an optional comparison function, returning a new sorted array.
   * @param {Array<any>} sourceArray - The array to sort.
   * @param {Function} [sortComparator] - Optional comparison function.
   * @returns {Array<any>} A new sorted array. Returns an empty array if input is invalid.
   */
  orderArray(sourceArray, sortComparator) {
    if (!Array.isArray(sourceArray)) {
        return [];
    }
    // Create a shallow copy to avoid modifying the original array.
    const workingCopy = [...sourceArray];
    // Define the default numerical comparison if none is provided.
    const actualComparator = sortComparator || ((a, b) => a - b);
    return workingCopy.sort(actualComparator);
  }

  /**
   * Generates a sequence of numbers within a specified range.
   * @param {number} startValue - The starting value of the sequence.
   * @param {number} [endValue] - The exclusive end value of the sequence. If omitted, startValue becomes endValue and start is 0.
   * @param {number} [stepSize] - The increment/decrement step. Defaults to 1 or -1.
   * @returns {number[]} An array containing the generated numeric sequence.
   */
  generateNumericRange(startValue, endValue, stepSize) {
    let currentStart = startValue;
    let currentEnd = endValue;
    let currentStep = stepSize;

    // Handle optional endValue and default startValue.
    if (currentEnd === null || currentEnd === undefined) {
      currentEnd = currentStart || 0; // If only one arg, it's end, start is 0.
      currentStart = 0;
    }

    // Determine default step size based on direction if not provided or zero.
    if (currentStep === null || currentStep === undefined || currentStep === 0) {
      currentStep = (currentEnd < currentStart) ? -1 : 1;
    }

    // Calculate the number of elements in the range, ensuring it's non-negative.
    const seriesLength = Math.max(Math.ceil((currentEnd - currentStart) / currentStep), 0);
    const resultSeries = new Array(seriesLength); // Pre-allocate array.

    // Populate the array with values using the calculated step.
    for (let i = 0; i < seriesLength; i++) {
      resultSeries[i] = currentStart + i * currentStep;
    }
    return resultSeries;
  }

  /**
   * Retrieves the first N elements from an array.
   * @param {Array<any>} sourceCollection - The input array.
   * @param {number} [count] - The number of elements to retrieve from the start. If null/undefined, returns the first element.
   * @returns {any|Array<any>|undefined} The first element, or an array of the first N elements, or undefined/empty array for invalid input.
   */
  fetchLeadingElements(sourceCollection, count) {
    if (!Array.isArray(sourceCollection) || sourceCollection.length === 0) {
      return (count === null || count === undefined) ? undefined : []; // Return undefined or empty array for invalid input.
    }
    if (count === null || count === undefined) {
      return sourceCollection[0]; // Return single first element if count is not specified.
    }
    // Ensure count is non-negative.
    const actualCount = Math.max(0, count);
    // Use slice to get the leading elements efficiently.
    return sourceCollection.slice(0, actualCount);
  }

  /**
   * Returns all but the last N elements of an array.
   * @param {Array<any>} dataArray - The source array.
   * @param {number} [numToExclude] - The number of elements to exclude from the end. Defaults to 1.
   * @returns {Array<any>} A new array containing elements from the start up to (length - numToExclude).
   */
  extractInitialSegment(dataArray, numToExclude) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return []; // Return empty array for invalid input.
    }
    // Determine the number of elements to remove from the end, defaulting to 1.
    const elementsToRemove = (numToExclude === null || numToExclude === undefined) ? 1 : Math.max(0, numToExclude);
    // Calculate the effective end index for slicing, ensuring it's not negative.
    const endIndex = Math.max(0, dataArray.length - elementsToRemove);
    return dataArray.slice(0, endIndex);
  }

  /**
   * Retrieves the elements from an array starting from a specified index.
   * @param {Array<any>} sourceList - The input array.
   * @param {number} [startIndex] - The starting index for the slice. Defaults to 1 (second element).
   * @returns {Array<any>} A new array containing the trailing elements.
   */
  getTrailingElements(sourceList, startIndex) {
    if (!Array.isArray(sourceList) || sourceList.length === 0) {
      return []; // Return empty array for invalid input.
    }
    // Determine the actual starting index, defaulting to 1.
    const actualStartIndex = (startIndex === null || startIndex === undefined) ? 1 : Math.max(0, startIndex);
    return sourceList.slice(actualStartIndex);
  }

  /**
   * Retrieves the last N elements from an array.
   * @param {Array<any>} sourceArray - The input array.
   * @param {number} [count] - The number of elements to retrieve from the end. If null/undefined, returns the last element.
   * @returns {any|Array<any>|undefined} The last element, or an array of the last N elements, or undefined/empty array for invalid input.
   */
  fetchFinalElements(sourceArray, count) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return (count === null || count === undefined) ? undefined : []; // Return undefined or empty array.
    }
    if (count === null || count === undefined) {
      return sourceArray[sourceArray.length - 1]; // Return single last element if count is not specified.
    }
    // Ensure count is non-negative.
    const actualCount = Math.max(0, count);
    // Calculate the starting index for the slice from the end of the array.
    const startIndexForSlice = Math.max(0, sourceArray.length - actualCount);
    return sourceArray.slice(startIndexForSlice);
  }

  /**
   * Calculates the cumulative sum (prefix sum) of an array of numbers.
   * The result is an array of prefix sums, excluding the initial zero.
   * E.g., for `[1, 2, 3]`, it returns `[1, 3, 6]`.
   * @param {number[]} numericData - The array of numbers.
   * @returns {number[]} An array containing the cumulative sums. Returns an empty array for invalid input.
   */
  calculatePrefixSums(numericData) {
    if (!Array.isArray(numericData) || numericData.length === 0) {
      return []; // Return empty array for invalid input.
    }

    const cumulativeSums = [];
    let currentRunningSum = 0;
    // Iterate through the input array to build the prefix sums.
    for (let i = 0; i < numericData.length; i++) {
      currentRunningSum += numericData[i];
      cumulativeSums.push(currentRunningSum);
    }
    return cumulativeSums;
  }

  /**
   * Computes the difference between adjacent elements in a numerical array.
   * For an array `[a, b, c, d]`, it returns `[b-a, c-b, d-c]`.
   * @param {number[]} numericArray - The input array of numbers.
   * @returns {number[]} An array of differences. Returns an empty array if input has less than 2 elements or is invalid.
   */
  calculateAdjacentDifferences(numericArray) {
    const differenceResults = []; // Array to store the differences.
    if (!Array.isArray(numericArray) || numericArray.length < 2) {
      return differenceResults; // Cannot compute differences for less than 2 elements.
    }
    // Iterate from the second element to calculate differences with its predecessor.
    for (let index = 1; index < numericArray.length; ++index) {
      const currentElement = numericArray[index];
      const previousElement = numericArray[index - 1];
      differenceResults.push(currentElement - previousElement);
    }
    return differenceResults;
  }

  /**
   * Performs a binary search to find the insertion point for a key in a sorted array.
   * This function assumes the array is already sorted according to the value extractor.
   * @param {Array<any>} sortedArray - The array assumed to be sorted.
   * @param {any} searchTarget - The value to search for or an object containing the value.
   * @param {string} [propertyKey] - Optional key name if array elements are objects and `searchTarget` is also an object.
   * @returns {number} The index where the searchTarget would be inserted to maintain sort order.
   */
  findSortedInsertionIndex(sortedArray, searchTarget, propertyKey) {
    // Helper function to extract the comparable value from an element or object.
    const valueExtractor = (element) => {
      // If a propertyKey is provided and the element is a non-null object, extract the property.
      if (propertyKey && typeof element === 'object' && element !== null) {
        return element[propertyKey];
      }
      return element; // Otherwise, use the element directly for comparison.
    };

    const targetValue = valueExtractor(searchTarget); // Extract the value to be searched for.

    let lowPointer = 0;
    let highPointer = sortedArray.length; // Exclusive upper bound for the search range.

    // Standard binary search loop: continues as long as the search range is valid.
    while (lowPointer < highPointer) {
      const midPointer = Math.floor((lowPointer + highPointer) / 2); // Calculate the middle index.
      const midValue = valueExtractor(sortedArray[midPointer]); // Get the value at the middle index.

      // Adjust pointers based on comparison:
      // If the middle value is less than the target, search in the upper half.
      if (midValue < targetValue) {
        lowPointer = midPointer + 1;
      } 
      // Otherwise (midValue >= targetValue), search in the lower half (including mid).
      else {
        highPointer = midPointer;
      }
    }
    // The lowPointer now indicates the correct insertion point.
    return lowPointer; 
  }
}

// Instantiate the array operation helper, making it globally accessible.
const arrayOpHelper = new ArrayOperationHelper();

/**
 * @class SystemInputHandler
 * @description Manages reading input data from standard input.
 */
class SystemInputHandler {
  constructor() {
    this.readPosition = 0; // Tracks the current line index for reading.
    this.rawInputContent = []; // Stores all lines read from input.
    this.loadAllInputData(); // Automatically loads all input upon instantiation.
  }

  /**
   * Reads all lines from standard input and stores them in `this.rawInputContent`.
   * This operation typically happens once at the start of execution.
   * @returns {string[]} An array of strings, each representing a line of input.
   */
  loadAllInputData() {
    try {
        // Attempt to read from /dev/stdin for competitive programming environments.
        const fileSystemModule = require("fs");
        this.rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8").split('\n');
    } catch (error) {
        // Fallback or error handling for environments where /dev/stdin is not available.
        // This might occur in a browser or Node.js without specific setup.
        console.error("Error reading from /dev/stdin. Ensure input is piped or file exists: ", error.message);
        this.rawInputContent = []; // Ensure it's an empty array on failure to prevent further errors.
    }
    return this.rawInputContent;
  }

  /**
   * Retrieves one or more lines from the input data based on `lineCount`.
   * Advances the internal `readPosition` accordingly.
   * @param {number} [lineCount] - The number of lines to retrieve. If omitted or invalid, retrieves a single line.
   * @returns {string|string[]} A single string line or an array of string lines. Returns empty string/array if no more lines.
   */
  retrieveLines(lineCount) {
    // Validate lineCount for block retrieval.
    if (typeof lineCount === 'number' && lineCount > 0) {
      const endIndex = Math.min(this.readPosition + lineCount, this.rawInputContent.length);
      const blockOfLines = this.rawInputContent.slice(this.readPosition, endIndex);
      this.readPosition = endIndex; // Update read position.
      return blockOfLines;
    }
    // Retrieve a single line if lineCount is not specified or invalid.
    if (this.readPosition < this.rawInputContent.length) {
      const singleLine = this.rawInputContent[this.readPosition];
      this.readPosition++; // Advance read position for single line.
      return singleLine;
    }
    // If no more lines are available, return an empty string.
    return ''; 
  }

  /**
   * Reads the next line from input and parses it as a single integer.
   * @returns {number} The parsed integer. Returns NaN if parsing fails or line is empty.
   */
  readSingleInteger() {
    const lineContent = this.retrieveLines();
    // Use `Number()` for parsing, as it handles both integers and floats implicitly,
    // and `trim()` removes leading/trailing whitespace.
    return Number(lineContent.trim()); 
  }
  
  /**
   * Reads the next line, splits it by spaces, and returns an array of strings.
   * @returns {string[]} An array of strings. Returns an empty array for empty or invalid lines.
   */
  readStringArray() {
    const line = this.retrieveLines();
    // If the line is not a string or is empty after trimming, return an empty array.
    if (typeof line !== 'string' || line.trim() === '') {
        return []; 
    }
    return line.split(' ');
  }

  /**
   * Reads the next line, splits it by spaces, and parses each part as an integer.
   * @returns {number[]} An array of integers. Returns an empty array if parsing yields no valid numbers.
   */
  readIntegerArray() {
    const stringArray = this.readStringArray();
    // Map each string element to a number, trimming whitespace. Filter out NaN results.
    return stringArray.map(str => Number(str.trim())).filter(num => !isNaN(num)); 
  }

  /**
   * Reads the next line, splits it by spaces, and parses each part as a floating-point number.
   * @returns {number[]} An array of floating-point numbers. Returns an empty array if parsing yields no valid numbers.
   */
  readFloatArray() {
    const stringArray = this.readStringArray();
    // Map each string element to a float, trimming whitespace. Filter out NaN results.
    return stringArray.map(str => parseFloat(str.trim())).filter(num => !isNaN(num)); 
  }

  /**
   * Reads `numLines` lines and parses each as a single integer.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[]} An array of integers.
   */
  readMultiLineIntegers(numLines) {
    const lines = this.retrieveLines(numLines);
    if (!Array.isArray(lines)) { 
        // If retrieveLines returned a single string (e.g., last line, numLines=1), wrap it.
        return [Number(lines.trim())].filter(num => !isNaN(num));
    }
    // Map each line to an integer, filtering out invalid numbers.
    return lines.map(line => Number(line.trim())).filter(num => !isNaN(num));
  }

  /**
   * Reads `numLines` lines and parses each as a single floating-point number.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[]} An array of floating-point numbers.
   */
  readMultiLineFloats(numLines) {
    const lines = this.retrieveLines(numLines);
    if (!Array.isArray(lines)) {
        return [parseFloat(lines.trim())].filter(num => !isNaN(num));
    }
    return lines.map(line => parseFloat(line.trim())).filter(num => !isNaN(num));
  }

  /**
   * Reads `numLines` lines and splits each into an array of strings.
   * @param {number} numLines - The number of lines to read.
   * @returns {string[][]} A 2D array of strings.
   */
  readMultiLineStringMatrix(numLines) {
    const lines = this.retrieveLines(numLines);
    if (!Array.isArray(lines)) {
        return [lines.split(' ')];
    }
    return lines.map(line => line.split(' '));
  }

  /**
   * Reads `numLines` lines, splits each by spaces, and parses each part as an integer.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[][]} A 2D array of integers.
   */
  readMultiLineIntegerMatrix(numLines) {
    const lines = this.retrieveLines(numLines);
    if (!Array.isArray(lines)) {
        return [lines.split(' ').map(s => Number(s.trim())).filter(num => !isNaN(num))];
    }
    return lines.map(line => line.split(' ').map(s => Number(s.trim())).filter(num => !isNaN(num)));
  }

  /**
   * Reads `numLines` lines, splits each by spaces, and parses each part as a floating-point number.
   * @param {number} numLines - The number of lines to read.
   * @returns {number[][]} A 2D array of floating-point numbers.
   */
  readMultiLineFloatMatrix(numLines) {
    const lines = this.retrieveLines(numLines);
    if (!Array.isArray(lines)) {
        return [lines.split(' ').map(s => parseFloat(s.trim())).filter(num => !isNaN(num))];
    }
    return lines.map(line => line.split(' ').map(s => parseFloat(s.trim())).filter(num => !isNaN(num)));
  }
}

// Instantiate the input handler, making it globally accessible.
const dataStreamHandler = new SystemInputHandler();

/**
 * @function DisplayResult
 * @description A utility function to format and display the final computed result to standard output.
 * @param {any} computedOutput - The value to be displayed. Can be boolean, number, string, array, or object.
 */
const DisplayResult = (computedOutput) => {
  let formattedOutput; // Variable to hold the prepared output string.

  // Guard clause: if output is null or undefined, do nothing as there's nothing to display.
  if (computedOutput === null || computedOutput === undefined) {
    return;
  }

  // Determine the appropriate string representation based on the type of `computedOutput`.
  if (computedOutput === true) {
    formattedOutput = 'Yes'; // Convert boolean true to the string 'Yes'.
  } else if (computedOutput === false) {
    formattedOutput = 'No'; // Convert boolean false to the string 'No'.
  } else if (typeof computedOutput === 'number' || typeof computedOutput === 'string') {
    // For numbers and strings, simply convert to string if not already.
    formattedOutput = String(computedOutput); 
  } else if (Array.isArray(computedOutput)) {
    // For arrays, join elements with a single space.
    formattedOutput = computedOutput.join(' ');
  } else if (typeof computedOutput === 'object' && computedOutput !== null) {
    // For general objects (that are not null), serialize to JSON for a readable representation.
    formattedOutput = JSON.stringify(computedOutput);
  } else {
    // Fallback for any other unexpected types, convert them to a string.
    formattedOutput = String(computedOutput);
  }

  // Output the final formatted string to the console (standard output).
  console.log(formattedOutput);
};

// Main execution block:
// 1. Create an instance of the SolutionProcessor.
const mainSolverInstance = new SolutionProcessor();
// 2. Invoke the primary problem-solving method to get the final computed value.
const finalComputedValue = mainSolverInstance.processInputData();
// 3. Display the computed result using the helper function.
DisplayResult(finalComputedValue);