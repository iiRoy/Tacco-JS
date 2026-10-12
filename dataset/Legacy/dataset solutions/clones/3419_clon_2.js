"use strict"; // Enforce strict mode for cleaner code

/**
 * Processes the input string to extract parameters and initiate the calculation.
 * @param {string} inputString - The raw input string from stdin.
 */
function processInput(inputString) {
    // Split the input into lines, though for this problem, only the first line is used.
    const lineData = inputString.split("\n");

    // Parse the first line to get the two integer values.
    // The first value represents the layer count.
    const layerCount = parseInt(lineData[0].split(" ")[0]);
    // The second value represents the target position.
    const targetPosition = parseInt(lineData[0].split(" ")[1]);

    // Output the result of the main calculation function.
    console.log(calculateEatenPatties(layerCount, targetPosition));
}

/**
 * Calculates the total number of elements (buns and patties) in a given burger layer.
 * @param {number} currentLayer - The layer number (0-indexed).
 * @returns {number} The total count of elements.
 */
function getTotalElements(currentLayer) {
    // Formula for total elements: 2^(layer + 2) - 3
    return Math.pow(2, currentLayer + 2) - 3;
}

/**
 * Calculates the total number of patties in a given burger layer.
 * @param {number} currentLayer - The layer number (0-indexed).
 * @returns {number} The total count of patties.
 */
function getTotalPatties(currentLayer) {
    // Formula for total patties: 2^(layer + 1) - 1
    return Math.pow(2, currentLayer + 1) - 1;
}

/**
 * Recursively calculates the number of patties eaten up to a certain position in a burger layer.
 * This function models a specific recursive structure of a "burger".
 *
 * @param {number} currentLayer - The current layer of the burger being considered (0-indexed).
 * @param {number} targetPosition - The position up to which patties are counted (1-indexed).
 * @returns {number} The count of patties eaten.
 */
function calculateEatenPatties(currentLayer, targetPosition) {
    // Calculate the total elements in the layer below the current one.
    const totalElementsInLowerLayer = getTotalElements(currentLayer - 1);

    // Base case: If the layer is 0, it's just a single patty.
    if (currentLayer === 0) {
        return 1;
    }
    // Case 1: If the target position is 1 or less, no patties are eaten (only a bun).
    else if (targetPosition <= 1) {
        return 0;
    }
    // Case 2: If the target position is within the first half of the burger (excluding the middle patty).
    // This means we are looking into the lower layer's structure.
    else if (targetPosition <= totalElementsInLowerLayer + 1) {
        // Recurse into the lower layer, adjusting the target position by 1 (for the bun).
        return calculateEatenPatties(currentLayer - 1, targetPosition - 1);
    }
    // Case 3: If the target position is past the first half and includes the middle patty.
    // We count all patties from the lower layer, plus the middle patty, and then recurse for the remaining part.
    else {
        // Total patties in the lower layer + 1 (for the middle patty) + patties from the remaining part of the upper layer.
        return getTotalPatties(currentLayer - 1) + 1 + calculateEatenPatties(currentLayer - 1, targetPosition - totalElementsInLowerLayer - 2);
    }
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
