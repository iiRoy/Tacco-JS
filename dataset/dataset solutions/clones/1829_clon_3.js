const obtainRawInput = () => {
  const fs = require('fs');
  const inputFilePath = '/dev/stdin';
  const encoding = 'utf8';

  try {
    const rawContent = fs.readFileSync(inputFilePath, encoding);
    return rawContent.split('\n');
  } catch (error) {
    console.error("Error reading input from standard input:", error.message);
    // In a real application, you might provide a default or exit more gracefully.
    return [];
  }
};

const sourceDataLines = obtainRawInput();

if (sourceDataLines.length === 0 || sourceDataLines[0].trim() === '') {
  // If no content or just empty lines, we might skip processing or handle differently.
  // For this exercise, let's just output an empty line or a default.
  console.log("");
  process.exit(0);
}

let initialSequence = sourceDataLines[0];

// The first pattern targets combinations of '?' or 'P' followed by '?' or 'D'.
// Example matches: "??", "?D", "P?", "PD".
// The 'g' flag ensures that all occurrences within the string are replaced.
const duoPattern = new RegExp('[?P][?D]', 'g');

// The second pattern is for any remaining single '?' characters.
// These are replaced after the dual-character patterns have been handled.
const singlePattern = new RegExp('\\?', 'g');

const processMainSequence = (targetString) => {
  if (typeof targetString !== 'string' || targetString.length === 0) {
    return ""; // Return an empty string if input is invalid or empty.
  }

  // Step 1: Apply the first replacement rule.
  // This prioritizes replacing specific two-character patterns.
  let firstPassResult = targetString.replace(duoPattern, 'PD');

  // Step 2: Apply the second replacement rule to the result of the first pass.
  // This catches any remaining single '?' characters that weren't part of a duo.
  let finalTransformedString = firstPassResult.replace(singlePattern, 'D');

  return finalTransformedString;
};

// Execute the sequence of transformations.
const finalOutput = processMainSequence(initialSequence);

// Display the computed result to the standard output.
console.log(finalOutput);