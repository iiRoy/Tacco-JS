/*
 * This module contains a specialized recursive function
 * designed to compute a value based on a base, exponent, and modulus.
 * It's structured similarly to modular exponentiation but
 * processes exponents using floating-point division.
 */
function expMod(baseVal, exponentVal, modulusVal)
{
    // A local variable to store the accumulating product.
    // It is initialized to the neutral element for multiplication.
    let currentProduct = 1;

    // The recursive computation proceeds only if the exponent is
    // greater than or equal to one.
    if (exponentVal >= 1)
    {
        // Recursively invoke the function with the base,
        // half of the current exponent (using standard floating-point division),
        // and the same modulus.
        currentProduct = expMod(baseVal, exponentVal / 2, modulusVal);

        // Check if the exponent has an exact zero remainder when divided by two.
        // This includes cases where `exponentVal` itself might be fractional.
        if (exponentVal % 2 === 0)
        {
            // If the condition is met, square the intermediate product
            // and apply the modulus.
            currentProduct = (currentProduct * currentProduct) % modulusVal;
        }
        else
        {
            // Otherwise, square the intermediate product, apply the modulus,
            // then multiply by the original base value, and apply the modulus again.
            currentProduct = (((currentProduct * currentProduct) % modulusVal) * baseVal) % modulusVal;
        }
    }

    // Return the final computed value for this recursive step.
    return currentProduct;
}

// --- Application's Primary Execution Flow ---

// Obtain the Node.js file system module for I/O operations.
const fileSystemModule = require('fs');

// Read the entire content from the standard input stream.
// The data is expected to be encoded in UTF-8.
let fileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Define a constant for the large prime modulus often used
// in competitive programming challenges.
const LARGE_PRIME_MODULUS = 1000000007;

// Process the acquired input:
// 1. Remove any leading/trailing whitespace.
// 2. Split the string into an array of substrings using space as a delimiter.
// 3. Convert each substring in the array to a numerical type.
let parsedNumbers = fileContent.trim().split(" ").map(Number);

// Output the result of the `expMod` function to the console.
// The first element of `parsedNumbers` serves as the base,
// the second as the exponent, and the predefined constant as the modulus.
console.log(expMod(parsedNumbers[0], parsedNumbers[1], LARGE_PRIME_MODULUS));