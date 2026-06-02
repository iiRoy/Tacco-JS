"use strict";

// This function processes the incoming text data to solve a specific problem.
const processInput = inputData => {
    // First, clean up the input string by removing leading/trailing whitespace
    // and then splitting it into an array of lines.
    inputData = inputData.trim().split("\n");

    // Extract the two primary integer values from the first line of the input.
    // These represent the counts of two distinct items.
    const countA = parseInt(inputData[0].split(" ")[0]);
    const countB = parseInt(inputData[0].split(" ")[1]);

    // Check if the absolute difference between the two counts is greater than one.
    // If it is, it's impossible to arrange them in an alternating pattern,
    // so the result is zero.
    if (Math.abs(countA - countB) > 1) {
        console.log(0);
        return; // Exit the function early as no further calculation is needed.
    }

    // Define a large prime number to use as a modulus for all calculations.
    // This helps in preventing integer overflow and keeps results within a manageable range.
    const primeModulus = 1000000007;
    let finalResult = 1; // Initialize the accumulator for the factorial-like product.

    // Calculate the factorial of 'countA' modulo 'primeModulus'.
    // Each multiplication is performed with the modulus applied to both operands.
    for (let counter = 1; counter <= countA; counter++) {
        finalResult = (finalResult % primeModulus) * (counter % primeModulus);
    }

    // Calculate the factorial of 'countB' modulo 'primeModulus'.
    // This product is multiplied with the previously accumulated 'finalResult'.
    for (let counter = 1; counter <= countB; counter++) {
        finalResult = (finalResult % primeModulus) * (counter % primeModulus);
    }

    // Determine the final multiplier based on the relationship between 'countA' and 'countB'.
    // If 'countA' equals 'countB', there are two possible alternating arrangements (e.g., ABAB or BABA).
    // If their absolute difference is one, there's only one possible arrangement (e.g., ABABA or BABAB).
    // The expression `(countA === countB) + 1` cleverly evaluates to 2 if equal, and 1 if not.
    console.log(finalResult * ((countA === countB) + 1) % primeModulus);
};

// Read the entire content of standard input as a UTF-8 string
// and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
