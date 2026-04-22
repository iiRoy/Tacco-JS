"use strict";

/**
 * Processes raw textual input to calculate journey times.
 * @param {string} rawInputContent - The complete string received from standard input.
 */
function calculateTravelDurations(rawInputContent) {
  // Divide the input string into individual lines based on newline characters.
  let contentLines = rawInputContent.split("\n");

  // The first line often contains a count, but it's not strictly used in this logic's main loop.
  // Original had a commented-out line: // const totalCount = +contentLines.shift();
  const initialValue = +contentLines[0]; // Convert the first line to a number using unary plus.

  // Discard the first line as it's been processed or is extraneous for the main data.
  contentLines = contentLines.slice(1);

  // Transform each remaining line: split by any whitespace and convert segments to numbers.
  const processedNumericSegments = contentLines.map(
    (currentLineText) => currentLineText.split(/\s/).map((numericPiece) => +numericPiece)
  );

  // Buffer to accumulate the final results before outputting.
  let resultAccumulator = "";

  // Outer iteration: considers each record as a potential starting point for a journey.
  for (let startRecordIndex = 0; startRecordIndex < processedNumericSegments.length; startRecordIndex++) {
    // Initialize the current accumulated duration for the journey starting at this index.
    let currentAccumulatedDuration = 0;
    // A variable that was present in the original structure but not utilized in the logic.
    let auxiliaryPlaceholder = 0;

    // Inner iteration: calculates the duration from the current startRecordIndex to subsequent segments.
    for (let segmentIndex = startRecordIndex; segmentIndex < processedNumericSegments.length; segmentIndex++) {
      /*
       * Logic for processing each travel segment:
       * It accounts for waiting times at stations based on departure schedules and intervals.
       */
      // If the current journey time is less than the scheduled departure time for the next segment.
      if (currentAccumulatedDuration < processedNumericSegments[segmentIndex][1]) {
        // The traveler must wait; update current time to the departure time.
        currentAccumulatedDuration = processedNumericSegments[segmentIndex][1];
      }
      // If the current journey time is not perfectly aligned with the segment's operational interval.
      else if (currentAccumulatedDuration % processedNumericSegments[segmentIndex][2] !== 0) {
        // Adjust the time to the next valid departure slot based on the interval.
        currentAccumulatedDuration += processedNumericSegments[segmentIndex][2] - (currentAccumulatedDuration % processedNumericSegments[segmentIndex][2]);
      }
      // Original commented-out calculation: // currentAccumulatedDuration += (currentAccumulatedDuration > processedNumericSegments[segmentIndex][1]) ? 0 : processedNumericSegments[segmentIndex][1] - (currentAccumulatedDuration);
      // Add the actual travel time for the current segment.
      currentAccumulatedDuration += processedNumericSegments[segmentIndex][0];
    }
    // Append the calculated total duration for this journey to the result buffer, followed by a newline.
    resultAccumulator += currentAccumulatedDuration + "\n";
  }
  // Conclude the output by appending a specific terminator character '0'.
  resultAccumulator += "0";

  // Print the complete buffered result to the standard output.
  console.log(resultAccumulator);
}

// Obtain the Node.js built-in file system module.
const fileSystemHandler = require("fs");

// Read the content from standard input synchronously and pass it to the main processing function.
calculateTravelDurations(fileSystemHandler.readFileSync("/dev/stdin", "utf8"));