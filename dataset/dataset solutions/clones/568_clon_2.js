var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split by newlines, and convert each part to a number.
var numericValues = (rawData.trim()).split("\n").map(Number);

// Iterate through each numerical entry in the processed array.
for (var idx = 0; idx < numericValues.length; idx++) {
    // Get the current amount from the array for processing.
    var currentAmount = numericValues[idx];

    // Initialize a counter for the total number of coins/bills.
    var totalCoins = 0;

    // If the current amount is zero, it signifies the end of input, so break the loop.
    if (currentAmount === 0) {
        break;
    }

    // Calculate the change needed from 1000.
    currentAmount = 1000 - currentAmount;

    // Check for 500-unit denominations.
    if (currentAmount >= 500) {
        totalCoins++;
        currentAmount = currentAmount - 500;
    }

    // Add the count of 100-unit denominations.
    totalCoins += Math.floor(currentAmount / 100);
    currentAmount = currentAmount % 100; // Update remaining amount.

    // Check for 50-unit denominations.
    if (currentAmount >= 50) {
        totalCoins++;
        currentAmount = currentAmount - 50;
    }

    // Add the count of 10-unit denominations.
    totalCoins += Math.floor(currentAmount / 10);
    currentAmount = currentAmount % 10; // Update remaining amount.

    // Check for 5-unit denominations.
    if (currentAmount >= 5) {
        totalCoins++;
        currentAmount = currentAmount - 5;
    }

    // The remaining 'currentAmount' represents 1-unit denominations.
    // Add these to the total count and print the final sum for the current input.
    console.log(totalCoins + currentAmount);
}
