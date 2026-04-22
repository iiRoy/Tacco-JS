const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

/**
 * Safely reads and processes input data from a specified file path.
 * It handles file reading errors, ensures sufficient input lines,
 * parses numeric divisors robustly, and filters out invalid or zero divisors.
 * @param {string} filePath The path to the input file.
 * @returns {number[]} An array of valid numeric divisors.
 */
function processInputData(filePath) {
    try {
        const rawInputContent = fileSystemModule.readFileSync(filePath, 'utf8');
        const lines = rawInputContent.split('\n');

        // Guard clause: ensure there's at least a second line for divisor data
        if (lines.length < 2) {
            console.error("Error: Insufficient input lines. Expected at least two for divisor data.");
            return [];
        }

        const secondLineOfData = lines[1];
        // Filter out empty strings that might result from multiple spaces or leading/trailing spaces
        const stringDivisors = secondLineOfData.split(' ').filter(s => s.trim() !== '');

        // Use map and parseInt with explicit radix for robust number conversion
        const numericDivisors = stringDivisors.map(str => parseInt(str, 10));

        // Validation: filter out any NaN values that might result from invalid number strings,
        // and also exclude zero divisors to prevent division by zero errors.
        const validDivisors = numericDivisors.filter(num => !isNaN(num) && num !== 0);

        if (validDivisors.length === 0) {
            console.warn("Warning: No valid numeric divisors found in the input. Proceeding with an empty set.");
        }

        return validDivisors;
    } catch (errorReadingFile) {
        console.error(`Failed to read or process input file: ${errorReadingFile.message}`);
        return [];
    }
}

/**
 * Calculates the sum of remainders when a candidate number is divided by each number in a given array of divisors.
 * @param {number} candidateNumber The number to be divided.
 * @param {number[]} divisorsArray An array of numbers to use as divisors.
 * @returns {number} The accumulated sum of remainders.
 */
function calculateRemainderSum(candidateNumber, divisorsArray) {
    let currentAccumulatedRemainder = 0;
    // Iterate through the array of divisors using a for...of loop
    for (const singleDivisor of divisorsArray) {
        // A defensive check, though zero divisors should be filtered during input processing.
        if (singleDivisor === 0) {
            continue;
        }
        currentAccumulatedRemainder += candidateNumber % singleDivisor;
    }
    return currentAccumulatedRemainder;
}

// --- Main execution flow ---

// Process the input data to get an array of valid numbers
const processedDivisorValues = processInputData(standardInputPath);

let peakModulusSum = 0; // Stores the maximum remainder sum encountered
let currentDivisorCandidate = 1; // The number currently being tested (starts from 1)
let loopTerminationConditionMet = false; // Flag to control the main processing loop

// Optional: Add a safety counter to prevent genuinely infinite loops in case of unusual data or logic errors
const maxIterationsAllowed = 1_000_000;
let actualIterations = 0;

// Early exit if no valid divisors are present, as no calculations can be performed
if (processedDivisorValues.length === 0) {
    console.warn("No valid divisors provided. Outputting 0 as the peak modulus sum.");
    // peakModulusSum is already 0, so no further action needed here.
} else {
    // Continue looping as long as the termination condition is not met and iteration limit isn't reached
    while (!loopTerminationConditionMet && actualIterations < maxIterationsAllowed) {
        actualIterations++; // Increment the iteration counter

        // Calculate the sum of remainders for the current candidate number
        const currentIterationRemainderSum = calculateRemainderSum(currentDivisorCandidate, processedDivisorValues);

        // Check if the sum of remainders is zero, which is the loop termination condition
        if (currentIterationRemainderSum === 0) {
            loopTerminationConditionMet = true; // Set the flag to exit the loop
        } else {
            // Update the peak modulus sum if the current sum is greater
            if (currentIterationRemainderSum > peakModulusSum) {
                peakModulusSum = currentIterationRemainderSum;
            }
        }
        currentDivisorCandidate++; // Move to the next candidate number for the subsequent iteration
    }

    // Inform if the loop was terminated due to exceeding the maximum allowed iterations
    if (actualIterations >= maxIterationsAllowed) {
        console.warn(`Loop terminated after ${maxIterationsAllowed} iterations to prevent an infinite loop. The result might be incomplete.`);
    }
}

// Display the final calculated peak modulus sum
console.log(peakModulusSum);