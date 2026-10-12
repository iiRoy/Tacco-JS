const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the raw input: remove leading/trailing whitespace,
// split into lines, and convert each line to a number.
let numericValues = rawData.trim().split("\n").map(Number);

// Declare variables for counting denominations.
// These variables are intentionally declared outside the loop
// to mimic the original code's implicit global scope for 'a', 'c', 'e',
// which means they retain their values across iterations if not reassigned.
let fiveHundredCount;
let oneHundredCount;
let fiftyCount;
let tenCount;
let fiveCount;

// Iterate through each numerical entry in the collection.
for (let idx = 0; idx < numericValues.length; idx++) {
    // Retrieve the current numerical value for processing.
    let currentAmount = numericValues[idx];

    // If the current value is zero, terminate the processing loop.
    if (currentAmount === 0) {
        break;
    }

    // Calculate the difference from 1000.
    currentAmount = 1000 - currentAmount;

    // Check if a 500-unit denomination is needed.
    // If the condition is not met, 'fiveHundredCount' retains its previous value.
    if (currentAmount >= 500) {
        fiveHundredCount = 1;
        currentAmount = currentAmount - 500;
    }

    // Determine the count of 100-unit denominations.
    // This variable is always explicitly assigned in each iteration.
    oneHundredCount = Math.floor(currentAmount / 100);
    currentAmount = currentAmount % 100;

    // Check if a 50-unit denomination is needed.
    // If the condition is not met, 'fiftyCount' retains its previous value.
    if (currentAmount >= 50) {
        fiftyCount = 1;
        currentAmount = currentAmount - 50;
    }

    // Determine the count of 10-unit denominations.
    // This variable is always explicitly assigned in each iteration.
    tenCount = Math.floor(currentAmount / 10);
    currentAmount = currentAmount % 10;

    // Check if a 5-unit denomination is needed.
    // If the condition is not met, 'fiveCount' retains its previous value.
    if (currentAmount >= 5) {
        fiveCount = 1;
        currentAmount = currentAmount - 5;
    }

    // Output the sum of all denomination counts plus any remaining amount.
    // Note: If 'fiveHundredCount', 'fiftyCount', or 'fiveCount' were never assigned
    // (e.g., in the first iteration where their conditions were false),
    // they will be 'undefined', leading to a 'NaN' result in the sum,
    // which matches the original code's behavior.
    console.log(fiveHundredCount + oneHundredCount + fiftyCount + tenCount + fiveCount + currentAmount);
}
