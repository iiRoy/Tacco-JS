// This file implements a solution to find the smallest positive difference.
// For each input integer 'N', it determines the minimum value of (N^3 - A^3 - B^3)
// where A and B are positive integers, and A < N, B <= A.
// The program reads multiple integers from standard input, stopping when it encounters a zero.

// --- Precomputation of Cube Values ---
// Define a constant for the upper limit of numbers whose cubes will be precalculated.
// This value corresponds to the maximum possible input 'z' from the original problem,
// which dictates the size of our cube lookup table.
const CUBE_CACHE_LIMIT = 1111;

// Declare an array to store the cubes of integers.
// Using 'let' as this array is populated sequentially.
let cubeLookupTable = [];

// Populate the `cubeLookupTable` with the cubes of numbers from 0 up to `CUBE_CACHE_LIMIT`.
// This step is an optimization to avoid repeated `Math.pow()` calls during the main computation.
for (let currentNumber = 0; currentNumber <= CUBE_CACHE_LIMIT; ++currentNumber) {
    // Calculate the cube using multiplication for potentially better performance than `Math.pow`.
    cubeLookupTable[currentNumber] = currentNumber * currentNumber * currentNumber;
}

// --- Input Acquisition and Processing ---
// Import the Node.js 'fs' (file system) module to handle input/output operations.
const fileSystem = require('fs');

// Read the entire content of standard input (`/dev/stdin`) synchronously.
// The input is assumed to be UTF-8 encoded text.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input string:
// 1. `trim()` removes any leading or trailing whitespace (like extra newlines).
// 2. `split('\n')` divides the string into an array of substrings, using the newline character as a separator.
//    Each element in `inputLines` will be a string representing a line from the input.
let inputLines = rawInputContent.trim().split('\n');

// --- Main Problem Solving Loop ---
// Enter an infinite loop to process each input line until a specific termination condition is met.
// The `for (;;)` construct is an idiomatic way to write an infinite loop in JavaScript.
for (;;) {
    // Retrieve the first line from the `inputLines` array and remove it.
    // `shift()` modifies the array in place.
    // `Number.parseInt(..., 10)` converts the string line to an integer, specifying base 10.
    // This is a robust way to ensure numeric conversion.
    const currentTargetN = Number.parseInt(inputLines.shift(), 10);

    // Check if the `currentTargetN` is the sentinel value (0).
    // If it is, this indicates the end of the input data, and the loop should terminate.
    if (currentTargetN === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize a variable to track the smallest positive difference found for the current `currentTargetN`.
    // `Infinity` is used as an initial value to ensure that the first valid positive difference will always be smaller.
    let smallestPositiveDifference = Infinity;

    // Retrieve the cube of `currentTargetN` from the precomputed lookup table.
    // This value is constant for the current iteration of the main loop.
    const targetNCubed = cubeLookupTable[currentTargetN];

    // --- Nested Loops for Finding Differences ---
    // Outer loop: Iterates for the first operand 'A' (originally 'i').
    // 'A' must be less than 'N' and greater than 0.
    for (let firstOperandA = currentTargetN - 1; firstOperandA > 0; --firstOperandA) {
        // Retrieve the cube of `firstOperandA` from the precomputed table.
        const firstOperandACubed = cubeLookupTable[firstOperandA];

        // Inner loop: Iterates for the second operand 'B' (originally 'j').
        // 'B' must be less than or equal to 'A' and greater than 0.
        // This constraint (B <= A) helps avoid duplicate calculations (e.g., A=3, B=2 vs A=2, B=3).
        for (let secondOperandB = firstOperandA; secondOperandB > 0; --secondOperandB) {
            // Retrieve the cube of `secondOperandB` from the precomputed table.
            const secondOperandBCubed = cubeLookupTable[secondOperandB];

            // Calculate the current difference: N^3 - A^3 - B^3.
            const currentCalculatedDelta = targetNCubed - firstOperandACubed - secondOperandBCubed;

            // Check two conditions to update `smallestPositiveDifference`:
            // 1. `currentCalculatedDelta > 0`: The difference must be positive.
            // 2. `currentCalculatedDelta < smallestPositiveDifference`: The current positive difference must be smaller than the previously recorded minimum.
            if (currentCalculatedDelta > 0 && currentCalculatedDelta < smallestPositiveDifference) {
                // If both conditions are met, update `smallestPositiveDifference` with this new, smaller positive value.
                smallestPositiveDifference = currentCalculatedDelta;
            }
        }
    }

    // After iterating through all possible combinations of A and B for the current N,
    // print the `smallestPositiveDifference` to standard output.
    console.log(smallestPositiveDifference);
}