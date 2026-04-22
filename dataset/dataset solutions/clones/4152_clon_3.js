// This script processes a string containing two space-separated numerical values.
// It calculates the ceiling of their average and displays the result.

/**
 * Simulates reading input from a source, defaulting to a predefined string
 * if no external input is available. This function acts as the entry point
 * for raw data acquisition in the application.
 * @returns {string} The raw input string to be processed. Returns an empty string
 *                   if input acquisition fails or is invalid.
 */
function obtainApplicationInput() {
  // In a real-world application, this might involve reading from
  // a file system, a network stream, or command-line arguments.
  // For this exercise, we simulate /dev/stdin by checking process.argv[2]
  // and providing a hardcoded default if no argument is supplied.
  const rawDataPayload = process.argv[2] || "10 21"; // Example default: "10 21" for demonstration

  // Basic validation: ensure the acquired data is indeed a string.
  if (typeof rawDataPayload !== 'string') {
    console.error("Error: Input data obtained was not of string type. Expected a string.");
    return ""; // Return an empty string to signify an invalid input
  }
  return rawDataPayload;
}

/**
 * Parses a given string to extract two integer-like numerical values.
 * This function includes robust error handling for malformed or incomplete input.
 * @param {string} inputLine - The raw string expected to contain two space-separated numbers.
 * @returns {Array<number>} An array containing two parsed finite numbers. Returns an empty array
 *                          if parsing fails due to invalid format or non-numerical components.
 */
function parseNumericalComponents(inputLine) {
  // First, remove any leading or trailing whitespace from the input string
  // to ensure clean splitting.
  const cleansedInputString = inputLine.trim();

  // Split the cleaned string into potential parts using one or more whitespace characters
  // as a delimiter. This handles cases with multiple spaces between numbers.
  const fragmentedParts = cleansedInputString.split(/\s+/);

  // Validate that exactly two components were successfully extracted.
  // Our application specifically expects two numerical values.
  if (fragmentedParts.length !== 2) {
    console.error(`Input Parsing Error: Expected exactly two numerical components, but found ${fragmentedParts.length}. Input: "${inputLine}"`);
    return []; // Indicate parsing failure by returning an empty array
  }

  // Attempt to convert the string parts into numerical values.
  // Using Number() for explicit type conversion.
  const firstComponentValue = Number(fragmentedParts[0]);
  const secondComponentValue = Number(fragmentedParts[1]);

  // Further validation: Ensure both converted values are finite numbers
  // and not NaN (Not a Number).
  if (isNaN(firstComponentValue) || !isFinite(firstComponentValue) ||
      isNaN(secondComponentValue) || !isFinite(secondComponentValue)) {
    console.error(`Input Validation Error: One or both parsed components are not valid finite numbers. Received: "${fragmentedParts[0]}", "${fragmentedParts[1]}"`);
    return []; // Indicate validation failure
  }

  return [firstComponentValue, secondComponentValue];
}

/**
 * Computes a specific derived value from two input numbers.
 * The calculation performed is: Math.ceil((numberA + numberB) / 2).
 * The result is then converted to its string representation.
 * @param {number} numberA - The first numerical term for the computation.
 * @param {number} numberB - The second numerical term for the computation.
 * @returns {string} The computed result as a string, representing the ceiling of their average.
 */
function computeCeiledAverageAsString(numberA, numberB) {
  // Add the two input numbers together to get their sum.
  const aggregateSum = numberA + numberB;

  // Divide the sum by two to find the raw average.
  const intermediateAverage = aggregateSum / 2;

  // Apply the ceiling function to round the average up to the nearest whole number.
  const finalCeiledNumericalResult = Math.ceil(intermediateAverage);

  // Convert the final numerical result into a string format for output.
  // Using String() constructor for explicit conversion.
  const resultAsText = String(finalCeiledNumericalResult);

  return resultAsText;
}

// --- Main Application Execution Block ---
// This section coordinates the acquisition of input, its processing,
// and the display of the final computed output. It also includes
// top-level error handling for robust operation.
try {
  // Step 1: Acquire the initial raw input data for the application.
  const initialInputData = obtainApplicationInput();

  // Guard clause: If the input data acquisition failed or returned an empty string,
  // we cannot proceed. Log a warning and exit.
  if (!initialInputData) {
    console.warn("Application Warning: No valid initial input data was obtained. Terminating execution.");
    process.exit(1); // Exit with a non-zero code to indicate an error
  }

  // Step 2: Parse the acquired input string into its expected numerical components.
  const numericalOperandsArray = parseNumericalComponents(initialInputData);

  // Guard clause: If parsing did not yield exactly two valid numerical operands,
  // log an error and terminate.
  if (numericalOperandsArray.length !== 2) {
    console.error("Application Error: Failed to extract the required two numerical operands. Processing cannot continue.");
    process.exit(1); // Exit due to critical parsing failure
  }

  // Destructure the array to assign the parsed numbers to distinct, descriptive variables.
  const [operandOne, operandTwo] = numericalOperandsArray;

  // Step 3: Perform the core computation using the validated numerical operands.
  const finalComputedOutcome = computeCeiledAverageAsString(operandOne, operandTwo);

  // Step 4: Display the final computed result to the standard output.
  // This is the primary output of the script.
  console.log(finalComputedOutcome);

} catch (unforeseenError) {
  // Catch any unexpected exceptions that might occur during the main execution flow.
  // Log the error details and exit with an error code.
  console.error("An unhandled exception occurred during script execution:", unforeseenError.message);
  process.exit(1); // Exit due to an unexpected runtime error
}