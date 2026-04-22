// Import the Node.js file system module for reading standard input.
const fileSystemModule = require('fs');

// Read all raw input data from standard input, ensuring it's decoded as UTF-8.
// This block handles the initial acquisition of data from the execution environment.
let rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: first, remove any leading or trailing whitespace
// from the entire string, then split it into an array of individual lines.
// Each line typically represents a distinct piece of information for a test case.
let processingQueue = rawInputData.trim().split('\n');

// Initiate the primary processing loop. This loop continues indefinitely
// until a specific termination condition is met, allowing for multiple test cases.
for (;;) {
    // Extract the first line from the queue, which is expected to be an integer.
    // This value, 'initialCount', often dictates the scale or iteration count for the current test.
    // Convert the extracted string to a numerical type.
    let initialCount = Number(processingQueue.shift());

    // Check for the termination condition: if 'initialCount' is zero,
    // it signals the end of all test cases, and the loop must be exited.
    if (initialCount === 0) {
        break;
    }

    // Retrieve the next line from the input queue. This line contains
    // space-separated strings representing primary item values.
    // These strings are parsed into integers and stored in an array.
    let primaryItems = processingQueue.shift().split(' ').map(valueStr => parseInt(valueStr, 10));

    // Similarly, fetch the subsequent line which holds space-separated bonus factors.
    // These strings are converted to numbers for later arithmetic operations.
    let bonusFactors = processingQueue.shift().split(' ').map(Number);

    // Compute the sum of all 'primaryItems'. This forms the baseline value
    // upon which subsequent calculations and bonus applications will be built.
    let totalBaseValue = primaryItems.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // Sort the 'bonusFactors' array in descending order. This strategic sorting
    // ensures that the most impactful bonuses are considered and applied first,
    // which is crucial for maximizing the final result in many optimization problems.
    bonusFactors.sort((factorA, factorB) => factorB - factorA);

    // Establish the initial maximum possible result. This is computed by
    // multiplying the 'totalBaseValue' by the 'initialCount' before any bonuses are applied.
    let peakResult = totalBaseValue * initialCount;

    // Introduce a mutable variable to track the current multiplier.
    // It starts with the 'initialCount' and will be decremented in each step
    // where a bonus factor is considered.
    let currentMultiplier = initialCount;

    // Commence a secondary loop to iteratively apply bonus factors and update the maximum result.
    // This loop continues as long as there are bonus factors remaining to be processed.
    while (bonusFactors.length > 0) {
        // Decrement the 'currentMultiplier' as one "slot" for a bonus is being used.
        currentMultiplier--;

        // Extract the largest available bonus factor from the front of the sorted array.
        let appliedBonus = bonusFactors.shift();

        // Calculate a potential new result by adding the 'appliedBonus' to the
        // 'totalBaseValue' and then multiplying the sum by the 'currentMultiplier'.
        let potentialNewResult = (totalBaseValue + appliedBonus) * currentMultiplier;

        // Compare the 'potentialNewResult' with the 'peakResult' found so far.
        // Update 'peakResult' if the new calculation yields a higher value.
        peakResult = Math.max(peakResult, potentialNewResult);
    }

    // After processing all bonus factors for the current test case,
    // print the final 'peakResult' to standard output.
    console.log(peakResult);
}