function computeGreatestCommonDivisor(firstNum, secondNum) {
    // Determine the larger and smaller of the two input numbers
    let maxVal = Math.max(firstNum, secondNum);
    let minVal = Math.min(firstNum, secondNum);

    // Euclidean algorithm to find the GCD
    while (minVal !== 0) {
        let tempVal = minVal; // Store the current minimum value
        minVal = maxVal % minVal; // Calculate the remainder
        maxVal = tempVal; // Update the maximum value to the previous minimum
    }
    return maxVal; // The GCD is the last non-zero remainder
}

// Read input from standard input, assuming UTF-8 encoding
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines
const lineSegments = rawData.trim().split("\n");

// Main processing loop
while (true) {
    // Get the number of pairs for the current test case
    let countOfPairs = parseInt(lineSegments.shift(), 10); // Convert string to number

    // If the count is 0, it signifies the end of input
    if (countOfPairs === 0) {
        break;
    }

    // Array to store simplified fractions
    let fractionList = [];

    // Loop through each pair of numbers for the current test case
    for (let idx = 0; idx < countOfPairs; idx++) {
        // Read a line, split by space, and convert parts to numbers
        const pairValues = lineSegments.shift().split(" ").map(Number);

        // Calculate the GCD of the two numbers in the pair
        const commonDivisor = computeGreatestCommonDivisor(pairValues[0], pairValues[1]);

        // Add the simplified fraction [numerator/gcd, denominator/gcd] to the list
        fractionList.push([pairValues[0] / commonDivisor, pairValues[1] / commonDivisor]);
    }

    // Calculate the LCM of all denominators
    let leastCommonMultiple = 1;
    fractionList.forEach(function(currentFraction) {
        // Calculate GCD of current denominator and the running LCM
        const commonDivisor = computeGreatestCommonDivisor(currentFraction[1], leastCommonMultiple);
        // Update LCM using the formula: LCM(a,b) = (a*b)/GCD(a,b)
        // Optimized to prevent overflow: (a/GCD) * b
        leastCommonMultiple = (currentFraction[1] / commonDivisor) * (leastCommonMultiple / commonDivisor);
    });

    // Convert fractions to integers by multiplying by the LCM of denominators
    fractionList = fractionList.map(function(currentFraction, indexPosition) {
        return currentFraction[0] * (leastCommonMultiple / currentFraction[1]);
    });

    // Recalculate LCM for the new set of integer values (this part seems to be a copy-paste error in the original logic,
    // as it re-initializes lcm to 1 and then tries to use v[1] which doesn't exist for integer values.
    // Following Type II rules, I must preserve the original behavior, even if it's flawed.
    // The original code has `lcm=(v[1]/gcd)*(lcm/gcd);` which will cause `v[1]` to be `undefined` for the second `forEach`
    // on `arr` (which now contains integers). This will result in `NaN` for `lcm` in the second calculation.
    // I will keep this behavior as per Type II rules.
    // The original code's intent for the second LCM calculation is unclear given the `arr` transformation.
    // Assuming the original intended to calculate LCM of the *new* integer values, but the implementation is incorrect.
    // I must replicate the exact original behavior, including potential runtime errors or `NaN` propagation.
    let secondLeastCommonMultiple = 1;
    fractionList.forEach(function(fractionElement) {
        // This will likely result in NaN because fractionElement is now an integer, not an array [num, den]
        // So fractionElement[1] will be undefined.
        const commonDivisor = computeGreatestCommonDivisor(fractionElement[1], secondLeastCommonMultiple);
        secondLeastCommonMultiple = (fractionElement[1] / commonDivisor) * (secondLeastCommonMultiple / commonDivisor);
    });


    // Output the results
    fractionList.forEach(function(finalValue) {
        // If secondLeastCommonMultiple became NaN, this will also output NaN.
        console.log(secondLeastCommonMultiple / finalValue);
    });
}
