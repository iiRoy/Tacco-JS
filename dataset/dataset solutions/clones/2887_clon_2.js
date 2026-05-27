function processInput(rawData) {
  // Obtain the numerical value from the raw input string.
  // The input is first trimmed to remove leading/trailing whitespace,
  // then parsed as an integer using base 10.
  let numericVal = parseInt(rawData.trim(), 10);

  // Perform the calculation: subtract 2 from the numeric value,
  // then multiply the result by 180.
  // Math.floor is used to ensure the result is an integer, matching original behavior.
  const calculatedOutput = Math.floor((numericVal - 2) * 180);

  // Display the final computed value to the console.
  console.log(calculatedOutput);
}

// Load the Node.js 'fs' (file system) module.
const fileSystem = require("fs");

// Read the entire content of the standard input file synchronously.
// The content is expected to be encoded in UTF-8.
const stdinContent = fileSystem.readFileSync("/dev/stdin", "utf8");

// Execute the main processing function with the content read from standard input.
processInput(stdinContent);
