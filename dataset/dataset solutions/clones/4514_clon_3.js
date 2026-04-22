// A utility function to compute the factorial of a number modulo a large prime.
function computeFactorialMod(targetNum) {
    const MOD_CONSTANT = 1000000007; // Defines the modulus for calculations.

    // Handle edge cases for factorial definition.
    if (targetNum < 0) {
        // Factorial is not defined for negative numbers in standard contexts.
        // Returning 0 or throwing an error are common approaches; 0 is chosen here
        // assuming problem constraints prevent negative inputs.
        return 0;
    }
    if (targetNum === 0) {
        return 1; // By definition, 0! is 1.
    }

    let currentProduct = 1; // Accumulates the factorial product.
    let iterationIndex = 1; // Loop counter.

    // Calculate factorial iteratively, applying modulo at each multiplication.
    // This prevents intermediate results from exceeding JavaScript's safe integer limit.
    while (iterationIndex <= targetNum) {
        currentProduct = (currentProduct * iterationIndex) % MOD_CONSTANT;
        iterationIndex++;
    }
    return currentProduct;
}

// This module processes input data to determine a specific combinatorial result
// based on two numeric counts and their absolute difference.
function ExecuteSolution(sourceData) {
    // Define the large prime modulus for all calculations within this function.
    const MODULO_CONSTANT = 1000000007;

    // Step 1: Parse the raw input string.
    // The input is expected to be a single line containing two space-separated integers.
    const inputSegments = sourceData.trim().split('\n')[0].split(' ');

    // Step 2: Extract and convert the numeric values.
    // Using parseInt with radix 10 for explicit base conversion.
    const firstEntityCount = parseInt(inputSegments[0], 10);
    const secondEntityCount = parseInt(inputSegments[1], 10);

    // Step 3: Input validation - ensure parsed values are indeed numbers.
    if (isNaN(firstEntityCount) || isNaN(secondEntityCount)) {
        console.error("Error: Invalid numeric input detected. Please provide two integers.");
        return; // Halt execution if input is malformed.
    }

    // Step 4: Calculate the absolute difference between the two counts.
    const absoluteDifferenceValue = Math.abs(firstEntityCount - secondEntityCount);

    let finalCalculatedResult = 0; // Variable to store the outcome before printing.

    // Step 5: Apply conditional logic based on the absolute difference.
    switch (absoluteDifferenceValue) {
        case 0:
            // Case: The two counts are identical (e.g., N, N).
            // Result is (fact(N) * fact(N) * 2) % MOD.
            const factorialValA_Equal = computeFactorialMod(firstEntityCount);
            const factorialValB_Equal = computeFactorialMod(secondEntityCount); // Will be same as A
            
            // Calculate (factA * factB) % MOD first.
            const productOfFactorialsEqual = (factorialValA_Equal * factorialValB_Equal) % MODULO_CONSTANT;
            
            // Then multiply by 2 and apply modulo again.
            finalCalculatedResult = (productOfFactorialsEqual * 2) % MODULO_CONSTANT;
            break;

        case 1:
            // Case: The two counts differ by exactly one (e.g., N, N+1 or N+1, N).
            // Result is (fact(N1) * fact(N2)) % MOD.
            const factorialValA_Diff = computeFactorialMod(firstEntityCount);
            const factorialValB_Diff = computeFactorialMod(secondEntityCount);
            finalCalculatedResult = (factorialValA_Diff * factorialValB_Diff) % MODULO_CONSTANT;
            break;

        default:
            // Case: The two counts differ by two or more.
            // The problem statement implies a result of 0 in this scenario.
            finalCalculatedResult = 0;
            break;
    }

    // Step 6: Display the final computed result.
    console.log(finalCalculatedResult);
}

// The following section handles standard input/output operations for the execution environment.
// It reads all data from the standard input stream (/dev/stdin) and passes it to the
// main processing function. This part is typically provided by the platform and should
// not be altered for problem submission.
ExecuteSolution(require("fs").readFileSync("/dev/stdin", "utf8"));