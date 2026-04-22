process.stdin.resume(); // Ensures the standard input stream remains active to receive data.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for the incoming data, typically UTF-8.

let collectedInputSegments = []; // An array to accumulate all lines received from standard input.

// Initiates a new interface to handle line-by-line input from the standard input stream.
const inputLineProcessor = require('readline').createInterface({
  input: process.stdin,   // Designates standard input as the data source.
  output: process.stdout  // Designates standard output for any potential echoes (not directly used here for output).
});

// Registers an event handler for each 'line' of text received.
inputLineProcessor.on('line', (currentInputLine) => {
  collectedInputSegments.push(currentInputLine); // Appends the current line to our collection.
});

// Registers an event handler for when the 'close' event is emitted, signifying end of input.
inputLineProcessor.on('close', () => {
  // --- Core Processing Logic Begins Here ---

  // Validation: Check if any input was received at all.
  if (collectedInputSegments.length === 0) {
    process.stderr.write('Error: No data provided via standard input.\n');
    process.exit(1); // Exits the process with a non-zero status code indicating an error.
  }

  // According to the problem's implicit requirement, we only process the very first line.
  const primaryInputString = collectedInputSegments[0];

  // Splits the primary input string by spaces. Filters out any empty strings
  // that might arise from multiple consecutive spaces (e.g., "1  2").
  const stringifiedNumericElements = primaryInputString.split(' ').filter(s => s.trim() !== '');

  // Validation: Ensure there are at least two distinct elements to consider.
  if (stringifiedNumericElements.length < 2) {
    process.stderr.write('Error: The input line must contain at least two space-separated numeric values.\n');
    process.exit(1);
  }

  // Transforms the array of string elements into an array of actual numbers.
  // It also filters out any elements that could not be successfully converted to a valid number (NaN).
  const parsedNumericalValues = stringifiedNumericElements
    .map(valueStr => Number(valueStr)) // Converts each string to a number.
    .filter(numVal => !isNaN(numVal)); // Retains only valid numeric values.

  // Further validation: After parsing and cleaning, ensure we still have enough numbers.
  if (parsedNumericalValues.length < 2) {
    process.stderr.write('Error: After parsing, fewer than two valid numbers were found in the input.\n');
    process.exit(1);
  }

  // --- Algorithm to find the two smallest numbers in a single pass ---
  let firstSmallestEntry = Infinity;   // Initialize with a very large value.
  let secondSmallestEntry = Infinity;  // Initialize with a very large value.

  // Iterates through each number to determine the two smallest.
  // This method correctly handles cases where the smallest number appears multiple times.
  for (const currentNumericValue of parsedNumericalValues) {
    if (currentNumericValue < firstSmallestEntry) {
      // If the current value is smaller than the smallest found so far,
      // the previous 'firstSmallestEntry' becomes the 'secondSmallestEntry'.
      secondSmallestEntry = firstSmallestEntry;
      firstSmallestEntry = currentNumericValue;
    } else if (currentNumericValue < secondSmallestEntry) {
      // If the current value is not smaller than the 'firstSmallestEntry',
      // but is smaller than the 'secondSmallestEntry', it becomes the new 'secondSmallestEntry'.
      // This is crucial for scenarios like [5, 5, 6], ensuring both 5s are considered.
      secondSmallestEntry = currentNumericValue;
    }
  }

  // Final validation: Check if we successfully found two finite numbers.
  if (firstSmallestEntry === Infinity || secondSmallestEntry === Infinity) {
      process.stderr.write('Error: Could not determine two valid smallest numeric values from the provided input.\n');
      process.exit(1);
  }

  // Computes the sum of the identified two smallest numbers.
  const finalComputedSum = firstSmallestEntry + secondSmallestEntry;

  // Outputs the calculated sum to standard output, followed by a newline character.
  process.stdout.write(String(finalComputedSum) + '\n');

  // --- Core Processing Logic Ends Here ---
});