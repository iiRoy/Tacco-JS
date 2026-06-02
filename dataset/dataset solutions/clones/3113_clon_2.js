'use strict'; // Enforce strict parsing and error handling for cleaner code.

// This class encapsulates the primary application logic.
class AppProcessor {
  /**
   * Executes the main algorithm to process input and generate output.
   */
  executeLogic() {
    // Read the first integer from the input stream.
    let inputVal = dataReader.getIntegerArray()[0];

    // Initialize an array to hold groups of numbers.
    const valueGroups = [];

    // If the initial input value is odd, add it as a standalone group.
    if (inputVal % 2 !== 0) {
      valueGroups.push([inputVal]);
    }

    // Calculate an adjusted value for loop iteration, ensuring it's even.
    let adjustedVal = (inputVal % 2 !== 0) ? (inputVal - 1) : inputVal;

    // Populate the valueGroups array with pairs of numbers.
    // These pairs sum up to (adjustedVal + 1) for the first element and (adjustedVal) for the second.
    for (let idx = 0; idx < adjustedVal / 2; ++idx) {
      valueGroups.push([idx + 1, adjustedVal - idx]);
    }

    // Initialize an array to store the final set of combined pairs.
    let resultCombinations = [];

    // Iterate through the generated value groups to form combinations.
    for (let idx = 0; idx < valueGroups.length; ++idx) {
      // For each element in the current group, combine it with every element
      // from the next group in a cyclic manner.
      valueGroups[idx].forEach((elementOne) => {
        resultCombinations = resultCombinations.concat(
          valueGroups[(idx + 1) % valueGroups.length].map((elementTwo) => [elementOne, elementTwo])
        );
      });
    }

    // Output the total number of unique combinations found.
    console.log(resultCombinations.length);
    // Format and output each combination on a new line, with elements separated by a space.
    console.log(resultCombinations.map((comboItem) => comboItem.join(' ')).join('\n'));
  }
}

// This utility class handles reading and parsing input data.
class DataHandler {
  /**
   * Constructs a new DataHandler instance, initializing the read pointer
   * and loading all input data.
   */
  constructor() {
    this.readPointer = 0; // Tracks the current line index for reading.
    this.loadAllData();   // Reads all lines from standard input.
  }

  /**
   * Reads all available data from standard input and stores it internally.
   * @returns {string[]} An array where each element is a line from the input.
   */
  loadAllData() {
    // Use Node.js 'fs' module to synchronously read from /dev/stdin.
    this.rawDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines;
  }

  /**
   * Retrieves one or more lines from the stored input data.
   * @param {number} [numLines] - The number of lines to retrieve. If omitted, retrieves a single line.
   * @returns {string|string[]} A single line string or an array of line strings.
   */
  getLineOrLines(numLines) {
    if (numLines) {
      // If a specific number of lines is requested, slice the array.
      const retrievedLines = this.rawDataLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines; // Advance the pointer by the number of lines read.
      return retrievedLines;
    }
    // Otherwise, return the current line and then advance the pointer.
    return this.rawDataLines[this.readPointer++];
  }

  /**
   * Reads a single line and splits it into an array of strings based on spaces.
   * @returns {string[]} An array of string tokens from the current line.
   */
  getStringArray() { return this.getLineOrLines().split(' '); }

  /**
   * Reads a single line, splits it, and converts each token to an integer.
   * @returns {number[]} An array of integers from the current line.
   */
  getIntegerArray() { return this.getStringArray().map((element) => parseInt(element, 10)); }

  /**
   * Reads a single line, splits it, and converts each token to a floating-point number.
   * @returns {number[]} An array of floating-point numbers from the current line.
   */
  getFloatArray() { return this.getStringArray().map((element) => parseFloat(element)); }

  /**
   * Reads multiple lines and converts each line into a single integer.
   * @param {number} count - The number of lines to read.
   * @returns {number[]} An array of integers, one for each line.
   */
  getIntegerLines(count) { return this.getLineOrLines(count).map((element) => parseInt(element, 10)); }

  /**
   * Reads multiple lines and converts each line into a single floating-point number.
   * @param {number} count - The number of lines to read.
   * @returns {number[]} An array of floating-point numbers, one for each line.
   */
  getFloatLines(count) { return this.getLineOrLines(count).map((element) => parseFloat(element)); }

  /**
   * Reads multiple lines and splits each line into an array of strings, forming a 2D array.
   * @param {number} count - The number of lines to read.
   * @returns {string[][]} A 2D array of strings.
   */
  getStringMatrix(count) { return this.getLineOrLines(count).map((lineContent) => lineContent.split(' ')); }

  /**
   * Reads multiple lines, splits each line, and converts tokens to integers, forming a 2D array.
   * @param {number} count - The number of lines to read.
   * @returns {number[][]} A 2D array of integers.
   */
  getIntegerMatrix(count) {
    return this.getLineOrLines(count).map((lineContent) => lineContent.split(' ').map((element) => parseInt(element, 10)));
  }

  /**
   * Reads multiple lines, splits each line, and converts tokens to floats, forming a 2D array.
   * @param {number} count - The number of lines to read.
   * @returns {number[][]} A 2D array of floating-point numbers.
   */
  getFloatMatrix(count) {
    return this.getLineOrLines(count).map((lineContent) => lineContent.split(' ').map((element) => parseFloat(element)));
  }
}

// Create a global instance of the data handler to manage input.
const dataReader = new DataHandler();

// Instantiate the main application processor and trigger its execution.
(new AppProcessor()).executeLogic();
