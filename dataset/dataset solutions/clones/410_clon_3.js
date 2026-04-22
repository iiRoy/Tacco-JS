const fs = require('fs'); // Import the file system module explicitly

/**
 * Generates all possible permutations of an array using Heap's algorithm.
 * @param {Array<any>} initialSequence The array to permute.
 * @returns {Array<Array<any>>} A collection of all permutations.
 */
function createAllArrangements(initialSequence) {
    const sequenceLength = initialSequence.length;

    // Handle edge cases for permutation generation
    if (sequenceLength === 0) {
        return [[]]; // An empty array has one permutation: itself.
    }
    if (sequenceLength === 1) {
        return [[...initialSequence]]; // Single element array has only one permutation.
    }

    const collectedPermutations = [];
    // Start with the original sequence as the first permutation
    collectedPermutations.push([...initialSequence]);

    // This array tracks the "state" of the Heap's algorithm for each position.
    const indexTracker = Array.from({ length: sequenceLength }, () => 0);

    let currentPos = 1; // Start processing from the second element
    while (currentPos < sequenceLength) {
        if (indexTracker[currentPos] < currentPos) {
            // Determine the swap index based on parity of currentPos
            const swapIndex = (currentPos % 2 === 1) ? indexTracker[currentPos] : 0;

            // Perform the swap
            const tempValue = initialSequence[currentPos];
            initialSequence[currentPos] = initialSequence[swapIndex];
            initialSequence[swapIndex] = tempValue;

            // Increment the counter for the current position
            indexTracker[currentPos]++;
            currentPos = 1; // Reset to the second position to re-evaluate after swap
            collectedPermutations.push([...initialSequence]); // Add the new permutation
        } else {
            // Reset the counter for the current position and move to the next
            indexTracker[currentPos] = 0;
            currentPos++;
        }
    }
    return collectedPermutations;
}

// Pre-calculate permutations for arrays of integers up to a certain length (e.g., 10)
// This lookup table is optimized for repeated use with small N values.
const permutationLookupTable = new Array(11); // Stores permutations for lengths 0 to 10
permutationLookupTable[0] = [[]]; // Permutations of an empty array
permutationLookupTable[1] = [[0]]; // Permutations of [0]

for (let currentLen = 1; currentLen <= 10; currentLen++) {
    const sequentialArr = Array.from({ length: currentLen }, (_, idx) => idx);
    permutationLookupTable[currentLen] = createAllArrangements(sequentialArr);
}

// Read raw input data from standard input
const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');

// Process input lines, filtering out any empty lines that might result from splitting
const processedLines = rawInputData.split('\n').filter(line => line.trim().length > 0);

// Main loop to process multiple test cases
while (processedLines.length > 0) {
    const currentCaseSize = parseInt(processedLines.shift(), 10);

    // If '0' is encountered, it signifies the end of input
    if (currentCaseSize === 0) {
        break;
    }

    // Read and parse job specifications for the current test case
    const jobSpecifications = Array.from({ length: currentCaseSize }, () => {
        const lineParts = processedLines.shift().split(' ');
        return {
            name: lineParts[0],
            weight: parseInt(lineParts[1], 10),
            capacityLimit: parseInt(lineParts[2], 10)
        };
    });

    // Retrieve pre-calculated permutations for the current case size
    const availablePermutations = permutationLookupTable[currentCaseSize];

    let maximumEfficiencyRatio = -1.0; // Initialize with a value lower than any possible ratio
    let optimalSequence = []; // Stores the indices of the best permutation

    // Iterate through all possible permutations for the current set of jobs
    for (const currentOrder of availablePermutations) {
        let cumulativeLoad = 0;
        let totalWeightedTime = 0;
        let capacityExceeded = false; // Flag to check if any job's capacity limit is breached

        // Evaluate the current permutation
        for (let positionIndex = 0; positionIndex < currentOrder.length; positionIndex++) {
            const jobIndex = currentOrder[positionIndex];
            const job = jobSpecifications[jobIndex];

            // Check if adding this job exceeds its individual capacity limit based on current cumulative load
            if (cumulativeLoad + job.weight > job.capacityLimit) {
                capacityExceeded = true;
                break; // This permutation is invalid, move to the next
            }

            cumulativeLoad += job.weight;
            totalWeightedTime += job.weight * (positionIndex + 1); // Weighted sum based on position
        }

        // Only consider valid permutations that did not exceed any capacity limits
        if (!capacityExceeded) {
            // Avoid division by zero if all weights are zero, though problem constraints usually prevent this.
            // If cumulativeLoad is 0, the ratio is 0.
            const currentEfficiencyRatio = (cumulativeLoad > 0) ? (totalWeightedTime / cumulativeLoad) : 0;

            // Update the maximum efficiency ratio and the corresponding optimal sequence
            if (currentEfficiencyRatio > maximumEfficiencyRatio) {
                maximumEfficiencyRatio = currentEfficiencyRatio;
                optimalSequence = currentOrder;
            }
        }
    }

    // Map the optimal sequence of job indices back to their original names and print
    // The problem output requires reversing the order of names for some reason.
    const resultNames = optimalSequence.map(jobIdx => jobSpecifications[jobIdx].name).reverse();
    console.log(resultNames.join('\n'));
}