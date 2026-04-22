function processInputData(rawData) {
    // Validate the initial raw input string.
    if (typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Input processing error: Raw data is empty or not a string.");
        return 0;
    }

    const inputLines = rawData.split("\n");

    // Ensure there's at least a header line and one data line.
    if (inputLines.length < 2) {
        console.error("Input processing error: Insufficient number of lines in data.");
        return 0;
    }

    const headerTokens = inputLines[0].split(" ");

    // Validate the header line for N and K values.
    if (headerTokens.length < 2) {
        console.error("Input processing error: Header line is malformed, missing N or K.");
        return 0;
    }

    const totalAvailableItems = Number(headerTokens[0]);
    const combinationTargetSize = Number(headerTokens[1]);

    // Validate N and K for numeric values and logical constraints.
    if (isNaN(totalAvailableItems) || totalAvailableItems <= 0 ||
        isNaN(combinationTargetSize) || combinationTargetSize <= 0 ||
        combinationTargetSize > totalAvailableItems) {
        console.error(`Input processing error: Invalid values for total items (${totalAvailableItems}) or target size (${combinationTargetSize}).`);
        return 0;
    }

    let deliciousFoodItems = []; // This array holds all parsed food item objects.

    // Iterate through the input lines to populate the deliciousFoodItems array.
    for (let currentItemIndex = 1; currentItemIndex <= totalAvailableItems; currentItemIndex++) {
        // Guard clause for missing data lines.
        if (currentItemIndex >= inputLines.length) {
            console.error(`Input processing error: Expected data for item ${currentItemIndex} but line is missing.`);
            return 0;
        }

        const itemDataParts = inputLines[currentItemIndex].split(" ");
        if (itemDataParts.length < 2) {
            console.error(`Input processing error: Item data on line ${currentItemIndex} is malformed.`);
            return 0;
        }

        const itemTypeIdentifier = Number(itemDataParts[0]);
        const itemDeliciousnessScore = Number(itemDataParts[1]);

        // Validate parsed numeric values for items.
        if (isNaN(itemTypeIdentifier) || isNaN(itemDeliciousnessScore)) {
            console.error(`Input processing error: Non-numeric values found for item on line ${currentItemIndex}.`);
            return 0;
        }

        deliciousFoodItems.push({
            flavorCategory: itemTypeIdentifier,
            deliciousnessRating: itemDeliciousnessScore
        });
    }

    let overallMaximumScore = 0; // Stores the highest score found across all combinations.

    /**
     * Calculates the score for a given combination of selected item indices.
     * The score is (count of unique flavor categories)^2 + (sum of deliciousness ratings).
     * @param {number[]} selectedItemOneBasedIndices - An array of 1-based indices of the selected items.
     * @returns {number} The calculated score for the combination.
     */
    const evaluateCombinationScore = (selectedItemOneBasedIndices) => {
        let currentDeliciousnessTotal = 0;
        const distinctFlavorCategories = new Set(); // Tracks unique flavor categories.

        for (const oneBasedIdx of selectedItemOneBasedIndices) {
            // Convert 1-based index to 0-based for array access.
            const actualFoodItem = deliciousFoodItems[oneBasedIdx - 1];
            if (actualFoodItem) { // Basic check if item exists at index.
                distinctFlavorCategories.add(actualFoodItem.flavorCategory);
                currentDeliciousnessTotal += actualFoodItem.deliciousnessRating;
            }
        }
        const uniqueCategoryCount = distinctFlavorCategories.size;
        return Math.pow(uniqueCategoryCount, 2) + currentDeliciousnessTotal;
    };

    /**
     * Initiates the recursive process to find all combinations.
     * @param {number} targetCount - The number of items to select for each combination (K).
     * @param {number} dynamicUpperBoundOffset - A parameter (N-K from original) that influences the loop's upper bound.
     */
    function beginCombinationDiscovery(targetCount, dynamicUpperBoundOffset) {
        // This buffer will hold the 1-based indices of items for the current combination.
        // Size is targetCount + 1 because indices are 1-based.
        const currentSelectionBuffer = new Array(targetCount + 1).fill(0);

        // Start the recursive exploration from the first position.
        recursivelyFormCombinations(
            0, // previousChosenItemIndex: No item chosen yet, so start index is 0.
            1, // currentDepth: We are filling the first slot (1-based).
            targetCount,
            dynamicUpperBoundOffset,
            currentSelectionBuffer
        );
    }

    /**
     * Recursively generates combinations of items and updates the maximum score.
     * This function's loop bounds mirror the original algorithm's specific logic.
     * @param {number} previousChosenItemIndex - The 1-based index of the item chosen in the previous step.
     * @param {number} currentDepth - The 1-based index of the current slot being filled in the combination (from 1 to K).
     * @param {number} desiredCombinationSize - The total number of items to select (K).
     * @param {number} dynamicUpperBoundOffset - The N-K value from the initial call, used in the loop's upper bound calculation.
     * @param {number[]} currentCombinationIndicesStore - The array storing 1-based indices of selected items for the current combination.
     */
    function recursivelyFormCombinations(
        previousChosenItemIndex,
        currentDepth,
        desiredCombinationSize,
        dynamicUpperBoundOffset,
        currentCombinationIndicesStore
    ) {
        // Iterate through potential item indices for the current slot.
        // The upper bound for 'candidateIndex' is determined by 'dynamicUpperBoundOffset' and 'currentDepth'.
        // This specific bounding logic is preserved from the original code.
        for (let candidateIndex = previousChosenItemIndex + 1;
             candidateIndex <= dynamicUpperBoundOffset + currentDepth;
             candidateIndex++) {

            // Store the current candidate index (1-based) in the combination buffer.
            currentCombinationIndicesStore[currentDepth] = candidateIndex;

            // If not all K slots are filled, recurse to fill the next slot.
            if (desiredCombinationSize !== currentDepth) {
                recursivelyFormCombinations(
                    candidateIndex,
                    currentDepth + 1,
                    desiredCombinationSize,
                    dynamicUpperBoundOffset,
                    currentCombinationIndicesStore
                );
            } else {
                // If all K slots are filled, calculate the score for this complete combination.
                // Use slice to get only the relevant 1-based indices (from index 1 up to desiredCombinationSize).
                const currentCombinationScore = evaluateCombinationScore(
                    currentCombinationIndicesStore.slice(1, desiredCombinationSize + 1)
                );

                // Update the global maximum score if the current combination yields a higher score.
                if (currentCombinationScore > overallMaximumScore) {
                    overallMaximumScore = currentCombinationScore;
                }
            }
        }
    }

    // Begin the combination generation process with K and (N-K) as parameters.
    beginCombinationDiscovery(combinationTargetSize, totalAvailableItems - combinationTargetSize);

    return overallMaximumScore;
}

// Entry point for execution: Read input from standard in, process, and print result.
const standardInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const computedFinalResult = processInputData(standardInputData);
console.log(computedFinalResult);