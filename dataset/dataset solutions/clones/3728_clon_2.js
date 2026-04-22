"use strict"; // Enforce strict parsing and error handling rules for the entire script.

// Define a local alias for the global 'parseInt' function to adhere to renaming requirements.
const parseIntegerFromString = parseInt;

// Define a local alias for the global 'console.log' function for output.
const outputToConsole = console.log;

// Define a local alias for the Node.js 'require' function to import modules.
const importModule = require;

// Access the Node.js file system module through its alias.
const fileSystemUtility = importModule('fs');

// Define a local alias for the 'readFileSync' method from the file system utility.
const retrieveFileContents = fileSystemUtility.readFileSync;

// Specify the path for standard input, aliased for consistency.
const standardInputFile = '/dev/stdin';

// Define the character encoding standard, aliased.
const utfEightEncoding = 'utf8';

// Augment String and Array prototypes with aliased methods for string manipulation and array transformation.
String.prototype.stripWhitespace = String.prototype.trim;
String.prototype.divideBySeparator = String.prototype.split;
Array.prototype.transformEach = Array.prototype.map;

/**
 * Executes the primary data processing logic.
 * This function takes raw text input, parses it, performs calculations, and prints the result.
 * @param {string} rawInputText The entire raw string content read from the input source.
 */
const executeProcessing = rawInputText => {

  // Step 1: Normalize the input string by removing any leading or trailing whitespace,
  // then break it down into an array of individual lines using the newline character as a delimiter.
  let inputLines = rawInputText.stripWhitespace().divideBySeparator("\n");


  // Step 2: Extract the first two essential numeric values from the initial line of input.
  // The first number represents the total count of entities.
  const firstNumericValue = parseIntegerFromString(inputLines[0].divideBySeparator(" ")[0]);
  // The second number signifies the capacity or size of each group.
  const secondNumericValue = parseIntegerFromString(inputLines[0].divideBySeparator(" ")[1]);


  // Step 3: Process the second line of input, which contains a series of space-separated numbers.
  // Convert these string representations into a true array of numeric integers.
  const parsedNumberArray = inputLines[1].divideBySeparator(" ").transformEach(currentElement => parseIntegerFromString(currentElement));

  // Step 4: Perform the core arithmetic operation using the extracted numeric values.
  // This calculation determines a specific outcome based on the problem's requirements.
  // The formula used is: (firstNumericValue - 1 + secondNumericValue - 2) / (secondNumericValue - 1)
  const calculationResult = (firstNumericValue - 1 + secondNumericValue - 2) / (secondNumericValue - 1);


  // Step 5: Display the final computed result to the standard output stream.
  outputToConsole(calculationResult);

};

// Initiate the entire process by calling the main execution function.
// It first reads the content of the standard input file (typically '/dev/stdin' on Unix-like systems)
// using the specified UTF-8 encoding, and then passes this content to the processing function.
executeProcessing(retrieveFileContents(standardInputFile, utfEightEncoding));