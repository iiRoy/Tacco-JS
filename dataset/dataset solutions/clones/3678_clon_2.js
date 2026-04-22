function ProcessInputData(rawData) {
  // This function takes a raw string, processes it, and prints a result.

  // First, split the input string by spaces and convert each part to a number.
  // The 'map' function iterates over each string segment.
  // The unary plus operator (+singleNumberString) converts the string to a number.
  const numericValues = rawData.split(" ").map(singleNumberString => +singleNumberString);

  // Initialize a variable to store the determined operation symbol.
  let operationSymbol = "unknown"; // Default value indicating no match found yet.

  // Check if the sum of the first two numbers equals 15.
  if (numericValues[0] + numericValues[1] === 15) {
    operationSymbol = "plus"; // Assign 'plus' if the condition is met.
  }

  // Check if the product of the first two numbers equals 15.
  // This check happens regardless of the previous 'if' statement's outcome,
  // potentially overwriting 'plus' if both conditions were true (though not possible with 15).
  if (numericValues[0] * numericValues[1] === 15) {
    operationSymbol = "times"; // Assign 'times' if this condition is met.
  }

  // Output the final determined operation symbol to the console.
  console.log(operationSymbol);
}


// Entry point of the script:
// Load the 'fs' (file system) module to handle file operations.
const fileUtility = require("fs");

// Read the content from the standard input file synchronously.
// The content is expected to be UTF-8 encoded text.
const fileContent = fileUtility.readFileSync("/dev/stdin", "textEncoding");

// Call the main processing function with the obtained file content.
ProcessInputData(fileContent);