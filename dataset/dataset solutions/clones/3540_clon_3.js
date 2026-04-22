/*
 * This script is designed to process standard input for a specific problem.
 * It utilizes Node.js's 'readline' module to handle line-by-line input.
 * The core functionality involves selecting items with the lowest costs
 * until a given budget is exhausted, and then reporting the total number of items selected.
 */

// Resume the standard input stream to prevent the process from exiting.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// An array to store all received input lines.
const capturedInputSegments = [];

// Instantiate a readline interface manager to handle incoming data.
const inputFlowManager = require('readline').createInterface({
  input: process.stdin, // Direct input from standard input channel.
  output: process.stdout // Direct output to standard output channel (though not used for prompts here).
});

// Event listener for each new line received from the input stream.
inputFlowManager.on('line', (currentInputLine) => {
  // Add the current line to our buffer of captured segments.
  capturedInputSegments.push(currentInputLine);
});

// Event listener triggered when the input stream closes (e.g., EOF).
inputFlowManager.on('close', () => {
    // Ensure we have at least two lines of input for processing.
    if (capturedInputSegments.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines.");
        process.exit(1); // Exit with an error code.
    }

    // --- Parse the initial configuration line ---
    // The first line contains two space-separated numbers:
    // the total count of items (which might not be strictly used for iteration bounds)
    // and the initial budget available.
    const initialParametersString = capturedInputSegments[0];
    const parsedInitialValues = initialParametersString.split(" ").map(valStr => parseInt(valStr, 10));

    // Store the total item count (conceptually 'N', though array length will be used for iteration).
    const conceptualTotalItems = parsedInitialValues[0];
    // Store the available budget. This value will be decremented.
    let currentAvailableBudget = parsedInitialValues[1];

    // Initialize a counter for successfully selected items.
    let eligibleSelectionsCount = 0;

    // A preliminary check: if the budget is already non-positive, no items can be selected.
    if (currentAvailableBudget <= 0) {
        process.stdout.write(eligibleSelectionsCount.toString() + '\n');
        return; // Exit early as no items can be bought.
    }

    // --- Parse and prepare the item costs ---
    // The second line contains a space-separated list of item costs.
    const rawItemCostStrings = capturedInputSegments[1].split(" ");
    // Convert string costs to numbers and sort them in ascending order.
    // Sorting ensures we always pick the cheapest available items first, maximizing selections.
    const sortedItemExpenses = rawItemCostStrings.map(costString => Number(costString)).sort((costA, costB) => costA - costB);

    // Iterate through the sorted list of item expenses.
    // We use the actual length of the sorted array for iteration.
    for (let itemOrdinal = 0; itemOrdinal < sortedItemExpenses.length; ++itemOrdinal) {
        const individualItemExpense = sortedItemExpenses[itemOrdinal];

        // Check if the current budget is sufficient to purchase this item.
        // If not, since the items are sorted by cost, we cannot afford any subsequent (more expensive) items either.
        if (currentAvailableBudget >= individualItemExpense) {
            // Deduct the item's cost from the budget.
            currentAvailableBudget -= individualItemExpense;
            // Increment the counter for successfully selected items.
            eligibleSelectionsCount++;
        } else {
            // If the budget is insufficient, break the loop as no more items can be bought.
            break;
        }
    }

    // Output the final count of items that were successfully selected.
    process.stdout.write(eligibleSelectionsCount.toString() + '\n');
});