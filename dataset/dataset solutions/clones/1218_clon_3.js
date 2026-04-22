const applicationSettings = {
  sourceFilePath: '/dev/stdin',
  textEncoding: 'utf8', // Standardized encoding name for Node.js fs module
  segmentDelimiter: ' ',
  positiveOutcomeMessage: 'Yes, the numerical sequence is strictly increasing.', // Enhanced success message
  negativeOutcomeMessage: 'No, the numerical sequence is not strictly increasing.' // Enhanced failure message
};

// A utility function designed to securely fetch raw data from a specified file path.
// It incorporates basic error handling for file system interactions.
const obtainContentFromFile = (pathIdentifier, encodingStandard) => {
  try {
    // Attempt to read the file's content synchronously.
    const fileBufferContent = require('fs').readFileSync(pathIdentifier, encodingStandard);
    // Convert the buffer to a string and remove any extraneous whitespace at the start/end.
    return fileBufferContent.toString().trim();
  } catch (dataAcquisitionError) {
    // In case of an error during file reading, log the issue for debugging purposes.
    console.error(`CRITICAL: Failed to retrieve input data from ${pathIdentifier}. Details: ${dataAcquisitionError.message}`);
    // Return an empty string to signal that data acquisition was unsuccessful.
    return '';
  }
};

// The primary function that orchestrates the data processing and comparison logic.
const executeSequenceEvaluation = () => {
  // Step 1: Acquire the initial raw input string from the configured source.
  const rawInputLine = obtainContentFromFile(applicationSettings.sourceFilePath, applicationSettings.textEncoding);

  // Step 2: Implement an early exit condition if no valid input was obtained.
  if (!rawInputLine.length) {
    console.log(applicationSettings.negativeOutcomeMessage);
    return; // Terminate execution
  }

  // Step 3: Divide the input string into an array of substrings using the defined delimiter.
  const inputSegments = rawInputLine.split(applicationSettings.segmentDelimiter);

  // Step 4: Validate that a sufficient number of segments are present for comparison.
  const requiredSegmentCount = 3;
  if (inputSegments.length < requiredSegmentCount) {
    console.log(`DIAGNOSTIC: Expected ${requiredSegmentCount} data points, but found only ${inputSegments.length}.`);
    console.log(applicationSettings.negativeOutcomeMessage);
    return;
  }

  // Step 5: Convert the relevant string segments into numeric types.
  // We use the unary plus operator for concise type coercion, which is equivalent to Number().
  const primaryValue = +inputSegments[0];
  const secondaryValue = +inputSegments[1];
  const tertiaryValue = +inputSegments[2];

  // Step 6: Perform a crucial validation to ensure all converted values are indeed numbers.
  if (isNaN(primaryValue) || isNaN(secondaryValue) || isNaN(tertiaryValue)) {
    console.log(`DIAGNOSTIC: One or more input components could not be parsed as valid numbers: [${inputSegments[0]}, ${inputSegments[1]}, ${inputSegments[2]}].`);
    console.log(applicationSettings.negativeOutcomeMessage);
    return;
  }

  // Step 7: Evaluate the core condition for strict ascending order.
  // This uses a boolean variable to store the result of the comparison for later use.
  let isOrderingCorrect = false;
  if (primaryValue < secondaryValue) {
    if (secondaryValue < tertiaryValue) {
      isOrderingCorrect = true;
    }
  }

  // Step 8: Construct the final output message based on the evaluation result.
  const finalMessageToDisplay = isOrderingCorrect
    ? applicationSettings.positiveOutcomeMessage
    : applicationSettings.negativeOutcomeMessage;

  // Step 9: Output the determined message to the standard console.
  console.log(finalMessageToDisplay);
};

// Initiate the execution of the main program logic.
executeSequenceEvaluation();