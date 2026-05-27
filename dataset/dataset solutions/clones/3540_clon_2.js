process.stdin.resume();
process.stdin.setEncoding('utf8'); // Set the encoding for incoming data

// This array will store all lines read from standard input.
let inputDataRows = [];

// Create an interface for reading lines from standard input and writing to standard output.
const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input received.
inputHandler.on('line', (currentLineText) => {
  inputDataRows.push(currentLineText); // Add the current line to our collection.
});

// Event listener for when the input stream closes.
inputHandler.on('close', () => {
    // Parse the first line to get the total number of items and the initial budget.
    let [itemCount, remainingBudget] = inputDataRows[0].split(" ").map(numericValue => Number(numericValue));

    // Parse the second line, convert values to numbers, and sort them in ascending order.
    const sortedCosts = inputDataRows[1].split(" ").map(numericValue => Number(numericValue)).sort((valA, valB) => valA - valB);

    let successfulPurchases = 0; // Initialize a counter for items purchased.

    // Iterate through the sorted list of costs.
    for (let idx = 0; idx < itemCount; idx++) {
        // If the budget runs out, stop trying to buy more items.
        if (remainingBudget < 0) {
            break;
        }

        // Deduct the cost of the current item from the budget.
        remainingBudget -= sortedCosts[idx];

        // If the budget is still non-negative after purchase, increment the counter.
        if (remainingBudget >= 0) {
            successfulPurchases++;
        }
    }
    // Output the final count of successfully purchased items.
    console.log(successfulPurchases);
});
