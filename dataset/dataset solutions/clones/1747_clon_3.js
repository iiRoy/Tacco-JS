// This module provides functionality to convert a positive BigInt number into an Excel-like column identifier string.
// For example, 1 becomes 'a', 26 becomes 'z', 27 becomes 'aa', 52 becomes 'az', 53 becomes 'ba', etc.

/**
 * Converts a numeric string representation into an Excel-style column identifier.
 * This function handles numbers as BigInt to support very large inputs.
 *
 * @param {string} dataString The input string representing a positive integer.
 * @returns {string} The generated Excel-style column identifier, or an empty string for invalid input.
 */
const processNumericInput = (dataString) => {
  // Defines the 0-indexed alphabet used for conversion (a=0, b=1, ..., z=25).
  const alphabetChars = 'abcdefghijklmnopqrstuvwxyz';
  // A temporary array to store the characters of the column identifier in reverse order.
  const columnFragments = [];

  // Attempt to parse the input string into a BigInt.
  // The .trim() method removes leading/trailing whitespace from the input.
  let numericValue = BigInt(dataString.trim());

  // Input validation: Ensure the numeric value is strictly positive.
  // Excel column identifiers start from 1 ('A'), so 0 or negative numbers are invalid.
  if (numericValue <= 0n) {
    // If the input is invalid, return an empty string to indicate no valid identifier.
    return '';
  }

  // The base for our conversion system, which is 26 (for 26 letters in the alphabet).
  const BASE_VALUE = 26n;

  // The main conversion loop. It continues as long as there is a positive numeric value to process.
  while (numericValue > 0n) {
    // Decrement the numeric value by one. This is crucial for correctly mapping
    // 1-indexed column numbers (A=1) to 0-indexed alphabet positions (a=0).
    numericValue--; 
    
    // Calculate the remainder when the adjusted numeric value is divided by the base.
    // This remainder gives us the 0-indexed position of the current character in the alphabet.
    const charIndex = numericValue % BASE_VALUE;
    
    // Prepend the character corresponding to the calculated index to our result list.
    // BigInt cannot directly index a string, so it must be converted to a Number.
    columnFragments.unshift(alphabetChars[Number(charIndex)]);
    
    // Update the numeric value for the next iteration by performing integer division.
    // This effectively shifts to the next 'digit' in our base-26 system.
    numericValue = numericValue / BASE_VALUE;
  }

  // Join all the collected characters to form the final column identifier string.
  const finalColumnIdentifier = columnFragments.join('');
  
  // Return the generated identifier. The responsibility for outputting this string
  // to the console or other streams lies with the calling environment.
  return finalColumnIdentifier;
};

// --- Input/Output Handling and Execution Context ---
// This section determines how the script obtains its input and how it delivers its output.
// It includes logic for different execution modes, such as testing or direct input.

// A placeholder function for a dedicated testing routine.
// In a more comprehensive setup, this would contain a suite of unit tests.
const runTestRoutine = () => {
  console.log("Initiating internal test routine for column conversion.");
  // Define a set of test cases with expected outputs.
  const testCases = [
    { input: '1', expected: 'a' },
    { input: '26', expected: 'z' },
    { input: '27', expected: 'aa' },
    { input: '52', expected: 'az' },
    { input: '53', expected: 'ba' },
    { input: '702', expected: 'zz' },
    { input: '703', expected: 'aaa' },
    { input: '0', expected: '' },       // Test case for zero input
    { input: '-10', expected: '' },     // Test case for negative input
    { input: '18278', expected: 'zzz' }, // A larger test case
    { input: '28684401878', expected: 'aaaaaaaaaaaa' } // A very large BigInt test case
  ];

  // Iterate through each test case and verify the output of processNumericInput.
  testCases.forEach((testData, index) => {
    const actualResult = processNumericInput(testData.input);
    const testStatus = actualResult === testData.expected ? 'PASS' : 'FAIL';
    console.log(`[Test ${index + 1}] Input: '${testData.input}' | Expected: '${testData.expected}' | Actual: '${actualResult}' | Status: ${testStatus}`);
  });
  console.log("Internal test routine completed.");
};

// Check for the presence and value of a custom environment variable to control execution flow.
// This allows for different behaviors based on the deployment or development environment.
if (process.env.APP_EXEC_MODE) {
  // If the environment variable indicates that a specific test mode should be run.
  if (process.env.APP_EXEC_MODE === 'run_tests') {
    runTestRoutine(); // Execute the dedicated test routine.
  } else {
    // If APP_EXEC_MODE is set but not 'run_tests', it implies a custom input source,
    // often used in development or for specific test scenarios where input is from a file.
    const customInputFilePath = 'dev_environment_input/custom_data.txt'; // Custom path and filename
    try {
      // Synchronously read the content from the specified development input file.
      const devFileContent = require('fs').readFileSync(customInputFilePath, 'utf8');
      const devConversionResult = processNumericInput(devFileContent);
      // Output the result to standard output, followed by a newline for proper formatting.
      process.stdout.write(devConversionResult + '\n');
    } catch (error) {
      // Log any errors encountered during file reading or processing and exit with an error code.
      console.error(`Error processing development input file '${customInputFilePath}': ${error.message}`);
      process.exit(1); // Indicate an error occurred.
    }
  }
} else {
  // This is the default execution path, typically for production or direct command-line usage.
  // Input is expected from standard input (/dev/stdin on Unix-like systems).
  try {
    // Read the entire content from standard input, specifying UTF-8 encoding.
    const stdInputContent = require('fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
    const finalOutput = processNumericInput(stdInputContent);
    // Write the final converted string to standard output, ensuring a newline.
    process.stdout.write(finalOutput + '\n');
  } catch (error) {
    // Handle potential errors during standard input reading.
    console.error(`Failed to read from standard input: ${error.message}`);
    process.exit(1); // Exit with an error status.
  }
}