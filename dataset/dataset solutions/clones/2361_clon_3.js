// This module is designed to process incoming data streams,
// specifically targeting a certain numeric condition within the input.
function analyzeInputPayload(sourceContent) {
  // Define a constant representing the specific numeric state we are looking for.
  const requiredStateValue = 1;

  // Split the entire input content into an array of individual text lines.
  // This operation segments the raw string by newline characters.
  const contentLines = sourceContent.split('\n');

  // Implement a preliminary validation check: ensure that the input contains
  // at least two lines, as the logic depends on accessing the second line.
  if (contentLines.length < 2) {
    // If the input is malformed or incomplete, log an error and exit gracefully.
    console.error("Error: The provided input payload is too short. Expected at least two lines of data.");
    return; // Terminate execution for this invalid input.
  }

  // Extract the second line from the parsed content lines array (index 1).
  // This line is considered the primary focus for subsequent analysis.
  const pertinentLine = contentLines[1];

  // Further dissect the pertinent line by splitting it based on space characters.
  // This yields an array of individual components or data fields.
  const lineComponents = pertinentLine.split(' ');

  // Another validation step: ensure that the pertinent line, once split,
  // contains at least two components. This is crucial for accessing the second component.
  if (lineComponents.length < 2) {
    // If the line structure is invalid, report an error and halt processing.
    console.error("Error: The relevant input line is malformed. Expected multiple space-separated components.");
    return; // Terminate execution for this malformed line.
  }

  // Isolate the specific component of interest, which is the second one (index 1).
  // This component's value will be evaluated against our required state.
  const componentForEvaluation = lineComponents[1];

  // Convert the extracted string component into a numeric type.
  // The Number() constructor provides a robust way to achieve this conversion.
  const numericalRepresentation = Number(componentForEvaluation);

  // Declare a variable to store the final output result.
  let finalResultValue;

  // Compare the numerically converted component with our predefined required state.
  // Assign 1 if they match, indicating success or true, otherwise assign 0.
  if (numericalRepresentation === requiredStateValue) {
    finalResultValue = 1;
  } else {
    finalResultValue = 0;
  }

  // Output the determined result to the standard console.
  console.log(finalResultValue);
}

// This immediately invoked function expression (IIFE) serves as the application's entry point.
// It handles the initial setup and data acquisition before invoking the main processing logic.
(function initializeSystem() {
  // Import the Node.js file system module for reading input files.
  const fileSystemModule = require('fs');

  // Define the standard input file path, common in competitive programming environments.
  const standardInputFilePath = '/dev/stdin';

  // Specify the character encoding to use when reading the file content.
  const inputEncodingScheme = 'utf8';

  try {
    // Synchronously read the entire content of the standard input file.
    // The content is expected to be a string due to the specified encoding.
    const rawDataBuffer = fileSystemModule.readFileSync(standardInputFilePath, inputEncodingScheme);
    
    // Pass the acquired raw data string to the primary processing function.
    analyzeInputPayload(rawDataBuffer.toString()); // Ensure string type, though readFileSync with utf8 already returns string.
  } catch (error) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error("An error occurred during system initialization or input reading:", error.message);
  }
})();