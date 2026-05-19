'use strict';
// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
  // The raw input string is first split into an array of lines based on newline characters.
  let parsedLines = rawData.split("\n");

  // Numerical values are extracted from specific lines of the parsed input.
  // The first line typically represents the overall quantity or total units.
  const totalUnits = parseInt(parsedLines[0], 10);
  // The second line denotes a specific threshold or initial quantity for a billing tier.
  const initialTierThreshold = parseInt(parsedLines[1], 10);
  // The third line specifies the rate applicable to the initial tier.
  const initialTierRate = parseInt(parsedLines[2], 10);
  // The fourth line defines the rate for quantities exceeding the initial tier.
  const additionalTierRate = parseInt(parsedLines[3], 10);

  // A conditional statement evaluates the total units against the initial tier's rate.
  // This comparison dictates which calculation method will be applied.
  if (totalUnits <= initialTierRate) {
    // If the total units are less than or equal to the initial tier's rate (as per original logic),
    // the total cost is simply the total units multiplied by the initial tier rate.
    console.log(totalUnits * initialTierRate);
  } else {
    // Otherwise, if total units exceed the initial tier's rate, a two-part calculation is performed:
    // 1. The cost for the units up to the initial tier threshold, at the initial tier rate.
    // 2. The cost for the remaining units (total minus initial threshold), at the additional tier rate.
    console.log((initialTierThreshold * initialTierRate) + ((totalUnits - initialTierThreshold) * additionalTierRate));
  }
}

// The program initiates by reading data from standard input.
// It uses Node.js's 'fs' module to synchronously read the file content from '/dev/stdin'
// and then passes this content as a UTF-8 encoded string to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
