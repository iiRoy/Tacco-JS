// This module processes input data to calculate a specific combinatorial value.
// It handles numerical inputs based on their difference.
function computeFinalResult(rawInputString) {
    // Define constants for modular arithmetic operations.
    const ARITHMETIC_MODULUS = 1000000007; // A common prime modulus used in competitive programming.

    // Helper function to calculate factorial (n!) modulo ARITHMETIC_MODULUS.
    // This local function improves code organization and reusability within this scope.
    const calculateFactorialMod = (upperBound) => {
        let currentProduct = 1; // Initialize product for this factorial computation.
        for (let idx = 1; idx <= upperBound; ++idx) {
            currentProduct = (currentProduct * idx) % ARITHMETIC_MODULUS;
        }
        return currentProduct;
    };

    // Parse the raw string input.
    // The input is expected to be a single line containing two space-separated integers.
    const processedLines = rawInputString.trim().split('\n');
    const numericTokens = processedLines[0].split(' ').map(Number); // Convert string tokens to numbers.

    // Extract the two primary numerical values from the parsed tokens.
    let primaryValueA = numericTokens[0];
    let primaryValueB = numericTokens[1];

    // Introduce an early exit condition or guard clause for invalid inputs.
    // Although problem constraints usually guarantee valid inputs, this demonstrates robustness.
    if (isNaN(primaryValueA) || isNaN(primaryValueB) || primaryValueA < 0 || primaryValueB < 0) {
        console.log(0); // Output zero for invalid or non-positive inputs.
        return; // Terminate execution for invalid data.
    }

    // Determine the absolute difference between the two primary values.
    const absoluteDifference = Math.abs(primaryValueA - primaryValueB);

    let finalComputedOutcome = 0; // Default result, particularly for large differences.

    // Conditional logic based on the absolute difference of the input values.
    if (absoluteDifference >= 2) {
        // If the difference is 2 or more, the result is always 0.
        // 'finalComputedOutcome' is already initialized to 0, so no action needed here
        // other than explicit clarity if desired.
    } else {
        // For differences of 0 or 1, proceed with factorial calculations.
        const factorialOfA = calculateFactorialMod(primaryValueA);
        const factorialOfB = calculateFactorialMod(primaryValueB);

        // Calculate the product of the two factorials, applying modulo at each step.
        // Using BigInt for intermediate multiplication to ensure precision before final modulo,
        // especially if numbers were larger, though for current constraints `Number` is sufficient.
        // This is a stylistic change to demonstrate "data type" variation and "intermediate steps".
        let interimProduct = (BigInt(factorialOfA) * BigInt(factorialOfB)) % BigInt(ARITHMETIC_MODULUS);

        if (absoluteDifference === 0) {
            // If values are identical (A == B), multiply the product of factorials by 2.
            finalComputedOutcome = Number((interimProduct * 2n) % BigInt(ARITHMETIC_MODULUS));
        } else { // absoluteDifference === 1
            // If values differ by exactly 1, the result is simply the product of factorials.
            finalComputedOutcome = Number(interimProduct);
        }
    }

    // Output the final calculated numerical result to the console.
    console.log(finalComputedOutcome);
}

// The following section handles standard input/output.
// It reads the entire standard input stream and passes it to our processing function.
// This part should generally not be modified as it's the environment's interaction point.
computeFinalResult(require("fs").readFileSync("/dev/stdin", "utf8"));