// Main entry point for processing system input
function handleSystemInput(incomingStreamData) {
  // Initial data sanitization: ensure input is a string and remove leading/trailing whitespace
  let sanitizedStream = String(incomingStreamData || '').trim();

  // Early exit if the input is empty after trimming, signaling no data to process.
  if (sanitizedStream.length === 0) {
    console.warn("Input stream was empty or contained only whitespace. No processing performed.");
    return; // Terminate execution gracefully
  }

  // Internal helper function to robustly parse a single string component into a number.
  const parseNumericComponent = (strValue) => {
    const numericalRepresentation = Number(strValue); // Using Number() for flexible parsing (integers/floats)
    if (isNaN(numericalRepresentation)) {
      // Log a warning for data that couldn't be converted, but attempt to continue.
      console.error(`Warning: Could not convert data fragment '${strValue}' to a valid numerical type. This component will be omitted.`);
      return null; // Indicate failure to parse
    }
    return numericalRepresentation;
  };

  // Divide the sanitized input string into an array of individual string tokens using space as a delimiter.
  const stringTokens = sanitizedStream.split(" ");

  // Convert the array of string tokens into an array of numerical values, filtering out any invalid entries.
  let processedNumbers = [];
  for (const token of stringTokens) {
    const num = parseNumericComponent(token);
    if (num !== null) { // Only append successfully parsed numbers to our list.
      processedNumbers.push(num);
    }
  }

  // A crucial guard clause to ensure we have a sufficient number of data points for the subsequent calculations.
  const MIN_REQUIRED_DATA_POINTS = 3;
  if (processedNumbers.length < MIN_REQUIRED_DATA_POINTS) {
    console.error(`Error: Insufficient numerical data points provided. Expected at least ${MIN_REQUIRED_DATA_POINTS}, but received only ${processedNumbers.length}. Calculation aborted.`);
    return; // Prevent further execution due to incomplete data
  }

  // Extract the primary operands and the value for comparison from the beginning of the processed numerical array.
  const firstOperationValue = processedNumbers[0];
  const secondOperationValue = processedNumbers[1];
  const comparativeThreshold = processedNumbers[2];

  // Perform the intermediate multiplication operation.
  let calculatedProduct = firstOperationValue * secondOperationValue;

  // An optional debugging statement that can be uncommented for development purposes.
  // console.debug(`DEBUG: Intermediate product: ${calculatedProduct}, Comparative value: ${comparativeThreshold}`);

  // Define a simple helper function to determine the smaller of two given values.
  const determineLesserOfTwo = (valueA, valueB) => {
    return valueA < valueB ? valueA : valueB;
  };

  // Compute the final result by finding the minimum between the calculated product and the third value.
  const ultimateComputedResult = determineLesserOfTwo(calculatedProduct, comparativeThreshold);

  // Output the final determined minimum value to the standard console stream.
  // This could also be routed through a more sophisticated logging utility in a larger system.
  console.log(ultimateComputedResult);
}

// --- Application Bootstrap and Input Acquisition ---
// This Immediately Invoked Function Expression (IIFE) handles the initial setup
// and input reading from the operating system's standard input stream.
(function initializeApplication() {
  const fileSystemModule = require('fs');
  const standardInputFileDescriptor = '/dev/stdin';
  const characterEncodingStandard = 'utf8';

  try {
    // Attempt to read the entire content of the standard input synchronously.
    // This approach is common in environments like competitive programming.
    const rawInputBuffer = fileSystemModule.readFileSync(standardInputFileDescriptor, characterEncodingStandard);

    // Pass the acquired raw data (ensuring it's a string) to our primary processing function.
    handleSystemInput(rawInputBuffer.toString());
  } catch (inputAcquisitionError) {
    // Catch and report any potential errors that occur during the file reading process.
    console.error("An unrecoverable error occurred during standard input acquisition:", inputAcquisitionError.message);
    // In a production environment, one might choose to exit the process or provide a fallback.
    // process.exit(1);
  }
})();