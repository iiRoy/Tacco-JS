const calculateDivisorCount = (targetNumber) => {
    // Initialize a counter for the number of divisors found.
    let divisorTally = 0;

    // Iterate from zero up to and including the target number.
    for (let iteratorIndex = 0; iteratorIndex <= targetNumber; iteratorIndex++) {
        // Check if the current iterator index is a divisor of the target number.
        // Note: Division by zero (targetNumber % 0) results in NaN, which does not equal 0.
        if (targetNumber % iteratorIndex === 0) {
            divisorTally++; // Increment the tally if it's a divisor.
        }
    }
    // Return the total count of divisors.
    return divisorTally;
};

const executePrimaryLogic = (rawInputString) => {
    // Convert the raw input string to a numerical upper limit.
    const upperLimit = Number(rawInputString);

    // Initialize a counter for numbers meeting specific criteria.
    let finalResultCount = 0;

    // Loop through numbers from zero up to the upper limit.
    for (let currentIterationValue = 0; currentIterationValue <= upperLimit; currentIterationValue++) {
        // Skip processing if the current number is even.
        if (currentIterationValue % 2 === 0) {
            continue;
        }

        // If the current number is odd, calculate its divisor count.
        // Check if the number of divisors is exactly eight.
        if (calculateDivisorCount(currentIterationValue) === 8) {
            finalResultCount++; // Increment the result count if it has eight divisors.
        }
    }

    // Output the final count to the console.
    console.log(finalResultCount);
};

// The following line handles standard input and calls the main processing function.
// It should not be modified as it's part of the execution environment.
executePrimaryLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
