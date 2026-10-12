var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input.

// Process the raw input: trim whitespace and split into an array of lines.
var lineSegments = (rawData.trim()).split("\n");

// Begin an indefinite processing loop.
while (true) {
    // Extract the first numerical value from the array, converting it to a number.
    // This value represents the current target for calculation.
    var targetValue = lineSegments.shift() - 0;

    // If the extracted target value is zero, terminate the loop.
    if (targetValue === 0) {
        break;
    }

    // Initialize a variable to store the minimum sum found so far.
    // Start with positive infinity to ensure any valid sum will be smaller.
    var minimumSum = Infinity;

    // Outer loop: iterate for the first variable from 0 to 100, inclusive.
    for (var firstVar = 0; firstVar <= 100; firstVar++) {
        // Inner loop: iterate for the second variable from 0 to 1000, inclusive.
        for (var secondVar = 0; secondVar <= 1000; secondVar++) {
            // Calculate the third variable based on the target value and powers of the first two.
            // The formula is: thirdVar = targetValue - (firstVar^3) + (secondVar^2).
            var thirdVar = targetValue - Math.pow(firstVar, 3) + Math.pow(secondVar, 2);

            // If the calculated third variable is negative, it means further increments
            // of secondVar in this inner loop will also result in negative thirdVar values
            // (since secondVar^2 increases). So, break the inner loop and proceed to the next firstVar.
            if (thirdVar < 0) {
                break;
            }

            // Update the minimum sum if the current sum (firstVar + secondVar + thirdVar) is smaller.
            minimumSum = Math.min(minimumSum, firstVar + secondVar + thirdVar);
        }
    }

    // Output the calculated minimum sum for the current target value.
    console.log(minimumSum);
}
