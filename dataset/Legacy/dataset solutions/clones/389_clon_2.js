const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input stream is processed: leading/trailing whitespace removed,
// then split into lines, and each line converted to a numeric value.
let numericSequence = rawInputData.trim().split("\n").map(Number);

// This loop continues to process numbers from the sequence until a zero is encountered.
while (true) {
    // Retrieve the next number from the front of the sequence.
    let currentModulus = numericSequence.shift();

    // If the extracted number is zero, it signals the end of input, so the loop terminates.
    if (currentModulus === 0) {
        break;
    }

    // For a modulus of 1, the output is an empty line, and processing continues to the next number.
    if (currentModulus === 1) {
        console.log("");
        continue;
    }

    // An array is initialized to track which numbers are quadratic residues modulo `currentModulus`.
    // `true` will indicate a residue, `false` otherwise.
    let isQuadraticResidue = [];
    for (let index = 0; index < currentModulus; index++) {
        isQuadraticResidue[index] = false; // All positions are initially marked as non-residues.
    }

    // Populate the `isQuadraticResidue` array by marking `x*x % currentModulus` as true for `x` from 1 to `currentModulus - 1`.
    for (let index = 1; index < currentModulus; index++) {
        isQuadraticResidue[(index * index) % currentModulus] = true;
    }

    // A new list is created to store the actual values (indices) that are quadratic residues.
    let residueIndices = [];
    isQuadraticResidue.forEach(function (flagValue, position) {
        if (flagValue) { // If the flag is true, this position is a quadratic residue.
            residueIndices.push(position);
        }
    });

    // An array to store the frequency of differences between quadratic residues.
    let differenceFrequencies = [];
    // The `halfRange` defines the upper bound for differences, considering symmetry (e.g., for modulus N, differences are considered up to (N-1)/2).
    const halfRange = (currentModulus - 1) / 2;
    for (let index = 0; index <= halfRange; index++) {
        differenceFrequencies[index] = 0; // Initialize all frequency counts to zero.
    }

    // Iterate through all unique pairs of quadratic residues to calculate and count their differences.
    for (let outerIndex = 0; outerIndex < residueIndices.length; outerIndex++) {
        for (let innerIndex = outerIndex + 1; innerIndex < residueIndices.length; innerIndex++) {
            // Calculate the first difference: `residueIndices[outerIndex] - residueIndices[innerIndex]`.
            let calculatedDifference = residueIndices[outerIndex] - residueIndices[innerIndex];
            // Adjust negative differences by adding `currentModulus` to bring them into the positive range.
            if (calculatedDifference < 0) {
                calculatedDifference += currentModulus;
            }
            // If the difference exceeds `halfRange`, subtract `currentModulus` to map it to its symmetric counterpart.
            if (halfRange < calculatedDifference) {
                calculatedDifference -= currentModulus;
            }
            // Increment the frequency count for this specific difference.
            differenceFrequencies[calculatedDifference]++;

            // Calculate the second difference: `residueIndices[innerIndex] - residueIndices[outerIndex]`.
            calculatedDifference = residueIndices[innerIndex] - residueIndices[outerIndex];
            // Apply the same adjustments for negative values and values exceeding `halfRange`.
            if (calculatedDifference < 0) {
                calculatedDifference += currentModulus;
            }
            if (halfRange < calculatedDifference) {
                calculatedDifference -= currentModulus;
            }
            // Increment the frequency count for this second difference.
            differenceFrequencies[calculatedDifference]++;
        }
    }

    // The count for difference 0 is not part of the required output, so it's removed.
    differenceFrequencies.shift();

    // For each remaining frequency count, print its value multiplied by two.
    differenceFrequencies.forEach(function (countValue) {
        console.log(countValue * 2);
    });
}
