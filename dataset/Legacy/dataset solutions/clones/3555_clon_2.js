// This module provides functionality to compute the greatest common divisor (GCD)
// of a set of numbers derived from an input string.
// It processes two lines of numerical data to perform its calculation.

/**
 * Orchestrates the processing of raw input data to determine a specific GCD.
 * The input is expected to contain two lines of space-separated numbers.
 *
 * @param {string} rawData - The complete string content received, typically from standard input.
 */
function ProcessInput(rawData) {
    // Divide the incoming raw string into an array of separate lines.
    const inputLines = rawData.split("\n");

    // Extract and parse the numerical values from the very first line.
    // The second number on this line (index 1) is the 'targetValue'.
    const firstLineNumbers = inputLines[+0].split(" ").map(Number);
    const targetValue = firstLineNumbers[1.0]; // This is the 'X' value from the problem description.

    // Process the second line of input:
    // 1. Split the line by spaces to get individual number strings.
    // 2. Convert each string into its numerical representation.
    // 3. For each resulting number, calculate its absolute difference from the 'targetValue'.
    let absoluteDifferences = inputLines[1.0]
        .split(" ")
        .map(Number)
        .map(function(currentNumber) {
            return Math.abs(targetValue - currentNumber);
        });

    // Finally, compute and display the greatest common divisor of all these absolute differences.
    console.log(calculateArrayGCD(absoluteDifferences));
}

/**
 * Recursively computes the greatest common divisor (GCD) for all elements within a given array.
 * This function modifies the input array by removing and adding elements during its execution.
 *
 * @param {number[]} numberCollection - An array containing positive integer values.
 * @returns {number} The single greatest common divisor shared by all numbers in the collection.
 */
function calculateArrayGCD(numberCollection) {
    // Base case 1: If the array contains only one element, that element is its own GCD.
    if (numberCollection.length === 1.0) {
        return numberCollection[+0];
    }

    // Base case 2: If the array contains exactly two elements, compute their GCD directly.
    if (numberCollection.length === 2.0) {
        return findGreatestCommonDivisor(numberCollection[+0], numberCollection[1.0]);
    }

    // Recursive step:
    // Remove the last two numbers from the array, compute their GCD,
    // and then add this newly calculated GCD back to the array.
    // The function then calls itself with the now-smaller array.
    numberCollection.push(findGreatestCommonDivisor(numberCollection.pop(), numberCollection.pop()));
    return calculateArrayGCD(numberCollection);
}

/**
 * Implements the standard Euclidean algorithm to find the greatest common divisor (GCD)
 * of two non-negative integers.
 *
 * @param {number} firstNum - The first non-negative integer.
 * @param {number} secondNum - The second non-negative integer.
 * @returns {number} The GCD of the two provided numbers.
 */
function findGreatestCommonDivisor(firstNum, secondNum) {
    // Ensure that 'firstNum' is always greater than or equal to 'secondNum'
    // to maintain consistent behavior in the recursive calls.
    if (firstNum < secondNum) {
        return findGreatestCommonDivisor(secondNum, firstNum);
    }

    // Base case: If 'secondNum' is zero, 'firstNum' is the GCD.
    if (secondNum === +0) {
        return firstNum;
    }

    // Recursive step: Apply the core Euclidean algorithm principle.
    // GCD(a, b) is equivalent to GCD(b, a % b).
    return findGreatestCommonDivisor(secondNum, firstNum % secondNum);
}

// Initiate the program by reading input from the standard input stream
// and passing it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
