// This function receives the entire input data as a single string parameter.
function ProcessInput(rawData) {
    let parsedValues = rawData.split(" ");

    const lowerBound = +parsedValues[0];      // The first numerical boundary for iteration.
    const upperBound = +parsedValues[1];      // The second numerical boundary for iteration.
    const firstDivisor = +parsedValues[2];    // The initial number used for checking divisibility.
    const secondDivisor = +parsedValues[3];   // The subsequent number used for checking divisibility.

    let resultTally = 0; // A counter initialized to zero, to store the final outcome.

    // Loop through numbers from the lower bound up to and including the upper bound.
    for (let iteratorValue = lowerBound; iteratorValue <= upperBound; iteratorValue++) {
        // Check if the current number is perfectly divisible by either of the specified divisors.
        if ((iteratorValue % firstDivisor === 0) || (iteratorValue % secondDivisor === 0)) {
            // If it is divisible by C or D, we do not increment the counter.
            // This block intentionally remains empty as per the logic.
        } else {
            // If the number is not divisible by C and not divisible by D,
            // then we increment our result tally.
            resultTally += 1;
        }
    }

    // Output the final computed count to the standard console.
    console.log(resultTally);
}


// --- DO NOT MODIFY THE FOLLOWING SECTION ---
// This part is responsible for reading standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));