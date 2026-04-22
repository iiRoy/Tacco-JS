'use strict'; // Enforcing strict parsing rules within this script.

// Obtain the raw input data from the standard input stream.
let sourceData = require("fs").readFileSync("/dev/stdin", "UTF-eight");

// Process the acquired data by dividing it into an array of strings, using the newline character as a delimiter.
sourceData = sourceData.split(String.fromCharCode(0x0A));

// Extract the second line of the input, split it by spaces, and convert each part into an integer.
let numericSequence = sourceData[0x1].split("\u0020").map(
  (itemValue) => {
    // Explicitly convert each string item to its base-10 integer equivalent.
    return parseInt(itemValue, 10);
  }
);

// Initialize a counter for the number of trend reversals or distinct segments observed.
// It starts at one because there's always at least one segment.
let segmentCount = 0x1;

// Initialize a variable to keep track of the established directional trend (slope).
// A value of 0x0 indicates no trend is currently established for the segment.
// 0x1 typically represents an increasing trend, while -0x1 represents a decreasing trend.
let slopeDirection = 0x0;

// Iterate through the numeric sequence, commencing from the second element (index 0x1).
for (
  let loopIndex = 0x1;
  loopIndex < numericSequence.length;
  loopIndex++
) {
  // Calculate the sign of the difference between the preceding and current element.
  // This determines the instantaneous direction of change (increasing, decreasing, or flat).
  let instantaneousDirection = Math.sign(
    numericSequence[loopIndex - 0x1] - numericSequence[loopIndex]
  );

  // Evaluate if the instantaneous direction indicates a reversal of the established trend.
  // A product less than 0x0 signifies opposite signs (e.g., increasing then decreasing).
  if (instantaneousDirection * slopeDirection < 0x0) {
    // If a trend reversal is detected, increment the segment counter.
    segmentCount++;
    // Reset the slope direction to 0x0, signifying the start of a new, undefined trend segment.
    slopeDirection = 0x0;
  }
  // If no established slope direction exists for the current segment (it's the beginning of a new segment).
  else if (slopeDirection === 0x0) {
    // Establish the current instantaneous direction as the prevailing slope for this segment.
    slopeDirection = instantaneousDirection;
  }
}

// Output the final computed number of segments to the console.
console.log(segmentCount);