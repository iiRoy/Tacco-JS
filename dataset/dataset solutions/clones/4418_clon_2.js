"use strict";

/*
 * This module processes a string of numbers to determine the length of an overlapping interval.
 * It expects four space-separated integers representing two intervals [A, B] and [C, D].
 * The output is the length of their intersection, or 0 if they do not overlap.
 */
const ProcessInput = (rawData) => {
  // First, we parse the incoming string.
  // It's trimmed to remove any leading/trailing whitespace,
  // then split by spaces into an array of string representations of numbers.
  // Finally, each string is converted into an integer using base 10.
  let parsedNumbers = rawData
    .trim()
    .split(" ")
    .map((numStr) => parseInt(numStr, 10));

  // Assign the parsed numerical values to descriptive variables.
  // These represent the start and end points of the two intervals.
  let firstIntervalStart = parsedNumbers[0];
  let firstIntervalEnd = parsedNumbers[1];
  let secondIntervalStart = parsedNumbers[2];
  let secondIntervalEnd = parsedNumbers[3];

  // Calculate the potential start point of the overlap.
  // This is the maximum of the two interval start points.
  let overlapBeginning = Math.max(firstIntervalStart, secondIntervalStart);

  // Calculate the potential end point of the overlap.
  // This is the minimum of the two interval end points.
  let overlapEnding = Math.min(firstIntervalEnd, secondIntervalEnd);

  // Determine the length of the overlapping segment.
  // If overlapEnding is less than overlapBeginning, there is no actual overlap.
  let calculatedLength = overlapEnding - overlapBeginning;

  // Output the result.
  // If the calculated length is non-negative, it means there's an overlap,
  // and we print its length.
  if (calculatedLength >= 0) {
    console.log(calculatedLength);
  }
  // If the calculated length is negative, it implies the intervals do not intersect,
  // so the overlap length is effectively zero.
  else if (calculatedLength < 0) {
    console.log(0);
  }
};

// The program execution starts here.
// It reads the entire content of standard input,
// decodes it as UTF-8, and then passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
