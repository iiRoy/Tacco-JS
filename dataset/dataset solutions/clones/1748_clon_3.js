const processNumericalInput = (inputStringSegment) => {
  // A mapping string to convert numerical values to their character representations.
  // Note: Index 0 is '0', Index 1 is 'a', Index 26 is 'z'.
  const characterMap = '0abcdefghijklmnopqrstuvwxyz';

  // Define the base for our custom conversion system.
  // Using BigInt for calculations to handle potentially large numbers.
  const numericalBase = 26n;

  // Pre-process the raw input: remove leading/trailing whitespace.
  const cleanedInput = inputStringSegment.trim();

  // Convert the cleaned input string into a BigInt.
  // This will be the number we progressively deconstruct.
  let currentBigNumber = BigInt(cleanedInput);

  // An array to accumulate the resulting characters in reverse order.
  const outputCharacterSegments = [];

  // Continue the conversion process as long as the number is positive.
  // This ensures that for an input of '0', an empty string is returned,
  // consistent with the original logic.
  while (currentBigNumber > 0n) {
    // Calculate the remainder when the current number is divided by the base.
    // This remainder determines the current character.
    const calculatedRemainder = currentBigNumber % numericalBase;

    // Convert the BigInt remainder to a standard Number to be used as an array index.
    const mappedCharacterIndex = Number(calculatedRemainder);

    // Retrieve the corresponding character from our character map
    // and add it to the front of our output segments array.
    outputCharacterSegments.unshift(characterMap[mappedCharacterIndex]);

    // Update the number for the next iteration:
    // First, subtract the remainder to ensure integer division accuracy in this base system.
    // Then, divide by the base to shift to the next 'digit'.
    currentBigNumber = (currentBigNumber - calculatedRemainder) / numericalBase;
  }

  // Join all collected character segments into a single string to form the final result.
  const finalConvertedString = outputCharacterSegments.join('');

  // Return the generated string. The responsibility for displaying it
  // (e.g., to console) is left to the calling context.
  return finalConvertedString;
};

// --- Execution Block ---

// A helper function to run a set of basic assertions for the conversion logic.
const runVerificationTests = () => {
  console.assert(processNumericalInput('1') === 'a', 'Test Failed: Input 1 should yield "a"');
  console.assert(processNumericalInput('26') === 'a0', 'Test Failed: Input 26 should yield "a0"');
  console.assert(processNumericalInput('27') === 'aa', 'Test Failed: Input 27 should yield "aa"');
  console.assert(processNumericalInput('52') === 'b0', 'Test Failed: Input 52 should yield "b0"');
  console.assert(processNumericalInput('0') === '', 'Test Failed: Input 0 should yield an empty string');
  console.assert(processNumericalInput('  123  ') === 'dw', 'Test Failed: Trimmed input 123 should yield "dw"');
  console.log('All internal verification checks completed.');
};

// Determine execution path based on an environment variable.
// If 'RUN_TESTS_MODE' is set, execute the test suite.
// Otherwise, read from standard input, process, and print the result.
if (process.env.RUN_TESTS_MODE) {
  runVerificationTests();
} else {
  // Read the entire content from standard input synchronously.
  // Assume UTF-8 encoding for the input.
  const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

  // Process the input using our main conversion function.
  const processedOutputResult = processNumericalInput(standardInputContent);

  // Display the final generated string to standard output.
  console.log(processedOutputResult);
}