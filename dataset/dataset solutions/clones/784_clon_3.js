// Module for interacting with the file system, typically for I/O operations.
const fileSystemModule = require('fs');

// Determine the size of the standard input stream to allocate an appropriate buffer.
// This is a synchronous operation, suitable for script startup.
let inputSizeEstimate = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the raw bytes read from stdin.
// Using Buffer.alloc for safety and modern Node.js practices.
let rawDataBuffer = Buffer.alloc(inputSizeEstimate);

// Synchronously read data from standard input into the buffer.
// Arguments: file descriptor, buffer, offset, length, position.
let actualBytesRead = fileSystemModule.readSync(process.stdin.fd, rawDataBuffer, 0, inputSizeEstimate, 0);

// Convert the raw buffer data to a UTF-8 string, then split it into an array of lines.
// This array will serve as our primary source of input data for transactions.
let processedLines = rawDataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// The main entry point for processing the financial transactions.
// This function orchestrates the logic for calculating change.
processFinancialTransactions();

/**
 * Parses a string of space-separated numbers into an array of integers.
 * Includes basic validation for robust parsing.
 * @param {string} inputString - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed integer values. Returns an empty array on invalid input.
 */
function parseNumericStringArray(inputString) {
    // Check for null, undefined, or empty strings to prevent errors.
    if (!inputString || inputString.trim() === '') {
        // Log a warning and return an empty array, indicating no valid numbers were found.
        console.error("Warning: Empty or invalid string provided for numeric array parsing. Returning empty array.");
        return [];
    }
    return inputString.split(' ').map(val => {
        const num = parseInt(val, 10); // Use radix 10 for explicit decimal parsing.
        if (isNaN(num)) {
            // Log an error for individual invalid numbers and default them to 0.
            console.error(`Error: Could not parse "${val}" as a number. Defaulting to 0.`);
            return 0; // Gracefully handle non-numeric parts by returning 0.
        }
        return num;
    });
}


/**
 * Core logic for handling currency exchange scenarios.
 * It processes input lines representing payment and available coins,
 * then calculates and displays the remaining coins after making change.
 * This function continues processing until a '0' is encountered as the first input line.
 */
function processFinancialTransactions() {
  // Variable to hold the initial amount paid by the customer for an item.
  let initialPaymentAmount;
  // Array to store the counts of each available coin denomination in the register.
  let availableDenominationsCount;
  // Predefined array of currency unit values (e.g., 10 JPY, 50 JPY, 100 JPY, 500 JPY).
  const currencyUnits = [10, 50, 100, 500];
  // Variable to track the total monetary value currently under consideration or change to be returned.
  let remainingValueToProcess;
  // Temporary variable for holding the number of units to dispense for a given denomination type.
  let numUnitsToDispense;
  // Loop index for iterating through different coin types or denominations.
  let typeIndex;

  // A boolean flag to control the main transaction processing loop.
  // Set to true initially to ensure the loop runs at least once.
  let continueProcessing = true;

  // Main loop: continues as long as the 'continueProcessing' flag is true.
  // It reads and processes pairs of input lines (payment amount, coin counts).
  while (continueProcessing) {
    // Retrieve the next line of input, which should be the initial payment amount.
    const currentInputLine = processedLines.shift(); 
    
    // Check for termination condition: end of input or '0' indicating no more transactions.
    if (currentInputLine === undefined || currentInputLine.trim() === '0') {
      continueProcessing = false; // Set flag to false to stop the loop.
      break; // Exit the loop immediately.
    }

    // Parse the initial payment amount from the current line.
    initialPaymentAmount = parseInt(currentInputLine, 10);
    // Validate the parsed payment amount.
    if (isNaN(initialPaymentAmount) || initialPaymentAmount < 0) {
        console.error(`Invalid or negative initial payment amount detected: "${currentInputLine}". Skipping this transaction.`);
        continue; // Skip to the next iteration if parsing fails or amount is invalid.
    }

    // Retrieve the next line, which contains the counts of available coins.
    const coinCountsLine = processedLines.shift();
    // Validate if the coin counts line is present.
    if (coinCountsLine === undefined) {
        console.error("Missing coin counts line for the current transaction. Terminating processing.");
        continueProcessing = false; // Stop if there's an unexpected end of input.
        break;
    }
    // Parse the coin counts string into an array of numbers using the helper function.
    availableDenominationsCount = parseNumericStringArray(coinCountsLine);

    // Validate if the number of parsed coin types matches the expected number of currency units.
    if (availableDenominationsCount.length !== currencyUnits.length) {
        console.error(`Mismatch in number of coin types provided. Expected ${currencyUnits.length}, got ${availableDenominationsCount.length}. Skipping transaction.`);
        continue; // Skip transaction if coin data is malformed.
    }

    // Calculate the total monetary value of all coins initially available in the register.
    let totalInitialCoinValue = 0;
    for (typeIndex = 0; typeIndex < currencyUnits.length; typeIndex++) {
        totalInitialCoinValue += availableDenominationsCount[typeIndex] * currencyUnits[typeIndex];
    }
    
    // Determine the amount of change that needs to be returned to the customer.
    // This is the difference between the total available value and the payment received.
    remainingValueToProcess = totalInitialCoinValue - initialPaymentAmount;

    // Guard clause: If no change is needed (remainingValueToProcess is zero or negative),
    // we can skip the change dispensing logic.
    if (remainingValueToProcess <= 0) {
        // If negative, it implies the customer underpaid or paid exactly.
        // In this context, it means no change is dispensed, but we still print original coins.
        for (typeIndex = 0; typeIndex < currencyUnits.length; typeIndex++) {
            if (availableDenominationsCount[typeIndex] > 0) {
                // Output the denomination and its count using stdout.write for consistency.
                process.stdout.write(`${currencyUnits[typeIndex]} ${availableDenominationsCount[typeIndex]}\n`);
            }
        }
        process.stdout.write('\n'); // Add a newline separator for output formatting.
        continue; // Move to the next transaction in the loop.
    }

    // Iterate through the coin denominations from largest to smallest.
    // This greedy approach is standard for change-making problems with typical currency systems.
    for (typeIndex = currencyUnits.length - 1; typeIndex >= 0; typeIndex--) {
      const currentUnitValue = currencyUnits[typeIndex]; // Get the value of the current denomination.

      // Calculate how many units of the current denomination can theoretically be dispensed.
      numUnitsToDispense = Math.floor(remainingValueToProcess / currentUnitValue);

      // Ensure we do not dispense more coins than are actually available in the register.
      numUnitsToDispense = Math.min(availableDenominationsCount[typeIndex], numUnitsToDispense);

      // Update the count of available coins after dispensing the calculated number of units.
      availableDenominationsCount[typeIndex] -= numUnitsToDispense;

      // Reduce the total value still needing to be processed by the value of dispensed coins.
      remainingValueToProcess -= numUnitsToDispense * currentUnitValue;
    }

    // After dispensing change, iterate through the remaining coins in the register
    // and print out any denominations that still have a positive count.
    for (typeIndex = 0; typeIndex < currencyUnits.length; typeIndex++) {
      if (availableDenominationsCount[typeIndex] > 0) {
        // Use process.stdout.write for direct stream output, which can be slightly more efficient
        // than console.log in high-volume scenarios, and avoids adding an implicit newline.
        process.stdout.write(`${currencyUnits[typeIndex]} ${availableDenominationsCount[typeIndex]}\n`);
      }
    }
    // Print a blank line to visually separate the output for different transactions.
    process.stdout.write('\n');
  }
}