"use strict";

const ProcessInput = (rawData) => {
  console.log(rawData); // Display the original raw input received.

  // Trim any leading/trailing whitespace from the input string,
  // then split it into an array of strings based on newline characters.
  const lineSegments = rawData.trim().split(/\n/);

  // For the first line segment, split it by any non-digit characters.
  const firstLineParts = lineSegments[0].split(/\D/);
  // For the second line segment, split it by any non-digit characters.
  const secondLineParts = lineSegments[1].split(/\D/);
  // For the third line segment, split it by any non-digit characters.
  const thirdLineParts = lineSegments[2].split(/\D/);

  // Construct the final output string by concatenating specific elements
  // from the parsed parts of each line.
  // This takes the first element from the first line's parts,
  // the second element from the second line's parts,
  // and the third element from the third line's parts.
  const finalResult = `${firstLineParts[0]}${secondLineParts[1]}${thirdLineParts[2]}`;

  console.log(finalResult); // Output the computed final result.
};

// Read the entire content of '/dev/stdin' synchronously using Node.js 'fs' module,
// interpreting it as UTF-8 encoded text, and then pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
