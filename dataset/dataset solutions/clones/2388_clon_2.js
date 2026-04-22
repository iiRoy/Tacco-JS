'use strict';

/**
 * Entry point for processing calendar-related input.
 * This function determines a specific numeric value based on a given day label.
 * @param {string} incomingText - The entire text content provided as input.
 */
function ProcessInputData(incomingText) {
  // A constant array holding the textual representations of the days of the week.
  const calendarLabels = [ 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT' ];

  // Another constant array, mapping to a specific set of integer values.
  const numericOffsets = [ 7, 6, 5, 4, 3, 2, 1 ];

  // The first line of the input is expected to contain the current day's label.
  let currentDayIdentifier = incomingText
    .split("\n")[0];

  // console.log({ currentDay: currentDayIdentifier }); // Debugging line, now commented out.

  // Find the zero-based index of the identified day within our labels array.
  let matchingIndex = calendarLabels.indexOf(currentDayIdentifier);

  // Print the corresponding numeric offset for the found index.
  console.log(numericOffsets[matchingIndex]);
}

// Initiate the processing by reading from standard input.
ProcessInputData(
  require("fs")
    .readFileSync( "/dev/stdin", "utf8" )
);