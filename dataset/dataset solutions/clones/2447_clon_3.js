// This JavaScript code calculates a combinatorial count based on an input sequence
// representing distances in a graph-like structure. It processes an array of integers
// and determines a specific product modulo a large prime number.
// The overall logic is derived from a C++ implementation, translated and extensively modified
// to exhibit Type III cloning characteristics, including renaming, structural changes,
// additions of validation, and helper functions.

// Main entry point for the solution logic.
// This function encapsulates the core algorithm.
function calculateCombinatorialCount() {
    // A specific large prime number used for modular arithmetic operations.
    // This is a common modulus in competitive programming for problems involving combinations or permutations.
    const MODULO_CONSTANT = 998244353n; // Using BigInt for modular operations to prevent overflow.

    // --- Input Processing Section ---
    // In a typical competitive programming environment, input would be read from standard input.
    // For demonstration, we'll use hardcoded or simulated input.
    // To use with Node.js in a competitive programming setup, uncomment the `readline` block:
    /*
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let inputLines = [];
    rl.on('line', (line) => inputLines.push(line));
    rl.on('close', () => {
        processProblemInput(inputLines); // Call the processing function once all input is received
    });

    function processProblemInput(lines) {
        const totalElements = parseInt(lines[0], 10);
        const distanceSequence = lines[1].split(' ').map(val => parseInt(val, 10));
        // ... rest of the logic inside this function ...
    }
    */

    // For a self-contained execution without `readline` (e.g., in a browser console or simple script):
    const inputLines = ["4", "0 1 2 1"]; // Sample input: N=4, D=[0,1,2,1]. Expected output: 2.

    // Parse the total number of elements from the first line of input.
    const totalElements = parseInt(inputLines[0], 10);

    // Parse the sequence of distance values from the second line of input.
    const distanceSequence = inputLines[1].split(' ').map(val => parseInt(val, 10));

    // --- Input Validation and Edge Cases ---
    // Guard clause: Ensure the number of elements is a positive integer.
    if (isNaN(totalElements) || totalElements <= 0 || !Number.isInteger(totalElements)) {
        console.log(0); // Output zero for invalid N.
        return;
    }

    // Guard clause: Verify that the length of the distance sequence matches the declared total elements.
    if (distanceSequence.length !== totalElements) {
        console.log(0); // Output zero if input size is inconsistent.
        return;
    }

    // Initialize an array to store the frequency of each distance value.
    // Each index `k` in `distanceFrequencies` will store the count of `k` in `distanceSequence`.
    const distanceFrequencies = new Array(totalElements).fill(0);

    // Populate the frequency array by iterating over the input distance sequence.
    for (let elementIdx = 0; elementIdx < totalElements; elementIdx++) {
        const currentDistanceVal = distanceSequence[elementIdx];

        // Guard clause: Validate that distance values are within expected bounds [0, totalElements-1].
        // This prevents out-of-bounds array access and handles malformed input.
        if (currentDistanceVal < 0 || currentDistanceVal >= totalElements) {
            console.log(0); // Output zero for out-of-range distance values.
            return;
        }
        // Increment the count for the observed distance value.
        distanceFrequencies[currentDistanceVal]++;
    }

    // Crucial initial structural checks based on problem constraints:
    // 1. The first element of the sequence (`distanceSequence[0]`) must be 0.
    // 2. The count of 0-distance elements (`distanceFrequencies[0]`) must be exactly 1.
    // If `distanceSequence[0]` is not 0, or if `distanceFrequencies[0]` is not 1 (i.e., 0 or >=2),
    // the structure is invalid, and the result is 0.
    if (distanceSequence[0] !== 0 || distanceFrequencies[0] !== 1) {
        console.log(0); // Output zero for invalid starting conditions.
        return;
    }

    // --- Modular Exponentiation Helper Function ---
    // This is an added utility function to robustly compute (base^exponent) % modulus
    // using BigInts to prevent overflow with potentially large intermediate numbers.
    const performModularExponentiation = (baseVal, expVal, modVal) => {
        let resultAccumulator = 1n; // Initialize result as BigInt 1.
        let currentBase = BigInt(baseVal);
        let currentExponent = BigInt(expVal);
        const currentModulus = BigInt(modVal);

        currentBase %= currentModulus; // Reduce base modulo currentModulus to optimize calculations.

        // Implement binary exponentiation (also known as exponentiation by squaring).
        // This method efficiently computes large powers.
        while (currentExponent > 0n) {
            if (currentExponent % 2n === 1n) { // If the exponent is odd, multiply result by base.
                resultAccumulator = (resultAccumulator * currentBase) % currentModulus;
            }
            currentBase = (currentBase * currentBase) % currentModulus; // Square the base.
            currentExponent /= 2n; // Halve the exponent.
        }
        return resultAccumulator; // Return the BigInt result.
    };

    // --- Main Calculation Loop ---
    // Initialize the final outcome with 1 (as it's a multiplicative accumulation).
    let finalOutcome = 1n; // Use BigInt for the outcome to ensure correct modular arithmetic throughout.

    // Iterate from the second level (index 2) up to, but not including, `totalElements`.
    // This loop structure corresponds to `REPS(i, 2, N)` in the original C++ code.
    for (let levelIndex = 2; levelIndex < totalElements; levelIndex++) {
        const countPreviousLevel = distanceFrequencies[levelIndex - 1];
        const countCurrentLevel = distanceFrequencies[levelIndex];

        // Guard clause: Early exit if an invalid structural relationship is detected.
        // If elements exist at the current level (`countCurrentLevel > 0`)
        // but no elements exist at the previous level (`countPreviousLevel === 0`),
        // then the structure is impossible, as elements at `levelIndex` must be connected
        // to elements at `levelIndex - 1`.
        if (countPreviousLevel === 0 && countCurrentLevel > 0) {
            console.log(0);
            return;
        }

        // Calculate the term: (countPreviousLevel ^ countCurrentLevel) % MODULO_CONSTANT.
        // The `performModularExponentiation` function correctly handles cases where `countCurrentLevel` is 0
        // (any number to the power of 0 is 1, including 0^0 which is typically defined as 1 in combinatorics).
        const currentTerm = performModularExponentiation(countPreviousLevel, countCurrentLevel, MODULO_CONSTANT);

        // Multiply the running `finalOutcome` by the `currentTerm`, then take modulo.
        finalOutcome = (finalOutcome * currentTerm) % MODULO_CONSTANT;
    }

    // --- Output Result ---
    // Convert the final BigInt outcome back to a standard Number for display,
    // as the result will fit within JavaScript's safe integer range after modulo.
    console.log(Number(finalOutcome));
}

// Execute the main solution function.
// This acts as the program's entry point.
calculateCombinatorialCount();