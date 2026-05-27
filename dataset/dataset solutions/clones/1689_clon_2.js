"use strict"; // Enforce strict mode for cleaner code execution.

/**
 * Establishes a utility for reading input data line by line from standard input.
 * This function initializes an object that manages the input stream.
 * @returns {object} An object with methods to navigate and retrieve input lines.
 */
const buildDataStream = () => {
  // Read all input from /dev/stdin, decode as UTF-8, remove leading/trailing whitespace,
  // then split into an array of lines.
  const sourceLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

  // Construct the data processing object.
  const dataProcessor = {
    "contentArray": sourceLines, // Stores all input lines.
    "readPointer": 0,            // Current position in the input array.
    "bufferLength": sourceLines.length, // Total number of lines available.

    /**
     * Checks if there are more lines to read in the input stream.
     * @returns {boolean} True if more data is available, false otherwise.
     */
    "hasMoreData": function() {
      return this.readPointer < this.bufferLength;
    },

    /**
     * Retrieves the next line from the input stream and advances the pointer.
     * Throws an error if no more data is available.
     * @returns {string} The next line of input.
     */
    "fetchLine": function() {
      if (!this.hasMoreData()) {
        throw "ArrayIndexOutOfBoundsException"; // Indicate an attempt to read beyond available data.
      } else {
        return this.contentArray[this.readPointer++]; // Return current line and increment pointer.
      }
    }
  };
  return dataProcessor; // Return the configured data stream handler.
};

// Initialize the global input handler instance.
const inputHandler = buildDataStream();

// Helper functions for convenient input parsing.
const getNextLine = () => inputHandler.fetchLine();
const parseNextInt = () => parseInt(inputHandler.fetchLine());
const readStringTokens = () => inputHandler.fetchLine().split(" ");
const readIntTokens = () => inputHandler.fetchLine().split(" ").map(el => parseInt(el));
const readCharSequence = () => inputHandler.fetchLine().split("");
const checkHasNext = () => inputHandler.hasMoreData();

// Custom logging function for output.
const logResult = (...items) => console.log(...items);

/**
 * Main function to process competition submission results.
 * Reads submission statuses and counts occurrences of each type.
 */
const AnalyzeSubmissions = () => {
  let totalEntries = parseNextInt(); // The first line is the total number of submissions (though not strictly used in the loop condition here).

  // Initialize counters for different submission statuses.
  let acCount = 0; // Accepted
  let waCount = 0; // Wrong Answer
  let tleCount = 0; // Time Limit Exceeded
  let reCount = 0; // Runtime Error

  // Loop through the remaining input lines, processing each submission status.
  while (checkHasNext()) {
    let currentSubmissionStatus = getNextLine(); // Get the next status string.

    // Increment the appropriate counter based on the status.
    if (currentSubmissionStatus === "AC") {
      acCount++;
    }
    if (currentSubmissionStatus === "WA") {
      waCount++;
    }
    if (currentSubmissionStatus === "TLE") {
      tleCount++;
    }
    if (currentSubmissionStatus === "RE") {
      reCount++;
    }
  }

  // Output the final counts in the specified format.
  console.log(`AC x ${acCount}`);
  console.log(`WA x ${waCount}`);
  console.log(`TLE x ${tleCount}`);
  console.log(`RE x ${reCount}`);
};

// Execute the main analysis function.
AnalyzeSubmissions();
