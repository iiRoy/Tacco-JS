const ITEM_BASE_QUANTITY_IDX = 0;
const ITEM_BASE_PRICE_IDX = 1;
const ITEM_MAX_MULTIPLIER_IDX = 2;
const NUMBER_OF_ITEM_TYPES = 6;

/**
 * Represents a collection of product configurations.
 * Each sub-array defines a product type:
 * [base_quantity, base_price, maximum_units_to_consider]
 * Values are pre-calculated for direct use, maintaining original integer precision.
 */
const productConfigurations = [
    // Product Type 1: (500*3 quantity, 850*3*0.88 price, max 4 units)
    [1500, 2244, 4],
    // Product Type 2: (300*4 quantity, 550*4*0.85 price, max 5 units)
    [1200, 1870, 5],
    // Product Type 3: (200*5 quantity, 380*5*0.8 price, max 6 units)
    [1000, 1520, 6],
    // Product Type 4: (500 quantity, 850 price, max 11 units)
    [500, 850, 11],
    // Product Type 5: (300 quantity, 550 price, max 17 units)
    [300, 550, 17],
    // Product Type 6: (200 quantity, 380 price, max 26 units)
    [200, 380, 26]
];

/**
 * Calculates the minimum possible cost to achieve a specific target quantity
 * by combining different product types. This uses a brute-force approach
 * checking all possible combinations within defined limits.
 * @param {number} desiredQuantity - The target total quantity to achieve.
 * @returns {number} The lowest price found for the desired quantity,
 *                   -1 if no combination matches, or -2 if input is invalid.
 */
const determineOptimalPrice = (desiredQuantity) => {
    // Basic input validation: ensure desiredQuantity is a positive integer.
    if (typeof desiredQuantity !== 'number' || desiredQuantity <= 0 || !Number.isInteger(desiredQuantity)) {
        console.error(`Error: Invalid desired quantity provided: ${desiredQuantity}. Must be a positive integer.`);
        return -2; // Indicate an error due to invalid input type/value.
    }

    // Initialize the minimum price found to a very large value.
    // Using Number.MAX_SAFE_INTEGER ensures any valid calculated price will be smaller.
    let lowestAchievedPrice = Number.MAX_SAFE_INTEGER;

    // This array stores the current number of units selected for each product type
    // during the combinatorial exploration. It's equivalent to the original 'index' array.
    const currentUnitSelections = new Array(NUMBER_OF_ITEM_TYPES).fill(0);

    /**
     * Recursively explores all possible combinations of product units to find
     * the one that matches the desired quantity with the minimum price.
     * This function effectively replaces the original code's deeply nested for-loops,
     * offering a more structured approach for combinatorial iteration.
     * @param {number} itemIndex - The index of the current product type being considered (from 0 up to NUMBER_OF_ITEM_TYPES - 1).
     */
    const exploreCombinationsRecursively = (itemIndex) => {
        // Base Case: If we have assigned units for all product types (i.e., itemIndex has reached NUMBER_OF_ITEM_TYPES),
        // we have a complete combination. Now, calculate its total quantity and price.
        if (itemIndex === NUMBER_OF_ITEM_TYPES) {
            let currentTotalQuantity = 0;
            let currentCalculatedPrice = 0;

            // Iterate through the current selection of units for each product type
            // to sum up the total quantity and price for this specific combination.
            for (let i = 0; i < NUMBER_OF_ITEM_TYPES; i++) {
                const selectedUnits = currentUnitSelections[i];
                const config = productConfigurations[i];
                currentTotalQuantity += selectedUnits * config[ITEM_BASE_QUANTITY_IDX];
                currentCalculatedPrice += selectedUnits * config[ITEM_BASE_PRICE_IDX];
            }

            // If this combination's total quantity matches the target desired quantity,
            // update the overall minimum price found so far.
            if (currentTotalQuantity === desiredQuantity) {
                lowestAchievedPrice = Math.min(currentCalculatedPrice, lowestAchievedPrice);
            }
            return; // End of this recursive path; backtrack to explore other options.
        }

        // Recursive Step: Iterate through all possible unit counts for the current product type.
        // The number of units can range from 0 up to the maximum allowed for this product type.
        const maxUnitsForThisItem = productConfigurations[itemIndex][ITEM_MAX_MULTIPLIER_IDX];
        for (let units = 0; units <= maxUnitsForThisItem; units++) {
            currentUnitSelections[itemIndex] = units; // Assign the current number of units for this item.
            // Recurse to consider the next product type (itemIndex + 1).
            exploreCombinationsRecursively(itemIndex + 1);
        }
    };

    // Initiate the recursive search process starting from the first product type (index 0).
    exploreCombinationsRecursively(0);

    // After exploring all combinations, return the lowest price found.
    // If no combination was found that matched the desired quantity, lowestAchievedPrice
    // will still be its initial value of Number.MAX_SAFE_INTEGER. In this scenario,
    // return -1 to explicitly indicate "no solution found".
    return lowestAchievedPrice === Number.MAX_SAFE_INTEGER ? -1 : lowestAchievedPrice;
};

// Array to hold all non-empty, trimmed lines read from standard input.
const receivedInputValues = [];

// Configure standard input stream to resume operations and use UTF-8 encoding.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received on standard input.
process.stdin.on('data', (dataChunk) => {
    // Process the incoming data chunk:
    // 1. Trim leading/trailing whitespace from the entire chunk.
    // 2. Split the chunk into individual lines.
    // 3. Filter out any lines that are empty after trimming.
    // 4. For each valid line, push it into our `receivedInputValues` array.
    dataChunk.trim().split('\n')
        .filter(line => line.trim().length > 0)
        .forEach((singleLineText) => {
            receivedInputValues.push(singleLineText);
        });
});

// Event listener for when the standard input stream ends (e.g., user presses Ctrl+D or input pipe closes).
process.stdin.on('end', () => {
    // Iterate through each collected input line to process it.
    for (const rawLine of receivedInputValues) {
        // Attempt to parse the line into an integer, explicitly specifying radix 10 for reliability.
        const targetAmount = parseInt(rawLine.trim(), 10);

        // Guard clause: Check if the parsed value is a valid number.
        if (isNaN(targetAmount)) {
            console.error(`Skipping invalid input: "${rawLine}" could not be parsed as a number.`);
            continue; // Skip to the next input line if this one is invalid.
        }

        // Specific termination condition: If the input is '0', stop processing all further inputs.
        // This behavior precisely matches the original code's requirement.
        if (targetAmount === 0) {
            console.log("Input processing halted due to '0' encountered.");
            return; // Exit the 'end' event handler callback entirely.
        }

        // Call the main calculation function for the current target quantity.
        const resultPrice = determineOptimalPrice(targetAmount);

        // Output the result with enhanced clarity based on the returned price.
        if (resultPrice === -1) {
            console.log(`Desired quantity ${targetAmount}: No valid combination found.`);
        } else if (resultPrice === -2) {
            // Error message for invalid input was already logged by determineOptimalPrice.
            // No further action needed here to avoid redundant or confusing output.
        } else {
            // Display the minimum price, formatted to two decimal places for consistency.
            console.log(`Desired quantity ${targetAmount}: Minimum price is ${resultPrice.toFixed(2)}.`);
        }
    }
});

// Global error handling for unhandled exceptions and promise rejections.
// These are new fragments added for increased application robustness and debugging insight.
process.on('uncaughtException', (err) => {
    console.error('An unhandled exception occurred:', err.message);
    // Optionally, log the full stack trace for detailed debugging: console.error(err.stack);
    process.exit(1); // Exit with a non-zero status code to indicate an error.
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('An unhandled promise rejection occurred:', reason, 'Promise:', promise);
    process.exit(1);
});