// Import the Node.js file system module for input handling.
const fileSystem = require('fs');

// Define the standard input path where the program will read its data.
const standardInputPath = '/dev/stdin';

// Specify the character encoding to use when reading the file.
const textEncoding = 'utf8';

// Read the raw input data from the specified path.
// This block is responsible for fetching all input at once.
let rawInputData = fileSystem.readFileSync(standardInputPath, textEncoding);

// Process the raw input: first, trim any leading/trailing whitespace,
// then split the entire string into an array of individual lines.
let inputLineBuffer = rawInputData.trim().split('\n');

// Declare an array to hold the monetary denominations in ascending order.
// This makes the code more readable and maintainable than hardcoding values.
const currencyDenominations = [10, 50, 100, 500];

// Initiate the main processing loop. This loop continues indefinitely
// until a specific termination condition (itemTransactionCost === 0) is met.
while (true) {
    // Attempt to parse the first line from the buffer as the cost of the item.
    // The `shift()` method removes the first element (line) from the array and returns it.
    // `parseInt(..., 10)` is used to ensure the string is converted to an integer in base 10.
    let itemTransactionCost = parseInt(inputLineBuffer.shift(), 10);

    // This is the termination condition for the loop. If the parsed cost is 0,
    // it signals the end of input data, and the program should exit the loop.
    if (itemTransactionCost === 0) {
        break;
    }

    // --- Type III Addition: Input Validation ---
    // Add a basic validation check for the transaction cost.
    // If it's not a valid number (NaN) or is negative, it's considered invalid.
    // In such cases, an error is logged, and the current iteration is skipped,
    // ensuring that the input buffer remains aligned for the next valid entry.
    if (isNaN(itemTransactionCost) || itemTransactionCost < 0) {
        console.error("Error: Invalid item transaction cost detected. Skipping this entry.");
        // Consume the next line which would be coin counts, to avoid misaligning future inputs.
        if (inputLineBuffer.length > 0) {
            inputLineBuffer.shift();
        }
        continue; // Move to the next iteration of the main loop.
    }
    // --- End Type III Addition ---


    // Parse the next line, which is expected to contain the customer's coin counts.
    // The line is split by spaces, and each resulting string segment is converted to an integer.
    let customerProvidedCoinCounts = inputLineBuffer.shift().split(' ').map(val => parseInt(val, 10));

    // Calculate the total monetary value provided by the customer based on their coin counts.
    // This uses a loop for clarity and flexibility, iterating through denominations.
    let totalPaidAmount = 0;
    for (let i = 0; i < currencyDenominations.length; i++) {
        totalPaidAmount += currencyDenominations[i] * customerProvidedCoinCounts[i];
    }

    // Determine the exact amount of change that needs to be returned to the customer.
    let changeAmountDue = totalPaidAmount - itemTransactionCost;

    // Initialize an array to keep track of the counts of each coin denomination
    // that should be returned as change. It mirrors the structure of customerProvidedCoinCounts.
    let changeCoinBreakdown = [0, 0, 0, 0];

    // --- Greedy algorithm for calculating the change breakdown ---
    // This section applies a greedy approach to determine the minimum number of coins
    // of each denomination needed to make up the changeAmountDue, starting from the largest.

    // Process 500-yen coins (index 3 in currencyDenominations)
    while (changeAmountDue >= currencyDenominations[3]) {
        changeCoinBreakdown[3]++;
        changeAmountDue -= currencyDenominations[3];
    }
    // Process 100-yen coins (index 2)
    while (changeAmountDue >= currencyDenominations[2]) {
        changeCoinBreakdown[2]++;
        changeAmountDue -= currencyDenominations[2];
    }
    // Process 50-yen coins (index 1)
    while (changeAmountDue >= currencyDenominations[1]) {
        changeCoinBreakdown[1]++;
        changeAmountDue -= currencyDenominations[1];
    }
    // Process 10-yen coins (index 0)
    while (changeAmountDue >= currencyDenominations[0]) {
        changeCoinBreakdown[0]++;
        changeAmountDue -= currencyDenominations[0];
    }
    // --- End of greedy change algorithm ---


    // Prepare an empty string that will accumulate the final output message.
    let outputResultString = '';

    // Iterate through the customer's initial coin counts using `entries()`
    // to get both the index (`idx`) and the count (`initialCount`) for each denomination.
    for (const [idx, initialCount] of customerProvidedCoinCounts.entries()) {
        const returnedCount = changeCoinBreakdown[idx];

        // Compare the number of coins of a specific denomination the customer gave
        // versus the number of coins of that same denomination returned as change.
        // If the customer gave more than they received back for a specific coin type,
        // it means they overpaid with that coin, and this difference should be noted.
        if (initialCount > returnedCount) {
            // Append a line to the output string using a template literal for readability.
            // This line shows the denomination value and the quantity of that coin
            // that the customer effectively "paid" with (initial - returned).
            outputResultString += `${currencyDenominations[idx]} ${initialCount - returnedCount}\n`;
        }
    }

    // Print the final accumulated output string to the console.
    // `.trim()` is used to remove any trailing newline characters if present,
    // ensuring clean output, especially for the last entry.
    console.log(outputResultString.trim());
}