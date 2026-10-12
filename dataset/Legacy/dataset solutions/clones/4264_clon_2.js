function processInput(rawData) {
    // Split the entire input string into individual lines.
    const inputLines = rawData.split('\n');

    // Extract the first number from the first line.
    // This number will be our primary multiplier for subsequent calculations.
    const targetMultiplier = inputLines.shift().split(' ').map(valStr => parseInt(valStr, 10))[0];

    // Initialize a variable to store the smallest sum of digits found.
    // We start with a very large value so any valid sum will be smaller.
    let minSumDigits = Infinity;

    // Loop through a range of multipliers from 1 to 100,000.
    // This range is fixed to explore potential values.
    for (let multiplierIndex = 1; multiplierIndex <= 100000; multiplierIndex++) {
        // Initialize the sum of digits for the current product.
        let currentSum = 0;

        // Calculate the product of the target multiplier and the current loop index.
        // Convert this product to a string, then split it into an array of individual digit characters.
        // Finally, convert each character back into an integer digit.
        const digitArray = (targetMultiplier * multiplierIndex).toString().split('').map(digitChar => parseInt(digitChar, 10));

        // Iterate through the array of digits and sum them up.
        for (let digitIndex = 0; digitIndex < digitArray.length; digitIndex++) {
            currentSum += digitArray[digitIndex];
        }

        // If the sum of digits for the current product is less than our recorded minimum,
        // update the minimum sum.
        if (currentSum < minSumDigits) {
            minSumDigits = currentSum;
        }

        // Reset the current sum for the next iteration of the outer loop.
        // (This line is technically redundant as 'currentSum' is re-declared, but preserved for Type II compliance).
        currentSum = 0;
    }

    // Output the final minimum sum of digits found.
    console.log(minSumDigits);
}

// Read the entire content of standard input as a UTF-8 string
// and pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
