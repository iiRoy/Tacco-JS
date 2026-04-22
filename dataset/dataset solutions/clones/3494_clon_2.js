'use strict'; /* This directive enforces stricter parsing and error handling in the code. */

const processInputData = (rawDataLines) => {
  // Extract the count of data points from the initial line of input.
  const totalEntries = parseInt(rawDataLines[0], 10); // Parse the first input element as an integer, base 10.

  // Initialize arrays to hold the X, Y coordinates, and corresponding height values for each point.
  let xCoordinates = new Array(totalEntries);
  let yCoordinates = new Array(totalEntries);
  let elevationData = new Array(totalEntries);

  // Iterate through the input lines, parsing and storing the coordinate and height information.
  for (  let currentRecordIndex = 0;   currentRecordIndex < totalEntries;   currentRecordIndex++  ) {
    const segmentData = rawDataLines[currentRecordIndex + 1].split(' '); // Split the current line by spaces.
    xCoordinates[currentRecordIndex] = parseInt(segmentData[0], 10);
    yCoordinates[currentRecordIndex] = parseInt(segmentData[1], 10);
    elevationData[currentRecordIndex] = parseInt(segmentData[2], 10);
  }

  // Begin a nested loop to test all possible central X and Y coordinates within a 0-100 range.
  for ( let scanX = 0; scanX < 101; scanX++ ) {
    for ( let scanY = 0; scanY < 101; scanY++ ) {
      // Calculate a hypothetical elevation for the current (scanX, scanY) based on the first data point.
      let hypothesizedZ = elevationData[0] + Math.abs(scanX - xCoordinates[0]) + Math.abs(scanY - yCoordinates[0]);

      let validationFlag = 1; // Assume consistency until proven otherwise.

      // Validate this hypothesized elevation against all other provided data points.
      for ( let validationIndex = 1; validationIndex < totalEntries; validationIndex++ ) {
        // If the calculated elevation for any other point does not match the hypothesized Z, it's inconsistent.
        if (hypothesizedZ !== elevationData[validationIndex] + Math.abs(scanX - xCoordinates[validationIndex]) + Math.abs(scanY - yCoordinates[validationIndex])) {
          validationFlag = 0; // Mark as inconsistent.
        }
      }

      // If validationFlag is still 1, all data points are consistent with the current (scanX, scanY, hypothesizedZ).
      if (validationFlag === 1) {
        console.log(scanX, scanY, hypothesizedZ); // Output the found central point and its elevation.
        return 0; // Terminate execution as the unique solution has been found.
      }
    }
  }
};

// Initiate the processing by reading the entire content from standard input, decoding as UTF-8, and splitting into lines.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));