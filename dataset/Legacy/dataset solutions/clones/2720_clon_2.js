var inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Array to store all input lines received.
var inputData = [];

// Event listener for each line of input.
inputHandler.on('line', function (currentLine) {
    inputData.push(currentLine);
});

/**
 * Computes the prime factorization of a given number.
 * @param {number} targetValue The number to factorize.
 * @returns {number[]} An array of prime factors.
 */
function factorizeNumber(targetValue) {
    var factorList = []; // Stores the prime factors.

    // Special case for 1.
    if (targetValue === 1) {
        return [1];
    }

    var startDivisor = 2; // Start checking for divisibility from 2.

    // Continue until the target value becomes 1.
    while (targetValue !== 1) {
        var currentDivisor = startDivisor; // Initialize current divisor for inner loop.

        // Iterate through potential divisors.
        while (currentDivisor < Number.MAX_SAFE_INTEGER) {
            // If currentDivisor divides targetValue evenly.
            if (targetValue % currentDivisor === 0) {
                factorList.push(currentDivisor); // Add to factors.
                targetValue /= currentDivisor; // Reduce targetValue.
                break; // Found a factor, break inner loop to re-evaluate targetValue.
            }
            currentDivisor++; // Increment divisor to check the next number.
        }
        startDivisor = currentDivisor; // Update startDivisor for the next iteration of the outer loop.
    }
    return factorList; // Return the list of prime factors.
}

// Main execution block, triggered when input stream closes.
inputHandler.on('close', function () {
    /*
     * This section contains commented-out alternative logic.
     * It is preserved as a comment to maintain structural similarity.
     *
     * var s = Number(inputData[0]);
     * var x = 1;
     * while(s % x !== 0 || s / x >= 1000000000) x++;
     * console.log("0 0 " + x + " 0 0 " + (s / x));
     */

    // Parse the first line of input as a number.
    var inputNum = Number(inputData[0]);

    // Get the prime factors of the input number.
    var primeFactors = factorizeNumber(inputNum);

    var factorIndex = 0; // Index for iterating through prime factors.
    var productAccumulator = 1; // Accumulator for the product of factors.

    // Multiply factors from the end of the list until product exceeds 1,000,000,000.
    while (productAccumulator < 1000000000) {
        // Multiply by the factor from the end of the list, moving backwards.
        productAccumulator = productAccumulator * primeFactors[primeFactors.length - 1 - factorIndex];
        factorIndex++; // Move to the next factor.
    }

    // Adjust the product by dividing by the last factor that caused it to exceed the limit.
    productAccumulator = productAccumulator / primeFactors[primeFactors.length - factorIndex];

    // Output the result in the specified format.
    console.log("0 0 " + productAccumulator + " 0 0 " + (inputNum / productAccumulator));
});
