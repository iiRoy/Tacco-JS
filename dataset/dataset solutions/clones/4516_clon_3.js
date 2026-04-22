/* This script processes two numeric inputs to compute a specific result based on their difference.
 * The calculation involves a modified factorial operation modulo a large prime.
 */
function ProcessInputData(rawData) {
    // Define the large prime modulus used in calculations.
    const MOD_VAL = 1000000007;

    /**
     * Performs modular multiplication (a * b) % m.
     * Ensures intermediate products stay within modular arithmetic rules.
     * @param {number} factor1 - The first number.
     * @param {number} factor2 - The second number.
     * @param {number} modulus - The modulus to apply.
     * @returns {number} The result of (factor1 * factor2) % modulus.
     */
    const performModularMultiplication = (factor1, factor2, modulus) => {
        // Explicitly convert to Number to prevent potential string concatenation issues,
        // although `parseInt` on inputs should handle this for the main counts.
        return ( (Number(factor1) % modulus) * (Number(factor2) % modulus) ) % modulus;
    };

    /**
     * Computes a recursive "pseudo-factorial" value modulo MOD_VAL.
     * This function precisely replicates the specific modular behavior from the original code,
     * where 'val' itself is modded before multiplication in each recursive step.
     * @param {number} val - The integer for which to compute the pseudo-factorial.
     * @returns {number} The computed pseudo-factorial modulo MOD_VAL.
     */
    const calculateModularFactorialish = (val) => {
        // Base case: Factorial of 0 or any non-positive integer is defined as 1 in this context.
        if (val <= 0) {
            return 1;
        }

        // Apply the specific modular behavior: (val % MOD) * (recursive_result % MOD) % MOD
        // The recursive_result (from calculateModularFactorialish(val - 1)) is already modulo MOD_VAL.
        const currentTermMod = val % MOD_VAL;
        const previousFactorialResultMod = calculateModularFactorialish(val - 1);

        return performModularMultiplication(currentTermMod, previousFactorialResultMod, MOD_VAL);
    };

    // --- Input parsing and initial processing ---
    // Ensure the raw input is treated as a string, trim any leading/trailing whitespace, and split into lines.
    const inputLines = String(rawData).trim().split('\n');

    // Guard clause: Check if any input lines were successfully provided.
    if (inputLines.length === 0) {
        console.log("Error: No input data received. Please provide at least one line.");
        return; // Terminate execution gracefully.
    }

    // Extract the first line, which is expected to contain the two space-separated counts.
    const numericStrings = inputLines[0].split(' ');

    // Guard clause: Validate that exactly two numeric values are present on the first line.
    if (numericStrings.length < 2) {
        console.log("Error: Insufficient numeric values found on the first line. Expected two space-separated numbers.");
        return; // Terminate execution.
    }

    // Parse the string values into base-10 integers.
    let countEntityA = parseInt(numericStrings[0], 10);
    let countEntityB = parseInt(numericStrings[1], 10);

    // Guard clause: Validate successful parsing of both input values.
    if (isNaN(countEntityA) || isNaN(countEntityB)) {
        console.log("Error: One or both input values are not valid numbers. Please check your input format.");
        return; // Terminate execution.
    }

    // --- Core Logic based on the difference of counts ---
    // Calculate the absolute difference between the two parsed counts.
    const absoluteCountDifference = Math.abs(countEntityA - countEntityB);

    let computedOutcome = 0; // Initialize a variable to store the final calculated result.

    // Conditional evaluation based on the absolute difference in counts.
    if (absoluteCountDifference > 1) { // This condition covers cases where the difference is 2 or more.
        computedOutcome = 0;
    } else if (absoluteCountDifference === 1) { // Exactly one unit of difference between the counts.
        // Calculate the modified factorials modulo MOD_VAL for both counts.
        const factResultA = calculateModularFactorialish(countEntityA);
        const factResultB = calculateModularFactorialish(countEntityB);
        // The final result is the modular product of these two factorial results.
        computedOutcome = performModularMultiplication(factResultA, factResultB, MOD_VAL);
    } else if (absoluteCountDifference === 0) { // The two counts are exactly equal.
        // Calculate the modified factorials modulo MOD_VAL for both (they will be identical).
        const factResultA = calculateModularFactorialish(countEntityA);
        const factResultB = calculateModularFactorialish(countEntityB); // Redundant call, but preserves original structure/logic flow.
        // The result is (factA * factB * 2) % MOD_VAL.
        let intermediateProduct = performModularMultiplication(factResultA, factResultB, MOD_VAL);
        computedOutcome = performModularMultiplication(intermediateProduct, 2, MOD_VAL);
    } else {
        // This 'else' block serves as an extra defensive guard, though Math.abs should ensure non-negative results.
        console.log("Warning: An unexpected negative absolute difference was calculated. Defaulting result to 0.");
        computedOutcome = 0;
    }

    // Output the final computed result to the console.
    console.log(computedOutcome);
}

// Do not modify the following lines: standard input/output handling.
// This part reads all input from stdin and invokes the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));