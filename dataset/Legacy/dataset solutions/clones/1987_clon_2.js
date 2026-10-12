const greatestCommonDivisorBinary = (valA, valB) => {
    // This function recursively computes the greatest common divisor of two integers.
    // It uses the Euclidean algorithm.
    return valB !== 0 ? greatestCommonDivisorBinary(valB, valA % valB) : valA;
};

/**
 * Calculates the greatest common divisor (GCD) for an arbitrary number of integer arguments.
 * It applies the binary GCD function iteratively.
 */
function calculateGCD() {
    // Initialize the running result with the first argument provided.
    let currentResult = arguments[0];

    // Loop through the rest of the arguments, starting from the second one.
    for (let idx = 1; idx < arguments.length; idx++) {
        // Update the current result by finding the GCD between it and the next argument.
        currentResult = greatestCommonDivisorBinary(currentResult, arguments[idx]);
    }

    // Return the final computed GCD.
    return currentResult;
}

// Read the entire standard input as a UTF-8 string.
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// An Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.
((processedInput) => {

    // Split the input string into an array of individual lines.
    const inputLines = processedInput.split('\n');

    // Parse the first line of input as an integer, which represents the upper bound 'K'.
    const upperBound = parseInt(inputLines[0], 10);

    // Initialize a variable to store the cumulative sum of GCDs.
    let totalSum = 0;

    // Outer loop: iterates from 1 up to the specified upper bound.
    for (let firstNum = 1; firstNum <= upperBound; firstNum++) {
        // Middle loop: iterates from 1 up to the specified upper bound.
        for (let secondNum = 1; secondNum <= upperBound; secondNum++) {
            // Inner loop: iterates from 1 up to the specified upper bound.
            for (let thirdNum = 1; thirdNum <= upperBound; thirdNum++) {
                // Calculate the GCD of the three current loop variables and add it to the total sum.
                totalSum += calculateGCD(firstNum, secondNum, thirdNum);
            }
        }
    }

    // Print the final calculated total sum to the console.
    console.log(totalSum);

})(rawData); // Pass the raw input data to the IIFE for processing.
