// This JavaScript module is designed to process numerical input from standard input (stdin).
// It expects the first line of input to contain two space-separated integer values.
// The primary goal is to compare these two numbers and output their relational status.

/**
 * Serves as the core logic handler, responsible for parsing input lines,
 * validating numerical data, and performing the comparison.
 *
 * @param {string[]} inputDataLines - An array where each element is a string representing a line from stdin.
 *                                    The first element is expected to contain two numbers.
 * @returns {void} This function prints its results or errors directly to the console.
 */
function executeComparisonLogic(inputDataLines) {
  // Defensive programming: Ensure input array is not null/undefined and has content.
  if (!inputDataLines || inputDataLines.length === 0) {
    console.error("Error: Input data array is empty or undefined. Cannot proceed with comparison.");
    return; // Terminate execution gracefully.
  }

  // Extract the very first line provided and remove any leading/trailing whitespace.
  const rawNumericString = inputDataLines[0].trim();

  // Validate the cleanliness of the extracted string.
  if (rawNumericString.length === 0) {
    console.error("Error: The first line of input was empty after trimming. Expected two numbers.");
    return;
  }

  // Split the cleaned string by one or more whitespace characters to get potential number tokens.
  const tokenizedNumbers = rawNumericString.split(/\s+/);

  // Guard clause: Ensure we have at least two distinct tokens to attempt parsing.
  if (tokenizedNumbers.length < 2) {
    console.error(`Error: Insufficient numerical tokens found on the first line. Expected 2, but got ${tokenizedNumbers.length}.`);
    return;
  }

  // Convert the string tokens into actual numerical values.
  // Using the global Number() constructor for explicit type conversion.
  const firstOperand = Number(tokenizedNumbers[0]);
  const secondOperand = Number(tokenizedNumbers[1]);

  // Comprehensive validation for parsed numbers: check for NaN (Not-a-Number) and Infinity.
  if (isNaN(firstOperand) || !isFinite(firstOperand) || isNaN(secondOperand) || !isFinite(secondOperand)) {
    console.error(`Error: One or both input values could not be reliably parsed as finite numbers.
      Attempted to parse '${tokenizedNumbers[0]}' and '${tokenizedNumbers[1]}'.`);
    return;
  }

  let finalComparisonResultString = ''; // A new helper variable to hold the outcome message.

  // Core comparison logic: Determine the relationship between the two operands.
  if (firstOperand === secondOperand) {
    // Both numbers are strictly equal.
    finalComparisonResultString = `${firstOperand} == ${secondOperand}`;
  } else if (firstOperand < secondOperand) {
    // The first number is strictly less than the second.
    finalComparisonResultString = `${firstOperand} < ${secondOperand}`;
  } else {
    // By exclusion: if not equal and not less than, the first number must be greater than the second.
    // This demonstrates removal of the redundant 'else if (firstOperand > secondOperand)' condition.
    finalComparisonResultString = `${firstOperand} > ${secondOperand}`;
  }

  // Output the determined comparison result to standard output.
  console.log(finalComparisonResultString);

  // Optional: Add an extra logging fragment for internal tracing or debugging.
  // console.debug(`Comparison completed for values: ${firstOperand}, ${secondOperand}. Outcome: ${finalComparisonResultString}`);
}


// --- Standard Input Stream Management ---

// An array to buffer all incoming data chunks from the stdin stream.
const receivedInputSegments = [];

// Event listener for 'data' events on the stdin stream.
// This event fires whenever a piece of data is available to be read.
process.stdin.on('data', (dataPiece) => {
  // Each 'dataPiece' is typically a Buffer object. We push it directly to our buffer array.
  receivedInputSegments.push(dataPiece);
});

// Event listener for the 'end' event on the stdin stream.
// This event signifies that the entire input stream has been consumed.
process.stdin.on('end', () => {
  // Once the stream ends, concatenate all buffered data chunks into a single string.
  // Then, split this comprehensive string by newline characters to form an array of lines.
  const processedLines = receivedInputSegments.join('').split('\n');

  // Invoke our primary comparison function with the fully prepared input lines.
  executeComparisonLogic(processedLines);
});

// Robust error handling for the stdin stream itself.
// This catches unexpected issues with the input channel.
process.stdin.on('error', (ioError) => {
  console.error(`An unhandled error occurred during standard input operations: ${ioError.message}`);
  // Exit the process with a non-zero status code to indicate an error.
  process.exit(1);
});