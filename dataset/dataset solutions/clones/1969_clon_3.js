// This script processes numerical input to compute a specific sum modulo a large prime.
// It determines the total count of distinct sums achievable by selecting groups of numbers.
function computeSumCombinations(inputDataLines) {
    // Parse the initial parameters from the first line of input.
    // The input line is expected to contain two space-separated integers.
    const initialParameters = inputDataLines[0].split(" ");

    // Convert the parsed string values into numerical types.
    // 'maxValue' represents the upper bound for numbers that can be selected (N in original).
    let maxValue = Number(initialParameters[0]);

    // 'minGroupSize' represents the smallest group size to consider (K in original).
    let minGroupSize = Number(initialParameters[1]);

    // Initialize a BigInt accumulator for the total count of distinct sums.
    // BigInt is used to prevent integer overflow before the final modulo operation,
    // as intermediate sums can be very large.
    let totalDistinctSumCount = BigInt(0);

    // Define the modulus constant. This is a common large prime used in programming challenges.
    const RESULT_MODULUS = BigInt(10**9 + 7);

    // Iterate through possible group sizes.
    // The loop starts from 'minGroupSize' and goes up to 'maxValue + 1'.
    // Each 'currentGroupSize' represents the number of elements chosen to form a sum.
    for (let currentGroupSize = minGroupSize; currentGroupSize <= maxValue + 1; currentGroupSize++) {
        // Calculate the absolute minimum possible sum for 'currentGroupSize' distinct non-negative integers.
        // This is achieved by selecting 0, 1, 2, ..., (currentGroupSize - 1).
        // The sum of an arithmetic progression is n * (first + last) / 2.
        // Here, n = currentGroupSize, first = 0, last = currentGroupSize - 1.
        // So, minimum sum = currentGroupSize * (currentGroupSize - 1) / 2.
        let lowestPossibleSumForGroup = (BigInt(currentGroupSize) * (BigInt(currentGroupSize) - BigInt(1))) / BigInt(2);

        // Calculate the absolute maximum possible sum for 'currentGroupSize' distinct non-negative integers,
        // where each number is chosen from the range 0 to 'maxValue'.
        // This is achieved by selecting the largest 'currentGroupSize' numbers:
        // (maxValue - currentGroupSize + 1), ..., (maxValue - 1), maxValue.
        // Again, using the arithmetic progression sum formula.
        // Here, n = currentGroupSize, first = (maxValue - currentGroupSize + 1), last = maxValue.
        let highestPossibleSumForGroup = (BigInt(currentGroupSize) * (BigInt(maxValue - currentGroupSize + 1) + BigInt(maxValue))) / BigInt(2);

        // The number of distinct sums possible for this specific 'currentGroupSize'
        // is given by (highest sum - lowest sum + 1).
        // This accounts for all integer sums within the calculated range [lowestPossibleSumForGroup, highestPossibleSumForGroup].
        let distinctSumsInCurrentRange = highestPossibleSumForGroup - lowestPossibleSumForGroup + BigInt(1);

        // Add this count to the overall running total.
        totalDistinctSumCount = totalDistinctSumCount + distinctSumsInCurrentRange;
    }

    // Apply the modulo operation to the final accumulated sum count.
    const finalComputedResult = totalDistinctSumCount % RESULT_MODULUS;

    // Output the final result as a string to standard output.
    console.log(finalComputedResult.toString());
}

// --- Input Handling Section ---
// This part is responsible for reading input from the standard input stream,
// which is a common practice in environments like competitive programming judges.

// Import the 'fs' (file system) module, necessary for reading files.
const fileSystemModule = require("fs");

// Define the path to the standard input stream.
const standardInputPath = "/dev/stdin";

// Read the entire content of the standard input file as a UTF-8 string.
const rawInputContentString = fileSystemModule.readFileSync(standardInputPath, "utf8");

// Process the raw input:
// 1. Trim any leading or trailing whitespace.
// 2. Split the content into an array of strings, where each string represents a line.
const processedInputLines = rawInputContentString.trim().split("\n");

// Invoke the primary function to execute the core logic with the prepared input data.
computeSumCombinations(processedInputLines);