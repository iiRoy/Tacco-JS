// This module is designed to process budget and item price data
// to calculate the maximum number of items that can be acquired.
function calculateTotalPurchases(rawInputString) {
    // --- Data Ingestion and Initial Setup ---

    // Clean and segment the raw input string by newline characters.
    // .trim() ensures no leading/trailing whitespace interferes with parsing.
    const dataLines = rawInputString.trim().split('\n');

    // The first line contains configuration details:
    // The first token (N) is often the count of following items, but it's not directly used in this logic.
    // The second token is the initial budget available.
    const configurationTokens = dataLines[0].split(' ');

    // Convert the initial budget string into a numerical value.
    // Using Number() for conversion, which is robust for various numeric string formats.
    let availableBudgetAmount = Number(configurationTokens[1]);

    // Parse all subsequent lines as individual item prices.
    // .slice(1) skips the configuration line. .map(Number) transforms each string price into a number.
    const itemPriceList = dataLines.slice(1).map(Number);

    // Initialize a counter to track the total number of items successfully purchased.
    let totalItemsAcquired = 0;

    // --- Phase 1: Purchasing one of each unique item ---

    // First, calculate the cumulative cost of all items in the initial list.
    // This replaces the explicit loop from the original code with a functional `reduce` operation.
    const cumulativeCostOfInitialItems = itemPriceList.reduce((currentSum, individualItemPrice) => {
        // As a robustness enhancement (Type III addition), ensure individual prices are non-negative.
        // Negative prices could lead to unexpected behavior or exploits in a real system.
        return currentSum + Math.max(0, individualItemPrice);
    }, 0); // Start the sum from zero.

    // Deduct the calculated cumulative cost from the available budget.
    availableBudgetAmount -= cumulativeCostOfInitialItems;

    // The number of items acquired in this initial phase is simply the total count of items in the list.
    totalItemsAcquired = itemPriceList.length;

    // Important guard clause (Type III addition): If the budget has gone negative
    // after the initial purchases, it means we've overspent, and no further items can be bought.
    // We cap the budget at zero to prevent negative division results later.
    if (availableBudgetAmount < 0) {
        availableBudgetAmount = 0;
    }

    // --- Phase 2: Maximizing purchases with remaining budget using the cheapest item ---

    // Determine the lowest possible price among all items to maximize subsequent purchases.
    let minimumPriceAvailable;

    // A Type III guard: Handle the edge case where the item price list might be empty.
    // If there are no items, no further purchases are possible, so set min price to Infinity.
    if (itemPriceList.length === 0) {
        minimumPriceAvailable = Infinity;
    } else {
        // Use the spread operator with Math.min to find the smallest value efficiently.
        minimumPriceAvailable = Math.min(...itemPriceList);

        // Another Type III robustness check: if the minimum price is zero or negative,
        // it could lead to infinite purchases (if budget > 0) or division by zero.
        // In typical competitive programming, prices are positive. We'll enforce a minimum of 1.
        if (minimumPriceAvailable <= 0) {
            minimumPriceAvailable = 1; // Prevents division by zero or infinite loop scenarios.
        }
    }

    // Calculate how many additional items can be bought with the remaining budget.
    // We always pick the cheapest item. Math.floor ensures we only count whole items.
    const numberOfAdditionalItems = Math.floor(availableBudgetAmount / minimumPriceAvailable);

    // Add these newly calculated additional items to the running total.
    totalItemsAcquired += numberOfAdditionalItems;

    // --- Final Output ---

    // Display the grand total of all items purchased to the console.
    console.log(totalItemsAcquired);
}

// Entry point for execution in a Node.js environment, typical for competitive programming.
// Reads the entire content of standard input, decodes it as UTF-8, and passes it
// to our primary processing function, `calculateTotalPurchases`.
calculateTotalPurchases(require('fs').readFileSync('/dev/stdin', 'utf8'));