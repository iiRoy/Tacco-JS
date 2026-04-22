/*
 * This module processes raw string input to calculate a specific numeric result.
 * It involves several counting loops and modular arithmetic.
 */
function processData(rawData) {

    // Standardize the input by removing leading/trailing whitespace.
    rawData = rawData.trim();

    // Extract the primary count and the scaling factor from the first line.
    const elementCount = Number.parseInt(rawData.split(" ")[0], 10);
    const multiplierFactor = Number.parseInt(rawData.split(" ")[1], 10);

    // Parse the array of numbers from the second line of the input.
    var numericSequence = rawData.split('\n')[1].split(' ').map((numStr) => Number.parseInt(numStr, 10));

    // Initialize arrays to store intermediate counting results.
    var partialCounts = [];
    var totalCounts = [];

    // Initialize the accumulator for the final calculation.
    var finalResult = 0;

    // First main iteration: populate the two count arrays.
    for (var idx1 = 0; idx1 < elementCount; idx1++) {

        // This variable tracks counts for 'partial' comparisons.
        var currentPartialCount = 0;

        // Inner loop for partial comparisons (from current index to end).
        for (var idx2 = idx1; idx2 < elementCount; idx2++) {
            // Check if the current element is greater than a subsequent one.
            if (numericSequence[idx1] > numericSequence[idx2]) {
                currentPartialCount++;
            }
        }
        // Store the result for the current element.
        partialCounts.push(currentPartialCount);

        // This variable tracks counts for 'total' comparisons.
        var currentTotalCount = 0;

        // Inner loop for total comparisons (from start to end).
        for (var idx2 = 0; idx2 < elementCount; idx2++) {
            // Check if the current element is greater than any other element.
            if (numericSequence[idx1] > numericSequence[idx2]) {
                currentTotalCount++;
            }
        }
        // Store the result for the current element.
        totalCounts.push(currentTotalCount);
    }

    // Define a constant for the modulo operation to avoid magic numbers.
    const MODULUS_VAL = 1000000007;

    // Second main iteration: perform the final calculation.
    for (var idx1 = 0; idx1 < elementCount; idx1++) {
        // Calculate an intermediate sum using stored counts and the multiplier.
        // The calculation involves two terms, each subjected to modular arithmetic.
        var intermediateSum = (partialCounts[idx1] * multiplierFactor) % MODULUS_VAL +
                              (totalCounts[idx1] * multiplierFactor * (multiplierFactor - 1) * 0.5) % MODULUS_VAL;

        // Accumulate the intermediate sum into the final result, applying modulo.
        finalResult += intermediateSum % MODULUS_VAL;
        finalResult = finalResult % MODULUS_VAL;
    }

    // Output the computed final result to the console.
    console.log(finalResult % MODULUS_VAL);
}

// Initiate the data processing by reading from standard input.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));