// This module is designed to process a specific input structure and derive a calculated position.
// It expects input as a string where the first line contains two space-separated integer values.
// The primary goal is to compute a 1-based position given a total count and an offset index.

/**
 * Executes the core logic to calculate a target position.
 * This function takes raw string input, parses it, validates components,
 * performs a numerical calculation, and outputs the result to the console.
 *
 * @param {string} rawInputContent The complete raw string data provided for processing.
 */
const calculateDesiredPosition = (rawInputContent) => {
  // Guard against non-string input, ensuring the processing pipeline receives expected data.
  if (typeof rawInputContent !== 'string') {
    console.error("Processing Aborted: Input data must be a string type.");
    return; // Terminate execution if input type is incorrect.
  }

  // Step 1: Normalize and segment the input string.
  // First, remove any leading/trailing whitespace from the entire input block.
  const cleanedInputBlock = rawInputContent.trim();

  // Then, split the cleaned block into an array of individual lines.
  // This prepares the data for line-by-line parsing.
  const segmentedInputLines = cleanedInputBlock.split('\n');

  // Type III: Early exit validation - ensure there's at least one non-empty line to work with.
  if (segmentedInputLines.length === 0 || segmentedInputLines[0].trim().length === 0) {
    console.error("Data Error: No primary input line found for numerical parameters.");
    return;
  }

  // Extract the first line, which is expected to contain the critical numerical data.
  const principalParameterLine = segmentedInputLines[0];

  // Type III: Validate the format of the principal line.
  // It must contain a space to separate the two expected numbers.
  if (!principalParameterLine.includes(' ')) {
    console.error("Format Error: The first line does not contain two space-separated values.");
    return;
  }

  // Step 2: Parse the numerical components from the principal line.
  // Split the line by spaces to get string representations of the numbers.
  const stringRepresentedNumbers = principalParameterLine.split(' ');

  // Type III: Ensure we have exactly two numerical tokens.
  if (stringRepresentedNumbers.length < 2) {
    console.error("Parsing Error: Insufficient number of values on the first line. Expected two.");
    return;
  }

  // Explicitly assign string values to distinct variables for clarity.
  const totalCountString = stringRepresentedNumbers[0];
  const offsetIndexString = stringRepresentedNumbers[1];

  // Convert the string representations into actual numerical types.
  const numericalTotalCount = Number(totalCountString);
  const numericalOffsetIndex = Number(offsetIndexString);

  // Type III: Validate that the string-to-number conversion was successful.
  if (isNaN(numericalTotalCount) || isNaN(numericalOffsetIndex)) {
    console.error("Conversion Error: One or both input values are not valid numbers.");
    return;
  }

  // Step 3: Perform the core calculation based on the derived numerical values.
  // The calculation determines a 1-based position by subtracting the offset from the total
  // and then adding one. This is a common pattern for positional calculations.
  const intermediateDifference = numericalTotalCount - numericalOffsetIndex;
  const finalCalculatedResult = intermediateDifference + 1;

  // Step 4: Output the final computed result to the standard console.
  console.log(finalCalculatedResult);
};

// --- Application Entry Point & Input Acquisition ---
// This section is responsible for reading input from the environment
// and passing it to the main processing function.

// Type III: Introduce constants and helper variables for file system operations.
const fileSystemUtility = require('fs'); // Access the Node.js file system module.
const standardInputDevicePath = '/dev/stdin'; // Define the path for standard input.
const textDataEncoding = 'utf8'; // Specify the character encoding for reading the file.

let acquiredInputData = ''; // Initialize a variable to hold the input content.

try {
  // Attempt to synchronously read all content from the standard input file.
  // This is typical for competitive programming or simple script execution.
  acquiredInputData = fileSystemUtility.readFileSync(standardInputDevicePath, textDataEncoding);
} catch (fileReadOperationError) {
  // Type III: Implement robust error handling for file reading failures.
  console.error(`System Input Error: Could not read from ${standardInputDevicePath}.`, fileReadOperationError.message);
  // In case of an error, terminate the process with an error code.
  process.exit(1);
}

// Ensure the acquired data is a string (readFileSync can return a Buffer).
// Then, invoke the main calculation function with the prepared input.
calculateDesiredPosition(acquiredInputData.toString());