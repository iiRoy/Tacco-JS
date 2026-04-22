// This function processes raw string input to count specific numerical pairs based on a divisibility criterion.
function processInputData(sourceContent) {
  // Validate initial input content to ensure it's a usable string.
  if (typeof sourceContent !== 'string' || sourceContent.length === 0) {
    // Log an error and terminate execution if input is invalid.
    console.error("Error: Input content must be a non-empty string for processing.");
    return;
  }

  // Define components for a large numerical scaling constant.
  // This constant is used to manipulate numbers for specific arithmetic checks,
  // effectively shifting decimal points to avoid floating-point inaccuracies
  // when performing modulo operations that imply integer-like behavior.
  const SCALING_BASE_VALUE = 10;
  const SCALING_POWER_EXPONENT = 9; // Represents 10^9

  // Calculate the primary numerical scaler (10^9).
  const PRIMARY_NUMERICAL_SCALER = Math.pow(SCALING_BASE_VALUE, SCALING_POWER_EXPONENT);

  // Calculate the square of the primary scaler (10^18), which acts as the divisor
  // in the core conditional check.
  const SQUARE_OF_SCALER_DIVISOR = PRIMARY_NUMERICAL_SCALER * PRIMARY_NUMERICAL_SCALER;

  // Split the entire input content into an array of strings, where each element
  // corresponds to a line from the original input.
  let contentLines = sourceContent.split('\n');

  // Conventionally, the first line of input might contain metadata (e.g., item count)
  // or simply needs to be skipped. This operation removes the first element from the array.
  const initialHeaderLine = contentLines.shift(); // The value of the header line is stored but not used further.

  // Convert the remaining string lines into an array of floating-point numbers.
  // Each line is trimmed for whitespace, parsed, and then any resulting non-numeric
  // entries (like empty strings or invalid number formats) are filtered out.
  const validatedNumericEntries = contentLines
    .map(currentLine => parseFloat(currentLine.trim())) // Attempt to convert each line to a number.
    .filter(parsedValue => !isNaN(parsedValue)); // Retain only successfully parsed numbers.

  // Initialize a counter for pairs that satisfy the specific numerical condition.
  let validPairOccurrenceCounter = 0;

  // Employ a nested loop structure to iterate through all unique combinations of two distinct
  // numbers from the `validatedNumericEntries` array.
  // The outer loop selects the first element of a pair.
  for (let firstElementIterator = 0; firstElementIterator < validatedNumericEntries.length; firstElementIterator++) {
    // The inner loop selects the second element, starting from the element
    // immediately after the first, to ensure unique pairs and prevent self-pairing.
    for (let secondElementIterator = firstElementIterator + 1; secondElementIterator < validatedNumericEntries.length; secondElementIterator++) {
      // Extract the two numbers for the current pair.
      const valueA = validatedNumericEntries[firstElementIterator];
      const valueB = validatedNumericEntries[secondElementIterator];

      // Apply the primary numerical scaler to each value. This effectively multiplies
      // each number by 10^9, potentially converting small decimals into integers
      // or larger numbers while maintaining their relative scale.
      const scaledValueA = valueA * PRIMARY_NUMERICAL_SCALER;
      const scaledValueB = valueB * PRIMARY_NUMERICAL_SCALER;

      // Calculate the product of the two scaled values.
      // This product will be a very large number, potentially exceeding JavaScript's
      // safe integer limit, thus operating in floating-point precision.
      const combinedScaledProduct = scaledValueA * scaledValueB;

      // Evaluate the core condition: check if the `combinedScaledProduct` is perfectly
      // divisible by `SQUARE_OF_SCALER_DIVISOR` (10^18).
      // This condition effectively checks if the product of the original `valueA` and `valueB`
      // (i.e., `valueA * valueB`) results in an integer value.
      if (combinedScaledProduct % SQUARE_OF_SCALER_DIVISOR === 0) {
        // If the divisibility condition holds true, increment the counter.
        validPairOccurrenceCounter++;
      }
    }
  }

  // Display the final tally of pairs that satisfied the specified criteria.
  console.log(validPairOccurrenceCounter);
}

// This is the execution entry point for the script.
// It reads the entire content from standard input (`/dev/stdin`) as a UTF-8 string,
// and then passes this raw content to the `processInputData` function for analysis.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));