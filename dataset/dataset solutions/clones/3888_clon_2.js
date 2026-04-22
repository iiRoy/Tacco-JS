"use strict";

// This function determines the minimum expenditure for acquiring items.
function CalculateMinimumCost( sourceData ) {
    // Process the raw input string: remove leading/trailing whitespace, split by space, and convert to numbers.
    sourceData = sourceData.trim()
                           .split(' ')
                           .map(Number);

    // Deconstruct the parsed input into specific cost and quantity variables.
    const costOfAItem = sourceData[0];
    const costOfBItem = sourceData[1];
    const costOfCItem = sourceData[2]; // Cost of one "half" item (e.g., a combo item)
    const requiredQuantityA = sourceData[3];
    const requiredQuantityB = sourceData[4];

    // Initialize the lowest total cost with the straightforward approach: buying A and B directly.
    let currentLowestTotal = costOfAItem * requiredQuantityA + costOfBItem * requiredQuantityB;

    // A simple early exit optimization: if direct purchase of A and B is cheaper than two "half" items (C),
    // then no amount of "half" items will be cheaper overall.
    if ( ( costOfAItem + costOfBItem ) < ( 2 * costOfCItem ) ) {
        console.log(currentLowestTotal);
        return;
    }

    // Determine the maximum number of "half" items (C) to consider for replacing A items.
    // Each C item replaces one A and one B, so we need 2*A halves to replace all A items.
    const maxHalfPairsForA = requiredQuantityA * 2;

    // Determine the maximum number of "half" items (C) to consider for replacing B items.
    const maxHalfPairsForB = requiredQuantityB * 2;

    // First optimization loop: Iterate through purchasing 'C' items to cover 'A' items.
    // 'halfIndex' represents the total number of 'half' items (C) being purchased.
    for ( let halfIndex = 1; halfIndex <= maxHalfPairsForA; halfIndex++ ) {
        // We only care about even numbers of 'half' items, as each C item consists of two halves.
        if ( halfIndex % 2 !== 0 ) {
            continue;
        }

        // Calculate the remaining quantity of A items needed after using 'C' items.
        let remainingA = requiredQuantityA - ( halfIndex / 2 );
        // Ensure remaining quantity does not go below zero.
        if ( remainingA < 0 ) { remainingA = 0; }

        // Calculate the remaining quantity of B items needed after using 'C' items.
        // Note: Both A and B items are replaced by C items in pairs, so the same halfIndex applies.
        let remainingB = requiredQuantityB - ( halfIndex / 2 );
        // Ensure remaining quantity does not go below zero.
        if ( remainingB < 0 ) { remainingB = 0; }

        // Compute the potential total cost for this specific combination.
        const calculatedCost = costOfCItem * halfIndex + remainingA * costOfAItem + remainingB * costOfBItem;

        // Update the overall minimum total if this combination is cheaper.
        if ( currentLowestTotal > calculatedCost ) {
            currentLowestTotal = calculatedCost;
        }
    }

    // Second optimization loop: Iterate through purchasing 'C' items to cover 'B' items.
    // This loop is essentially symmetric to the first one, but ensures all permutations are checked.
    for ( let halfIndex = 1; halfIndex <= maxHalfPairsForB; halfIndex++ ) {
        // Again, only process even numbers for 'half' items.
        if ( halfIndex % 2 !== 0 ) {
            continue;
        }

        // Calculate remaining A items.
        let remainingA = requiredQuantityA - ( halfIndex / 2 );
        if ( remainingA < 0 ) { remainingA = 0; }

        // Calculate remaining B items.
        let remainingB = requiredQuantityB - ( halfIndex / 2 );
        if ( remainingB < 0 ) { remainingB = 0; }

        // Compute the potential total cost for this combination.
        const calculatedCost = costOfCItem * halfIndex + remainingA * costOfAItem + remainingB * costOfBItem;

        // Update the overall minimum total if this combination yields a lower cost.
        if ( currentLowestTotal > calculatedCost ) {
            currentLowestTotal = calculatedCost;
        }
    }

    // Output the final minimum total cost found.
    console.log(currentLowestTotal);
}

// Invoke the main calculation function with input read from standard input.
CalculateMinimumCost( require("fs").readFileSync("/dev/stdin", "utf8") );