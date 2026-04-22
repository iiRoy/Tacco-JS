"use strict";

/**
 * Primary processing function to handle input data.
 * @param {string} rawInputContent - The raw textual input provided.
 */
function ProcessData(rawInputContent) {
  // Instantiate a helper for parsing the incoming data stream.
  let dataStreamReader = new DataStreamProcessor(rawInputContent);

  // Extract the quantity of items and the modulo divisor.
  let itemQuantity = dataStreamReader.fetchInteger();
  let divisorValue = dataStreamReader.fetchInteger();

  // Retrieve the array of numerical items.
  let numericItems = dataStreamReader.fetchIntegerCollection(itemQuantity);

  // Initialize a hash map to track the frequencies of cumulative sums.
  let remainderCounts = {};

  // Create an array to store cumulative sums, including an initial zero.
  let cumulativeSums = new Array(itemQuantity + 1);
  cumulativeSums[0] = 0; // The sum before any elements is zero.

  // Compute the cumulative sums modulo the divisor.
  for (let currentPosition = 0; currentPosition < itemQuantity; currentPosition++) {
    cumulativeSums[currentPosition + 1] = (cumulativeSums[currentPosition] + numericItems[currentPosition]) % divisorValue;
  }

  // Variable to accumulate the final count of valid pairs.
  let resultantPairs = 0;

  // Iterate through the cumulative sums to find matching remainders.
  for (let indexValue = 0; indexValue < cumulativeSums.length; indexValue++) {
    // Get the existing count for the current remainder, defaulting to zero.
    let existingCount = remainderCounts[cumulativeSums[indexValue]] || 0;

    // Add the existing count to the total pairs, as these represent valid pairs.
    resultantPairs += existingCount;

    // Increment the frequency for the current cumulative sum's remainder.
    remainderCounts[cumulativeSums[indexValue]] = existingCount + 1;
  }

  // Display the final tally of pairs.
  console.log(resultantPairs);
}

/**
 * A specialized class designed to read and parse different data types from a continuous string.
 */
class DataStreamProcessor {
  /**
   * Initializes a new instance of the DataStreamProcessor.
   * @param {string} sourceText - The original string data to be parsed.
   */
  constructor(sourceText) {
    // Current index indicating the next segment to read.
    this.currentSegmentIndex = 0;
    // An array of individual data segments, split by newlines or spaces.
    this.parsedSegments = sourceText.split(/\n|\s/);
  }

  /**
   * Fetches and returns the subsequent integer from the parsed segments.
   * @returns {number} The next integer value.
   */
  fetchInteger() {
    // Retrieve the segment, advance the index, and convert to a number.
    return this.parsedSegments[this.currentSegmentIndex++] - 0;
  }

  /**
   * Acquires a sequence of integers from the data stream.
   * @param {number} desiredCount - The number of integers to fetch.
   * @returns {number[]} An array containing the requested integers.
   */
  fetchIntegerCollection(desiredCount) {
    // Allocate space for the incoming integer values.
    let integerSequence = new Array(desiredCount);
    // Populate the array by repeatedly fetching individual integers.
    for (let loopIndex = 0; loopIndex < desiredCount; loopIndex++) {
      integerSequence[loopIndex] = this.fetchInteger();
    }
    return integerSequence;
  }

  /**
   * Fetches and returns the next string segment from the data.
   * @returns {string} The next string value.
   */
  fetchString() {
    // Retrieve the segment and advance the index.
    return this.parsedSegments[this.currentSegmentIndex++];
  }

  /**
   * Acquires a sequence of strings from the data stream.
   * @param {number} stringAmount - The number of strings to fetch.
   * @returns {string[]} An array containing the requested strings.
   */
  fetchStringCollection(stringAmount) {
    // Allocate space for the incoming string values.
    let stringSequence = new Array(stringAmount);
    // Populate the array by repeatedly fetching individual strings.
    for (let sIdx = 0; sIdx < stringAmount; sIdx++) {
      stringSequence[sIdx] = this.fetchString();
    }
    return stringSequence;
  }
}

// Conditional execution block: if not running in a browser environment,
// read data from standard input and pass it to the main processing function.
if (typeof window === "undefined") {
  ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
}