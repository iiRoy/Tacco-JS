// Import the Node.js file system module.
const FS_UTILITIES = require('fs');

// Define the standard input file path.
const STD_INPUT_SOURCE = '/dev/stdin';

// Variable to hold the raw textual content read from the input.
let rawTextualData = '';

try {
  // Attempt to synchronously read the entire content of the specified input file,
  // interpreting it as UTF-8 encoded text.
  rawTextualData = FS_UTILITIES.readFileSync(STD_INPUT_SOURCE, 'utf8');
} catch (fileReadError) {
  // If an error occurs during file reading (e.g., file not found, permissions),
  // log the error and terminate the process with a non-zero exit code.
  console.error("Critical error: Could not read input from", STD_INPUT_SOURCE, "-", fileReadError.message);
  process.exit(1);
}

// Split the entire input content into an array of individual lines.
// Using a regex for splitting handles both Unix (`\n`) and Windows (`\r\n`) line endings.
// Then, filter out any lines that are empty or contain only whitespace.
const processedInputLines = rawTextualData
  .split(/\r?\n/)
  .filter(singleLine => singleLine.trim() !== '');

// If, after filtering, no valid lines remain, output 0 and exit.
if (processedInputLines.length === 0) {
  console.log(0);
  process.exit(0);
}

// The first line is expected to be a count of subsequent data records.
// Extract this first line and convert it to an integer.
const recordCountString = processedInputLines.shift();
const anticipatedRecordCount = parseInt(recordCountString, 10);

// Validate the anticipated record count. It must be a non-negative integer.
if (isNaN(anticipatedRecordCount) || anticipatedRecordCount < 0) {
  console.error("Input format error: The first line must contain a valid non-negative integer for the record count.");
  process.exit(1);
}

// Process the remaining lines, each expected to contain two space-separated numbers.
const numericalDataEntries = processedInputLines.map((dataRowText, rowIndex) => {
  // Split each row by one or more whitespace characters, trim leading/trailing whitespace,
  // and filter out any empty strings that might result from multiple spaces.
  const stringComponents = dataRowText.trim().split(/\s+/).filter(Boolean);

  // Each data row must contain exactly two components.
  if (stringComponents.length !== 2) {
    console.error(`Input format error: Line ${rowIndex + 2} ("${dataRowText}") is malformed. Expected two numbers.`);
    process.exit(1);
  }

  // Convert string components to numbers. Using Number() for explicit conversion.
  const primaryOperand = Number(stringComponents[0]);
  const secondaryDivisor = Number(stringComponents[1]);

  // Validate that both converted values are indeed numbers.
  if (isNaN(primaryOperand) || isNaN(secondaryDivisor)) {
    console.error(`Input format error: Line ${rowIndex + 2} ("${dataRowText}") contains non-numeric values.`);
    process.exit(1);
  }

  // Return the pair of parsed numbers.
  return [primaryOperand, secondaryDivisor];
});

// Optional validation: Check if the actual number of parsed data entries matches the anticipated count.
if (numericalDataEntries.length !== anticipatedRecordCount) {
  console.warn(`Warning: Expected ${anticipatedRecordCount} data records based on the first line, but found ${numericalDataEntries.length}. Proceeding with available data.`);
}

// Separate the first and second elements of each numerical pair into distinct arrays.
// These correspond to 'a' and 'b' in the original problem description.
const firstColumnOperands = numericalDataEntries.map(entryPair => entryPair[0]);
const secondColumnDivisors = numericalDataEntries.map(entryPair => entryPair[1]);

// Perform the core calculation using a right-to-left reduction.
// The objective is to find a cumulative total that satisfies a specific condition
// with each pair (operand_a, divisor_b) from the end of the lists to the beginning.
const finalCalculatedResult = firstColumnOperands.reduceRight((currentAccumulatedValue, currentPrimaryOperand, currentIndexPosition) => {
  // Retrieve the corresponding divisor from the second column for the current index.
  const currentSecondaryDivisor = secondColumnDivisors[currentIndexPosition];

  // Calculate a temporary sum: the current primary operand plus the accumulated value so far.
  const temporarySum = currentPrimaryOperand + currentAccumulatedValue;

  // Determine the remainder when the temporary sum is divided by the current secondary divisor.
  const remainderAfterDivision = temporarySum % currentSecondaryDivisor;

  // If there is a non-zero remainder, an adjustment is needed.
  if (remainderAfterDivision > 0) {
    // Calculate the amount required to make 'temporarySum' a perfect multiple of 'currentSecondaryDivisor'.
    const adjustmentAmount = currentSecondaryDivisor - remainderAfterDivision;

    // The new accumulated value is the old accumulated value plus this adjustment.
    // This effectively makes (currentPrimaryOperand + new_accumulated_value) a multiple of currentSecondaryDivisor.
    return currentAccumulatedValue + adjustmentAmount;
  } else {
    // If the remainder is zero, 'temporarySum' is already a multiple of 'currentSecondaryDivisor'.
    // No adjustment is needed, so the accumulated value remains unchanged.
    return currentAccumulatedValue;
  }
}, 0); // The initial value for the accumulation starts at zero.

// Output the final computed result to the standard output.
console.log(finalCalculatedResult);