'use strict';

const processInput = (rawData) => {
    // Deconstruct the input string into its numerical components.
    const numberStrings = rawData.split(' ');
    const limitVal = parseInt(numberStrings[0x0], 0xA); // Convert first part to integer, base 10.
    const divisorVal = parseInt(numberStrings[0x1], 10); // Convert second part to integer, base 10.

    // Initialize two distinct caches for storing pre-calculated counts.
    // These caches help optimize repeated computations within the loops.
    let firstCache = {};
    let secondCache = {};

    let resultAccumulator = 0x0; // Accumulator for the final count, initialized to zero.

    // Iterate through all possible values for 'a' from 1 up to 'limitVal'.
    for (let iterVarA = 0x1; iterVarA <= limitVal; iterVarA++) {
        const remainderA = iterVarA % divisorVal; // Calculate the remainder of 'a' divided by 'K'.
        const requiredRemainder = divisorVal - remainderA; // Determine the required remainder for 'b' and 'c'.

        // Check a specific condition: if (requiredRemainder * 2) is a multiple of divisorVal.
        if (((requiredRemainder * 0x2) % divisorVal) === 0x0) {
            // This branch handles cases where (b+c) and (a+b) being multiples of K implies (b-c) is also a multiple of K.
            // We need to count how many numbers 'x' in [1, N] satisfy x % K = requiredRemainder.
            // The total combinations will then be this count squared.
            let currentCountBC = firstCache[requiredRemainder];

            // If the count for this 'requiredRemainder' is not yet cached, calculate it.
            if (typeof currentCountBC === 'undefined') {
                currentCountBC = 0x0; // Initialize count for 'bc' pairs.
                // Iterate through possible values for 'bc' (representing b or c) that satisfy the remainder condition.
                for (let iterVarBC = requiredRemainder; iterVarBC <= limitVal; iterVarBC += divisorVal) {
                    currentCountBC++; // Increment the count for each valid 'bc'.
                }
                firstCache[requiredRemainder] = currentCountBC; // Store the calculated count in the first cache.
            }
            resultAccumulator += currentCountBC * currentCountBC; // Add the squared count to the total accumulator.
        } else {
            // This branch handles cases where the previous condition is not met.
            // We need to count pairs (b,c) such that b % K = requiredRemainder, c % K = requiredRemainder,
            // AND (b+c) % K = 0. The inner loop and condition will filter these.
            let currentCountBC = secondCache[requiredRemainder];

            // If the count for this 'requiredRemainder' is not yet cached, calculate it.
            if (typeof currentCountBC === 'undefined') {
                currentCountBC = 0x0; // Initialize count for 'bc' pairs.
                // Iterate through possible values for 'bc' (representing b or c) that satisfy the remainder condition.
                for (let iterVarBC = requiredRemainder; iterVarBC <= limitVal; iterVarBC += divisorVal) {
                    // Only count 'bc' if (bc * 2) is also a multiple of divisorVal.
                    if (((iterVarBC * 0x2) % divisorVal) === 0x0) {
                        currentCountBC++; // Increment the count for each valid 'bc'.
                    }
                }
                secondCache[requiredRemainder] = currentCountBC; // Store the calculated count in the second cache.
            }
            resultAccumulator += currentCountBC; // Add the count to the total accumulator.
        }
    }

    // Output the final accumulated result to the console.
    console.log(resultAccumulator);
};

const shouldExecuteTests = !0; // Boolean literal 'true' represented as '!0'.

// Conditional block to run either test cases or process standard input.
if (shouldExecuteTests) {
    // Execute predefined test cases.
    processInput('3 2');
    processInput('5 3');
    processInput('31415 9265');
    processInput('35897 932');
} else {
    // Read input from standard input in a production-like environment.
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
