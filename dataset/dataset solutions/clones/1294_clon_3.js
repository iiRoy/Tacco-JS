// Type III clone: This JavaScript program reads pairs of numbers (N, S) from standard input
// and for each pair, calculates the count of unique combinations of three distinct integers (a, b, c)
// such that 1 <= a < b < c <= N and their sum (a + b + c) equals S.
// Input processing terminates upon encountering the pair "0 0".

// A buffer to temporarily store incoming data chunks from standard input.
let dataAccumulator = '';

// Define a constant for the specific numeric pair that signals the end of input processing.
const END_OF_INPUT_MARKER = 0;

// Verify that the standard input stream is accessible within the current execution environment.
if (typeof process !== 'undefined' && process.stdin) {
    // Activate the standard input stream to begin receiving data.
    process.stdin.resume();
    // Configure the input stream to interpret incoming bytes as UTF-8 encoded text.
    process.stdin.setEncoding('utf-8');

    // Register an event listener to capture each incoming data segment.
    process.stdin.on('data', (incomingDataSegment) => {
        // Append the newly received data segment to our overall data buffer.
        dataAccumulator += incomingDataSegment;
    });

    // Register an event listener for when the standard input stream has completed transmitting data.
    process.stdin.on('end', () => {
        // Once all data has been received, initiate the primary processing function.
        analyzeInputData(dataAccumulator);
    });
} else {
    // If process.stdin is not available (e.g., in a browser environment), log an error.
    console.error("Error: Standard input (process.stdin) is not available. This script is designed for Node.js environments.");
}

/**
 * Parses and processes the entire raw input string received from standard input.
 * It iterates through each line, extracts parameters, and calculates triplet combinations.
 * @param {string} fullRawInputString - The complete string containing all input lines.
 */
function analyzeInputData(fullRawInputString) {
    // Split the raw input into an array of individual lines.
    // Using a regex to handle both Windows (\r\n) and Unix (\n) style newlines.
    // Also, filter out any lines that are empty after trimming whitespace.
    const processedInputLines = fullRawInputString.split(/\r?\n/).filter(lineText => lineText.trim() !== '');

    // Initialize an index to keep track of the current line being processed.
    let currentLineIndex = 0;

    // Begin the main loop to process each line until an explicit break condition is met.
    while (currentLineIndex < processedInputLines.length) {
        const activeLine = processedInputLines[currentLineIndex];
        currentLineIndex++; // Advance the line index for the next iteration.

        // Attempt to parse the current line into an array of numbers.
        // Each line is expected to contain two space-separated integers.
        const numericParameters = activeLine.split(' ').map(Number);

        // --- Input Validation and Early Exit Conditions ---
        // Check if the line contains exactly two numeric values and if they are valid numbers.
        if (numericParameters.length !== 2 || numericParameters.some(isNaN)) {
            console.error(`Warning: Skipping malformed input line "${activeLine}". Expected two valid numbers.`);
            continue; // Move to the next line without processing this one.
        }

        const maxIntegerN = numericParameters[0]; // The upper bound for the integers in the triplet (N).
        const desiredSumS = numericParameters[1]; // The target sum for the triplet (S).

        // Check for the global termination signal (N=0 and S=0).
        if (maxIntegerN === END_OF_INPUT_MARKER && desiredSumS === END_OF_INPUT_MARKER) {
            // If the termination marker is found, exit the entire processing loop.
            break;
        }

        // Initialize a counter for the number of valid triplets found for the current (N, S) pair.
        let validTripletCount = 0;

        // --- Optimization: Pre-check for impossible sums ---
        // The smallest possible sum for three distinct positive integers (1, 2, 3) is 6.
        // The largest possible sum for three distinct integers up to N is (N-2) + (N-1) + N = 3N - 3.
        // If the desired sum S falls outside this range, no triplets can satisfy the condition.
        if (desiredSumS < 6 || desiredSumS > (3 * maxIntegerN - 3)) {
            console.log(validTripletCount); // Output 0, as no combinations are possible.
            continue; // Proceed to the next input line.
        }

        // --- Core Logic: Triple Nested Loop for Combination Counting ---
        // Iterate through all possible combinations of three distinct integers (numA, numB, numC)
        // such that 1 <= numA < numB < numC <= maxIntegerN.

        // Loop for the first integer, 'numA'. It can go up to N-2 because there must be at least two larger integers (N-1, N).
        for (let numA = 1; numA <= maxIntegerN - 2; numA++) {
            // Loop for the second integer, 'numB'. It must be greater than 'numA' and can go up to N-1.
            for (let numB = numA + 1; numB <= maxIntegerN - 1; numB++) {
                // Loop for the third integer, 'numC'. It must be greater than 'numB' and can go up to N.
                for (let numC = numB + 1; numC <= maxIntegerN; numC++) {
                    // Check if the sum of the current triplet equals the desired target sum.
                    if ((numA + numB + numC) === desiredSumS) {
                        // If the sum matches, increment the counter.
                        validTripletCount++;
                    }
                }
            }
        }

        // Output the final count of valid triplets found for the current (N, S) input.
        console.log(validTripletCount);
    }
}