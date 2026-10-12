function ProcessInput(rawData) {
    rawData = rawData.trim(); // Remove leading/trailing whitespace
    const targetNumber = parseInt(rawData, 10); // Convert input string to an integer with base 10

    // The task is to find the sum of divisor counts for (targetNumber - currentValue)
    // where currentValue ranges from 1 up to targetNumber - 1.

    let totalDivisorSum = 0; // Initialize accumulator for the total count
    for (let currentValue = 1; currentValue < targetNumber; currentValue++) { // Iterate from 1 up to targetNumber - 1
        const difference = targetNumber - currentValue; // Calculate the difference

        totalDivisorSum += calculateDivisorCount(difference); // Add the number of divisors of the difference to the total
    }

    console.log(totalDivisorSum); // Output the final calculated sum
}

// This function determines the total number of divisors for a given positive integer.
function calculateDivisorCount(valueToCheck) {
    let divisorCounter = 0; // Counter for divisors found
    let perfectSquareDivisor = 0; // Flag for perfect square roots (to avoid double counting)

    // Iterate up to the square root of the number
    for (let iterator = 1; iterator * iterator <= valueToCheck; iterator++) {
        if (valueToCheck % iterator !== 0) { // If 'iterator' is not a divisor, skip
            continue;
        }
        if (iterator * iterator === valueToCheck) { // If 'iterator' is the square root, it's a single divisor
            perfectSquareDivisor++; // Mark that we found a perfect square divisor
        }
        divisorCounter++; // Increment divisor count for 'iterator'
    }

    // Each divisor 'iterator' (less than sqrt) has a corresponding divisor 'valueToCheck / iterator'.
    // So, we multiply the count by 2. If 'valueToCheck' is a perfect square, its square root was counted once,
    // but it's only one divisor, so we subtract 1 (represented by 'perfectSquareDivisor').
    return (divisorCounter * 2) - perfectSquareDivisor;
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
