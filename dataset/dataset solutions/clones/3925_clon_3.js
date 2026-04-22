(()=>{
  'use strict'; // Ensure strict mode for the entire execution context

  // --- Core Problem Solver ---
  /**
   * Represents the main logic handler for the challenge.
   * Processes input data to derive a specific numerical result.
   */
  class ChallengeProcessor {
    /**
     * Executes the primary solution logic.
     * @returns {number} The calculated result based on input.
     */
    runSolution() {
      // Fetch the initial count of data entries.
      const entryCount = dataReader.retrieveInteger();
      // Guard clause: If no entries or invalid count, return zero.
      if (typeof entryCount !== 'number' || entryCount <= 0) {
          // A more robust application might log an error or throw an exception here.
          return 0;
      }

      // Read a matrix of integer pairs based on the entry count.
      const dataPairs = dataReader.retrieveIntegerMatrix(entryCount);

      // Early exit condition: If all pairs have identical elements (e.g., [5,5]), the result is 0.
      let allElementsMatch = true;
      for (const pair of dataPairs) {
        if (pair[0] !== pair[1]) {
          allElementsMatch = false;
          break;
        }
      }
      if (allElementsMatch) {
        return 0;
      }

      let totalSumOfFirstElements = 0;
      let eligibleSecondElements = []; // Stores second elements from pairs where first > second.

      // Iterate through each data pair to calculate the sum and identify eligible second elements.
      for (const currentPair of dataPairs) {
        const firstVal = currentPair[0];
        const secondVal = currentPair[1];
        totalSumOfFirstElements += firstVal;

        // Check if the first element is strictly greater than the second.
        if (firstVal > secondVal) {
          eligibleSecondElements.push(secondVal);
        }
      }

      // Determine the minimum value among eligible second elements.
      let minimumEligibleSecond = 0; // Default if no eligible elements found.
      if (eligibleSecondElements.length > 0) {
        // Using a loop for finding the minimum, as per Type III requirement (rewriting existing statements).
        minimumEligibleSecond = eligibleSecondElements[0];
        for (let i = 1; i < eligibleSecondElements.length; i++) {
          if (eligibleSecondSecondElements[i] < minimumEligibleSecond) {
            minimumEligibleSecond = eligibleSecondElements[i];
          }
        }
      }

      // The final result is the sum of all first elements minus the minimum of eligible second elements.
      // If no eligible second elements were found, `minimumEligibleSecond` remains 0,
      // effectively subtracting nothing.
      return totalSumOfFirstElements - minimumEligibleSecond;
    }
  }

  // --- Modular Arithmetic Utilities ---
  /**
   * Provides operations for arithmetic with a specified modulus.
   */
  class ModularOperations {
    /**
     * Initializes the modular arithmetic handler.
     * @param {number} [modulusVal] - The modulus value. Defaults to a common prime if not provided.
     */
    constructor(modulusVal = 1e9 + 7) {
      if (typeof modulusVal !== 'number' || modulusVal <= 0 || !Number.isInteger(modulusVal)) {
        console.warn("Invalid modulus value provided. Using default 1e9 + 7.");
        this.modValue = 1e9 + 7;
      } else {
        this.modValue = modulusVal;
      }
    }

    /**
     * Computes the product of two numbers modulo the stored modulus.
     * Implements multiplication using bitwise operations (Russian peasant algorithm).
     * @param {number} factorA - The first operand.
     * @param {number} factorB - The second operand.
     * @returns {number} The product modulo this.modValue.
     */
    multiply(factorA, factorB) {
      let productResult = 0;
      let currentA = factorA % this.modValue;
      let currentB = factorB % this.modValue;

      // Ensure inputs are non-negative for bitwise ops, though not strictly necessary if handled by modulo.
      if (currentA < 0) currentA += this.modValue;
      if (currentB < 0) currentB += this.modValue;

      // Using a different loop structure for Type III.
      while (currentB > 0) {
        // If the least significant bit of currentB is 1, add currentA to productResult.
        if ((currentB & 1) === 1) {
          productResult = (productResult + currentA);
          if (productResult >= this.modValue) { // Check and reduce if overflow
            productResult -= this.modValue;
          }
        }
        // Double currentA and halve currentB for the next iteration.
        currentA = (currentA * 2);
        if (currentA >= this.modValue) { // Check and reduce if overflow
          currentA -= this.modValue;
        }
        currentB = Math.floor(currentB / 2); // Integer division
      }
      return productResult;
    }

    /**
     * Computes (base ^ exponent) modulo the stored modulus.
     * Uses binary exponentiation (exponentiation by squaring).
     * @param {number} baseVal - The base.
     * @param {number} expVal - The exponent.
     * @returns {number} (baseVal ^ expVal) modulo this.modValue.
     */
    power(baseVal, expVal) {
      let finalResult = 1;
      let currentBase = baseVal % this.modValue;
      let currentExp = expVal;

      // Handle negative base if needed, though typically not for modular exponentiation.
      if (currentBase < 0) currentBase += this.modValue;

      // Loop while exponent is greater than zero.
      while (currentExp > 0) {
        // If exponent is odd, multiply result by currentBase.
        if ((currentExp % 2) === 1) {
          finalResult = this.multiply(finalResult, currentBase);
        }
        // Square the currentBase and halve the exponent.
        currentBase = this.multiply(currentBase, currentBase);
        currentExp = Math.floor(currentExp / 2);
      }
      return finalResult;
    }

    /**
     * Computes (numerator / denominator) modulo the stored modulus using Fermat's Little Theorem.
     * Requires the modulus to be a prime number for this inverse method.
     * @param {number} numeratorVal - The numerator.
     * @param {number} denominatorVal - The denominator.
     * @returns {number} (numeratorVal * denominatorVal^-1) modulo this.modValue.
     */
    divide(numeratorVal, denominatorVal) {
      // (a / b) % m = (a * b^(m-2)) % m
      const invDenominator = this.power(denominatorVal, this.modValue - 2);
      return this.multiply(numeratorVal, invDenominator);
    }
    // Removed the 'comb' method as it relied on undefined global tables and was not used.
  }
  const ARITH_MOD = new ModularOperations(1_000_000_007); // Use underscore for number readability.

  // --- General Utility Functions ---
  /**
   * Provides a collection of common array and data manipulation utilities.
   */
  class DataUtilities {
    /**
     * Calculates the sum of all numeric elements in an array.
     * @param {number[]} numericArray - The array of numbers.
     * @returns {number} The sum of the elements. Returns 0 for empty or invalid input.
     */
    calculateSum(numericArray) {
      if (!Array.isArray(numericArray) || numericArray.length === 0) {
        return 0; // Return 0 for empty or invalid arrays
      }
      let runningTotal = 0;
      for (const item of numericArray) {
        // Add a type check to ensure only numbers are summed.
        if (typeof item === 'number') {
          runningTotal += item;
        } else {
          // Log a warning or throw an error for non-numeric elements if strictness is desired.
          // console.warn(`Non-numeric element encountered in array for sum: ${item}`);
        }
      }
      return runningTotal;
    }

    /**
     * Calculates the sum of array elements modulo a given value.
     * @param {number[]} numberSequence - The array of numbers.
     * @param {number} [modulus] - The modulus to apply. Defaults to a global modulus if available.
     * @returns {number} The modular sum.
     */
    calculateModularSum(numberSequence, modulus) {
      const currentMod = modulus ?? ARITH_MOD.modValue; // Use nullish coalescing for default.
      if (!Array.isArray(numberSequence) || numberSequence.length === 0) {
        return 0;
      }
      let currentSum = 0;
      for (const element of numberSequence) {
        if (typeof element === 'number') {
          currentSum = (currentSum + element) % currentMod;
          if (currentSum < 0) currentSum += currentMod; // Ensure positive result
        }
      }
      return currentSum;
    }

    /**
     * Finds the minimum element in an array.
     * @param {Array<any>} sourceArray - The array to search.
     * @param {function(any, any): number} [comparisonFn] - A custom comparison function.
     * @returns {any|undefined} The minimum element, or undefined if the array is empty.
     */
    findMinimum(sourceArray, comparisonFn = (valA, valB) => valA - valB) {
      if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
        return undefined;
      }
      let currentMin = sourceArray[0];
      for (let k = 1; k < sourceArray.length; k++) {
        const item = sourceArray[k];
        if (comparisonFn(item, currentMin) < 0) {
          currentMin = item;
        }
      }
      return currentMin;
    }

    /**
     * Finds the maximum element in an array.
     * @param {Array<any>} sourceArray - The array to search.
     * @param {function(any, any): number} [comparisonFn] - A custom comparison function.
     * @returns {any|undefined} The maximum element, or undefined if the array is empty.
     */
    findMaximum(sourceArray, comparisonFn = (valA, valB) => valA - valB) {
      if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
        return undefined;
      }
      let currentMax = sourceArray[0];
      for (let k = 1; k < sourceArray.length; k++) {
        const item = sourceArray[k];
        if (comparisonFn(item, currentMax) > 0) {
          currentMax = item;
        }
      }
      return currentMax;
    }

    /**
     * Sorts an array in place using an optional comparison function.
     * @param {Array<any>} targetArray - The array to sort.
     * @param {function(any, any): number} [comparator] - Custom comparison function.
     * @returns {Array<any>} The sorted array.
     */
    inPlaceSort(targetArray, comparator = (a, b) => a - b) {
      if (!Array.isArray(targetArray)) {
        console.error("Attempted to sort a non-array value.");
        return [];
      }
      // Add a shallow copy for safety if in-place modification is not strictly required.
      // For Type III, sticking to original's in-place nature.
      return targetArray.sort(comparator);
    }

    /**
     * Removes duplicate elements from an array.
     * @param {Array<any>} inputCollection - The array to process.
     * @returns {Array<any>} A new array with unique elements.
     */
    getUniqueElements(inputCollection) {
      if (!Array.isArray(inputCollection) || inputCollection.length === 0) {
        return [];
      }
      // Using Set for efficient uniqueness, a common and better alternative (Type III structural change).
      return Array.from(new Set(inputCollection));
    }

    /**
     * Generates a numeric range array.
     * @param {number} startVal - The starting value.
     * @param {number} [endVal] - The ending value (exclusive). If null, startVal becomes endVal, and start is 0.
     * @param {number} [stepSize] - The increment/decrement step.
     * @returns {number[]} An array representing the numeric range.
     */
    generateRange(startVal, endVal, stepSize) {
      let currentStart = startVal;
      let currentEnd = endVal;
      if (currentEnd === null || currentEnd === undefined) {
        currentEnd = currentStart || 0;
        currentStart = 0;
      }

      let actualStep = stepSize;
      if (!actualStep) {
        actualStep = currentEnd < currentStart ? -1 : 1;
      }

      const calculatedLength = Math.max(Math.ceil((currentEnd - currentStart) / actualStep), 0);
      const outputRange = new Array(calculatedLength);

      for (let iterIndex = 0; iterIndex < calculatedLength; iterIndex++) {
        outputRange[iterIndex] = currentStart + (iterIndex * actualStep);
      }
      return outputRange;
    }

    /**
     * Retrieves the first N elements of an array.
     * @param {Array<any>} sourceArr - The array.
     * @param {number} [count] - Number of elements to retrieve. If null, returns the first element.
     * @returns {any|Array<any>|undefined} The first element, an array of first N elements, or undefined/empty array.
     */
    fetchFirst(sourceArr, count) {
      if (!Array.isArray(sourceArr) || sourceArr.length === 0) {
        return count === null || count === undefined ? undefined : [];
      }
      if (count === null || count === undefined) {
        return sourceArr[0];
      }
      // Use slice directly for simplicity and clarity.
      return sourceArr.slice(0, Math.max(0, count));
    }

    /**
     * Retrieves all elements of an array except the last N.
     * @param {Array<any>} sourceArr - The array.
     * @param {number} [numToExclude] - Number of elements to exclude from the end. Default is 1.
     * @returns {Array<any>} A new array with elements excluding the last N.
     */
    fetchInitial(sourceArr, numToExclude = 1) {
      if (!Array.isArray(sourceArr)) return [];
      const actualNumToExclude = Math.max(0, numToExclude);
      return sourceArr.slice(0, Math.max(0, sourceArr.length - actualNumToExclude));
    }

    /**
     * Retrieves elements of an array starting from a specific index.
     * @param {Array<any>} sourceArr - The array.
     * @param {number} [startIndex] - The starting index (inclusive). Default is 1.
     * @returns {Array<any>} A new array containing elements from startIndex to the end.
     */
    fetchTail(sourceArr, startIndex = 1) {
      if (!Array.isArray(sourceArr)) return [];
      const actualStartIndex = Math.max(0, startIndex);
      return sourceArr.slice(actualStartIndex);
    }

    /**
     * Retrieves the last N elements of an array.
     * @param {Array<any>} sourceArr - The array.
     * @param {number} [count] - Number of elements to retrieve from the end. If null, returns the last element.
     * @returns {any|Array<any>|undefined} The last element, an array of last N elements, or undefined/empty array.
     */
    fetchLast(sourceArr, count) {
      if (!Array.isArray(sourceArr) || sourceArr.length === 0) {
        return count === null || count === undefined ? undefined : [];
      }
      if (count === null || count === undefined) {
        return sourceArr[sourceArr.length - 1];
      }
      return this.fetchTail(sourceArr, Math.max(0, sourceArr.length - count));
    }

    /**
     * Generates an array of cumulative sums.
     * @param {number[]} originalArray - The input array.
     * @returns {number[]} An array where each element is the sum of all preceding elements (including itself) from the original array.
     */
    generateCumulativeSums(originalArray) {
      if (!Array.isArray(originalArray) || originalArray.length === 0) {
        return [];
      }
      const cumulativeResult = [0]; // Start with 0 for cumulative sum
      for (let i = 0; i < originalArray.length; i++) {
        cumulativeResult.push(cumulativeResult[i] + originalArray[i]);
      }
      return this.fetchTail(cumulativeResult); // Remove the initial 0.
    }

    /**
     * Calculates the differences between adjacent elements in an array.
     * @param {number[]} sourceArray - The input array.
     * @returns {number[]} An array of differences (e.g., [arr[1]-arr[0], arr[2]-arr[1], ...]).
     */
    calculateDifferences(sourceArray) {
      if (!Array.isArray(sourceArray) || sourceArray.length < 2) {
        return [];
      }
      const differenceArray = [];
      for (let idx = 1; idx < sourceArray.length; idx++) {
        differenceArray.push(sourceArray[idx] - sourceArray[idx - 1]);
      }
      return differenceArray;
    }

    /**
     * Performs a binary search on a sorted array to find the index of the first element
     * that is greater than or equal to the key.
     * @param {Array<any>} sortedArray - The array to search (must be sorted).
     * @param {any} searchKey - The value to search for.
     * @param {string|function(any): any} [propertyExtractor] - A property name string or a function to extract the comparable value from array elements.
     * @returns {number} The index where the key would be inserted to maintain sorted order, or array.length if all elements are smaller.
     */
    performBinarySearch(sortedArray, searchKey, propertyExtractor) {
      if (!Array.isArray(sortedArray)) {
        console.error("Binary search requires an array.");
        return -1;
      }

      const extractValue = (obj) => {
        if (typeof propertyExtractor === 'string' && obj !== null && typeof obj === 'object') {
          return obj[propertyExtractor];
        }
        if (typeof propertyExtractor === 'function') {
          return propertyExtractor(obj);
        }
        return obj; // Default: use the object itself.
      };

      const targetValue = extractValue(searchKey);
      let lowIdx = 0;
      let highIdx = sortedArray.length;

      while (lowIdx < highIdx) {
        const midIdx = Math.floor((lowIdx + highIdx) / 2);
        if (extractValue(sortedArray[midIdx]) < targetValue) {
          lowIdx = midIdx + 1;
        } else {
          highIdx = midIdx;
        }
      }
      return lowIdx;
    }
  }
  const arrayProcessor = new DataUtilities();

  // --- Input Handling ---
  /**
   * Manages reading input from stdin.
   */
  class InputReader {
    constructor() {
      this.linePointer = 0; // Renamed from cursor
      this.bufferedLines = []; // Renamed from data
      this.loadInputData();
    }

    /**
     * Loads all input data from stdin into an internal buffer.
     * @private
     * @returns {string[]} The array of input lines.
     */
    loadInputData() {
      try {
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        this.bufferedLines = fileContent.split('\n').filter(line => line.trim() !== ''); // Filter empty lines.
      } catch (error) {
        console.error("Failed to read input from /dev/stdin:", error.message);
        this.bufferedLines = []; // Ensure it's an empty array on error.
      }
      return this.bufferedLines;
    }

    /**
     * Retrieves one or multiple lines from the buffered input.
     * @param {number} [count] - Number of lines to retrieve. If omitted, retrieves one line.
     * @returns {string|string[]|null} The line(s) or null if no more input.
     */
    getNextLine(count) {
      if (this.linePointer >= this.bufferedLines.length) {
        return null; // No more lines available.
      }

      if (count) {
        const endPointer = Math.min(this.linePointer + count, this.bufferedLines.length);
        const linesToReturn = this.bufferedLines.slice(this.linePointer, endPointer);
        this.linePointer = endPointer;
        return linesToReturn;
      }

      const singleLine = this.bufferedLines[this.linePointer];
      this.linePointer++;
      return singleLine;
    }

    /**
     * Parses and returns a single integer from the next line.
     * @returns {number} The parsed integer. Returns NaN if parsing fails.
     */
    retrieveInteger() {
      const line = this.getNextLine();
      if (line === null) return NaN;
      const parsed = Number.parseInt(line, 10); // Explicit radix for robustness.
      return isNaN(parsed) ? 0 : parsed; // Return 0 for invalid numbers as a default behavior.
    }

    /**
     * Parses a single line into an array of strings.
     * @returns {string[]} An array of strings. Returns an empty array if no line or parsing error.
     */
    retrieveStringArray() {
      const line = this.getNextLine();
      return line === null ? [] : line.split(' ');
    }

    /**
     * Parses a single line into an array of integers.
     * @returns {number[]} An array of integers. Filters out NaN values.
     */
    retrieveIntegerArray() {
      return this.retrieveStringArray().map(s => Number.parseInt(s, 10)).filter(n => !isNaN(n));
    }

    /**
     * Parses a single line into an array of floating-point numbers.
     * @returns {number[]} An array of floats. Filters out NaN values.
     */
    retrieveFloatArray() {
      return this.retrieveStringArray().map(s => Number.parseFloat(s)).filter(n => !isNaN(n));
    }

    /**
     * Retrieves N lines and parses each into an integer.
     * @param {number} numLines - The number of lines to read.
     * @returns {number[]} An array of integers.
     */
    retrieveIntegerLines(numLines) {
      const lines = this.getNextLine(numLines);
      if (lines === null || !Array.isArray(lines)) return [];
      return lines.map(l => Number.parseInt(l, 10)).filter(n => !isNaN(n));
    }

    /**
     * Retrieves N lines and parses each into a float.
     * @param {number} numLines - The number of lines to read.
     * @returns {number[]} An array of floats.
     */
    retrieveFloatLines(numLines) {
      const lines = this.getNextLine(numLines);
      if (lines === null || !Array.isArray(lines)) return [];
      return lines.map(l => Number.parseFloat(l)).filter(n => !isNaN(n));
    }

    /**
     * Retrieves N lines and parses each into an array of strings (a 2D string array).
     * @param {number} numRows - The number of rows to read.
     * @returns {string[][]} A 2D array of strings.
     */
    retrieveStringMatrix(numRows) {
      const lines = this.getNextLine(numRows);
      if (lines === null || !Array.isArray(lines)) return [];
      return lines.map(row => row.split(' '));
    }

    /**
     * Retrieves N lines and parses each into an array of integers (a 2D integer array).
     * @param {number} numRows - The number of rows to read.
     * @returns {number[][]} A 2D array of integers. Filters out NaN values.
     */
    retrieveIntegerMatrix(numRows) {
      const lines = this.getNextLine(numRows);
      if (lines === null || !Array.isArray(lines)) return [];
      return lines.map(row => row.split(' ').map(s => Number.parseInt(s, 10)).filter(n => !isNaN(n)));
    }

    /**
     * Retrieves N lines and parses each into an array of floats (a 2D float array).
     * @param {number} numRows - The number of rows to read.
     * @returns {number[][]} A 2D array of floats. Filters out NaN values.
     */
    retrieveFloatMatrix(numRows) {
      const lines = this.getNextLine(numRows);
      if (lines === null || !Array.isArray(lines)) return [];
      return lines.map(row => row.split(' ').map(s => Number.parseFloat(s)).filter(n => !isNaN(n)));
    }
  }
  const dataReader = new InputReader();

  // --- Output Handling ---
  /**
   * Handles formatting and printing output to the console.
   */
  class OutputDisplayManager {
    constructor() {
      this.booleanTextMapping = { // Renamed from 'option'
        'true': 'Yes',
        'false': 'No',
      };
    }

    /**
     * Prints the given data to the console, applying special formatting for booleans.
     * @param {any} dataToPrint - The data to output.
     */
    printFormattedOutput(dataToPrint) {
      let finalOutput;
      // Handle null and undefined explicitly.
      if (dataToPrint === null || dataToPrint === undefined) {
        // Decide on a default behavior for null/undefined, e.g., print empty string or nothing.
        // For this clone, matching original, simply return if null/undefined.
        return;
      }

      if (dataToPrint === true) {
        finalOutput = this.booleanTextMapping['true'];
      } else if (dataToPrint === false) {
        finalOutput = this.booleanTextMapping['false'];
      } else {
        finalOutput = String(dataToPrint); // Ensure non-boolean types are converted to string.
      }
      console.log(finalOutput);
    }

    /**
     * Configures the string representations for true/false boolean output.
     * @param {string[]} booleanLabels - An array containing [falseLabel, trueLabel].
     * @returns {OutputDisplayManager} This instance for chaining.
     */
    configureBooleanLabels(booleanLabels) {
      if (Array.isArray(booleanLabels) && booleanLabels.length >= 2) {
        this.booleanTextMapping['false'] = booleanLabels[0];
        this.booleanTextMapping['true'] = booleanLabels[1];
      } else {
        console.warn("Invalid boolean labels provided. Expected an array of at least two strings.");
      }
      return this;
    }
  }
  const resultPresenter = new OutputDisplayManager();

  // --- Main Execution Block ---
  // Create an instance of the problem solver and run its main logic.
  const problemSolution = new ChallengeProcessor();
  const finalAnswer = problemSolution.runSolution();

  // Display the final computed result using the output manager.
  resultPresenter.printFormattedOutput(finalAnswer);

})(); // Immediately-invoked function expression to encapsulate the code.