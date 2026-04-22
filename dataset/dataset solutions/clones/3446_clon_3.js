const standardInput = process.stdin;
const standardOutput = process.stdout;

// Ensure the standard input stream is active and ready to receive data.
standardInput.resume();

// Define the character encoding for incoming data to ensure proper interpretation.
standardInput.setEncoding('utf8');

/**
 * A data structure to accumulate all received lines from the standard input.
 * Although only the first line is ultimately processed, this array stores all.
 * @type {Array<string>}
 */
const receivedInputLines = [];

// Configuration for the readline interface, specifying input and output streams.
const terminalInputHandler = require('readline').createInterface({
  input: standardInput,
  output: standardOutput
});

/**
 * Event listener for each line of input received.
 * Pushes the current line into the storage array.
 * @param {string} currentLineContent - The text content of the line just read.
 */
terminalInputHandler.on('line', (currentLineContent) => {
  // Trim whitespace from the line before storing, to clean up potential empty lines or extra spaces.
  const trimmedLine = currentLineContent.trim();
  if (trimmedLine.length > 0) {
    receivedInputLines.push(trimmedLine);
  }
});

/**
 * Calculates a specific value based on two numeric inputs.
 * The operation is: (first number) + (second number / divisor).
 * @param {number} numA - The first numeric operand.
 * @param {number} numB - The second numeric operand.
 * @param {number} divisorVal - The value by which the second number is divided.
 * @returns {number} The computed result, or NaN if inputs are invalid.
 */
function performCustomCalculation(numA, numB, divisorVal) {
  // Basic validation to ensure we're working with numbers.
  if (typeof numA !== 'number' || typeof numB !== 'number' || typeof divisorVal !== 'number') {
    console.error("Calculation error: Invalid operand types provided.");
    return NaN;
  }
  if (divisorVal === 0) {
      console.warn("Calculation warning: Division by zero attempted. Result will be Infinity or NaN.");
      return NaN; // Or throw an error, depending on desired strictness
  }
  return numA + (numB / divisorVal);
}

// Constant for the divisor used in the calculation.
const CALCULATION_DIVISOR = 2; // This value is fixed for the specific operation.

/**
 * Event listener for when the input stream closes.
 * This is where the accumulated input is processed and the final result is displayed.
 */
terminalInputHandler.on('close', () => {
  // Guard clause: Check if any input lines were received at all.
  if (receivedInputLines.length === 0) {
    console.error("No input data was provided for processing.");
    return; // Exit if no input.
  }

  // We are only interested in the very first line of input for this specific task.
  const primaryInputLine = receivedInputLines[0];

  // Split the primary input line into its constituent parts using space as a delimiter.
  const parsedStringComponents = primaryInputLine.split(' ');

  // Guard clause: Ensure there are enough components for the calculation.
  // We need at least 3 components (index 0 and index 2).
  if (parsedStringComponents.length < 3) {
    console.error(`Insufficient components in input line: "${primaryInputLine}". Expected at least 3, got ${parsedStringComponents.length}.`);
    return; // Exit if not enough components.
  }

  // Extract the specific string components needed for the calculation.
  const firstComponentStr = parsedStringComponents[0];
  const thirdComponentStr = parsedStringComponents[2];

  // Explicitly convert the string components to floating-point numbers.
  // Using parseFloat is generally safer for user input that might contain decimals.
  const primaryNumericValue = parseFloat(firstComponentStr);
  const secondaryNumericValue = parseFloat(thirdComponentStr);

  // Validate if the parsing resulted in actual numbers.
  if (isNaN(primaryNumericValue) || isNaN(secondaryNumericValue)) {
    console.error(`Invalid numeric input detected. Could not parse "${firstComponentStr}" or "${thirdComponentStr}" as numbers.`);
    return; // Exit if numeric conversion failed.
  }

  // Perform the core calculation using the dedicated function.
  const finalComputedValue = performCustomCalculation(
    primaryNumericValue,
    secondaryNumericValue,
    CALCULATION_DIVISOR
  );

  // Check if the calculation itself yielded a valid number.
  if (isNaN(finalComputedValue)) {
    console.error("The calculation resulted in an invalid number (NaN).");
    return;
  }

  // Output the final result in a clear, formatted message.
  console.log(`Computed Result: ${finalComputedValue.toFixed(4)}`); // Format to 4 decimal places for consistency.
});