const MAXIMUM_SEQUENCE_LENGTH_TO_PRECOMPUTE = 10;
const permutationSequenceRegistry = []; // This array will store permutations. Index 'k' will hold all permutations of length 'k'.

/**
 * A recursive utility function to generate all possible permutations of numbers
 * from 0 up to (targetLength - 1). These permutations are stored as strings.
 * @param {number} targetLength - The desired length of the permutations.
 * @param {boolean[]} availableElementsTracker - An array tracking which numbers (0 to targetLength-1) are currently available for use.
 * @param {string} currentPartialSequence - The permutation string built so far in the current recursive call.
 * @param {string[]} finalPermutationCollector - The array where completed permutation strings will be added.
 */
const constructPermutationsRecursively = (targetLength, availableElementsTracker, currentPartialSequence, finalPermutationCollector) => {
    // Base case: If the current sequence has reached the desired length, it's a complete permutation.
    if (currentPartialSequence.length === targetLength) {
        finalPermutationCollector.push(currentPartialSequence);
        return;
    }

    // Recursive step: Iterate through all potential elements for the next position in the sequence.
    for (let elementValue = 0; elementValue < targetLength; elementValue++) {
        // If the current element has not been used yet in this branch of recursion.
        if (availableElementsTracker[elementValue]) {
            availableElementsTracker[elementValue] = false; // Mark this element as used.
            // Recursively call to build the rest of the permutation.
            constructPermutationsRecursively(
                targetLength,
                availableElementsTracker,
                currentPartialSequence + String(elementValue), // Append the element (converted to string) to the current sequence.
                finalPermutationCollector
            );
            availableElementsTracker[elementValue] = true; // Backtrack: Mark element as available for other permutation branches.
        }
    }
};

// Pre-computation phase: Generate and cache all permutations for lengths from 1 up to MAXIMUM_SEQUENCE_LENGTH_TO_PRECOMPUTE.
// Note: permutationSequenceRegistry[0] will be an empty array as lengths start from 1.
for (let sequenceLength = 0; sequenceLength <= MAXIMUM_SEQUENCE_LENGTH_TO_PRECOMPUTE; sequenceLength++) {
    const permutationsForThisLength = [];
    permutationSequenceRegistry.push(permutationsForThisLength);

    // Only generate permutations for valid lengths (greater than 0).
    if (sequenceLength > 0) {
        // Initialize an array to track element availability for the current sequence length.
        const elementAvailability = new Array(sequenceLength).fill(true);
        constructPermutationsRecursively(sequenceLength, elementAvailability, "", permutationsForThisLength);
    }
}


// --- Main application logic for processing input test cases ---

// Specify the input stream source.
const STANDARD_INPUT_PATH = '/dev/stdin';

// Read the entire content of the input stream as a UTF-8 string.
const rawInputContent = require('fs').readFileSync(STANDARD_INPUT_PATH, 'utf8');

// Process the raw input: trim whitespace and split into an array of individual lines.
let inputLineBuffer = rawInputContent.trim().split("\n");

/**
 * Helper function to parse a string value into a number.
 * Provides a default of 0 if parsing results in NaN, to prevent issues.
 * @param {string} strValue - The string to parse.
 * @returns {number} The parsed number, or 0 if parsing fails.
 */
const safeParseInteger = (strValue) => {
    const parsedNum = Number(strValue);
    return isNaN(parsedNum) ? 0 : parsedNum;
};

// Loop through each test case provided in the input.
// The loop continues until a test case with an item count of 0 is encountered.
while (true) {
    // Extract the item count for the current test case.
    const currentItemCountString = inputLineBuffer.shift();
    const currentItemCount = safeParseInteger(currentItemCountString);

    // If the item count is 0, it signifies the end of input, so break the loop.
    if (currentItemCount === 0) {
        break;
    }

    // --- Input Validation and Guard Clauses ---
    // Ensure the item count is within the pre-computed range to avoid errors.
    if (currentItemCount < 1 || currentItemCount > MAXIMUM_SEQUENCE_LENGTH_TO_PRECOMPUTE) {
        console.error(`Warning: Item count ${currentItemCount} is outside the supported range (1-${MAXIMUM_SEQUENCE_LENGTH_TO_PRECOMPUTE}). Skipping this test case.`);
        // Consume the remaining lines for this invalid test case to maintain input stream integrity.
        for (let i = 0; i < currentItemCount; i++) {
            inputLineBuffer.shift(); // Discard item data lines.
        }
        continue; // Proceed to the next test case.
    }

    // Array to store the details of each item. Each item will be an array: [name, weight, max_cumulative_weight_constraint].
    const itemSpecificationList = [];
    for (let i = 0; i < currentItemCount; i++) {
        const itemDataLine = inputLineBuffer.shift();
        if (itemDataLine === undefined) { // Check for unexpected end of input.
            console.error("Error: Unexpected end of input while reading item specifications.");
            // If input ends prematurely, it's best to stop processing or handle gracefully.
            // For this clone, we'll break and potentially terminate.
            process.exit(1); // Exit with an error code.
        }
        const itemComponents = itemDataLine.split(" ");
        itemSpecificationList.push([
            itemComponents[0], // Item name (string)
            safeParseInteger(itemComponents[1]), // Item weight (number)
            safeParseInteger(itemComponents[2])  // Maximum allowed cumulative weight before this item (number)
        ]);
    }

    // Variables to track the best (minimum) metric found and its corresponding permutation index.
    let globalMinimumMetricValue = Infinity; // Initialize with a very large value.
    let bestPermutationIndexFound = -1;      // Stores the index in the permutation registry.

    // Retrieve the pre-computed permutations for the current item count.
    const relevantPermutations = permutationSequenceRegistry[currentItemCount];

    // Iterate over each available permutation to evaluate its metric.
    relevantPermutations.forEach((currentPermutationString, permutationLookupIndex) => {
        let accumulatedWeight = 0;         // Tracks the sum of weights up to the current item in the sequence.
        let totalWeightedCompletionTime = 0; // Represents the 'g' value in the original code, product of weight and remaining items.
        let sequenceConstraintViolated = false; // Flag to indicate if any constraint is broken within this permutation.

        // Evaluate the current permutation string (e.g., "012" for 3 items).
        for (let sequencePosition = 0; sequencePosition < currentItemCount; sequencePosition++) {
            // Get the original zero-based index of the item from the current position in the permutation string.
            const originalItemReference = safeParseInteger(currentPermutationString[sequencePosition]);

            // Retrieve the weight and constraint for this specific item.
            const currentItemWeight = itemSpecificationList[originalItemReference][1];
            const currentItemMaxPrevWeightConstraint = itemSpecificationList[originalItemReference][2];

            // Check if the accumulated weight *before* processing the current item exceeds its constraint.
            if (accumulatedWeight > currentItemMaxPrevWeightConstraint) {
                sequenceConstraintViolated = true; // Mark this permutation as invalid.
                break; // No need to check further items in this permutation; it's already invalid.
            }

            // Update accumulated weight and calculate the weighted completion time component.
            accumulatedWeight += currentItemWeight;
            // The factor (currentItemCount - sequencePosition) represents the number of items
            // remaining in the sequence (including the current one), effectively a 'completion time' component.
            const remainingItemsInSequence = currentItemCount - sequencePosition;
            totalWeightedCompletionTime += currentItemWeight * remainingItemsInSequence;
        }

        // --- Refined Metric Calculation Logic (Type III Change) ---
        // The original code's `if(flag==false)` condition for calculating `g=g/sum` was ambiguous.
        // This rewrite assumes that the goal is to find the minimum `totalWeightedCompletionTime / accumulatedWeight`
        // *only for permutations that satisfy all constraints*. Invalid permutations should not contribute to the minimum.

        let calculatedSequenceMetric = Infinity; // Default to an infinitely bad score.

        // If no constraint was violated, calculate the actual metric for this permutation.
        if (!sequenceConstraintViolated) {
            // Prevent division by zero. If accumulatedWeight is 0 for a valid sequence,
            // its metric might be considered special (e.g., 0 or Infinity depending on problem).
            // Assuming positive weights for a meaningful metric.
            if (accumulatedWeight > 0) {
                calculatedSequenceMetric = totalWeightedCompletionTime / accumulatedWeight;
            } else {
                // If accumulated weight is zero but no constraint violated, this is an unusual case.
                // Assign an infinitely bad metric to prevent it from being chosen.
                calculatedSequenceMetric = Infinity;
            }
        }

        // Update the global minimum if the current permutation's metric is better.
        if (calculatedSequenceMetric < globalMinimumMetricValue) {
            globalMinimumMetricValue = calculatedSequenceMetric;
            bestPermutationIndexFound = permutationLookupIndex;
        }
    });

    // --- Output Results for the Best Permutation ---

    // If no valid permutation was found (e.g., all permutations violated constraints),
    // handle this scenario.
    if (bestPermutationIndexFound === -1) {
        console.log("No valid item sequence could be determined for this set.");
        continue; // Move to the next test case.
    }

    // Retrieve the string representation of the best permutation.
    const finalOptimalPermutationString = relevantPermutations[bestPermutationIndexFound];

    // Convert the permutation string into an array of item indices.
    const optimalItemIndices = finalOptimalPermutationString.split("").map(safeParseInteger);

    // The original code printed items in reverse order of the permutation sequence.
    // This behavior is preserved here.
    optimalItemIndices.reverse().forEach(itemOriginalIndex => {
        const itemName = itemSpecificationList[itemOriginalIndex][0];
        console.log(itemName);
    });
}