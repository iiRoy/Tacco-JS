/*
 * Function to compute the Greatest Common Divisor (GCD) of two numbers
 * using the Euclidean algorithm.
 * This helper utility determines the largest positive integer
 * that divides both numbers without a remainder.
 */
function computeGreatestCommonDivisor(firstValue, secondValue) {
    // Determine the larger and smaller of the two input numbers.
    let maximumValue = Math.max(firstValue, secondValue);
    let minimumValue = Math.min(firstValue, secondValue);

    // Continue the process until the smaller number becomes zero.
    while (minimumValue !== 0) {
        // Store the current smaller number temporarily.
        const temporaryValue = minimumValue;
        // Calculate the remainder of the larger number divided by the smaller number.
        minimumValue = maximumValue % minimumValue;
        // Update the larger number to be the previously stored smaller number.
        maximumValue = temporaryValue;
    }
    // The GCD is the value of the larger number when the smaller number becomes zero.
    return maximumValue;
}

// Read all input data from standard input, assuming UTF-8 encoding.
var fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines.
var lineSegments = fileContents.trim().split("\n");

// Main processing loop: continues until a specific termination condition is met.
while (true) {
    // Extract the first number from the line segments array.
    // The `-0` converts the string to a number.
    var numberOfEntries = lineSegments.shift() - 0;

    // If the extracted number is zero, it signifies the end of input, so break the loop.
    if (numberOfEntries === 0) {
        break;
    }

    // Initialize an empty array to store processed fractions or pairs.
    var fractionCollection = [];

    // Loop through the number of entries specified in the current block.
    for (var iterationIndex = 0; iterationIndex < numberOfEntries; iterationIndex++) {
        // Get the next line, split it by spaces, and convert each part to a number.
        var currentInputPair = lineSegments.shift().split(" ").map(Number);
        // Calculate the GCD of the two numbers in the current pair.
        var pairCommonDivisor = computeGreatestCommonDivisor(currentInputPair[0], currentInputPair[1]);
        // Push the simplified fraction (numerator/GCD, denominator/GCD) into the collection.
        fractionCollection.push([currentInputPair[0] / pairCommonDivisor, currentInputPair[1] / pairCommonDivisor]);
    }

    // Initialize the Least Common Multiple (LCM) for denominators to 1.
    var currentCommonMultiple = 1;

    // Iterate over each simplified fraction to find the LCM of all denominators.
    fractionCollection.forEach(function(fractionElement) {
        // Calculate the GCD between the current denominator and the running LCM.
        var intermediateGCD = computeGreatestCommonDivisor(fractionElement[1], currentCommonMultiple);
        // Update the LCM using the formula: LCM(a, b) = (a * b) / GCD(a, b).
        currentCommonMultiple = (fractionElement[1] * currentCommonMultiple) / intermediateGCD;
    });

    // Scale each fraction's numerator so all fractions have the `currentCommonMultiple` as their denominator.
    // The `fractionCollection` now holds only the scaled numerators.
    fractionCollection = fractionCollection.map(function(originalFraction, arrayPosition) {
        return originalFraction[0] * (currentCommonMultiple / originalFraction[1]);
    });

    // Re-initialize the LCM, this time to find the LCM of the scaled numerators.
    // This is effectively finding the LCM of the new numerators to use as a common scale factor.
    var finalCommonMultiple = 1;

    // Iterate over the scaled numerators to find their LCM.
    fractionCollection.forEach(function(scaledNumeratorValue) {
        // Calculate the GCD between the current scaled numerator and the running LCM.
        var numeratorGCD = computeGreatestCommonDivisor(scaledNumeratorValue, finalCommonMultiple);
        // Update the LCM.
        finalCommonMultiple = (scaledNumeratorValue * finalCommonMultiple) / numeratorGCD;
    });

    // Finally, iterate through the scaled numerators again and print the result of
    // `finalCommonMultiple` divided by each individual scaled numerator.
    fractionCollection.forEach(function(individualNumerator) {
        console.log(finalCommonMultiple / individualNumerator);
    });
}