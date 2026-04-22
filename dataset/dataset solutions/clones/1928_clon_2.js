/*
 * This utility module is designed to perform a specific numerical computation.
 * Its core function is to analyze input data and derive a maximum possible value
 * based on a defined mathematical relationship between the provided numbers.
 */

// Helper function: Ensures a value is an integer by rounding down.
function obtainFloorValue(numericalValue) {
  // Returns the largest integer less than or equal to the given numerical input.
  return Math.floor(numericalValue);
}

// Helper function: Converts a string representation into an integer.
function convertToInt(inputStringRepresentation) {
  // Parses the string and returns an integer, specifying radix 10 for robustness.
  return parseInt(inputStringRepresentation, 10);
}

// Helper function: Provides access to the Node.js file system capabilities.
function getFileSystemModule() {
  // Encapsulates the 'require' call for the 'fs' module.
  return require('fs');
}

// Helper function: Removes leading and trailing whitespace from a string.
function stripWhitespace(textString) {
  // Utilizes the built-in String.prototype.trim method.
  return textString.trim();
}

// Helper function: Splits a string into an array of substrings using a specified separator.
function divideStringByDelimiter(textString, separator) {
  // Employs the standard String.prototype.split method.
  return textString.split(separator);
}

// Helper function: Reads file content from a specified path with a given encoding.
function readInputFileContent(filePath, encodingFormat) {
  // Uses the file system utility to read the file synchronously.
  return getFileSystemModule().readFileSync(filePath, encodingFormat);
}

// Helper function: Prints the final computed result to the console.
function outputResult(finalCalculation) {
  // Uses console.info for displaying the outcome, which is a variation of console.log.
  console.info(finalCalculation);
}


// The primary function responsible for orchestrating the data processing.
function processData(dataLines) {

  // Declare variables to hold the key numerical parameters.
  let factorA,
      divisorB,
      upperLimitN;

  // Extract and parse the numerical parameters from the first line of the input data.
  // The line is first cleaned of whitespace, then split by spaces, and each part converted to an integer.
  [factorA, divisorB, upperLimitN] = divideStringByDelimiter(
                                        stripWhitespace(dataLines[0]),
                                        " "
                                      )
                                      .map(element => convertToInt(element));


  // Initialize a variable to track the highest value encountered during computation.
  // A very small initial value ensures any valid calculated score will replace it.
  let greatestValue = -999999999;

  // Conditional logic to determine the appropriate calculation path.
  // The iterative approach is used when 'upperLimitN' exceeds 'divisorB'.
  if (upperLimitN > divisorB) {

    // Loop through a specific range of integers to evaluate the expression.
    // The range starts from 'upperLimitN - (divisorB + 1)' and goes up to 'upperLimitN'.
    for (let currentIteration = upperLimitN - (divisorB + 1);
         currentIteration <= upperLimitN;
         currentIteration++) {

      // Compute a temporary score for the current iteration using the given mathematical formula.
      // The formula involves floor division and subtraction of two terms.
      let currentScore = obtainFloorValue(factorA * currentIteration / divisorB) -
                         (factorA * obtainFloorValue(currentIteration / divisorB));

      // Compare the calculated 'currentScore' with the 'greatestValue' found so far.
      // If the current score is higher, update 'greatestValue' to reflect the new maximum.
      if (greatestValue < currentScore) {
        greatestValue = currentScore;
      }
    }
  } else {
    // If 'upperLimitN' is not greater than 'divisorB', a direct calculation is performed.
    // In this specific case, the maximum value is simply the result of the formula
    // applied directly to 'upperLimitN', without needing an iteration.
    greatestValue = obtainFloorValue(factorA * upperLimitN / divisorB) -
                    (factorA * obtainFloorValue(upperLimitN / divisorB));
  }

  // Display the final determined maximum value to the standard output.
  outputResult(greatestValue);
}


// Configuration parameters for input file handling.
const standardEncoding = 'utf8'; // Defines the character encoding (e.g., UTF-8).
const inputPath = '/dev/stdin';   // Specifies the path to the standard input stream.

// --- Main Program Execution Flow ---

// 1. Read the entire content of the standard input file using the defined path and encoding.
let rawInputContent = readInputFileContent(inputPath, standardEncoding);

// 2. Process the raw input content: first, remove any leading/trailing whitespace,
//    then split the cleaned content into an array of strings based on newline characters.
let processedInputLines = divideStringByDelimiter(
                            stripWhitespace(rawInputContent),
                            "\n"
                          );

// 3. Invoke the main data processing function, passing the prepared array of input lines.
//    This initiates the core logic of the program.
processData(processedInputLines);