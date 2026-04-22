/**
 * This module processes a dataset from standard input to determine a total count based on budget constraints.
 * It reads initial configuration, item values, calculates a sum, sorts values, and computes a final total.
 */

/**
 * A utility function to safely convert a string to a numeric value.
 * It also trims any leading/trailing whitespace from the input string.
 *
 * @param {string} valueAsString - The string representation of a number.
 * @returns {number} The parsed numeric value, or NaN if parsing fails.
 */
const parseNumericString = (valueAsString) => {
    // Ensure the string is clean before attempting conversion.
    const trimmedString = valueAsString.trim();
    return Number(trimmedString);
};

/**
 * The primary function responsible for executing the data processing logic.
 * It takes an array of strings, where each string represents a line from the input.
 *
 * @param {string[]} rawInputLines - An array where each element is a line of text from the input source.
 * @returns {void} This function prints the final result to the console and does not return a value.
 */
function processInputDataset(rawInputLines) {
    // --- Type III Addition: Robust input validation and early exit conditions ---
    if (!rawInputLines || rawInputLines.length === 0) {
        console.error("Execution Error: No input data provided. Please ensure the input stream is not empty.");
        return;
    }

    // The first line of input contains two crucial configuration numbers:
    // the count of subsequent items and the initial budget.
    const configurationElements = rawInputLines[0].split(' ');

    if (configurationElements.length < 2) {
        console.error("Configuration Error: The first line of input must contain at least two space-separated numbers.");
        return;
    }

    // --- Type II Renaming: N -> initialItemQuantity, X -> availableFinancialAllowance ---
    // Extract and parse the initial item count and the total budget from the first line.
    const initialItemQuantity = parseNumericString(configurationElements[0]);
    let availableFinancialAllowance = parseNumericString(configurationElements[1]);

    // Validate the parsed initial configuration values.
    if (isNaN(initialItemQuantity) || initialItemQuantity < 0 || isNaN(availableFinancialAllowance)) {
        console.error("Validation Error: Initial item quantity or financial allowance is not a valid non-negative number.");
        return;
    }

    // --- Type II Renaming: list -> individualItemCosts, sum -> cumulativeExpenditure ---
    // Initialize a collection to hold the parsed costs of individual items
    // and a variable to track their running total.
    const individualItemCosts = [];
    let cumulativeExpenditure = 0;

    // --- Type III Update: Refactored loop with explicit indexing and enhanced validation ---
    // Iterate through the input lines, starting from the second line (index 1),
    // up to the number of initial items specified.
    for (let currentLinePointer = 0; currentLinePointer < initialItemQuantity; ++currentLinePointer) {
        const dataLineIndex = currentLinePointer + 1; // Adjust for 0-based array and 1-based data lines

        if (dataLineIndex >= rawInputLines.length) {
            console.error(`Data Error: Expected ${initialItemQuantity} item lines, but input ended prematurely at line ${dataLineIndex}.`);
            return;
        }

        const currentItemCostString = rawInputLines[dataLineIndex];
        const parsedCostValue = parseNumericString(currentItemCostString);

        if (isNaN(parsedCostValue) || parsedCostValue < 0) {
            console.error(`Parsing Error: Item cost '${currentItemCostString}' on line ${dataLineIndex} is not a valid non-negative number.`);
            return;
        }

        cumulativeExpenditure += parsedCostValue;
        individualItemCosts.push(parsedCostValue);
    }

    // --- Type III Addition: Guard clause for empty item collection if expected ---
    if (initialItemQuantity > 0 && individualItemCosts.length === 0) {
        console.error("Processing Error: No item costs were collected despite a positive initial item quantity.");
        return;
    }

    // --- Type II Comment Change & Renaming: a, b -> costA, costB ---
    // Sort the collected item costs in ascending order to easily identify the minimum cost.
    individualItemCosts.sort((costA, costB) => costA - costB);

    // --- Type III Update: Introduce intermediate variable for budget adjustment ---
    // Deduct the total cost of the initial items from the available budget.
    const budgetAfterInitialPurchase = availableFinancialAllowance - cumulativeExpenditure;
    availableFinancialAllowance = budgetAfterInitialPurchase; // Update the mutable budget variable

    // --- Type III Addition: Handle edge cases for item availability and cost ---
    let additionalItemsPurchasable = 0;
    const lowestUnitCost = individualItemCosts[0]; // The cheapest item available

    if (initialItemQuantity === 0) {
        // If there were no initial items, and thus individualItemCosts is empty,
        // we can't determine lowestUnitCost from `individualItemCosts[0]`.
        // This scenario implies 0 total items if budget > 0 but no items to buy, or 0 if N was 0.
        console.log(0);
        return;
    }

    if (lowestUnitCost === undefined || lowestUnitCost <= 0) {
        // This covers cases where individualItemCosts might be unexpectedly empty (though guarded above),
        // or where the cheapest item costs zero or less (which is problematic for division).
        if (availableFinancialAllowance > 0 && lowestUnitCost === 0) {
            // If budget is positive and item costs zero, this implies infinite purchases.
            // As a practical output, we might cap or signal this. For this problem's context,
            // it's usually assumed costs are positive. Let's output only initial items if this occurs.
            console.warn("Warning: Smallest item cost is zero, implying infinite purchases if budget is positive. Only counting initial items.");
            console.log(initialItemQuantity);
            return;
        } else {
            // If cheapest item is non-positive and budget is not positive, no additional items.
            additionalItemsPurchasable = 0;
        }
    } else {
        // If there's remaining budget and the cheapest item has a positive cost,
        // calculate how many more items can be bought.
        if (availableFinancialAllowance > 0) {
            additionalItemsPurchasable = Math.floor(availableFinancialAllowance / lowestUnitCost);
        } else {
            // If budget is zero or negative, no additional items can be purchased.
            additionalItemsPurchasable = 0;
        }
    }

    // --- Type III Update: Break down the final calculation into a clearer sequence ---
    // The total count is the sum of the initially present items and any additional items purchased.
    const finalComputedTotalCount = initialItemQuantity + additionalItemsPurchasable;

    // Display the final calculated total count to standard output.
    console.log(finalComputedTotalCount);
}

// --- Type II Formatting & Commenting: Caller function ---
// Read the entire standard input asynchronously, decode it as UTF-8,
// remove any leading/trailing whitespace from the whole input,
// and then split it into an array of strings based on newline characters.
// This prepared array is then passed to our main processing function.
processInputDataset(
    require('fs')
        .readFileSync('/dev/stdin', 'utf8')
        .trim()
        .split('\n')
);