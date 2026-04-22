// This module processes a string of numerical parameters to perform a specific counting operation.
function processInputData(rawDataString) {
    // Attempt to split the raw input string by whitespace to extract individual tokens.
    // Using trim() to remove leading/trailing whitespace and /\s+/ for robust splitting by one or more spaces.
    const numericTokens = rawDataString.trim().split(/\s+/);

    // Ensure we have enough tokens to proceed. A robust solution would handle fewer tokens more gracefully,
    // perhaps by throwing an error or logging a warning. Here, we'll log an error and exit.
    if (numericTokens.length < 4) {
        console.error("Error: Insufficient input parameters provided. Expected 4 numeric values.");
        return; // Terminate execution if input is malformed.
    }

    // Parse the numeric values from the tokens. Using parseInt with radix 10 for explicit base conversion.
    const lowerBound = parseInt(numericTokens[0], 10);
    const upperBound = parseInt(numericTokens[1], 10);
    const primaryDivisor = parseInt(numericTokens[2], 10);
    const secondaryDivisor = parseInt(numericTokens[3], 10);

    // Basic validation for parsed numbers. Check if any parsing resulted in NaN (Not a Number).
    if (isNaN(lowerBound) || isNaN(upperBound) || isNaN(primaryDivisor) || isNaN(secondaryDivisor)) {
        console.error("Error: One or more input parameters could not be parsed as valid numbers. Please provide numeric input.");
        return;
    }

    // Additional validation for logical bounds and divisors.
    // If the lower bound is greater than the upper bound, the range is empty, so no numbers qualify.
    if (lowerBound > upperBound) {
        console.log(0); // Output zero as there are no numbers in an inverse range.
        return;
    }

    // Divisors should ideally not be zero, as division by zero is undefined.
    // Adding a check for robustness, although problem contexts usually imply positive integers.
    if (primaryDivisor === 0 || secondaryDivisor === 0) {
        console.error("Error: Divisors cannot be zero. Please provide non-zero divisors.");
        return;
    }

    // Initialize a counter for numbers that satisfy the non-divisibility criteria.
    let nonDivisibleElementCount = 0;

    // Iterate through each integer within the specified range [lowerBound, upperBound] inclusive.
    // The loop variable `currentIterationValue` is declared with `let` for block-scoping.
    for (let currentIterationValue = lowerBound; currentIterationValue <= upperBound; currentIterationValue++) {
        // Determine if the current number is perfectly divisible by the primary divisor.
        const isDivisibleByPrimary = (currentIterationValue % primaryDivisor === 0);
        // Determine if the current number is perfectly divisible by the secondary divisor.
        const isDivisibleBySecondary = (currentIterationValue % secondaryDivisor === 0);

        // If the current number is NOT divisible by the primary divisor
        // AND it is also NOT divisible by the secondary divisor,
        // then it meets our specific counting condition.
        if (!isDivisibleByPrimary && !isDivisibleBySecondary) {
            nonDivisibleElementCount++; // Increment the counter for qualifying numbers.
        }
    }

    // Output the final accumulated count to standard output.
    console.log(nonDivisibleElementCount);
}

// The following section handles reading input from standard I/O and invoking the primary processing function.
// This is typically part of the execution environment setup for competitive programming or similar contexts,
// and should generally remain untouched when focusing on the core algorithm logic.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));