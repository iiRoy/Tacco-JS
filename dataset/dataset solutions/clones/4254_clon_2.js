'use strict'; // Enforce strict parsing and error handling for the script

// A utility function to safely convert any textual input into a numerical representation.
function convertTextToNumericValue(stringContent) {
  return Number(stringContent);
}

// A dedicated function to compute the power of a base number raised to an exponent.
function calculateExponentialValue(baseNumber, exponentNumber) {
  return Math.pow(baseNumber, exponentNumber);
}

// A simple routine to display a given value to the standard output console.
function renderOutputToConsole(valueForDisplay) {
  console.log(valueForDisplay);
}

/*
 * This is the primary function responsible for processing the incoming data.
 * It determines the largest square number that is strictly less than a given target.
 */
function processIncomingData(inputDataString) {

  // First, parse the input string to get our numerical target.
  const desiredTargetValue = convertTextToNumericValue(inputDataString);

  // Initialize a variable to keep track of the current square value found.
  let currentSquareResult = 0;

  // Initialize an iteration counter, starting from zero.
  let iterationCounter = 0;

  // The main loop: continues as long as the current square is below the target.
  while (currentSquareResult < desiredTargetValue) {
    // Increment the counter for the next evaluation.
    iterationCounter = iterationCounter + 1;

    // Calculate the square of the incremented counter.
    currentSquareResult = calculateExponentialValue(iterationCounter, 2);
  }

  // Once the loop exits, 'iterationCounter' will be one step too high.
  // We need the square of the value *before* it exceeded the target.
  const finalComputedSquare = calculateExponentialValue(iterationCounter - 1, 2);

  // Output the final result to the user.
  renderOutputToConsole(finalComputedSquare);
}

// Alias for the module loading mechanism to adhere to renaming.
const obtainSystemModule = require;

// Retrieve the file system utility module using the alias.
const fileSystemHandler = obtainSystemModule("fs");

// Define the standard input file path.
const standardInputFileLocation = "/dev/stdin";

// Specify the character encoding for reading the input file.
const fileContentEncoding = "utf8";

// Execute the core processing function by feeding it content
// read synchronously from the standard input stream.
processIncomingData(fileSystemHandler.readFileSync(standardInputFileLocation, fileContentEncoding));