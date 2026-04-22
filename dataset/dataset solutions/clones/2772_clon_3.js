"use strict";

// Define a constant for the standard input file path
const STANDARD_INPUT_SOURCE = "/dev/stdin";

/**
 * Reads and processes raw input data from a specified file path.
 * This function handles file system interaction, data trimming, and line splitting.
 * @param {string} sourcePath The path to the input file (e.g., "/dev/stdin").
 * @returns {string[]} An array of strings, where each string represents a line from the input.
 */
const acquireProcessedInputLines = (sourcePath) => {
    // Dynamically require 'fs' to keep it scoped if not needed elsewhere
    const fileSystemModule = require("fs"); 
    // Read the entire file content as UTF-8 string
    const rawInputContent = fileSystemModule.readFileSync(sourcePath, "utf8");
    // Trim any leading/trailing whitespace from the whole content
    const cleanedContent = rawInputContent.trim();
    // Split the content into an array of lines, handling multiple newlines as a single separator
    const individualLines = cleanedContent.split(/\n+/);
    return individualLines;
};

/**
 * Main execution block of the program.
 * It processes the input lines to calculate and output a sequence of numbers.
 * @param {string[]} inputDataLines An array of strings, each representing a line of input.
 */
((inputDataLines) => {
    // --- Input Validation and Parsing ---

    // Ensure there are at least two lines of input (one for N, one for A)
    if (inputDataLines.length < 2) {
        console.error("Error: Insufficient input provided. Expected at least two lines for 'N' and array 'A'.");
        return; // Terminate execution
    }

    // Parse the first line as the total number of elements (N)
    const totalElementCount = parseInt(inputDataLines[0], 10);

    // Parse the second line as the array of sum values (A)
    // It splits by one or more spaces, filters out any empty string tokens, and converts to numbers.
    const initialSumArray = inputDataLines[1].split(/\s+/).filter(Boolean).map(Number);

    // Comprehensive guard clause for input parameters
    // 1. Check if 'totalElementCount' is a valid number and positive.
    // 2. Crucially, check if 'totalElementCount' is odd, as this algorithm relies on odd 'N'.
    //    For even 'N', the system A[i] = B[i] + B[(i+1)%N] does not have a unique solution or may not have any.
    // 3. Verify that the parsed array 'initialSumArray' contains exactly 'totalElementCount' elements.
    if (isNaN(totalElementCount) || totalElementCount <= 0 || totalElementCount % 2 === 0 || initialSumArray.length !== totalElementCount) {
        console.error("Error: Invalid input parameters. 'N' must be a positive odd integer, and the array 'A' must contain exactly 'N' elements.");
        return; // Terminate execution
    }

    // --- Calculation of the first derived term (2 * B[N-1]) ---

    // This section computes the doubled value of the last element (B[N-1])
    // using an alternating sum pattern: A[N-1] - A[0] + A[1] - A[2] + ... + A[N-2].
    // This is a known property for cyclic sum problems where A[i] = B[i] + B[(i+1)%N] and N is odd.
    // The result of this sum is 2 * B[N-1].
    let doubledLastResultTerm = initialSumArray[totalElementCount - 1]; // Initialize with A[N-1]

    // Loop to accumulate the alternating sum.
    // The loop iterates (N-1)/2 times.
    // For N=3, it runs once (i=0).
    // For N=5, it runs twice (i=0, 1).
    for (let currentLoopIndex = 0; currentLoopIndex < (totalElementCount - 1) / 2; currentLoopIndex++) {
        const subtractTermIndex = 2 * currentLoopIndex;     // Index for A[0], A[2], A[4], ...
        const addTermIndex = 2 * currentLoopIndex + 1;      // Index for A[1], A[3], A[5], ...

        doubledLastResultTerm -= initialSumArray[subtractTermIndex]; // Subtract A[2*i]
        doubledLastResultTerm += initialSumArray[addTermIndex];      // Add A[2*i+1]
    }

    // --- Iterative calculation of remaining doubled terms ---

    // Array to store the doubled results, initially containing 2 * B[N-1].
    // Elements will be added in reverse order (2*B[N-1], 2*B[N-2], ..., 2*B[0]).
    const interimDoubledResultsReversed = [doubledLastResultTerm];

    // Iterate backwards from N-2 down to 0 to find the preceding doubled terms.
    // The relation used is 2*B[k] = 2*A[k] - 2*B[k+1], derived from B[k] = A[k] - B[k+1].
    for (let k = totalElementCount - 2; k >= 0; k--) {
        // Retrieve the previously calculated doubled term (which corresponds to 2 * B[k+1]).
        const previousTermDoubled = interimDoubledResultsReversed[interimDoubledResultsReversed.length - 1];
        
        // Calculate the current term's doubled value.
        const currentTermDoubled = (2 * initialSumArray[k]) - previousTermDoubled;
        
        // Add the newly calculated doubled term to our array.
        interimDoubledResultsReversed.push(currentTermDoubled);
    }

    // --- Final processing and output ---

    // Reverse the array to obtain the sequence in correct order (2*B[0], 2*B[1], ..., 2*B[N-1]).
    const orderedDoubledResultSequence = interimDoubledResultsReversed.reverse();

    // Convert the doubled values to the actual B_i values by dividing each by 2.
    // This is a key Type III modification, assuming the problem expects B_i, not 2*B_i.
    const finalResultValues = orderedDoubledResultSequence.map(val => val / 2);

    // Output the final sequence of B_i values, joined by spaces.
    console.log(finalResultValues.join(" "));

})(acquireProcessedInputLines(STANDARD_INPUT_SOURCE));