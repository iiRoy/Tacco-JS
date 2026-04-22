const fileSystemHandler = require('node:fs');

// Define the standard input path for reading data.
// Using '/dev/stdin' is common for competitive programming environments on Linux/macOS.
const inputSourcePath = '/dev/stdin';

// Read the entire content from the standard input synchronously.
// The data is expected to be UTF-8 encoded text.
const rawContentBuffer = fileSystemHandler.readFileSync(inputSourcePath, 'utf8');

// Prepare the list of available coin denominations, ordered from largest to smallest.
// This array facilitates a greedy algorithm for minimum coin calculation.
const availableCoinDenominations = [500, 100, 50, 10, 5, 1];

// Process the raw input:
// 1. Remove any leading or trailing whitespace.
// 2. Split the content into an array of strings, using newline characters as delimiters.
// 3. Filter out any empty string entries that might result from extra newlines.
// 4. Convert each remaining string entry into a numerical value.
const numericInputValues = rawContentBuffer
    .trim()
    .split('\n')
    .filter(lineText => lineText.length > 0)
    .map(Number);

// Iterate through each number provided in the input sequence.
// A `for...of` loop is used for cleaner iteration over array elements.
for (const currentInputValue of numericInputValues) {
    // Check for the termination condition: if the value is 0, stop processing further inputs.
    if (currentInputValue === 0) {
        break;
    }

    // Calculate the target amount for which we need to determine the minimum number of coins.
    // This is typically 1000 minus the current input value in this problem context.
    let requiredChangeAmount = 1000 - currentInputValue;

    // Initialize a counter to keep track of the total number of coins used for the current transaction.
    let totalCoinsCounter = 0;

    // Basic validation: ensure the required change amount is non-negative.
    // If it's negative, it indicates an invalid scenario for this problem, so we log an error and skip.
    if (requiredChangeAmount < 0) {
        console.error(`Invalid input: Calculated change amount (${requiredChangeAmount}) cannot be negative for input ${currentInputValue}.`);
        continue; // Proceed to the next input value.
    }

    // Loop through each denomination to calculate the optimal coin count using a greedy approach.
    for (const denominationValue of availableCoinDenominations) {
        // Determine how many coins of the current denomination can be used.
        // `Math.floor` ensures we only count whole coins.
        const countOfCurrentDenomination = Math.floor(requiredChangeAmount / denominationValue);

        // Add the count of these coins to our running total.
        totalCoinsCounter += countOfCurrentDenomination;

        // Update the remaining amount by taking the modulo with the current denomination value.
        // This effectively removes the value of the coins just counted.
        requiredChangeAmount %= denominationValue;

        // Optimization: If the remaining amount is zero, we've successfully made change
        // using the largest possible denominations, so no need to check smaller ones.
        if (requiredChangeAmount === 0) {
            break;
        }
    }

    // Output the final calculated total number of coins for the current input value.
    console.log(totalCoinsCounter);
}

// Script execution concludes here.