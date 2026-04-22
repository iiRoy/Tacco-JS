// Define a constant for the standard input path.
const STD_IN_PATH = '/dev/stdin';
// Define a constant for the newline delimiter.
const LINE_BREAK_CHAR = '\n';

/**
 * @function aggregateNumericValues
 * @description A utility function designed to sum two numeric values.
 *              This function is primarily intended for use as a reducer callback
 *              when aggregating elements within an array.
 * @param {number} currentTotal - The accumulated sum or current aggregate value so far.
 * @param {number} nextValue - The current value from the array to be added to the sum.
 * @returns {number} The new accumulated total after adding the current value.
 */
const aggregateNumericValues = (currentTotal, nextValue) => {
  // Perform defensive checks to ensure both operands are treated as numbers before addition.
  // If an operand is not a number, it attempts a conversion; if conversion fails (e.g., undefined, null),
  // it defaults to 0 to prevent unexpected NaN results in the accumulation.
  const operandA = typeof currentTotal === 'number' ? currentTotal : Number(currentTotal) || 0;
  const operandB = typeof nextValue === 'number' ? nextValue : Number(nextValue) || 0;
  return operandA + operandB;
};

// The main application logic is encapsulated within an Immediately Invoked Function Expression (IIFE).
// This pattern helps in creating a private scope for variables and functions, preventing global namespace pollution.
(function processInputAndCalculate() {
  let rawFileContent; // Declared with 'let' for flexibility, though it's assigned once here.
  try {
    // Attempt to read the entire content from the specified standard input path synchronously.
    // The 'utf8' encoding is specified to correctly interpret text data.
    rawFileContent = require('fs').readFileSync(STD_IN_PATH, 'utf8');
  } catch (errorReadingFile) {
    // If any error occurs during the file reading process (e.g., file not found, permission issues),
    // an error message is logged to the console, and the process is terminated with a non-zero exit code,
    // indicating an abnormal termination.
    console.error(`Error encountered while attempting to access the input stream: ${errorReadingFile.message}`);
    process.exit(1); // Exit with an error status.
  }

  // A preliminary check to determine if the content read from the input stream is empty
  // or consists solely of whitespace characters.
  if (!rawFileContent || rawFileContent.trim().length === 0) {
    console.log("No valid numeric input was provided through the standard input. The final computed result is 0.");
    return; // Terminate execution of this function early if no meaningful input exists.
  }

  // Step 1: Initial cleanup of the raw content.
  // Removes any leading or trailing whitespace from the entire input string, ensuring cleaner parsing.
  const cleanedContent = rawFileContent.trim();

  // Step 2: Divide the cleaned content into individual lines.
  // The input string is split based on the defined newline character constant.
  const contentLines = cleanedContent.split(LINE_BREAK_CHAR);

  // Step 3: Process each line to extract and validate numeric values.
  // This involves a two-stage pipeline: filtering and mapping.
  const parsedNumericArray = contentLines
    .filter(line => {
      const trimmedLine = line.trim();
      // The filter keeps only lines that are non-empty after trimming
      // AND can be successfully converted into a finite number (i.e., not NaN or Infinity).
      return trimmedLine.length > 0 && !isNaN(Number(trimmedLine));
    })
    .map(line => {
      // For each filtered line, convert it into a floating-point number.
      // parseFloat is used for explicit handling of decimal numbers.
      // A fallback to 0 is included, although the preceding filter makes `isNaN(num)` less likely for valid input.
      const num = parseFloat(line.trim());
      return isNaN(num) ? 0 : num;
    });

  // Define an explicit initial value for the array reduction process.
  // Providing an initial value is good practice, especially for handling empty arrays
  // or ensuring a consistent starting point for accumulation.
  const initialSumValue = 0;

  let finalCalculatedResult; // Declares a variable to hold the outcome of the calculation.

  // Check if any valid numbers were found after all the filtering and parsing steps.
  if (parsedNumericArray.length === 0) {
    // If no numbers remain in the array, the sum defaults to the initial sum value.
    finalCalculatedResult = initialSumValue;
    console.log("The input stream contained no valid numbers after extensive processing. Final sum: 0");
  } else {
    // Utilize the 'reduce' method to iteratively sum all numbers in the array.
    // The `aggregateNumericValues` function is passed as the reducer callback,
    // and `initialSumValue` is provided as the starting point for the accumulation.
    finalCalculatedResult = parsedNumericArray.reduce(aggregateNumericValues, initialSumValue);
    // Output the final computed result to the console in a descriptive manner.
    console.log(`The aggregated total of the provided numeric sequence is: ${finalCalculatedResult}`);
  }

})(); // The IIFE is immediately executed.