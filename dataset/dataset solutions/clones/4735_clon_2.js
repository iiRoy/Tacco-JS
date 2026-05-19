"use strict";

// This script processes a string to find the maximum length of a segment
// that starts with 'A' and ends with 'Z'.
const processStringData = (inputData) => {
  // Split the entire input by newlines, then take the first line.
  // Convert the first line into an array of individual characters.
  const charSequence = inputData.split("\n")[0].split("");

  // A boolean indicator to track if we are currently within an 'A'...'Z' sequence.
  let isBetweenAandZ = false;
  // An array to store the lengths of all identified 'A'...'Z' segments.
  let segmentLengths = [];
  // A counter for the length of the current segment being examined.
  let currentSegmentLength = 0;

  // Iterate over each character in the sequence using its index.
  for (let charIndex in charSequence) {
    // If the current character is 'A', set the flag to true, indicating a segment has started.
    if (charSequence[charIndex] === "A") {
      isBetweenAandZ = true;
    }

    // If the current character is 'Z', it marks the end of a segment.
    if (charSequence[charIndex] === "Z") {
      isBetweenAandZ = false; // Reset the flag.
      segmentLengths.push(currentSegmentLength); // Store the length of this completed segment.
    }

    // If the flag is true (we are inside an 'A'...'Z' segment), increment the counter.
    if (isBetweenAandZ) {
      currentSegmentLength++;
    }
  }

  // Calculate the maximum segment length found and add 1 (to account for the 'Z' character itself).
  // Then, print this final result to the console.
  console.log(Math.max(...segmentLengths) + 1);
};

// Read the input from standard input and pass it to the processing function.
processStringData(require("fs").readFileSync("/dev/stdin", "utf8"));
