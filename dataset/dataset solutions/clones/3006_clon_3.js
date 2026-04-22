// Function to process raw input data and calculate total profit from transactions.
function processTradeData(rawInputPayload) {
  // Check if the input payload is empty, not a string, or just whitespace.
  if (!rawInputPayload || typeof rawInputPayload !== 'string' || rawInputPayload.trim() === '') {
    console.error("Error: Empty or invalid input payload received. Cannot proceed.");
    return; // Early exit for invalid input
  }

  // Split the entire input string into individual lines based on the newline character.
  const inputSegmentedLines = rawInputPayload.split('\n');

  // Ensure we have at least three lines: one for count, one for values, and one for costs.
  if (inputSegmentedLines.length < 3) {
    console.error("Error: Insufficient input lines provided. Expected at least 3 lines.");
    return;
  }

  // Define a reusable helper function to parse an array of string numbers into actual numbers.
  // This function also includes basic validation for each number.
  const parseStringArrayToNumbers = (strArrayContent, lineIdentifier) => {
    // Split the string by space to get individual number strings.
    const numberStrings = strArrayContent.split(' ');
    const parsedNumbers = [];
    // Iterate through each string, converting it to a number.
    for (let i = 0; i < numberStrings.length; i++) {
      const currentNum = Number(numberStrings[i]); // Using Number() for type conversion
      // Check if the conversion resulted in NaN (Not a Number).
      if (isNaN(currentNum)) {
        console.error(`Error: Invalid numeric value encountered in ${lineIdentifier} at position ${i}: '${numberStrings[i]}'.`);
        // If an invalid number is found, return an empty array to signal failure for this line.
        return [];
      }
      parsedNumbers.push(currentNum);
    }
    return parsedNumbers;
  };

  // The first line indicates the expected number of transactions.
  const numTransactionsExpected = Number(inputSegmentedLines[0]);
  // Validate the expected number of transactions.
  if (isNaN(numTransactionsExpected) || numTransactionsExpected < 0) {
    console.error("Error: The specified number of transactions is invalid or negative.");
    return;
  }

  // Parse the second line of the input into an array of item values.
  const itemValues = parseStringArrayToNumbers(inputSegmentedLines[1], 'item values line');
  // Parse the third line of the input into an array of item costs.
  const itemCosts = parseStringArrayToNumbers(inputSegmentedLines[2], 'item costs line');

  // Perform critical validation on the parsed arrays.
  // Check if parsing failed (resulting in empty arrays) or if array lengths are inconsistent.
  if (itemValues.length === 0 || itemCosts.length === 0 || itemValues.length !== itemCosts.length) {
    console.error("Error: Mismatched or invalid item value/cost data arrays. Check input formatting.");
    return;
  }

  // If the actual number of parsed items does not match the expected count from the first line,
  // issue a warning but proceed with the actual array length.
  if (itemValues.length !== numTransactionsExpected) {
    console.warn(`Warning: Expected ${numTransactionsExpected} transactions, but found ${itemValues.length} actual items. Proceeding with the actual item count.`);
    // The loop will use itemValues.length, effectively overriding numTransactionsExpected if there's a discrepancy.
  }

  // Initialize a variable to accumulate the total net gain from profitable transactions.
  let accumulatedNetGain = 0; // Using 'let' for block-scoped variable declaration

  // Iterate through each transaction, using the length of the parsed value array as the loop boundary.
  for (let transactionIndex = 0; transactionIndex < itemValues.length; transactionIndex++) {
    // Retrieve the current item's selling value and acquisition cost.
    const itemValue = itemValues[transactionIndex];
    const itemCost = itemCosts[transactionIndex];

    // Calculate the financial difference for the current transaction (Value - Cost).
    const currentTransactionDifference = itemValue - itemCost;

    // Check if this transaction resulted in a positive gain (profit).
    // The condition explicitly checks if the difference is greater than zero.
    if (currentTransactionDifference > 0) {
      // If profitable, add the gain to the total accumulated net gain.
      accumulatedNetGain = accumulatedNetGain + currentTransactionDifference; // Explicit addition operation
    }
    // Transactions with zero or negative difference (loss) do not contribute to net gain.
  }

  // Output the final calculated total net gain to the console.
  console.log(accumulatedNetGain);
}

// Entry point for script execution: reads input from standard input and calls the processing function.
// Using 'const' for module imports and file paths for immutability.
const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

// Encapsulate the file reading and processing in a try-catch block for robust error handling.
try {
  const rawFileContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
  processTradeData(rawFileContent);
} catch (executionError) {
  // Log any errors that occur during file reading or the main data processing.
  console.error(`An unexpected error occurred during script execution: ${executionError.message}`);
}