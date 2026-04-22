const sourceData = require('node:fs').readFileSync(0, 'utf8');
const numericSequences = sourceData.trim().split('\n').map(rawLine => {
    let parsedDigits = [];
    for (let char of rawLine) {
        parsedDigits.push(parseInt(char, 10));
    }
    return parsedDigits;
});

// Helper to compute the (n_val)-th row of Pascal's triangle, modulo 10.
// This row contains the binomial coefficients C(n_val, k) for k from 0 to n_val.
function getPascalRowModulus(n_val) {
    if (n_val < 0) return [];
    if (n_val === 0) return [1]; // C(0,0) = 1

    let currentPascalRow = [1]; // Represents the row for (r-1)
    for (let r = 1; r <= n_val; r++) { // Iterate from row 1 up to n_val
        let nextPascalRow = [1]; // The current row being built (for r)
        for (let c = 1; c < r; c++) {
            // Pascal's identity: C(r, c) = C(r-1, c-1) + C(r-1, c)
            nextPascalRow.push((currentPascalRow[c - 1] + currentPascalRow[c]) % 10);
        }
        nextPascalRow.push(1); // C(r, r) = 1
        currentPascalRow = nextPascalRow; // Update for the next iteration
    }
    return currentPascalRow;
}

// Main logic to determine the final value for a given sequence of digits.
// Utilizes the property that the final sum is a weighted sum of original digits
// using binomial coefficients modulo 10.
function computeSingleSequenceResult(digitSequence) {
    const sequenceLength = digitSequence.length;
    if (sequenceLength === 0) {
        // If an empty line is provided, `rawLine` is `''`, `parsedDigits` is `[]`.
        // The original code `split("").map(n => Number(n))` for `''` results in `[0]`.
        // `singleDown([0])` returns `0`. So, we return 0 for consistency.
        return 0;
    }
    if (sequenceLength === 1) {
        return digitSequence[0];
    }

    // Get the (N-1)-th row of Pascal's triangle modulo 10
    // N is `sequenceLength`, so we need C(N-1, k)
    const coefficientsMod10 = getPascalRowModulus(sequenceLength - 1);

    let accumulatedValue = 0;
    for (let index = 0; index < sequenceLength; index++) {
        // Multiply coefficient by digit and add to sum, taking modulo 10 at each step
        accumulatedValue = (accumulatedValue + (coefficientsMod10[index] * digitSequence[index])) % 10;
    }
    return accumulatedValue;
}

// Apply the calculation to each numeric sequence
const finalOutcomes = numericSequences.map(computeSingleSequenceResult);

// Print the final array of results
console.log(finalOutcomes);