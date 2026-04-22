'use strict'; // Enforce strict mode for cleaner code practices.

/**
 * Computes the standard baseline cost for a single item, assuming it's processed individually.
 * This cost consists of a fixed multiplier for the item's value plus a doubled global modifier.
 * @param {number} itemValueData - The specific numeric value associated with the item.
 * @param {number} globalModifierConstant - The global modifier value (akin to 'X' in original problem).
 * @returns {number} The calculated individual processing expense.
 */
const computeIndividualProcessingExpense = (itemValueData, globalModifierConstant) => {
    // The item's inherent value is weighted by 5, and the global modifier contributes twice.
    const itemWeightComponent = 5 * itemValueData;
    const modifierContribution = 2 * globalModifierConstant;
    return itemWeightComponent + modifierContribution;
};

/**
 * Determines the special grouped cost for an item, applicable when it's part of a sequential group.
 * The cost depends on its 'distance' from the group's anchor item.
 * @param {number} itemValueData - The numeric value of the item being considered for grouping.
 * @param {number} globalModifierConstant - The global modifier value.
 * @param {number} groupDistanceMetric - The 'k' value, indicating how many positions away this item is from the group's rightmost element.
 * @returns {number} The calculated expense if this item is processed as part of a group.
 */
const calculateGroupedProcessingExpense = (itemValueData, globalModifierConstant, groupDistanceMetric) => {
    // The multiplier for the item's value increases with its distance within the group.
    // The formula (2k + 3) * itemValue + X is applied.
    const dynamicItemMultiplier = (2 * groupDistanceMetric) + 3;
    const weightedItemPart = dynamicItemMultiplier * itemValueData;
    return weightedItemPart + globalModifierConstant;
};

/**
 * The primary routine that processes raw input data to determine a cumulative expense.
 * It employs a greedy, right-to-left grouping algorithm to minimize total cost.
 * @param {string} rawInputStringData - The complete string input, expected to be newline-separated.
 */
const processCumulativeExpenseCalculation = (rawInputStringData) => {
    // Divide the entire input string into an array of individual lines.
    const parsedInputLines = rawInputStringData.split('\n');

    // Initial validation: Ensure at least two lines are present for configuration and data.
    if (parsedInputLines.length < 2) {
        console.error("ERROR: Input data is incomplete. Expected at least two lines.");
        return; // Terminate execution if input format is critically flawed.
    }

    // Extract and parse the first line, which contains global configuration parameters.
    const configurationParameters = parsedInputLines[0].split(' ');
    // Validate the number of configuration parts.
    if (configurationParameters.length < 2) {
        console.error("ERROR: Configuration line malformed. Requires item count and global modifier.");
        return;
    }

    // Convert string-based configuration values into numbers using the unary plus operator.
    const declaredItemQuantity = +configurationParameters[0];
    const systemGlobalModifier = +configurationParameters[1];

    // Further validation: Check if parsed numbers are valid and sensible.
    if (isNaN(declaredItemQuantity) || isNaN(systemGlobalModifier) || declaredItemQuantity <= 0) {
        console.error("ERROR: Invalid numeric values for declared item quantity or global modifier.");
        return;
    }

    // Process the second line to obtain the actual item values.
    // Filter out potential empty strings from multiple spaces and convert to numbers.
    const rawItemValueStrings = parsedInputLines[1].split(' ').filter(s => s !== '');
    const numericItemValues = rawItemValueStrings.map(Number);

    // Validate that the number of provided items matches the declared quantity.
    if (numericItemValues.length < declaredItemQuantity) {
        console.error(`ERROR: Actual items provided (${numericItemValues.length}) are fewer than declared (${declaredItemQuantity}).`);
        return;
    }
    // Use only the exact number of items declared, ignoring any excess.
    const effectiveItemValueArray = numericItemValues.slice(0, declaredItemQuantity);

    let totalCumulativeExpense = 0; // Accumulator for the final calculated expense.
    // Start processing from the rightmost item (last index) and move leftwards.
    let currentProcessingPosition = declaredItemQuantity - 1;

    // Main processing loop: Iterates through the items from right to left.
    while (currentProcessingPosition >= 0) {
        // The current (rightmost) item of any new group always incurs its individual cost first.
        const rightmostGroupItemValue = effectiveItemValueArray[currentProcessingPosition];
        totalCumulativeExpense += computeIndividualProcessingExpense(rightmostGroupItemValue, systemGlobalModifier);

        let groupLengthOffset = 1; // This tracks how many items *before* the current one are grouped.
        let continueInnerGroupingPhase = true; // Flag to control the inner grouping decision loop.

        // Inner loop: Attempts to extend the current group by including preceding items.
        while (continueInnerGroupingPhase && (currentProcessingPosition - groupLengthOffset >= 0)) {
            const precedingItemAbsoluteIndex = currentProcessingPosition - groupLengthOffset;
            const precedingItemData = effectiveItemValueArray[precedingItemAbsoluteIndex];

            // Calculate the expense for the preceding item under two conditions:
            // 1. If it were processed as a standalone individual item.
            const individualItemScenarioCost = computeIndividualProcessingExpense(precedingItemData, systemGlobalModifier);
            // 2. If it were processed as part of the current group.
            const groupedItemScenarioCost = calculateGroupedProcessingExpense(precedingItemData, systemGlobalModifier, groupLengthOffset);

            // Decision logic: Compare the two scenarios.
            // Grouping is preferred if its cost is less than or equal to the individual cost.
            const isGroupOptionMoreEconomical = (groupedItemScenarioCost <= individualItemScenarioCost);

            if (isGroupOptionMoreEconomical) {
                // If grouping is beneficial, add its cost and try to extend the group further.
                totalCumulativeExpense += groupedItemScenarioCost;
                groupLengthOffset++;
            } else {
                // If the individual cost is cheaper, cease grouping for this sequence.
                continueInnerGroupingPhase = false; // Exit the inner loop.
            }
        }
        // Advance the main processing position by the total number of items just grouped (including the anchor).
        currentProcessingPosition -= groupLengthOffset;
    }

    // Output the final accumulated expense to the console.
    console.log(totalCumulativeExpense);
};

// --- Program Execution Control ---

const isDevelopmentEnvironment = false; // Set to 'true' for testing with predefined inputs, 'false' for live input.

// Execute the main processing function based on the environment flag.
if (isDevelopmentEnvironment) {
    // Displaying various test cases for verification and debugging.
    console.log("--- Executing Test Case 1 ---");
    processCumulativeExpenseCalculation('2 100\n1 10');
    console.log("--- Executing Test Case 2 ---");
    processCumulativeExpenseCalculation('5 1\n1 999999997 999999998 999999999 1000000000');
    console.log("--- Executing Test Case 3 ---");
    processCumulativeExpenseCalculation('10 8851025\n38 87 668 3175 22601 65499 90236 790604 4290609 4894746');
    console.log("--- Executing Test Case 4 ---");
    processCumulativeExpenseCalculation('16 10\n1 7 12 27 52 75 731 13856 395504 534840 1276551 2356789 9384806 19108104 82684732 535447408');
    // Test cases for input validation.
    console.log("--- Executing Test Case 5 (Validation: Incomplete Items) ---");
    processCumulativeExpenseCalculation('3 50\n1 2');
    console.log("--- Executing Test Case 6 (Validation: Non-numeric Config) ---");
    processCumulativeExpenseCalculation('A 100\n1 2');
    console.log("--- Executing Test Case 7 (Validation: Missing Modifier) ---");
    processCumulativeExpenseCalculation('2\n1 2');
} else {
    // In a production-like environment, read input from standard input stream.
    // This typically requires a Node.js runtime environment with 'fs' module access.
    try {
        const fileSystemModule = require('fs');
        const standardInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        processCumulativeExpenseCalculation(standardInputBuffer);
    } catch (ioError) {
        console.error("An error occurred while reading from /dev/stdin:", ioError.message);
        console.error("Please ensure the script is run in a Node.js environment with proper file system access.");
    }
}