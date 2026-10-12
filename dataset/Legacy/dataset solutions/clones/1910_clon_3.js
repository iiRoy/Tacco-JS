/*
 *  This script processes a sequence of operations based on initial resource allocations.
 *  It first performs a preliminary validation to ensure that the total demand for each
 *  pair of resources does not exceed the initial combined capacity of those resources.
 *  If the validation fails, it indicates impossibility.
 *  Otherwise, it proceeds to simulate the operations, decrementing resources
 *  and logging decisions based on specific rules, including edge cases where
 *  resource counts are equal or specific conditions are met.
 *
 *  The core logic involves:
 *  1. Parsing configuration parameters and a list of step types.
 *  2. Calculating initial resource availability versus total projected consumption for pairs.
 *  3. Iterating through most of the steps, applying a complex decision tree to decrement resources.
 *  4. Handling the final step with a distinct rule set.
 *
 *  (Note: Some conditional checks within the main loop might appear redundant or always false
 *  in their immediate context. This behavior intentionally mirrors the original structure.)
 */

// Acquire the file system module for input operations
const fileSystem = require('fs');

// Define the path for standard input (often a pipe in competitive programming environments)
const inputPath = '/dev/stdin';
// Read the entire input, decode it as UTF-8, and split into individual lines
const rawInputData = fileSystem.readFileSync(inputPath, 'utf8').split('\n');

// Extract the first line containing numerical parameters
const initialConfiguration = rawInputData[0].split(' ');

// Parse the primary parameters, ensuring they are treated as numbers
// `numOperations` corresponds to N
const numOperations = parseInt(initialConfiguration[0], 10);

// `resourceInventory` will hold the current counts for A, B, C, mapped to 'X', 'Y', 'Z'
let resourceInventory = {
    'X': parseInt(initialConfiguration[1], 10), // Corresponds to A
    'Y': parseInt(initialConfiguration[2], 10), // Corresponds to B
    'Z': parseInt(initialConfiguration[3], 10)  // Corresponds to C
};

// Store the sequence of operational steps from the input
// `opSequence` contains the lines s[1] to s[N]
const opSequence = [];
// Populate the operation sequence array, skipping the first line (index 0)
for (let k = 0; k < numOperations; ++k) {
    opSequence.push(rawInputData[k + 1]);
}

// --- Initial Feasibility Check ---
// This section determines if the operations are theoretically possible
// based on initial resource levels and total demands.

// Map to store the combined initial counts of resource pairs
// e.g., 'XY' stores resourceInventory['X'] + resourceInventory['Y']
const initialPairCapacities = new Map();
initialPairCapacities.set('XY', resourceInventory['X'] + resourceInventory['Y']);
initialPairCapacities.set('XZ', resourceInventory['X'] + resourceInventory['Z']);
initialPairCapacities.set('YZ', resourceInventory['Y'] + resourceInventory['Z']);

// Map to count the occurrences of each operational pair type in the sequence
const operationTypeFrequencies = new Map();
operationTypeFrequencies.set('XY', 0);
operationTypeFrequencies.set('XZ', 0);
operationTypeFrequencies.set('YZ', 0);

// Populate the frequency map
opSequence.forEach(operationType => {
    // Ensure the key exists before incrementing, handling potential invalid inputs gracefully (though not strictly required by original)
    if (operationTypeFrequencies.has(operationType)) {
        operationTypeFrequencies.set(operationType, operationTypeFrequencies.get(operationType) + 1);
    }
});

let feasibilityStatus = true; // Assume feasible until proven otherwise

// Iterate through the resource pair combinations to perform the check
for (const [pairKey, totalCapacity] of initialPairCapacities.entries()) {
    const totalDemand = operationTypeFrequencies.get(pairKey);
    // If at any point the initial capacity minus total demand falls below zero,
    // it means there aren't enough resources for this pair, so it's not feasible.
    if ((totalCapacity - totalDemand) < 0) {
        feasibilityStatus = false;
        break; // No need to check further if one pair fails
    }
}

// Output the result of the initial feasibility check
if (feasibilityStatus) {
    console.log('Yes');
} else {
    console.log('No');
    // Terminate execution if not feasible, as per original logic
    process.exit(0); // Using process.exit(0) instead of 'return' for top-level script termination
}

// --- Simulation of Operations (N-1 steps) ---
// This loop processes all operations except the very last one.
// The logic for decrementing resources and printing output is highly conditional.

const lastButOneIndex = numOperations - 1; // Index of the last element to be processed in this loop

for (let currentStepIndex = 0; currentStepIndex < lastButOneIndex; ++currentStepIndex) {
    const currentOperationType = opSequence[currentStepIndex];

    if (currentOperationType === 'XY') { // Corresponds to 'AB'
        // If resource X and Y counts are currently equal
        if (resourceInventory['X'] === resourceInventory['Y']) {
            // This inner condition (`currentOperationType.includes('Z')`) will always be false
            // because `currentOperationType` is 'XY' and does not contain 'Z'.
            // This mimics a potentially dead or complex conditional branch from the original.
            if (currentOperationType.includes('Z')) {
                console.log('Y');
                resourceInventory['Y']--;
            } else { // This block is always executed if X and Y are equal for 'XY' type
                console.log('X');
                resourceInventory['X']--;
            }
        } else { // If X and Y counts are not equal
            console.log('X');
            resourceInventory['X']--;
        }
    } else if (currentOperationType === 'XZ') { // Corresponds to 'AC'
        // If resource X and Z counts are currently equal
        if (resourceInventory['X'] === resourceInventory['Z']) {
            // This inner condition (`currentOperationType.startsWith('Y')`) will always be false
            // because `currentOperationType` is 'XZ' and does not start with 'Y'.
            // This mimics a potentially dead or complex conditional branch from the original.
            if (currentOperationType.startsWith('Y')) {
                console.log('X');
                resourceInventory['X']--;
            } else { // This block is always executed if X and Z are equal for 'XZ' type
                console.log('Z');
                resourceInventory['Z']--;
            }
        } else { // If X and Z counts are not equal
            // Note: In this specific case, the original code had no console.log,
            // only a decrement. This behavior is preserved.
            resourceInventory['Z']--;
        }
    } else { // currentOperationType === 'YZ' (Corresponds to 'BC')
        // If resource Y and Z counts are currently equal
        if (resourceInventory['Y'] === resourceInventory['Z']) {
            // This inner condition (`currentOperationType.includes('X')`) will always be false
            // because `currentOperationType` is 'YZ' and does not contain 'X'.
            // This mimics a potentially dead or complex conditional branch from the original.
            if (currentOperationType.includes('X')) {
                console.log('Y');
                resourceInventory['Y']--;
            } else { // This block is always executed if Y and Z are equal for 'YZ' type
                console.log('Z');
                resourceInventory['Z']--;
            }
        } else { // If Y and Z counts are not equal
            console.log('Z');
            resourceInventory['Z']--;
        }
    }
}

// --- Final Operation Handling ---
// The last operation in the sequence is handled with a different set of rules.

const finalOperationType = opSequence[numOperations - 1]; // Get the very last operation

if (finalOperationType === 'XY') { // Corresponds to 'AB'
    if (resourceInventory['X'] < resourceInventory['Y']) {
        console.log('Y');
    } else {
        console.log('X');
    }
} else if (finalOperationType === 'YZ') { // Corresponds to 'BC'
    if (resourceInventory['Z'] < resourceInventory['Y']) {
        console.log('Y');
    } else {
        console.log('Z');
    }
} else { // finalOperationType === 'XZ' (Corresponds to 'AC')
    if (resourceInventory['Z'] < resourceInventory['X']) {
        console.log('X');
    } else {
        console.log('Z');
    }
}