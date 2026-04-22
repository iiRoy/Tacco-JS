"use strict"; // Enforce strict parsing and error handling for cleaner code

/**
 * Main entry point for processing input data from a given source string.
 * This function orchestrates data parsing, sorting, and matching logic.
 *
 * @param {string} sourceText - The raw input data as a single string.
 */
function ProcessData(sourceText) {
  // Initialize a specialized parser to extract numerical and string values from the input.
  let dataExtractor = new TextParser(sourceText);

  // Read the total number of coordinate pairs expected in both sets.
  let totalItems = dataExtractor.readInteger();

  // Create two distinct arrays to hold the incoming coordinate pairs.
  // These represent two sets of points, e.g., red and blue points.
  let firstSet = new Array(totalItems);
  let secondSet = new Array(totalItems);

  // Populate the first set of coordinates by reading pairs of integers.
  for (let firstIdx = 0; firstIdx < totalItems; firstIdx++) {
    firstSet[firstIdx] = [dataExtractor.readInteger(), dataExtractor.readInteger()];
  }

  // Populate the second set of coordinates, similarly reading integer pairs.
  for (let secondIdx = 0; secondIdx < totalItems; secondIdx++) {
    secondSet[secondIdx] = [dataExtractor.readInteger(), dataExtractor.readInteger()];
  }

  // Define a comparison function to sort coordinate pairs.
  // Sorting is primarily by the first coordinate (x-value), then by the second (y-value) if x-values are equal.
  const pointComparator = (pointOne, pointTwo) =>
    pointOne[0] === pointTwo[0] ? pointOne[1] - pointTwo[1] : pointOne[0] - pointTwo[0];

  // Sort both collections of coordinate pairs using the defined comparison logic.
  firstSet.sort(pointComparator);
  secondSet.sort(pointComparator);

  // Initialize a counter to keep track of the number of successful matches found.
  let successfulMatches = 0;

  // Iterate through each point in the first set to find a suitable match from the second set.
  for (let currentFirstIdx = 0; currentFirstIdx < totalItems; currentFirstIdx++) {
    // If the current point from the first set has already been matched (marked as null), skip it.
    if (firstSet[currentFirstIdx] === null) {
      continue;
    }

    // Iterate through the second set of points to search for a matching candidate.
    for (let currentSecondIdx = 0; currentSecondIdx < totalItems; currentSecondIdx++) {
      // If the current point from the second set has already been matched, skip it.
      if (secondSet[currentSecondIdx] === null) {
        continue;
      }

      // Check the matching condition:
      // A point from the first set matches a point from the second set if
      // both its x and y coordinates are strictly less than the corresponding coordinates
      // of the second set's point.
      if (
        firstSet[currentFirstIdx][0] < secondSet[currentSecondIdx][0] &&
        firstSet[currentFirstIdx][1] < secondSet[currentSecondIdx][1]
      ) {
        // Upon finding a match, mark both points as consumed (by setting to null)
        // to ensure they are not used in subsequent matches.
        secondSet[currentSecondIdx] = null;
        firstSet[currentFirstIdx] = null;
        // Increment the count of successful matches.
        successfulMatches++;
        // Break out of the inner loop as a match has been found for the current firstSet point.
        // This ensures each point from the first set matches at most one point from the second.
        break;
      }
    }
  }

  // Output the final tally of successful matches to the console.
  console.log(successfulMatches);
}

/**
 * A dedicated utility class designed for parsing various data types (integers, strings)
 * from a raw string input, typically from standard input.
 */
class TextParser {
  /**
   * Constructs a new TextParser instance, initializing it with the raw input content.
   *
   * @param {string} rawData - The complete string containing all input tokens,
   *                           expected to be separated by newlines or spaces.
   * @throws {Error} If the provided rawData is undefined, indicating missing input.
   */
  constructor(rawData) {
    if (typeof rawData === "undefined") {
      throw new Error("Input data stream argument cannot be omitted!");
    }
    // Initialize an index to keep track of the current token being processed.
    this.tokenIndex = 0;
    // Split the raw input string into an array of individual tokens using newlines or spaces as delimiters.
    this.parsedTokens = rawData.split(/\n|\s/);
  }

  /**
   * Retrieves the next token from the parsed list and converts it to an integer.
   * The token index is advanced after retrieval.
   *
   * @returns {number} The integer value of the next token.
   */
  readInteger() {
    // The `- 0` unary operation is a concise way to convert a string to a number.
    return this.parsedTokens[this.tokenIndex++] - 0;
  }

  /**
   * Reads a specified number of tokens and converts them into an array of integers.
   *
   * @param {number} size - The exact number of integers to read and return in the array.
   * @returns {number[]} An array containing the parsed integer values.
   * @throws {Error} If the size argument is undefined, indicating an invalid request.
   */
  readIntegerArray(size) {
    if (typeof size === "undefined") {
      throw new Error("Array length parameter must be provided!");
    }
    let resultArray = new Array(size);
    for (let idx = 0; idx < size; idx++) {
      resultArray[idx] = this.readInteger();
    }
    return resultArray;
  }

  /**
   * Retrieves the next token from the parsed list as a string.
   * The token index is advanced after retrieval.
   *
   * @returns {string} The next token as a string.
   */
  readString() {
    return this.parsedTokens[this.tokenIndex++];
  }

  /**
   * Reads a specified number of tokens and returns them as an array of strings.
   *
   * @param {number} count - The number of string tokens to read.
   * @returns {string[]} An array containing the string tokens.
   * @throws {Error} If the count argument is undefined.
   */
  readStringArray(count) {
    if (typeof count === "undefined") {
      throw new Error("String array count parameter must be provided!");
    }
    let resultArray = new Array(count);
    for (let idx = 0; idx < count; idx++) {
      resultArray[idx] = this.readString();
    }
    return resultArray;
  }
}

// This conditional block determines the execution environment.
// If the script is running in a Node.js-like environment (indicated by the presence of 'process' and its 'versions.node' property),
// it will read input from standard input (/dev/stdin) and pass it to the main processing function.
if (typeof process === "object" && typeof process.versions === "object" && process.versions.node) {
  // Obtain the Node.js built-in 'fs' (file system) module for file operations.
  const fileSystemUtilities = require("fs");
  // Alias the synchronous file reading method to a new identifier.
  const readSynchronousFile = fileSystemUtilities.readFileSync;
  // Read the entire content of standard input as raw binary data.
  const rawBytes = readSynchronousFile("/dev/stdin", "binary");
  // Convert the raw binary data to a UTF-8 string before passing it to the main logic.
  ProcessData(rawBytes.toString("utf8"));
}