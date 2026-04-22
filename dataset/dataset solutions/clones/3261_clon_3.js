"use strict"; // Enforcing strict mode for cleaner code practices

/**
 * Parses a line of space-separated numbers into an array of integers.
 * @param {string | string[]} inputLine - The line string or an array of strings to parse.
 * @returns {number[]} An array of parsed integers.
 */
const parseNumbersFromLine = (inputLine) => {
    // If input is already an array, use it directly; otherwise, split by whitespace.
    return (Array.isArray(inputLine) ? inputLine : inputLine.split(/\s+/)).map(numericStr => {
        // Ensure conversion to integer, handling potential non-numeric inputs gracefully.
        const parsed = parseInt(numericStr, 10);
        if (isNaN(parsed)) {
            throw new Error(`Invalid number encountered: "${numericStr}"`);
        }
        return parsed;
    });
};

/**
 * Generator function to produce a sequence of integers from a starting point up to (but not including) an end point.
 * @param {number} begin - The starting integer (inclusive).
 * @param {number} finish - The ending integer (exclusive).
 * @yields {number} Each integer in the sequence.
 */
function* sequenceGenerator(begin, finish) {
    for (let idx = begin; idx < finish; idx++) {
        yield idx;
    }
}

/**
 * Calculates the total score based on accumulated deliciousness and the count of unique types.
 * The score is defined as the sum of deliciousness plus the square of the unique type count.
 * @param {number} deliciousnessSum - The sum of deliciousness values of selected items.
 * @param {number} uniqueTypesCount - The number of unique types among selected items.
 * @returns {number} The calculated total score.
 */
const computeTotalValue = (deliciousnessSum, uniqueTypesCount) => {
    return deliciousnessSum + (uniqueTypesCount * uniqueTypesCount);
};

/**
 * Main function to solve the sushi selection problem.
 * It aims to maximize a score based on selected sushi items' deliciousness and type diversity.
 * @param {string} rawInputString - The entire input data as a single string.
 */
function optimizeSushiSelection(rawInputString) {
    // Basic validation for input data
    if (!rawInputString || rawInputString.trim() === '') {
        console.error("Input data is empty or invalid. Cannot proceed with sushi selection.");
        return;
    }

    const inputLines = rawInputString.split('\n');

    // Parse the first line for total item count and selection limit
    const [totalSushiItems, maxSelections] = parseNumbersFromLine(inputLines[0]);

    // Validate parsed N and K values
    if (totalSushiItems <= 0 || maxSelections <= 0 || maxSelections > totalSushiItems) {
        console.error(`Invalid item counts: Total=${totalSushiItems}, Limit=${maxSelections}. Exiting.`);
        return;
    }

    // Process each sushi item from the input lines
    const sushiItemsDetailed = inputLines.slice(1, totalSushiItems + 1).map((itemLine, originalIdx) => {
        const [typeId, deliciousness] = parseNumbersFromLine(itemLine);
        return {
            typeId,         // Categorical identifier for the sushi type
            deliciousness,  // Numerical value representing how tasty it is
            originalIdx     // Keep track of the item's initial position
        };
    });

    // Sort items primarily by type ID, then by deliciousness in descending order.
    // This helps in easily picking the most delicious item for each type later.
    sushiItemsDetailed.sort((itemA, itemB) => {
        if (itemA.typeId < itemB.typeId) return -1;
        if (itemA.typeId > itemB.typeId) return 1;
        return itemB.deliciousness - itemA.deliciousness; // Descending deliciousness
    });

    // Create a separate list sorted purely by deliciousness in descending order.
    // This is used for picking additional items or replacements based on pure deliciousness.
    const itemsSortedByDeliciousness = Array.from(sushiItemsDetailed).sort((itemA, itemB) => {
        return itemB.deliciousness - itemA.deliciousness; // Descending deliciousness
    });

    // Group sushi items by their typeId. Each group will contain items of that specific type,
    // sorted by deliciousness (due to `sushiItemsDetailed`'s initial sort).
    const sushiTypeCategorization = new Map();
    for (const dish of sushiItemsDetailed) {
        if (!sushiTypeCategorization.has(dish.typeId)) {
            sushiTypeCategorization.set(dish.typeId, []);
        }
        sushiTypeCategorization.get(dish.typeId).push(dish);
    }

    const allUniqueTypes = Array.from(sushiTypeCategorization.keys());
    const isItemSelected = new Array(totalSushiItems).fill(false); // Tracks which items are currently in our selection

    let primarySelections = [];      // Stores the initial set of items (one from each unique type)
    let totalCurrentDeliciousness = 0; // Sum of deliciousness of currently selected items
    let currentUniqueTypeCount = 0;    // Count of unique types in current selection
    let nextAvailableDishIndex = 0;  // Pointer for iterating through `itemsSortedByDeliciousness`

    // Phase 1: Initial Selection
    // Always prioritize taking one of the most delicious items from each unique type.
    for (const typeIdentifier of allUniqueTypes) {
        const bestOfType = sushiTypeCategorization.get(typeIdentifier)[0]; // Most delicious of this type
        if (bestOfType) {
            primarySelections.push(bestOfType);
            isItemSelected[bestOfType.originalIdx] = true;
            totalCurrentDeliciousness += bestOfType.deliciousness;
            currentUniqueTypeCount++;
        }
    }

    // Sort primary selections by deliciousness in ascending order.
    // This makes it easy to find the "least delicious" unique type item for potential replacement.
    primarySelections.sort((itemA, itemB) => itemA.deliciousness - itemB.deliciousness);

    // If we haven't reached `maxSelections` yet, fill the remaining slots.
    // We pick the most delicious available items that are not already selected.
    while (primarySelections.length < maxSelections) {
        let itemFound = false;
        for (; nextAvailableDishIndex < totalSushiItems; nextAvailableDishIndex++) {
            const potentialAddition = itemsSortedByDeliciousness[nextAvailableDishIndex];
            if (!isItemSelected[potentialAddition.originalIdx]) {
                // Found an unselected, highly delicious item
                primarySelections.push(potentialAddition);
                isItemSelected[potentialAddition.originalIdx] = true;
                totalCurrentDeliciousness += potentialAddition.deliciousness;
                // Note: uniqueTypeCount does not increase here, as these are not new unique types.
                itemFound = true;
                nextAvailableDishIndex++; // Move past this item for the next iteration
                break;
            }
        }
        if (!itemFound) {
            // No more items to add, even if maxSelections not reached (e.g., N < K)
            break;
        }
    }

    // Phase 2: Greedy Optimization (Replacement Strategy)
    // Iterate through the initially selected unique-type items (from least delicious to most).
    // Try to replace them with a more delicious item that is not yet selected,
    // only if this replacement increases the overall score.
    // This is a greedy approach; the first non-improving replacement stops the process.
    for (const itemIndex of sequenceGenerator(0, primarySelections.length)) {
        const currentLeastDeliciousPrimary = primarySelections[itemIndex];

        // Search for a replacement from the remaining most delicious items.
        // We continue from where we left off (nextAvailableDishIndex).
        let replacementFound = false;
        for (; nextAvailableDishIndex < totalSushiItems; nextAvailableDishIndex++) {
            const potentialReplacement = itemsSortedByDeliciousness[nextAvailableDishIndex];

            // Skip if this item is already part of our selection.
            if (isItemSelected[potentialReplacement.originalIdx]) {
                continue;
            }

            // Calculate scores before and after the potential replacement.
            const scoreBeforeChange = computeTotalValue(totalCurrentDeliciousness, currentUniqueTypeCount);
            const potentialNewDeliciousnessSum = totalCurrentDeliciousness - currentLeastDeliciousPrimary.deliciousness + potentialReplacement.deliciousness;
            const potentialNewUniqueTypeCount = currentUniqueTypeCount - 1; // Replacing a unique type item reduces unique count

            const scoreAfterChange = computeTotalValue(potentialNewDeliciousnessSum, potentialNewUniqueTypeCount);

            // If replacing improves the score, make the change.
            if (scoreBeforeChange < scoreAfterChange) {
                totalCurrentDeliciousness = potentialNewDeliciousnessSum;
                currentUniqueTypeCount = potentialNewUniqueTypeCount;

                isItemSelected[potentialReplacement.originalIdx] = true; // Mark new item as selected
                isItemSelected[currentLeastDeliciousPrimary.originalIdx] = false; // Mark old item as unselected

                replacementFound = true;
                nextAvailableDishIndex++; // Move past this replacement for the next iteration
                break; // Move to consider the next least delicious primary item for replacement
            } else {
                // If this replacement doesn't improve the score, the greedy strategy dictates
                // that no further replacements will improve it either. So, we exit early.
                console.log(scoreBeforeChange); // Output the score at this point
                return; // Terminate execution
            }
        }
        if (!replacementFound) {
            // If no replacement could be found for the currentLeastDeliciousPrimary,
            // it means all remaining items are either taken or not good enough.
            // In a greedy context, this also implies we can't improve further.
            break;
        }
    }

    // Calculate the final score if the loop completed without an early exit.
    const finalCalculatedScore = computeTotalValue(totalCurrentDeliciousness, currentUniqueTypeCount);
    console.log(finalCalculatedScore);
}

// Entry point: Read input from standard input and pass to the main function.
// This assumes an environment where `require('fs')` is available (e.g., Node.js).
optimizeSushiSelection(require('fs').readFileSync('/dev/stdin', 'utf8'));