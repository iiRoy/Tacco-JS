// Function responsible for orchestrating the numerical analysis based on provided input
function processInputData(rawData) {
    // Initial validation: ensure the input is a non-empty string
    if (typeof rawData !== 'string' || rawData.trim().length === 0) {
        console.error("Execution halted: Input data is either missing or not a valid string.");
        return; // Terminate if input is invalid
    }

    const processedText = rawData.trim(); // Remove leading/trailing whitespace
    // Convert the cleaned input string into an integer
    const primaryNumericValue = parseInt(processedText, 10);

    // Further validation: check if the parsed value is a positive integer
    if (isNaN(primaryNumericValue) || primaryNumericValue <= 0) {
        console.error("Execution halted: Parsed input is not a positive integer.");
        return; // Terminate if the number is invalid
    }

    // Initialize an accumulator for the total count of divisors across all iterations
    let aggregatedDivisorSum = 0;

    // Begin a loop where a 'subtraction_operand' decreases from 1 up to (primaryNumericValue - 1)
    for (let subtractionOperand = 1; subtractionOperand < primaryNumericValue; subtractionOperand++) {
        // Calculate the current difference value
        const currentDifference = primaryNumericValue - subtractionOperand;

        // As a protective measure, although currentDifference will always be > 0 here,
        // it's good practice to ensure the value passed to the divisor function is valid.
        if (currentDifference > 0) {
            // Add the number of divisors for the 'currentDifference' to our running total
            aggregatedDivisorSum += calculatePositiveDivisors(currentDifference);
        }
    }

    // Output the final computed sum of divisors to the console
    console.log(aggregatedDivisorSum);
}

// Helper function designed to compute the total number of positive divisors for a given integer
function calculatePositiveDivisors(targetNumber) {
    // Handle trivial cases for divisor calculation
    if (targetNumber <= 0) {
        return 0; // Non-positive numbers have no positive divisors
    }
    if (targetNumber === 1) {
        return 1; // The number 1 has only one positive divisor (itself)
    }

    let foundFactorsBelowSqrt = 0; // Counts divisors found up to the square root of 'targetNumber'
    let isPerfectSquareFlag = false; // Flag to indicate if 'targetNumber' is a perfect square

    // Iterate through potential factors starting from 1 up to the square root of 'targetNumber'.
    // We use 'i * i <= targetNumber' to avoid floating-point issues with Math.sqrt().
    for (let iterationFactor = 1; iterationFactor * iterationFactor <= targetNumber; iterationFactor++) {
        // Check if 'iterationFactor' evenly divides 'targetNumber'
        if (targetNumber % iterationFactor === 0) {
            foundFactorsBelowSqrt++; // Increment count for this divisor

            // If the square of 'iterationFactor' is exactly 'targetNumber',
            // then 'iterationFactor' is the square root, meaning it's a "double" factor (counted once).
            if (iterationFactor * iterationFactor === targetNumber) {
                isPerfectSquareFlag = true; // Set flag for adjustment
            }
        }
    }

    // The total number of divisors is calculated using the property that divisors come in pairs (d, N/d).
    // If N is a perfect square, its square root (which is one of these 'd' values) forms a pair with itself,
    // and thus is counted only once, not twice.
    // The formula (foundFactorsBelowSqrt * 2) accounts for all pairs.
    // If 'isPerfectSquareFlag' is true, we subtract 1 because the square root factor was counted once
    // but would be doubled incorrectly if not adjusted.
    const finalDivisorCount = (foundFactorsBelowSqrt * 2) - (isPerfectSquareFlag ? 1 : 0);
    return finalDivisorCount;
}

// Main execution entry point: Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));