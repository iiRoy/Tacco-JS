(function(rawData) {
    // This function processes input data to find the greatest common divisor.

    // Split the raw input string by spaces and convert each part into a numerical value.
    var numStrings = rawData.split(' ').map(Number);

    // Extract the first number from the processed array.
    var firstNumber = numStrings.shift();
    // Extract the second number from the processed array.
    var secondNumber = numStrings.shift();

    // Compute the highest common factor for the two extracted numbers and display the result.
    console.log(calculateHighestCommonFactor(firstNumber, secondNumber));

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire content of standard input as a UTF-8 string.

/**
 * Determines the highest common factor (HCF) between two integer values.
 *
 * @param {number} valA - The initial integer value.
 * @param {number} valB - The second integer value.
 * @returns {number} The greatest common divisor of valA and valB.
 */
function calculateHighestCommonFactor(valA, valB) {
    // Retrieve all common factors and then return the largest one using Math.max.apply.
    return Math.max.apply(null, retrieveAllCommonFactors(valA, valB));
}

/**
 * Gathers all common factors (divisors) for a pair of integers.
 * The internal logic might modify the input parameters `valA` and `valB` for calculation purposes.
 *
 * @param {number} valA - The first integer for which to find common factors.
 * @param {number} valB - The second integer for which to find common factors.
 * @returns {Array<number>} An array containing all integers that are common factors of both valA and valB.
 */
function retrieveAllCommonFactors(valA, valB) {
    // Adjust valA and valB to ensure efficient iteration.
    // If valA is greater than valB, reduce valA using the modulo operator.
    if (valA > valB) {
        valA = valA % valB;
    }
    // If valA is less than valB, swap them and then reduce the new valA.
    else if (valA < valB) {
        var temporaryValue = valB; // Store valB temporarily.
        valB = valA;                // Assign valA to valB.
        valA = temporaryValue % valA; // Assign the remainder of temporaryValue divided by valA to valA.
    }
    // If valA and valB are equal, no operation is performed in this block.

    // Initialize an empty array to store the identified common factors.
    var factorCollection = [];

    // Iterate from 1 up to the (potentially modified) valA.
    for (var loopIndex = 1; loopIndex <= valA; loopIndex++) {
        // Check if the current loopIndex divides both valA and valB without any remainder.
        if ((valA % loopIndex === 0) && (valB % loopIndex === 0)) {
            // If it's a common factor, add it to our collection.
            factorCollection.push(loopIndex);
        }
    }

    // Return the array containing all common factors found.
    return factorCollection;
}
