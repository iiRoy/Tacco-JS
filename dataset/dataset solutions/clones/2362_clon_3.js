"use strict";

/**
 * Processes raw input data to compare two numeric values.
 * This function extracts the first numeric part from the first two lines
 * and determines if they are strictly unequal.
 * @param {string} rawInputContent - The complete raw input string, typically from stdin.
 */
function ProcessInputData(rawInputContent) {
  // Define common delimiters for clarity and potential reusability.
  const lineSeparator = '\n';
  const dataFieldSeparator = ' ';

  // Split the entire input content into individual lines (records).
  // Trim any potential empty strings at the end if the input ends with a newline.
  let inputRecords = rawInputContent.split(lineSeparator).filter(row => row.length > 0);

  // --- Input Validation and Extraction ---

  // Ensure there are at least two lines of data to process.
  if (inputRecords.length < 2) {
    console.error("Error: Insufficient input data. Expected at least two lines for comparison.");
    // In a production environment, one might throw an error or exit the process.
    return;
  }

  // Process the first line to extract its numeric component.
  let firstRecordParts = inputRecords[0].split(dataFieldSeparator);
  let rawFirstNumericString = firstRecordParts[0];

  // Validate and convert the first extracted string to a number.
  let firstNumericValue;
  if (rawFirstNumericString.trim() === '' || isNaN(Number(rawFirstNumericString))) {
    console.error(`Error: Invalid numeric format encountered in the first line: '${rawFirstNumericString}'`);
    return;
  } else {
    firstNumericValue = Number(rawFirstNumericString);
  }

  // Process the second line to extract its numeric component.
  let secondRecordParts = inputRecords[1].split(dataFieldSeparator);
  let rawSecondNumericString = secondRecordParts[0];

  // Validate and convert the second extracted string to a number.
  let secondNumericValue;
  if (rawSecondNumericString.trim() === '' || isNaN(Number(rawSecondNumericString))) {
    console.error(`Error: Invalid numeric format encountered in the second line: '${rawSecondNumericString}'`);
    return;
  } else {
    secondNumericValue = Number(rawSecondNumericString);
  }

  // --- Core Logic: Comparison ---

  // Determine if the two parsed numeric values are distinct.
  // This is a direct check for inequality, which is functionally equivalent to !(A === B).
  const areValuesUnequal = (firstNumericValue !== secondNumericValue);

  // Display the comparison outcome.
  console.log(areValuesUnequal);
}

// Entry point for execution:
// Reads the entire standard input content as a UTF-8 string and passes it to the processing function.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";

try {
  const stdinContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
  ProcessInputData(stdinContent);
} catch (error) {
  console.error(`Failed to read input from ${standardInputPath}:`, error.message);
  // Exit with a non-zero status code to indicate an error.
  process.exit(1);
}