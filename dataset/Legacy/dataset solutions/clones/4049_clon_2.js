// This module defines a function to calculate specific combinations based on input values.

/**
 * Processes a multi-line string input to determine the number of valid combinations.
 * The input string is expected to contain four numeric values, each on a new line.
 * These values represent:
 * - numericValues[0]: Maximum count for the first type of item.
 * - numericValues[1]: Maximum count for the second type of item.
 * - numericValues[2]: Maximum count for the third type of item.
 * - numericValues[3]: Total budget or target sum.
 *
 * The costs for the items are fixed:
 * - First item: 500 units
 * - Second item: 100 units
 * - Third item: 50 units
 *
 * The function counts how many combinations of (firstCoinCount, secondCoinCount, thirdCoinCount)
 * satisfy the following conditions:
 * 1. firstCoinCount <= numericValues[0]
 * 2. secondCoinCount <= numericValues[1]
 * 3. thirdCoinCount <= numericValues[2]
 * 4. 500 * firstCoinCount + 100 * secondCoinCount + 50 * thirdCoinCount === numericValues[3]
 *
 * @param {string} inputLines - The raw string input, with numbers separated by newlines.
 */
function processInput(inputLines) {
    // Convert the input string into an array of numerical values.
    // Each line is parsed as a number.
    let numericValues = inputLines.split("\n").map(lineStr => Number(lineStr));

    // Initialize a counter for the total number of valid combinations found.
    let validCombinationsCount = 0;

    // Outer loop: Iterates through all possible counts for the first item.
    // The loop continues as long as the count does not exceed the available quantity
    // and the total cost of these items does not exceed the overall budget.
    for (let firstCoinCount = 0; firstCoinCount <= Math.min(numericValues[0], numericValues[3] / 500); firstCoinCount++) {
        // Inner loop: Iterates through all possible counts for the second item.
        // The upper limit is constrained by its available quantity and the remaining budget
        // after accounting for the first item's cost.
        for (let secondCoinCount = 0; secondCoinCount <= Math.min(numericValues[1], (numericValues[3] - 500 * firstCoinCount) / 100); secondCoinCount++) {
            // Check if the remaining amount, after purchasing the first two types of items,
            // can be exactly covered by the third type of item (costing 50 units each).
            // Also, ensure that the required number of third items does not exceed its available quantity.
            if ((numericValues[3] - 500 * firstCoinCount - 100 * secondCoinCount) % 50 === 0 &&
                (numericValues[3] - 500 * firstCoinCount - 100 * secondCoinCount) / 50 <= numericValues[2]) {
                // If both conditions are met, increment the counter for valid combinations.
                validCombinationsCount++;
            }
        }
    }

    // Print the final count of valid combinations to the console.
    console.log(validCombinationsCount);
}

// Read the entire content of standard input as a UTF-8 string,
// then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
