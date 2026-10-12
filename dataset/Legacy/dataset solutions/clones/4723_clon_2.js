'use strict';

// Read input from standard input, parse it, and prepare data structures.
const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// Extract main parameters: number of items, target A, target B.
const itemCount = +rawInput[0].split(' ')[0];
const targetA = +rawInput[0].split(' ')[1];
const targetB = +rawInput[0].split(' ')[2];

// Parse item properties (A, B, C values for each item).
const itemProps = rawInput.slice(1).map(lineStr => lineStr.split(' ').map(Number));

// Initialize a 3D array to store minimum costs.
// Dimensions: [item_index][total_A_value][total_B_value]
let minCosts = [];

// Define maximum possible values for A, B, C properties based on problem constraints.
const maxPropA = 10;
const maxPropB = 10;
const maxPropC = 100;

// Initialize the minCosts array with a very large value (representing infinity).
// The maximum possible cost is maxPropC * itemCount, so add 1 to ensure it's larger.
const initialLargeCost = maxPropC * itemCount + 1;

for (let idx = 0; idx < itemCount; idx++) {
    minCosts[idx] = [];
    for (let valA = 1; valA <= maxPropA * itemCount; valA++) {
        minCosts[idx][valA - 1] = [];
        for (let valB = 1; valB <= maxPropB * itemCount; valB++) {
            minCosts[idx][valA - 1][valB - 1] = initialLargeCost;
        }
    }
}

// Dynamic programming approach to fill the minCosts array.
for (let idx = 0; idx < itemCount; idx++) {
    // Get properties of the current item.
    let currentA = itemProps[idx][0];
    let currentB = itemProps[idx][1];
    let currentC = itemProps[idx][2];

    // Base case: For the first item (idx = 0), only its own properties contribute.
    if (idx === 0) {
        minCosts[idx][currentA - 1][currentB - 1] = currentC;
        continue; // Move to the next item.
    }

    // Iterate through all possible accumulated A values.
    for (let valA = 1; valA <= maxPropA * itemCount; valA++) {
        // If the current accumulated A value is less than the current item's A,
        // we cannot include the current item to reach this 'valA'.
        // So, the cost is simply inherited from the previous item's state.
        if (valA <= currentA) {
            for (let valB = 1; valB < maxPropB * itemCount; valB++) {
                minCosts[idx][valA - 1][valB - 1] = minCosts[idx - 1][valA - 1][valB - 1];
            }
            continue; // Move to the next 'valA'.
        }

        // Iterate through all possible accumulated B values.
        for (let valB = 1; valB <= maxPropB * itemCount; valB++) {
            // Similar to 'valA', if 'valB' is too small, inherit from previous state.
            if (valB <= currentB) {
                minCosts[idx][valA - 1][valB - 1] = minCosts[idx - 1][valA - 1][valB - 1];
                continue; // Move to the next 'valB'.
            }

            // Calculate the minimum cost to achieve (valA, valB) using items up to 'idx'.
            // Option 1: Do not include the current item. Cost is from previous state.
            // Option 2: Include the current item. Cost is (cost of previous state for (valA - currentA, valB - currentB)) + currentC.
            minCosts[idx][valA - 1][valB - 1] = Math.min(
                minCosts[idx - 1][valA - 1][valB - 1],
                minCosts[idx - 1][valA - currentA - 1][valB - currentB - 1] + currentC
            );
        }
    }
}

// After filling the DP table, find the minimum cost that satisfies the target ratio.
let finalResult = initialLargeCost; // Initialize with the large cost.
let currentTargetA = targetA;
let currentTargetB = targetB;

// Iterate through multiples of (targetA, targetB) to find the minimum cost.
while (currentTargetA <= maxPropA * itemCount && currentTargetB <= maxPropB * itemCount) {
    finalResult = Math.min(finalResult, minCosts[itemCount - 1][currentTargetA - 1][currentTargetB - 1]);
    currentTargetA += targetA;
    currentTargetB += targetB;
}

// Output the result. If finalResult is still the initial large cost, it means no combination was found, so output -1.
console.log(finalResult === initialLargeCost ? -1 : finalResult);
