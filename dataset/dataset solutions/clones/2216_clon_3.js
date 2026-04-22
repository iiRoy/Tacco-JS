// This module processes a specific set of numerical inputs to generate and display a derived string.

const processInputData = (inputLines) => {
  // Ensure that input data is available for processing.
  if (!inputLines || inputLines.length === 0 || !inputLines[0]) {
    console.error("Error: Input data stream appears empty or invalid.");
    return; 
  }

  // Define the delimiter used to separate numeric tokens on the input line.
  const tokenDelimiter = ' ';

  // Extract and split the first line of input into individual string tokens.
  const rawNumericTokens = inputLines[0].split(tokenDelimiter);
  
  // Validate that at least two numeric tokens are present for the operation.
  if (rawNumericTokens.length < 2) {
    console.error("Error: Insufficient numeric tokens found in the input line.");
    return;
  }

  // Safely parse the first and second tokens into base-10 integers.
  const valueOne = parseInt(rawNumericTokens[0], 10);
  const valueTwo = parseInt(rawNumericTokens[1], 10);

  // Perform basic validation to ensure parsed values are valid non-negative integers.
  if (isNaN(valueOne) || isNaN(valueTwo) || valueOne < 0 || valueTwo < 0) {
    console.error("Error: Invalid or negative numeric values detected in input.");
    return;
  }

  // Construct the first candidate string: valueOne repeated valueTwo times.
  // Example: if valueOne=3, valueTwo=2, this becomes "33"
  const repeatedValueOneString = String(valueOne).repeat(valueTwo);

  // Construct the second candidate string: valueTwo repeated valueOne times.
  // Example: if valueOne=3, valueTwo=2, this becomes "222"
  const repeatedValueTwoString = String(valueTwo).repeat(valueOne);

  // Declare a variable to hold the final string result based on the comparison.
  let finalResultantString; 

  // Compare the two original numeric values to decide which constructed string to output.
  // If valueOne is strictly greater than valueTwo, use the string where valueTwo was repeated valueOne times.
  if (valueOne > valueTwo) {
    finalResultantString = repeatedValueTwoString;
  } else {
    // Otherwise (if valueTwo is greater than or equal to valueOne),
    // use the string where valueOne was repeated valueTwo times.
    finalResultantString = repeatedValueOneString;
  }

  // Display the determined string to the standard output.
  console.log(finalResultantString);
};

// Entry point for the script: Reads input from standard input and delegates processing.
try {
  // Utilize Node.js file system module to synchronously read from standard input.
  const fileBuffer = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });
  // Split the entire file content into an array of lines.
  const inputLinesArray = fileBuffer.split('\n');
  // Invoke the main processing function with the parsed lines.
  processInputData(inputLinesArray);
} catch (fileReadError) {
  // Handle potential errors during file reading, logging the issue and exiting.
  console.error("Fatal Error: Unable to read from standard input:", fileReadError.message);
  process.exit(1); // Terminate the process with a non-zero exit code indicating an error.
}