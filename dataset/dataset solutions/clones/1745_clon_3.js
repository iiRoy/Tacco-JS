// Define a constant array holding the characters for base conversion.
// This provides a clear, zero-indexed mapping for 'a' through 'z'.
const ALPHABET_MAP = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
];

// Establish the base for our conversion, which is 26 for the English alphabet.
const CONVERSION_BASE = 26;

// Define a constant for the standard input file path.
const STANDARD_INPUT_FILE = '/dev/stdin';

/**
 * Transforms a positive integer from base-10 into a custom base-26 string
 * representation, where 'a' corresponds to 1, 'b' to 2, ..., 'z' to 26.
 * This function handles the special case where a remainder of 0 maps to 'z' (26).
 * @param {string} rawInputString The input value as a string, expected to be a positive integer.
 * @returns {string|void} The converted string sequence, or void if input is invalid.
 */
function processNumericalInput(rawInputString) {
  // Perform initial validation on the input string to ensure it's a valid numerical format.
  if (typeof rawInputString !== 'string' || !/^\d+$/.test(rawInputString.trim())) {
    console.error("Input error: Provided data must be a string containing only digits.");
    return; // Exit if input is not a valid digit string.
  }

  // Parse the input string into an integer.
  let currentNumericalValue = parseInt(rawInputString.trim(), 10);

  // Validate the parsed number to ensure it's a positive integer.
  if (isNaN(currentNumericalValue) || currentNumericalValue <= 0) {
    console.error("Input error: The numerical value must be a positive integer greater than zero.");
    return; // Exit if the number is invalid.
  }

  // An array to store the resulting characters in reverse order.
  const generatedCharacterSequence = [];

  // Loop as long as there's a numerical value left to process.
  while (currentNumericalValue > 0) {
    // Calculate the remainder when dividing by the conversion base.
    // This gives us the 'digit' in our custom base-26 system.
    let remainderForCurrentStep = currentNumericalValue % CONVERSION_BASE;

    // Adjust the remainder: if it's 0, it means the character should be 'z' (which is the 26th character).
    // Otherwise, use the remainder directly.
    const effectiveDigitValue = (remainderForCurrentStep === 0) ? CONVERSION_BASE : remainderForCurrentStep;

    // Retrieve the corresponding character from our alphabet map.
    // We subtract 1 because ALPHABET_MAP is 0-indexed ('a' at index 0, 'z' at index 25).
    const characterToAdd = ALPHABET_MAP[effectiveDigitValue - 1];

    // Add the character to the beginning of our sequence.
    // Using unshift builds the string in the correct order without needing a final reverse.
    generatedCharacterSequence.unshift(characterToAdd);

    // Update the numerical value for the next iteration.
    // We subtract the effective digit value (1-26) and then divide by the base.
    // Math.floor ensures we maintain integer values for the next loop.
    currentNumericalValue = Math.floor((currentNumericalValue - effectiveDigitValue) / CONVERSION_BASE);
  }

  // Join the collected characters to form the final output string.
  const finalOutputString = generatedCharacterSequence.join('');

  // Log the final result to the console.
  console.log(`Conversion result: ${finalOutputString}`);

  // Return the result for potential further use, though not strictly required by the original snippet.
  return finalOutputString;
}

// Entry point for script execution.
// This block reads input from standard input and passes it to our processing function.
try {
  // Dynamically import the 'fs' module.
  const fileIOModule = require('fs');

  // Read the entire content of the standard input file, encoded as UTF-8.
  const inputPayload = fileIOModule.readFileSync(STANDARD_INPUT_FILE, 'utf8');

  // Call the main processing function with the obtained input.
  processNumericalInput(inputPayload);
} catch (executionError) {
  // Catch and report any errors during file reading or initial execution.
  console.error("An error occurred during script execution:", executionError.message);
}

// Example of a direct function call for testing purposes (commented out).
// processNumericalInput("1111");
// processNumericalInput("26"); // Should output 'z'
// processNumericalInput("27"); // Should output 'za'
// processNumericalInput("702"); // Should output 'zz'
// processNumericalInput("703"); // Should output 'aaa'
// processNumericalInput("-5"); // Should trigger error
// processNumericalInput("invalid"); // Should trigger error