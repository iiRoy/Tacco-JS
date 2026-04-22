// This function processes raw input data to count specific numeric triplets.
function processInputData(rawDataString) {
    // Trim whitespace and split the input string by space to get individual components.
    const parsedComponents = rawDataString.trim().split(' ');

    // --- Input Validation and Guard Clauses ---

    // Ensure exactly two numeric parameters are provided.
    if (parsedComponents.length !== 2) {
        // In a real application, this might throw an error or log to a specific error stream.
        // For competitive programming, direct `console.error` followed by a return is common.
        console.error("Input parsing error: Expected two numeric parameters, but received " + parsedComponents.length + ".");
        return;
    }

    // Convert the string components to base-10 integers.
    const upperBound = parseInt(parsedComponents[0], 10);
    const moduloDivisor = parseInt(parsedComponents[1], 10);

    // Validate that the parsed numbers are valid positive integers.
    // 'N' (upperBound) and 'k' (moduloDivisor) must be positive.
    if (isNaN(upperBound) || isNaN(moduloDivisor) || upperBound <= 0 || moduloDivisor <= 0) {
        console.error("Input validation error: Both N and k must be positive integers.");
        return;
    }

    // --- Core Logic Simplification and Early Exit Optimization ---

    // Mathematical observation: If 2 * upperBound is less than moduloDivisor,
    // it's impossible for any sum (a + b) to be a multiple of moduloDivisor,
    // since 'a' and 'b' are always >= 1. The maximum sum is 2 * upperBound.
    // If 2 * upperBound < moduloDivisor, then (a + b) is always < moduloDivisor,
    // making (a + b) % moduloDivisor equal to (a + b).
    // Since a, b >= 1, a + b >= 2, thus (a + b) % moduloDivisor can never be 0.
    // Therefore, no valid triplets can exist under this condition.
    if (2 * upperBound < moduloDivisor) {
        console.log(0); // Output 0 and terminate early.
        return;
    }

    // Initialize a counter for the total number of valid triplets (a, b, c).
    let validTripletCount = 0;

    // --- Iteration and Counting ---

    // Iterate through all possible integer values for the first term, 'a',
    // from 1 up to the defined 'upperBound' (N).
    for (let firstTerm = 1; firstTerm <= upperBound; firstTerm++) {
        // Calculate the remainder of the 'firstTerm' when divided by 'moduloDivisor'.
        const currentRemainder = firstTerm % moduloDivisor;

        // Key insight: In the original problem structure, the inner loops for 'b' and 'c'
        // effectively select numbers such that 'b % moduloDivisor' is equal to 'a % moduloDivisor'
        // and 'c % moduloDivisor' is also equal to 'a % moduloDivisor'.
        // Given this, the three conditions for a valid triplet:
        // 1. (a + b) % moduloDivisor === 0
        // 2. (a + c) % moduloDivisor === 0
        // 3. (b + c) % moduloDivisor === 0
        // all simplify to: ( (a % moduloDivisor) + (a % moduloDivisor) ) % moduloDivisor === 0,
        // or more simply, (2 * currentRemainder) % moduloDivisor === 0.
        // If this simplified condition is not met for a given 'firstTerm',
        // then no combination of 'b' and 'c' (with the same remainder property)
        // will satisfy the triplet criteria.
        if ((2 * currentRemainder) % moduloDivisor === 0) {
            // If the condition is met, we need to count how many valid 'b' and 'c' terms exist.
            // These are numbers 'x' such that:
            // 1. 1 <= x <= upperBound
            // 2. x % moduloDivisor === currentRemainder (or x % moduloDivisor === 0 if currentRemainder is 0)

            // Determine the smallest positive integer 'x' that satisfies the remainder condition.
            // If 'currentRemainder' is 0, the smallest positive 'x' is 'moduloDivisor' itself.
            // Otherwise, it's 'currentRemainder'.
            const sequenceStartValue = (currentRemainder === 0) ? moduloDivisor : currentRemainder;

            // Calculate the total count of numbers in the range [1, upperBound]
            // that fit this remainder pattern.
            // This count is the same for both 'b' and 'c'.
            // Formula: floor((N - start_val) / k) + 1
            const termsInSequence = Math.floor((upperBound - sequenceStartValue) / moduloDivisor) + 1;

            // Since any valid 'b' can combine with any valid 'c' (given 'a' satisfies the condition),
            // the number of triplets for this 'firstTerm' is the square of 'termsInSequence'.
            validTripletCount += termsInSequence * termsInSequence;
        }
    }

    // Output the final accumulated count of valid triplets.
    console.log(validTripletCount);
}

// --- Standard Competitive Programming Boilerplate ---

// This line ensures the function is called with input read from standard input.
// It uses Node.js's 'fs' module to synchronously read the entire content of '/dev/stdin' (standard input),
// and then decodes it as a UTF-8 string before passing it to the processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));