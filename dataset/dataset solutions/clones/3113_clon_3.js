'use strict';

/**
 * Utility class for reading input from standard input.
 * Handles various data types and formats.
 */
class DataReader {
  constructor() {
    /** @private {number} Tracks the current line being read. */
    this.currentReadPosition = 0;
    /** @private {string[]} Stores all lines of input data. */
    this.cachedInputLines = [];
    // Immediately load all data upon instantiation
    this.loadSourceData();
  }

  /**
   * Loads all input data from /dev/stdin into memory.
   * Uses Buffer for potentially better performance or consistency.
   * @private
   */
  loadSourceData() {
    try {
      const rawBuffer = require("fs").readFileSync("/dev/stdin");
      this.cachedInputLines = Buffer.from(rawBuffer).toString('utf8').split('\n');
    } catch (error) {
      console.error("Error reading input from /dev/stdin:", error.message);
      // Fallback or exit strategy could be implemented here
      this.cachedInputLines = [];
    }
  }

  /**
   * Retrieves one or multiple lines from the input.
   * @param {number} [linesToFetch] - The number of lines to retrieve. If omitted, retrieves a single line.
   * @returns {string|string[]} A single line string or an array of line strings.
   */
  retrieveLines(linesToFetch) {
    if (linesToFetch && linesToFetch > 0) {
      const segment = this.cachedInputLines.slice(this.currentReadPosition, this.currentReadPosition + linesToFetch);
      this.currentReadPosition += linesToFetch;
      return segment;
    }
    // Return a single line if no count is specified
    if (this.currentReadPosition < this.cachedInputLines.length) {
      return this.cachedInputLines[this.currentReadPosition++];
    }
    return ''; // Return empty string if no more lines
  }

  /**
   * Parses a single line into an array of strings (words).
   * @returns {string[]} An array of strings.
   */
  parseWords() {
    const currentLine = this.retrieveLines();
    return currentLine ? currentLine.split(' ') : [];
  }

  /**
   * Helper function to safely parse an integer.
   * @param {string} str - The string to parse.
   * @returns {number} The parsed integer.
   */
  #parseIntegerHelper(str) {
    const val = parseInt(str, 10);
    return isNaN(val) ? 0 : val; // Default to 0 or throw error if preferred
  }

  /**
   * Parses a single line into an array of integers.
   * @returns {number[]} An array of integers.
   */
  getLineOfIntegers() {
    return this.parseWords().map(this.#parseIntegerHelper);
  }

  /**
   * Helper function to safely parse a float.
   * @param {string} str - The string to parse.
   * @returns {number} The parsed float.
   */
  #parseFloatHelper(str) {
    const val = parseFloat(str);
    return isNaN(val) ? 0.0 : val; // Default to 0.0 or throw error
  }

  /**
   * Parses a single line into an array of floating-point numbers.
   * @returns {number[]} An array of floats.
   */
  getLineOfFloats() {
    return this.parseWords().map(this.#parseFloatHelper);
  }

  /**
   * Retrieves multiple lines and parses each into an integer.
   * @param {number} count - The number of lines to read.
   * @returns {number[]} An array of integers.
   */
  getManyIntegers(count) {
    const lines = this.retrieveLines(count);
    return Array.isArray(lines) ? lines.map(line => this.#parseIntegerHelper(line.trim())) : [];
  }

  /**
   * Retrieves multiple lines and parses each into a float.
   * @param {number} count - The number of lines to read.
   * @returns {number[]} An array of floats.
   */
  getManyFloats(count) {
    const lines = this.retrieveLines(count);
    return Array.isArray(lines) ? lines.map(line => this.#parseFloatHelper(line.trim())) : [];
  }

  /**
   * Retrieves multiple lines, splitting each into an array of strings.
   * @param {number} count - The number of lines to read.
   * @returns {string[][]} A 2D array of strings.
   */
  getWordGrid(count) {
    const lines = this.retrieveLines(count);
    return Array.isArray(lines) ? lines.map(line => line.split(' ')) : [];
  }

  /**
   * Retrieves multiple lines, splitting each into an array of integers.
   * @param {number} count - The number of lines to read.
   * @returns {number[][]} A 2D array of integers.
   */
  getIntegerGrid(count) {
    const lines = this.retrieveLines(count);
    return Array.isArray(lines) ? lines.map(line => line.split(' ').map(this.#parseIntegerHelper)) : [];
  }

  /**
   * Retrieves multiple lines, splitting each into an array of floats.
   * @param {number} count - The number of lines to read.
   * @returns {number[][]} A 2D array of floats.
   */
  getFloatGrid(count) {
    const lines = this.retrieveLines(count);
    return Array.isArray(lines) ? lines.map(line => line.split(' ').map(this.#parseFloatHelper)) : [];
  }
}

/**
 * Core application logic for processing numerical sequences.
 */
class SolutionEngine {
  /**
   * Executes the main processing flow based on input data.
   * Generates and outputs a specific set of paired numbers.
   */
  processInputData() {
    // Read the primary input number from the first line
    const initialValue = dataSupplier.getLineOfIntegers()[0];

    // Basic validation for the input number
    if (initialValue === undefined || initialValue <= 0) {
      console.error("Invalid or non-positive input value received.");
      return; // Exit if input is invalid
    }

    /** @type {Array<Array<number>>} Stores segments of numbers that will be combined. */
    const blockSegments = [];
    const isInitialValueOdd = (initialValue % 2 !== 0);

    // If the initial value is odd, add it as a single-element segment first.
    // Using unshift to prepend, maintaining order logic.
    if (isInitialValueOdd) {
      blockSegments.unshift([initialValue]);
    }

    // Determine the upper bound for the loop based on parity.
    const effectiveLimit = isInitialValueOdd ? (initialValue - 1) : initialValue;

    // Generate pairs for the main sequence.
    // The loop iterates up to half of the effective limit.
    for (let currentIdx = 0; currentIdx < Math.floor(effectiveLimit / 2); currentIdx++) {
      const firstComponent = currentIdx + 1;
      const secondComponent = effectiveLimit - currentIdx;
      blockSegments.push([firstComponent, secondComponent]);
    }

    /** @type {Array<Array<number>>} Accumulates the final set of generated pairs. */
    const generatedOutputList = [];
    const totalSegments = blockSegments.length;

    // Iterate through the block segments to create cross-product pairs.
    // Each element in a segment is paired with every element in the *next* segment (circularly).
    for (let segmentIndex = 0; segmentIndex < totalSegments; segmentIndex++) {
      const currentSegment = blockSegments[segmentIndex];
      const nextSegmentIndex = (segmentIndex + 1) % totalSegments;
      const nextSegment = blockSegments[nextSegmentIndex];

      // Use nested loops for clearer pairing logic instead of chained map/concat
      for (const itemA of currentSegment) {
        for (const itemB of nextSegment) {
          generatedOutputList.push([itemA, itemB]);
        }
      }
    }

    // Prepare the output strings.
    // Using a temporary array to store mapped strings before joining.
    const formattedOutputStrings = generatedOutputList.map((pair) => pair.join(' '));

    // Output the total count of generated pairs and then each pair on a new line.
    console.log(generatedOutputList.length);
    console.log(formattedOutputStrings.join('\n'));
  }
}

// Instantiate the data reader and the solution engine.
const dataSupplier = new DataReader();
const mainProcessor = new SolutionEngine();

// Execute the main processing logic.
mainProcessor.processInputData();